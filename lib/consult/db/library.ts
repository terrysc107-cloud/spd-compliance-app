import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'
import type { AreaId, ConsultSettings, LibraryEntry, Priority, Rating } from '@/lib/consult/types'

type LibraryRow = {
  id: string; area: string; title: string; finding_text: string | null; recommendation: string | null
  standard_refs: string[] | null; rating: string; priority: string; tags: string[] | null; use_count: number
}

function mapEntry(r: LibraryRow): LibraryEntry {
  return {
    id: r.id, area: r.area as AreaId, title: r.title, findingText: r.finding_text ?? '',
    recommendation: r.recommendation ?? '', standardRefs: r.standard_refs ?? [],
    rating: r.rating as Rating, priority: r.priority as Priority, tags: r.tags ?? [],
    useCount: r.use_count, builtIn: false,
  }
}

export type LibraryInput = Omit<LibraryEntry, 'id' | 'useCount' | 'builtIn'>

function toRow(e: Partial<LibraryInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (e.area !== undefined)           row.area = e.area
  if (e.title !== undefined)          row.title = e.title.trim()
  if (e.findingText !== undefined)    row.finding_text = e.findingText || null
  if (e.recommendation !== undefined) row.recommendation = e.recommendation || null
  if (e.standardRefs !== undefined)   row.standard_refs = e.standardRefs.map(s => s.trim()).filter(Boolean)
  if (e.rating !== undefined)         row.rating = e.rating
  if (e.priority !== undefined)       row.priority = e.priority
  if (e.tags !== undefined)           row.tags = e.tags.map(t => t.trim().toLowerCase()).filter(Boolean)
  return row
}

export async function listLibrary(): Promise<LibraryEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_library')
    .select('*')
    .order('use_count', { ascending: false })
    .order('title')
  if (error) throw new Error(error.message)
  return ((data ?? []) as LibraryRow[]).map(mapEntry)
}

export async function createLibraryEntry(input: LibraryInput): Promise<LibraryEntry> {
  if (!input.title.trim()) throw new Error('Library entry needs a title')
  const profile = await getMyProfile()
  if (!profile?.orgId) throw new Error('No profile/org — cannot save library entry')
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_library')
    .insert({ ...toRow(input), org_id: profile.orgId, created_by: profile.id })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapEntry(data as LibraryRow)
}

export async function updateLibraryEntry(id: string, updates: Partial<LibraryInput>): Promise<void> {
  if (updates.title !== undefined && !updates.title.trim()) throw new Error('Library entry needs a title')
  const supabase = createClient()
  const { error } = await supabase
    .from('consult_library')
    .update({ ...toRow(updates), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteLibraryEntry(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('consult_library').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Best-effort usage counter; popular entries float to the top of pickers. */
export async function bumpLibraryUse(entry: LibraryEntry): Promise<void> {
  if (entry.builtIn) return
  const supabase = createClient()
  await supabase.from('consult_library').update({ use_count: entry.useCount + 1 }).eq('id', entry.id)
}

// ─── CONSULTANT SETTINGS ────────────────────────────────────────────────────

export const EMPTY_SETTINGS: ConsultSettings = {
  firmName: '', consultantName: '', credentials: '', methodology: '', disclaimer: '', voiceNotes: '',
}

export async function getConsultSettings(): Promise<ConsultSettings> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return EMPTY_SETTINGS
  const { data } = await supabase.from('consult_settings').select('*').eq('user_id', user.id).maybeSingle()
  if (!data) return EMPTY_SETTINGS
  return {
    firmName: data.firm_name ?? '', consultantName: data.consultant_name ?? '',
    credentials: data.credentials ?? '', methodology: data.methodology ?? '',
    disclaimer: data.disclaimer ?? '', voiceNotes: data.voice_notes ?? '',
  }
}

export async function saveConsultSettings(s: ConsultSettings): Promise<void> {
  const profile = await getMyProfile()
  if (!profile?.orgId) throw new Error('No profile/org — cannot save settings')
  const supabase = createClient()
  const { error } = await supabase.from('consult_settings').upsert({
    user_id: profile.id, org_id: profile.orgId,
    firm_name: s.firmName || null, consultant_name: s.consultantName || null,
    credentials: s.credentials || null, methodology: s.methodology || null,
    disclaimer: s.disclaimer || null, voice_notes: s.voiceNotes || null,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}
