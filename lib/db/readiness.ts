import { createClient } from '@/lib/supabase/client'
import { getMyProfile, getMyOrg } from '@/lib/db/org'
import { getAllAudits } from '@/lib/db/audits'
import { computeReadiness, type ReadinessResult } from '@/lib/readiness/engine'

export interface ReadinessSnapshot {
  score:      number
  band:       string
  capturedAt: string
}

/** Facility-wide readiness snapshots over time (for the trend chart). */
export async function getSnapshots(): Promise<ReadinessSnapshot[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('readiness_snapshots')
    .select('score, band, captured_at, department_id')
    .is('department_id', null)
    .order('captured_at', { ascending: true })
  if (error || !data) return []
  return data.map(r => ({ score: Number(r.score), band: r.band, capturedAt: r.captured_at }))
}

export async function recordSnapshot(result: ReadinessResult): Promise<void> {
  const profile = await getMyProfile()
  if (!profile?.orgId) return
  const supabase = createClient()
  await supabase.from('readiness_snapshots').insert({
    org_id:        profile.orgId,
    department_id: null,
    score:         result.score,
    band:          result.band,
    factors:       result.factors,
  })
}

/** Compute current readiness from live data and persist a snapshot. */
export async function snapshotNow(): Promise<ReadinessResult | null> {
  const [audits, org] = await Promise.all([getAllAudits(), getMyOrg()])
  const result = computeReadiness(audits, { nextSurveyDate: org?.nextSurveyDate })
  if (result.assessed) await recordSnapshot(result)
  return result
}

/** Compute current readiness without persisting (for the dashboard read). */
export async function getCurrentReadiness(): Promise<{ result: ReadinessResult; orgName: string | null }> {
  const [audits, org] = await Promise.all([getAllAudits(), getMyOrg()])
  return {
    result: computeReadiness(audits, { nextSurveyDate: org?.nextSurveyDate }),
    orgName: org?.name ?? null,
  }
}
