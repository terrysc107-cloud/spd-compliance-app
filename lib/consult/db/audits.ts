import { createClient } from '@/lib/supabase/client'
import { consultIdentity } from '@/lib/consult/identity'
import { perform } from '@/lib/consult/offline/queue'
import type { AuditTemplate } from '@/lib/consult/audits/templates'
import type { Audit, AuditAnswer, AuditItem, AuditSample } from '@/lib/consult/types'

type AuditRow = {
  id: string; engagement_id: string; observation_id: string | null; template_id: string; title: string
  items: AuditItem[]; sample_unit: string; target_per_day: number; status: string; started_on: string; created_at: string
}
type SampleRow = {
  id: string; audit_id: string; sampled_on: string; sample_ref: string | null; source: string
  auditor: string | null; answers: Record<string, AuditAnswer>; note: string | null; created_at: string
}

export function mapAudit(r: AuditRow): Audit {
  return {
    id: r.id, engagementId: r.engagement_id, observationId: r.observation_id, templateId: r.template_id,
    title: r.title, items: r.items ?? [], sampleUnit: r.sample_unit, targetPerDay: r.target_per_day,
    status: r.status as Audit['status'], startedOn: r.started_on, createdAt: r.created_at,
  }
}

export function mapSample(r: SampleRow): AuditSample {
  return {
    id: r.id, auditId: r.audit_id, sampledOn: r.sampled_on, sampleRef: r.sample_ref ?? '',
    source: r.source as AuditSample['source'], auditor: r.auditor ?? '', answers: r.answers ?? {},
    note: r.note ?? '', createdAt: r.created_at,
  }
}

export async function listAudits(engagementId: string): Promise<{ audits: Audit[]; samples: AuditSample[] }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_audits').select('*').eq('engagement_id', engagementId).order('created_at')
  if (error) throw new Error(error.message)
  const audits = ((data ?? []) as AuditRow[]).map(mapAudit)
  if (!audits.length) return { audits, samples: [] }
  const { data: s, error: sErr } = await supabase
    .from('consult_audit_samples').select('*').in('audit_id', audits.map(a => a.id)).order('sampled_on').order('created_at')
  if (sErr) throw new Error(sErr.message)
  return { audits, samples: ((s ?? []) as SampleRow[]).map(mapSample) }
}

export async function startAudit(
  engagementId: string, t: AuditTemplate, opts: { observationId?: string | null; targetPerDay?: number } = {},
): Promise<Audit> {
  const me = await consultIdentity()
  const audit: Audit = {
    id: crypto.randomUUID(), engagementId, observationId: opts.observationId ?? null, templateId: t.id,
    title: t.name, items: t.items.map(i => ({ ...i })), sampleUnit: t.sampleUnit,
    targetPerDay: Math.min(200, Math.max(1, Math.round(opts.targetPerDay ?? t.defaultPerDay))),
    status: 'active', startedOn: today(), createdAt: new Date().toISOString(),
  }
  await perform({ kind: 'row.upsert', table: 'consult_audits', row: {
    id: audit.id, org_id: me.orgId, engagement_id: engagementId, observation_id: audit.observationId,
    template_id: t.id, title: audit.title, items: audit.items, sample_unit: audit.sampleUnit,
    target_per_day: audit.targetPerDay, status: 'active', started_on: audit.startedOn, created_by: me.userId,
  } })
  return audit
}

export async function updateAudit(id: string, u: Partial<Pick<Audit, 'title' | 'status' | 'targetPerDay'>>): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (u.title !== undefined)        patch.title = u.title.trim()
  if (u.status !== undefined)       patch.status = u.status
  if (u.targetPerDay !== undefined) patch.target_per_day = Math.min(200, Math.max(1, Math.round(u.targetPerDay)))
  await perform({ kind: 'row.update', table: 'consult_audits', id, patch })
}

export async function deleteAudit(id: string): Promise<void> {
  await perform({ kind: 'row.delete', table: 'consult_audits', id })
}

export type SampleInput = Omit<AuditSample, 'id' | 'createdAt'>

export async function addSample(input: SampleInput): Promise<AuditSample> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.sampledOn)) throw new Error('Enter the date the audit was performed')
  if (input.sampledOn > today()) throw new Error('Audit date can’t be in the future')
  if (!Object.values(input.answers).some(a => a === 'yes' || a === 'no')) throw new Error('Answer at least one item')
  const me = await consultIdentity()
  const sample: AuditSample = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  await perform({ kind: 'row.upsert', table: 'consult_audit_samples', row: {
    id: sample.id, org_id: me.orgId, audit_id: input.auditId, sampled_on: input.sampledOn,
    sample_ref: input.sampleRef.trim() || null, source: input.source, auditor: input.auditor.trim() || null,
    answers: input.answers, note: input.note.trim() || null, created_by: me.userId,
  } })
  return sample
}

export async function deleteSample(id: string): Promise<void> {
  await perform({ kind: 'row.delete', table: 'consult_audit_samples', id })
}

/** Local calendar date, YYYY-MM-DD. */
export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
