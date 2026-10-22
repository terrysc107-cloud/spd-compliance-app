import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'
import type { AreaId, Observation, Photo, Priority, Rating } from '@/lib/consult/types'

export const CONSULT_BUCKET = 'spd-consult'
const MAX_PHOTO_BYTES = 10 * 1024 * 1024

type ObservationRow = {
  id: string; engagement_id: string; area: string; title: string; detail: string | null
  rating: string; standard_refs: string[] | null; recommendation: string | null
  priority: string; owner_role: string | null; item_id: string | null; source: string
  created_at: string
}

type PhotoRow = {
  id: string; observation_id: string; file_path: string; file_name: string; caption: string | null
}

function mapObservation(r: ObservationRow): Observation {
  return {
    id: r.id, engagementId: r.engagement_id, area: r.area as AreaId, title: r.title,
    detail: r.detail ?? '', rating: r.rating as Rating, standardRefs: r.standard_refs ?? [],
    recommendation: r.recommendation ?? '', priority: r.priority as Priority,
    ownerRole: r.owner_role ?? '', itemId: r.item_id,
    source: r.source as Observation['source'], createdAt: r.created_at,
  }
}

function mapPhoto(r: PhotoRow): Photo {
  return { id: r.id, observationId: r.observation_id, filePath: r.file_path, fileName: r.file_name, caption: r.caption }
}

export async function listObservations(engagementId: string): Promise<Observation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_observations')
    .select('*')
    .eq('engagement_id', engagementId)
    .order('created_at')
  if (error) throw new Error(error.message)
  const obs = ((data ?? []) as ObservationRow[]).map(mapObservation)
  if (!obs.length) return obs

  const { data: photos } = await supabase
    .from('consult_photos')
    .select('id, observation_id, file_path, file_name, caption')
    .in('observation_id', obs.map(o => o.id))
  const byObs = new Map<string, Photo[]>()
  for (const p of (photos ?? []) as PhotoRow[]) {
    const arr = byObs.get(p.observation_id) ?? []
    arr.push(mapPhoto(p))
    byObs.set(p.observation_id, arr)
  }
  if (byObs.size) {
    const paths = [...byObs.values()].flat().map(p => p.filePath)
    const { data: signed } = await supabase.storage.from(CONSULT_BUCKET).createSignedUrls(paths, 3600)
    const urlByPath = new Map((signed ?? []).map(s => [s.path, s.signedUrl]))
    for (const arr of byObs.values()) for (const p of arr) p.url = urlByPath.get(p.filePath) ?? undefined
  }
  return obs.map(o => ({ ...o, photos: byObs.get(o.id) ?? [] }))
}

export type ObservationInput = Omit<Observation, 'id' | 'createdAt' | 'photos'>

function toRow(o: Partial<ObservationInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (o.area !== undefined)           row.area = o.area
  if (o.title !== undefined)          row.title = o.title.trim()
  if (o.detail !== undefined)         row.detail = o.detail || null
  if (o.rating !== undefined)         row.rating = o.rating
  if (o.standardRefs !== undefined)   row.standard_refs = o.standardRefs.map(s => s.trim()).filter(Boolean)
  if (o.recommendation !== undefined) row.recommendation = o.recommendation || null
  if (o.priority !== undefined)       row.priority = o.priority
  if (o.ownerRole !== undefined)      row.owner_role = o.ownerRole || null
  if (o.itemId !== undefined)         row.item_id = o.itemId
  if (o.source !== undefined)         row.source = o.source
  return row
}

export async function createObservation(input: ObservationInput): Promise<Observation> {
  if (!input.title.trim()) throw new Error('Observation title is required')
  const profile = await getMyProfile()
  if (!profile?.orgId) throw new Error('No profile/org — cannot save observation')
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_observations')
    .insert({ ...toRow(input), engagement_id: input.engagementId, org_id: profile.orgId, created_by: profile.id })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return { ...mapObservation(data as ObservationRow), photos: [] }
}

export async function updateObservation(id: string, updates: Partial<ObservationInput>): Promise<void> {
  if (updates.title !== undefined && !updates.title.trim()) throw new Error('Observation title is required')
  const supabase = createClient()
  const { error } = await supabase
    .from('consult_observations')
    .update({ ...toRow(updates), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteObservation(obs: Observation): Promise<void> {
  const supabase = createClient()
  const paths = (obs.photos ?? []).map(p => p.filePath)
  if (paths.length) await supabase.storage.from(CONSULT_BUCKET).remove(paths)
  const { error } = await supabase.from('consult_observations').delete().eq('id', obs.id)
  if (error) throw new Error(error.message)
}

// ─── PHOTOS ─────────────────────────────────────────────────────────────────

export async function uploadPhoto(obs: Observation, file: File, caption = ''): Promise<Photo> {
  if (!file.type.startsWith('image/')) throw new Error('Only image files can be attached')
  if (file.size > MAX_PHOTO_BYTES) throw new Error('Photo is larger than 10 MB')
  const profile = await getMyProfile()
  if (!profile?.orgId) throw new Error('No profile/org — cannot upload photo')

  const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(-80) || 'photo.jpg'
  const path = `${profile.orgId}/${obs.engagementId}/${obs.id}/${Date.now()}-${safeName}`
  const supabase = createClient()
  const { error: upErr } = await supabase.storage.from(CONSULT_BUCKET).upload(path, file, { contentType: file.type })
  if (upErr) throw new Error(upErr.message)

  const { data, error } = await supabase
    .from('consult_photos')
    .insert({
      org_id: profile.orgId, observation_id: obs.id, file_path: path,
      file_name: file.name, caption: caption || null, uploaded_by: profile.id,
    })
    .select('id, observation_id, file_path, file_name, caption')
    .single()
  if (error) {
    await supabase.storage.from(CONSULT_BUCKET).remove([path])
    throw new Error(error.message)
  }
  const { data: signed } = await supabase.storage.from(CONSULT_BUCKET).createSignedUrl(path, 3600)
  return { ...mapPhoto(data as PhotoRow), url: signed?.signedUrl }
}

export async function deletePhoto(photo: Photo): Promise<void> {
  const supabase = createClient()
  await supabase.storage.from(CONSULT_BUCKET).remove([photo.filePath])
  const { error } = await supabase.from('consult_photos').delete().eq('id', photo.id)
  if (error) throw new Error(error.message)
}
