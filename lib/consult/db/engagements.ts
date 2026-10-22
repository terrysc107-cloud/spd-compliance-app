import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'
import { consultIdentity } from '@/lib/consult/identity'
import { perform } from '@/lib/consult/offline/queue'
import type {
  AreaId, Answer, DepartmentProfile, Engagement, EngagementStatus, EngagementType, ResponseMap,
} from '@/lib/consult/types'

type EngagementRow = {
  id: string; client_id: string; title: string; engagement_type: string; status: string
  visit_start: string | null; visit_end: string | null; scope_areas: string[] | null
  department_profile: DepartmentProfile | null; executive_summary: string | null
  ai_draft: string | null; delivered_at: string | null; created_at: string; updated_at: string
  client?: { name: string } | null
}

const SELECT = '*, client:consult_clients(name)'

export function mapEngagement(r: EngagementRow): Engagement {
  return {
    id: r.id, clientId: r.client_id, clientName: r.client?.name, title: r.title,
    type: r.engagement_type as EngagementType, status: r.status as EngagementStatus,
    visitStart: r.visit_start, visitEnd: r.visit_end,
    scopeAreas: (r.scope_areas ?? []) as AreaId[], profile: r.department_profile ?? {},
    executiveSummary: r.executive_summary, aiDraft: r.ai_draft, deliveredAt: r.delivered_at,
    createdAt: r.created_at, updatedAt: r.updated_at,
  }
}

export async function listEngagements(clientId?: string): Promise<Engagement[]> {
  const supabase = createClient()
  let q = supabase.from('consult_engagements').select(SELECT).order('visit_start', { ascending: false, nullsFirst: false })
  if (clientId) q = q.eq('client_id', clientId)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return ((data ?? []) as unknown as EngagementRow[]).map(mapEngagement)
}

export async function getEngagement(id: string): Promise<Engagement | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('consult_engagements').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapEngagement(data as unknown as EngagementRow) : null
}

export interface EngagementInput {
  clientId:   string
  title:      string
  type:       EngagementType
  visitStart: string | null
  visitEnd:   string | null
  scopeAreas: AreaId[]
}

export async function createEngagement(input: EngagementInput): Promise<Engagement> {
  if (!input.clientId) throw new Error('Choose a client')
  if (!input.title.trim()) throw new Error('Engagement title is required')
  if (input.visitStart && input.visitEnd && input.visitEnd < input.visitStart) {
    throw new Error('Visit end date is before the start date')
  }
  const profile = await getMyProfile()
  if (!profile?.orgId) throw new Error('No profile/org — cannot create engagement')
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_engagements')
    .insert({
      org_id: profile.orgId, created_by: profile.id, client_id: input.clientId,
      title: input.title.trim(), engagement_type: input.type,
      visit_start: input.visitStart || null, visit_end: input.visitEnd || null,
      scope_areas: input.scopeAreas,
    })
    .select(SELECT)
    .single()
  if (error) throw new Error(error.message)
  return mapEngagement(data as unknown as EngagementRow)
}

export type EngagementPatch = Partial<Pick<Engagement,
  'title' | 'type' | 'status' | 'visitStart' | 'visitEnd' | 'scopeAreas' | 'profile' |
  'executiveSummary' | 'aiDraft' | 'deliveredAt'>>

export async function updateEngagement(id: string, u: EngagementPatch): Promise<void> {
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (u.title !== undefined)            patch.title = u.title.trim()
  if (u.type !== undefined)             patch.engagement_type = u.type
  if (u.status !== undefined)           patch.status = u.status
  if (u.visitStart !== undefined)       patch.visit_start = u.visitStart || null
  if (u.visitEnd !== undefined)         patch.visit_end = u.visitEnd || null
  if (u.scopeAreas !== undefined)       patch.scope_areas = u.scopeAreas
  if (u.profile !== undefined)          patch.department_profile = u.profile
  if (u.executiveSummary !== undefined) patch.executive_summary = u.executiveSummary
  if (u.aiDraft !== undefined)          patch.ai_draft = u.aiDraft
  if (u.deliveredAt !== undefined)      patch.delivered_at = u.deliveredAt
  const supabase = createClient()
  const { error } = await supabase.from('consult_engagements').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteEngagement(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('consult_engagements').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── WALKTHROUGH RESPONSES ──────────────────────────────────────────────────

export async function getResponses(engagementId: string): Promise<ResponseMap> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_responses')
    .select('item_id, answer, note')
    .eq('engagement_id', engagementId)
  if (error) throw new Error(error.message)
  const map: ResponseMap = {}
  for (const r of data ?? []) map[r.item_id] = { answer: r.answer as Answer, note: r.note ?? '' }
  return map
}

/** Responses for several engagements at once (client history trend). */
export async function getResponsesFor(engagementIds: string[]): Promise<Record<string, ResponseMap>> {
  const out: Record<string, ResponseMap> = {}
  if (!engagementIds.length) return out
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_responses')
    .select('engagement_id, item_id, answer, note')
    .in('engagement_id', engagementIds)
  if (error) throw new Error(error.message)
  for (const r of data ?? []) {
    const m = (out[r.engagement_id] ??= {})
    m[r.item_id] = { answer: r.answer as Answer, note: r.note ?? '' }
  }
  return out
}

export async function setResponse(engagementId: string, itemId: string, answer: Answer, note: string): Promise<void> {
  const me = await consultIdentity()
  await perform({ kind: 'response.set', row: {
    engagement_id: engagementId, item_id: itemId, org_id: me.orgId,
    answer, note: note || null, updated_at: new Date().toISOString(),
  } })
}

export async function clearResponse(engagementId: string, itemId: string): Promise<void> {
  await perform({ kind: 'response.clear', engagementId, itemId })
}
