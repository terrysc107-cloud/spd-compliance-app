import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'
import type { Client, FacilityType } from '@/lib/consult/types'

type ClientRow = {
  id: string; name: string; facility_type: string; city: string | null; state: string | null
  bed_count: number | null; annual_surgical_cases: number | null
  contact_name: string | null; contact_title: string | null; contact_email: string | null
  contact_phone: string | null; notes: string | null; created_at: string
}

function mapClient(r: ClientRow): Client {
  return {
    id: r.id, name: r.name, facilityType: r.facility_type as FacilityType,
    city: r.city, state: r.state, bedCount: r.bed_count, annualSurgicalCases: r.annual_surgical_cases,
    contactName: r.contact_name, contactTitle: r.contact_title, contactEmail: r.contact_email,
    contactPhone: r.contact_phone, notes: r.notes, createdAt: r.created_at,
  }
}

export type ClientInput = Omit<Client, 'id' | 'createdAt'>

function toRow(c: Partial<ClientInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (c.name !== undefined)                row.name = c.name.trim()
  if (c.facilityType !== undefined)        row.facility_type = c.facilityType
  if (c.city !== undefined)                row.city = c.city || null
  if (c.state !== undefined)               row.state = c.state || null
  if (c.bedCount !== undefined)            row.bed_count = c.bedCount
  if (c.annualSurgicalCases !== undefined) row.annual_surgical_cases = c.annualSurgicalCases
  if (c.contactName !== undefined)         row.contact_name = c.contactName || null
  if (c.contactTitle !== undefined)        row.contact_title = c.contactTitle || null
  if (c.contactEmail !== undefined)        row.contact_email = c.contactEmail || null
  if (c.contactPhone !== undefined)        row.contact_phone = c.contactPhone || null
  if (c.notes !== undefined)               row.notes = c.notes || null
  return row
}

export async function listClients(): Promise<Client[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('consult_clients').select('*').order('name')
  if (error) throw new Error(error.message)
  return ((data ?? []) as ClientRow[]).map(mapClient)
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('consult_clients').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  return data ? mapClient(data as ClientRow) : null
}

export async function createClientRecord(input: ClientInput): Promise<Client> {
  if (!input.name.trim()) throw new Error('Client name is required')
  const profile = await getMyProfile()
  if (!profile?.orgId) throw new Error('No profile/org — cannot create client')
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consult_clients')
    .insert({ ...toRow(input), org_id: profile.orgId, created_by: profile.id })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapClient(data as ClientRow)
}

export async function updateClientRecord(id: string, updates: Partial<ClientInput>): Promise<void> {
  if (updates.name !== undefined && !updates.name.trim()) throw new Error('Client name is required')
  const supabase = createClient()
  const { error } = await supabase
    .from('consult_clients')
    .update({ ...toRow(updates), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteClientRecord(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('consult_clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
