import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'
import type { ChecklistTemplate, ChecklistItemDef } from '@/lib/types/checklist'

type ChecklistRow = {
  id: string; name: string; description: string | null; category: string
  version: string; status: string; is_built_in: boolean
  created_at: string; updated_at: string
}
type ItemRow = {
  id: string; checklist_id: string; question: string; rationale: string | null
  response_type: string; weight: number; severity: string
  reference_url: string | null; item_order: number
}

function mapItem(r: ItemRow): ChecklistItemDef {
  return {
    id:           r.id,
    question:     r.question,
    rationale:    r.rationale ?? undefined,
    responseType: r.response_type as ChecklistItemDef['responseType'],
    weight:       r.weight as ChecklistItemDef['weight'],
    severity:     r.severity as ChecklistItemDef['severity'],
    referenceUrl: r.reference_url ?? undefined,
    order:        r.item_order,
  }
}

function mapChecklist(r: ChecklistRow, items: ChecklistItemDef[]): ChecklistTemplate {
  return {
    id:          r.id,
    name:        r.name,
    description: r.description ?? '',
    category:    r.category as ChecklistTemplate['category'],
    version:     r.version,
    status:      r.status as ChecklistTemplate['status'],
    items,
    createdAt:   r.created_at,
    updatedAt:   r.updated_at,
    isBuiltIn:   r.is_built_in,
  }
}

export async function getAllCustomChecklists(): Promise<ChecklistTemplate[]> {
  const supabase = createClient()
  const { data: lists, error } = await supabase
    .from('checklists')
    .select('id, name, description, category, version, status, is_built_in, created_at, updated_at')
    .eq('is_built_in', false)
    .order('updated_at', { ascending: false })
  if (error || !lists) return []

  const ids = lists.map(l => l.id)
  const byList = new Map<string, ChecklistItemDef[]>()
  if (ids.length) {
    const { data: items } = await supabase
      .from('checklist_items').select('*').in('checklist_id', ids).order('item_order')
    for (const it of (items ?? []) as ItemRow[]) {
      const arr = byList.get(it.checklist_id) ?? []
      arr.push(mapItem(it))
      byList.set(it.checklist_id, arr)
    }
  }
  return (lists as ChecklistRow[]).map(l => mapChecklist(l, byList.get(l.id) ?? []))
}

export async function getCustomChecklist(id: string): Promise<ChecklistTemplate | null> {
  const supabase = createClient()
  const { data: list, error } = await supabase
    .from('checklists')
    .select('id, name, description, category, version, status, is_built_in, created_at, updated_at')
    .eq('id', id).maybeSingle()
  if (error || !list) return null
  const { data: items } = await supabase
    .from('checklist_items').select('*').eq('checklist_id', id).order('item_order')
  return mapChecklist(list as ChecklistRow, ((items ?? []) as ItemRow[]).map(mapItem))
}

async function syncItems(checklistId: string, items: ChecklistItemDef[]): Promise<void> {
  const supabase = createClient()
  await supabase.from('checklist_items').delete().eq('checklist_id', checklistId)
  if (items.length) {
    await supabase.from('checklist_items').insert(items.map((it, i) => ({
      checklist_id:  checklistId,
      question:      it.question,
      rationale:     it.rationale ?? null,
      response_type: it.responseType,
      weight:        it.weight,
      severity:      it.severity,
      reference_url: it.referenceUrl ?? null,
      item_order:    it.order ?? i,
    })))
  }
}

export async function saveCustomChecklist(template: ChecklistTemplate): Promise<void> {
  const supabase = createClient()
  const profile = await getMyProfile()
  if (!profile?.orgId) throw new Error('No profile/org — cannot save checklist')

  await supabase.from('checklists').upsert({
    id:          template.id,
    org_id:      profile.orgId,
    name:        template.name,
    description: template.description,
    category:    template.category,
    version:     template.version,
    status:      template.status,
    is_built_in: false,
    created_by:  profile.id,
    updated_at:  new Date().toISOString(),
  })
  await syncItems(template.id, template.items)
}

export async function updateCustomChecklist(
  id: string,
  updates: Partial<ChecklistTemplate>,
): Promise<void> {
  const supabase = createClient()
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.name !== undefined)        patch.name = updates.name
  if (updates.description !== undefined) patch.description = updates.description
  if (updates.category !== undefined)    patch.category = updates.category
  if (updates.version !== undefined)     patch.version = updates.version
  if (updates.status !== undefined)      patch.status = updates.status
  await supabase.from('checklists').update(patch).eq('id', id)
  if (updates.items) await syncItems(id, updates.items)
}

export async function deleteCustomChecklist(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('checklists').delete().eq('id', id)
}

/** Pure helper — clone a template into a new draft (not persisted). */
export function cloneChecklist(source: ChecklistTemplate, newName: string): ChecklistTemplate {
  const now = new Date().toISOString()
  return {
    ...structuredClone(source),
    id:        crypto.randomUUID(),
    name:      newName,
    version:   'v1',
    status:    'draft',
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  }
}
