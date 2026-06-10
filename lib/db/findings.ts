import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'
import type { FindingEvidence } from '@/lib/db/types'

const BUCKET = 'spd-evidence'

export async function listEvidence(findingId: string): Promise<FindingEvidence[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('finding_evidence')
    .select('id, finding_id, file_path, file_name, file_type, uploaded_at')
    .eq('finding_id', findingId)
    .order('uploaded_at', { ascending: false })
  if (error || !data) return []
  return data.map(r => ({
    id: r.id, findingId: r.finding_id, filePath: r.file_path,
    fileName: r.file_name, fileType: r.file_type, uploadedAt: r.uploaded_at,
  }))
}

export async function uploadEvidence(findingId: string, file: File): Promise<{ error: string | null }> {
  const profile = await getMyProfile()
  if (!profile?.orgId) return { error: 'No organization on profile' }

  const supabase = createClient()
  // Path MUST start with org_id — storage RLS scopes by the first folder segment.
  const safeName = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${profile.orgId}/${findingId}/${crypto.randomUUID()}-${safeName}`

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (upErr) return { error: upErr.message }

  const { error: rowErr } = await supabase.from('finding_evidence').insert({
    finding_id:  findingId,
    org_id:      profile.orgId,
    file_path:   path,
    file_name:   file.name,
    file_type:   file.type || null,
    uploaded_by: profile.id,
  })
  return { error: rowErr?.message ?? null }
}

/** Short-lived signed URL for viewing/downloading an evidence file. */
export async function getEvidenceUrl(filePath: string, expiresInSec = 300): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, expiresInSec)
  if (error || !data) return null
  return data.signedUrl
}

export async function deleteEvidence(ev: FindingEvidence): Promise<void> {
  const supabase = createClient()
  await supabase.storage.from(BUCKET).remove([ev.filePath])
  await supabase.from('finding_evidence').delete().eq('id', ev.id)
}
