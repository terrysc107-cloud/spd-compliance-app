import { createClient } from '@/lib/supabase/client'
import { consultIdentity } from '@/lib/consult/identity'
import { CONSULT_BUCKET, perform } from '@/lib/consult/offline/queue'
import { jpegName, normalizePhoto } from '@/lib/consult/photo'
import type { AreaId, Observation, Photo, Priority, Rating } from '@/lib/consult/types'

export { CONSULT_BUCKET }
const MAX_PHOTO_BYTES = 40 * 1024 * 1024   // pre-normalization; output is ~200–500 KB

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
  const me = await consultIdentity()
  // Client-made id: the row can be queued offline and replayed idempotently.
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  await perform({ kind: 'observation.upsert', row: {
    ...toRow(input), id, engagement_id: input.engagementId, org_id: me.orgId,
    created_by: me.userId, created_at: createdAt,
  } })
  return {
    ...input, id, createdAt, photos: [],
    title: input.title.trim(), standardRefs: input.standardRefs.map(r => r.trim()).filter(Boolean),
  }
}

export async function updateObservation(id: string, updates: Partial<ObservationInput>): Promise<void> {
  if (updates.title !== undefined && !updates.title.trim()) throw new Error('Observation title is required')
  await perform({ kind: 'observation.update', id, patch: { ...toRow(updates), updated_at: new Date().toISOString() } })
}

export async function deleteObservation(obs: Observation): Promise<void> {
  await perform({ kind: 'observation.delete', id: obs.id, paths: (obs.photos ?? []).map(p => p.filePath) })
}

// ─── PHOTOS ─────────────────────────────────────────────────────────────────

/** Normalizes to JPEG (see lib/consult/photo), then saves or queues. The
 *  returned photo previews from a local object URL until the next load. */
export async function uploadPhoto(obs: Observation, file: File, caption = ''): Promise<Photo> {
  if (!file.type.startsWith('image/') && !/\.(heic|heif)$/i.test(file.name)) throw new Error('Only image files can be attached')
  if (file.size > MAX_PHOTO_BYTES) throw new Error('Photo is too large')
  const me = await consultIdentity()
  const blob = await normalizePhoto(file)
  const id = crypto.randomUUID()
  const fileName = jpegName(file.name)
  const path = `${me.orgId}/${obs.engagementId}/${obs.id}/${id}.jpg`
  const row = {
    id, org_id: me.orgId, observation_id: obs.id, file_path: path,
    file_name: fileName, caption: caption || null, uploaded_by: me.userId,
  }
  await perform({ kind: 'photo.upload', path, blob, contentType: 'image/jpeg', row })
  return { id, observationId: obs.id, filePath: path, fileName, caption: caption || null, url: URL.createObjectURL(blob) }
}

export async function deletePhoto(photo: Photo): Promise<void> {
  await perform({ kind: 'photo.delete', id: photo.id, path: photo.filePath })
}
