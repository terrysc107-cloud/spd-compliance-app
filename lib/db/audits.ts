import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'
import type { StoredAudit, StoredFinding, AuditScore } from '@/lib/db/types'

// The audit flow uses the built-in SECTIONS template, so there is no per-audit
// checklist name in the DB — it is always this.
const CHECKLIST_NAME = 'SPD Compliance Audit'

type AuditRow = {
  id: string
  mode: string
  status: string
  overall_score: number | null
  audit_score: AuditScore | null
  started_at: string
  completed_at: string | null
  department_id: string | null
  conductor?: { name: string | null } | null
}

type FindingRow = {
  id: string
  audit_id: string
  item_index: number
  section_name: string | null
  question: string
  severity: string
  status: string
  comment: string | null
  corrective_action: string | null
  resolved_at: string | null
  assigned_to: string | null
  due_date: string | null
  resolved_by: string | null
}

const AUDIT_SELECT =
  'id, mode, status, overall_score, audit_score, started_at, completed_at, department_id, conductor:profiles!conducted_by(name)'

function mapFinding(r: FindingRow): StoredFinding {
  return {
    id:               r.id,
    itemIndex:        r.item_index,
    sectionName:      r.section_name ?? '',
    question:         r.question,
    severity:         r.severity as StoredFinding['severity'],
    comment:          r.comment ?? '',
    status:           r.status as StoredFinding['status'],
    correctiveAction: r.corrective_action ?? undefined,
    resolvedAt:       r.resolved_at ?? undefined,
    assignedTo:       r.assigned_to,
    dueDate:          r.due_date,
    resolvedBy:       r.resolved_by,
  }
}

function mapAudit(r: AuditRow, findings: StoredFinding[]): StoredAudit {
  return {
    id:            r.id,
    checklistName: CHECKLIST_NAME,
    mode:          (r.mode === 'focus' ? 'focus' : 'full'),
    startedAt:     r.started_at,
    completedAt:   r.completed_at ?? undefined,
    status:        r.status as StoredAudit['status'],
    responses:     {},
    score:         r.overall_score ?? undefined,
    auditScore:    r.audit_score ?? undefined,
    findings,
    departmentId:  r.department_id ?? undefined,
    conductedBy:   r.conductor?.name ?? undefined,
  }
}

// ─── READS ──────────────────────────────────────────────────────────────────

export async function getAllAudits(): Promise<StoredAudit[]> {
  const supabase = createClient()
  const { data: audits, error } = await supabase
    .from('audits')
    .select(AUDIT_SELECT)
    .order('started_at', { ascending: false })

  if (error || !audits) return []

  const ids = audits.map(a => a.id)
  const byAudit = new Map<string, StoredFinding[]>()
  if (ids.length) {
    const { data: findings } = await supabase.from('findings').select('*').in('audit_id', ids)
    for (const f of (findings ?? []) as FindingRow[]) {
      const arr = byAudit.get(f.audit_id) ?? []
      arr.push(mapFinding(f))
      byAudit.set(f.audit_id, arr)
    }
  }

  return (audits as unknown as AuditRow[]).map(a => mapAudit(a, byAudit.get(a.id) ?? []))
}

export async function getAudit(id: string): Promise<StoredAudit | null> {
  const supabase = createClient()
  const { data: audit, error } = await supabase
    .from('audits')
    .select(AUDIT_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error || !audit) return null

  const { data: findings } = await supabase
    .from('findings')
    .select('*')
    .eq('audit_id', id)
    .order('item_index', { ascending: true })

  const mapped = ((findings ?? []) as FindingRow[]).map(mapFinding)
  return mapAudit(audit as unknown as AuditRow, mapped)
}

// ─── WRITES ─────────────────────────────────────────────────────────────────

export async function saveAudit(audit: StoredAudit): Promise<void> {
  const supabase = createClient()
  const profile = await getMyProfile()
  if (!profile?.orgId) throw new Error('No profile/org — cannot save audit')

  await supabase.from('audits').upsert({
    id:            audit.id,
    org_id:        profile.orgId,
    department_id: profile.departmentId,
    conducted_by:  profile.id,
    status:        audit.status,
    mode:          audit.mode,
    overall_score: audit.score ?? null,
    audit_score:   audit.auditScore ?? null,
    started_at:    audit.startedAt,
    completed_at:  audit.completedAt ?? null,
  })

  // Findings are derived fresh on completion; sync them then.
  if (audit.status === 'completed') {
    await supabase.from('findings').delete().eq('audit_id', audit.id)
    if (audit.findings.length) {
      await supabase.from('findings').insert(
        audit.findings.map(f => ({
          audit_id:          audit.id,
          item_index:        f.itemIndex,
          section_name:      f.sectionName,
          question:          f.question,
          severity:          f.severity,
          status:            f.status,
          comment:           f.comment,
          corrective_action: f.correctiveAction ?? null,
        })),
      )
    }
  }
}

export async function updateAudit(id: string, updates: Partial<StoredAudit>): Promise<void> {
  const supabase = createClient()
  const patch: Record<string, unknown> = {}
  if (updates.status !== undefined)      patch.status = updates.status
  if (updates.score !== undefined)       patch.overall_score = updates.score
  if (updates.auditScore !== undefined)  patch.audit_score = updates.auditScore
  if (updates.completedAt !== undefined) patch.completed_at = updates.completedAt
  if (Object.keys(patch).length) await supabase.from('audits').update(patch).eq('id', id)
}

/** Back-compat finding update keyed by (auditId, itemIndex). */
export async function updateFinding(
  auditId: string,
  itemIndex: number,
  updates: Partial<StoredFinding>,
): Promise<void> {
  const supabase = createClient()
  await supabase.from('findings').update(findingPatch(updates)).match({ audit_id: auditId, item_index: itemIndex })
}

/** CAPA update keyed by finding id. */
export async function updateFindingById(
  findingId: string,
  updates: Partial<StoredFinding>,
): Promise<void> {
  const supabase = createClient()
  await supabase.from('findings').update(findingPatch(updates)).eq('id', findingId)
}

function findingPatch(updates: Partial<StoredFinding>): Record<string, unknown> {
  const patch: Record<string, unknown> = {}
  if (updates.status !== undefined)           patch.status = updates.status
  if (updates.comment !== undefined)          patch.comment = updates.comment
  if (updates.correctiveAction !== undefined) patch.corrective_action = updates.correctiveAction
  if (updates.resolvedAt !== undefined)       patch.resolved_at = updates.resolvedAt
  if (updates.assignedTo !== undefined)       patch.assigned_to = updates.assignedTo
  if (updates.dueDate !== undefined)          patch.due_date = updates.dueDate
  if (updates.resolvedBy !== undefined)       patch.resolved_by = updates.resolvedBy
  return patch
}

export async function deleteAudit(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('audits').delete().eq('id', id)
}
