// ─── SERVER-SIDE REPORT BUNDLE ──────────────────────────────────────────────
// One loader shared by the AI draft route and the PDF route, so the draft and
// the final document are built from identical data. Runs with the caller's
// session client — RLS guarantees they can only load their own org's work.

import type { SupabaseClient } from '@supabase/supabase-js'
import { scopedAreas } from '@/lib/consult/framework'
import { scoreEngagement, type EngagementScore } from '@/lib/consult/scoring'
import type {
  Answer, Audit, Client, ConsultSettings, Engagement, LibraryEntry, Observation, ResponseMap,
} from '@/lib/consult/types'
import { mapEngagement } from '@/lib/consult/db/engagements'
import { mapAudit, mapSample } from '@/lib/consult/db/audits'
import { summarize, type AuditSummary } from '@/lib/consult/audits/scoring'

// The app's clients are pinned to the `spd` schema (lib/supabase/*).
type SpdClient = SupabaseClient<any, 'spd', 'spd'>

export interface ReportPhoto { observationId: string; caption: string | null; dataUri: string }

export interface ReportBundle {
  engagement:   Engagement
  client:       Client
  responses:    ResponseMap
  observations: Observation[]
  score:        EngagementScore
  settings:     ConsultSettings
  library:      LibraryEntry[]
  photos:       ReportPhoto[]
  priorScore:   { title: string; date: string | null; overall: number | null } | null
  audits:       ReportAudit[]
}

export interface ReportAudit { audit: Audit; summary: AuditSummary; linkedTitle: string | null }

const MAX_PHOTOS_PER_OBS = 2
const MAX_PHOTOS_TOTAL   = 24

export async function loadReportBundle(
  supabase: SpdClient,
  engagementId: string,
  opts: { withPhotos?: boolean } = {},
): Promise<ReportBundle | null> {
  const { data: eRow } = await supabase
    .from('consult_engagements').select('*, client:consult_clients(name)').eq('id', engagementId).maybeSingle()
  if (!eRow) return null
  const engagement = mapEngagement(eRow)

  const [{ data: cRow }, { data: rRows }, { data: oRows }, { data: sRow }, { data: lRows }] = await Promise.all([
    supabase.from('consult_clients').select('*').eq('id', engagement.clientId).maybeSingle(),
    supabase.from('consult_responses').select('item_id, answer, note').eq('engagement_id', engagementId),
    supabase.from('consult_observations').select('*').eq('engagement_id', engagementId).order('created_at'),
    supabase.auth.getUser().then(({ data: { user } }) =>
      supabase.from('consult_settings').select('*').eq('user_id', user?.id ?? '').maybeSingle()),
    supabase.from('consult_library').select('*').order('use_count', { ascending: false }).limit(60),
  ])
  if (!cRow) return null

  const client: Client = {
    id: cRow.id, name: cRow.name, facilityType: cRow.facility_type, city: cRow.city, state: cRow.state,
    bedCount: cRow.bed_count, annualSurgicalCases: cRow.annual_surgical_cases,
    contactName: cRow.contact_name, contactTitle: cRow.contact_title, contactEmail: cRow.contact_email,
    contactPhone: cRow.contact_phone, notes: cRow.notes, createdAt: cRow.created_at,
  }

  const responses: ResponseMap = {}
  for (const r of rRows ?? []) responses[r.item_id] = { answer: r.answer as Answer, note: r.note ?? '' }

  const observations: Observation[] = (oRows ?? []).map(r => ({
    id: r.id, engagementId: r.engagement_id, area: r.area, title: r.title, detail: r.detail ?? '',
    rating: r.rating, standardRefs: r.standard_refs ?? [], recommendation: r.recommendation ?? '',
    priority: r.priority, ownerRole: r.owner_role ?? '', itemId: r.item_id, source: r.source,
    createdAt: r.created_at,
  }))

  const settings: ConsultSettings = {
    firmName: sRow?.firm_name ?? '', consultantName: sRow?.consultant_name ?? '',
    credentials: sRow?.credentials ?? '', methodology: sRow?.methodology ?? '',
    disclaimer: sRow?.disclaimer ?? '', voiceNotes: sRow?.voice_notes ?? '',
  }

  const library: LibraryEntry[] = (lRows ?? []).map(r => ({
    id: r.id, area: r.area, title: r.title, findingText: r.finding_text ?? '',
    recommendation: r.recommendation ?? '', standardRefs: r.standard_refs ?? [],
    rating: r.rating, priority: r.priority, tags: r.tags ?? [], useCount: r.use_count, builtIn: false,
  }))

  const score = scoreEngagement(scopedAreas(engagement.scopeAreas), responses, observations)
  const priorScore = await loadPriorScore(supabase, engagement)
  const audits = await loadAudits(supabase, engagementId, observations)
  const photos = opts.withPhotos ? await loadPhotos(supabase, observations) : []

  return { engagement, client, responses, observations, score, settings, library, photos, priorScore, audits }
}

/** The client's most recent earlier engagement, scored the same way — the
 *  "where were you last time" comparison consultants are asked for. */
async function loadPriorScore(supabase: SpdClient, e: Engagement): Promise<ReportBundle['priorScore']> {
  const { data: prior } = await supabase
    .from('consult_engagements')
    .select('id, title, visit_start, scope_areas, created_at')
    .eq('client_id', e.clientId)
    .neq('id', e.id)
    .lt('created_at', e.createdAt)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!prior) return null
  const { data: rRows } = await supabase
    .from('consult_responses').select('item_id, answer, note').eq('engagement_id', prior.id)
  const responses: ResponseMap = {}
  for (const r of rRows ?? []) responses[r.item_id] = { answer: r.answer as Answer, note: r.note ?? '' }
  const s = scoreEngagement(scopedAreas(prior.scope_areas ?? []), responses, [])
  return { title: prior.title, date: prior.visit_start, overall: s.overall }
}

async function loadPhotos(supabase: SpdClient, observations: Observation[]): Promise<ReportPhoto[]> {
  if (!observations.length) return []
  const { data: rows } = await supabase
    .from('consult_photos')
    .select('observation_id, file_path, caption, uploaded_at')
    .in('observation_id', observations.map(o => o.id))
    .order('uploaded_at')
  const perObs = new Map<string, number>()
  const picked = (rows ?? []).filter(r => {
    const n = perObs.get(r.observation_id) ?? 0
    if (n >= MAX_PHOTOS_PER_OBS) return false
    perObs.set(r.observation_id, n + 1)
    return true
  }).slice(0, MAX_PHOTOS_TOTAL)

  const out: ReportPhoto[] = []
  for (const r of picked) {
    const { data: blob } = await supabase.storage.from('spd-consult').download(r.file_path)
    if (!blob) continue
    // react-pdf renders JPEG and PNG only; skip anything else (HEIC, WebP).
    const type = blob.type || (r.file_path.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg')
    if (type !== 'image/jpeg' && type !== 'image/png') continue
    const b64 = Buffer.from(await blob.arrayBuffer()).toString('base64')
    out.push({ observationId: r.observation_id, caption: r.caption, dataUri: `data:${type};base64,${b64}` })
  }
  return out
}

async function loadAudits(supabase: SpdClient, engagementId: string, observations: Observation[]): Promise<ReportAudit[]> {
  const { data: aRows } = await supabase.from('consult_audits').select('*').eq('engagement_id', engagementId).order('created_at')
  const audits = (aRows ?? []).map(mapAudit)
  if (!audits.length) return []
  const { data: sRows } = await supabase.from('consult_audit_samples').select('*').in('audit_id', audits.map(a => a.id))
  const samples = (sRows ?? []).map(mapSample)
  const titles = new Map(observations.map(o => [o.id, o.title]))
  return audits.map(a => ({
    audit: a,
    summary: summarize(a, samples.filter(s => s.auditId === a.id)),
    linkedTitle: a.observationId ? titles.get(a.observationId) ?? null : null,
  }))
}
