import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'
import { snapshotNow } from '@/lib/db/readiness'

const DAY = 24 * 60 * 60 * 1000
const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString()
const dateOnly = (msFromNow: number) => new Date(Date.now() + msFromNow).toISOString().slice(0, 10)

function auditScore(overall: number, status: 'pass' | 'marginal' | 'fail', crit: number, maj: number, min: number) {
  return { overall, status, sections: [], criticalFailCount: crit, majorFailCount: maj, minorFailCount: min }
}

/**
 * Seed a realistic demo dataset for the current org: two completed audits, an
 * aged open critical + an overdue major, a resolved minor, a ~45-day survey
 * date, and readiness snapshots — so sales demos land on a populated dashboard.
 */
export async function seedDemoData(): Promise<{ error: string | null }> {
  const profile = await getMyProfile()
  if (!profile?.orgId) return { error: 'No organization on profile' }
  const supabase = createClient()

  const base = {
    org_id: profile.orgId,
    department_id: profile.departmentId,
    conducted_by: profile.id,
    status: 'completed' as const,
    mode: 'full' as const,
  }

  const a1 = crypto.randomUUID()
  const a2 = crypto.randomUUID()

  const { error: auditErr } = await supabase.from('audits').insert([
    { id: a1, ...base, overall_score: 72, audit_score: auditScore(72, 'marginal', 1, 2, 1), started_at: iso(60 * DAY), completed_at: iso(60 * DAY) },
    { id: a2, ...base, overall_score: 84, audit_score: auditScore(84, 'marginal', 1, 1, 0), started_at: iso(18 * DAY), completed_at: iso(18 * DAY) },
  ])
  if (auditErr) return { error: auditErr.message }

  const { error: findErr } = await supabase.from('findings').insert([
    { audit_id: a2, item_index: 3, section_name: 'Sterilization', question: 'Are biological indicators run with every load containing implants?', severity: 'critical', status: 'open', comment: 'BI not logged for 2 implant loads.', assigned_to: profile.id, due_date: dateOnly(-5 * DAY) },
    { audit_id: a2, item_index: 7, section_name: 'Decontamination', question: 'Is the eyewash station tested weekly and documented?', severity: 'major', status: 'in-progress', comment: 'Log gaps in March.', assigned_to: profile.id, due_date: dateOnly(10 * DAY) },
    { audit_id: a1, item_index: 5, section_name: 'Storage', question: 'Are sterile packages stored 8–10 inches off the floor?', severity: 'minor', status: 'resolved', comment: 'Shelving adjusted.', resolved_at: iso(40 * DAY), resolved_by: profile.id },
  ])
  if (findErr) return { error: findErr.message }

  await supabase.from('organizations').update({ next_survey_date: dateOnly(45 * DAY) }).eq('id', profile.orgId)

  // Backdated snapshots for the trend, then a live one.
  await supabase.from('readiness_snapshots').insert([
    { org_id: profile.orgId, department_id: null, score: 61, band: 'not-ready', factors: [], captured_at: iso(60 * DAY) },
    { org_id: profile.orgId, department_id: null, score: 74, band: 'at-risk', factors: [], captured_at: iso(18 * DAY) },
  ])
  await snapshotNow()

  return { error: null }
}
