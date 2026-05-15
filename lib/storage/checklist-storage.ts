// ─── CUSTOM CHECKLIST STORAGE ─────────────────────────────────────────────────
// Stores user-created checklists in localStorage.
// Built-in templates (ST79, ST91) live in lib/data/templates/ and are NOT stored here.

import type { ChecklistTemplate } from '@/lib/types/checklist'

const STORAGE_KEY = 'spd_checklists'

// ─── PRIVATE HELPERS ──────────────────────────────────────────────────────────

function readAll(): ChecklistTemplate[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ChecklistTemplate[]) : []
  } catch {
    return []
  }
}

function writeAll(templates: ChecklistTemplate[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
  } catch {
    // localStorage quota exceeded — fail silently
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export function saveCustomChecklist(template: ChecklistTemplate): void {
  const all = readAll()
  const idx = all.findIndex(t => t.id === template.id)
  if (idx >= 0) {
    all[idx] = template
  } else {
    all.unshift(template)
  }
  writeAll(all)
}

export function getCustomChecklist(id: string): ChecklistTemplate | null {
  return readAll().find(t => t.id === id) ?? null
}

export function getAllCustomChecklists(): ChecklistTemplate[] {
  return readAll()
}

export function updateCustomChecklist(id: string, updates: Partial<ChecklistTemplate>): void {
  const all = readAll()
  const idx = all.findIndex(t => t.id === id)
  if (idx < 0) return
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() }
  writeAll(all)
}

export function deleteCustomChecklist(id: string): void {
  writeAll(readAll().filter(t => t.id !== id))
}

export function cloneChecklist(
  source: ChecklistTemplate,
  newName: string,
): ChecklistTemplate {
  const now = new Date().toISOString()
  return {
    ...structuredClone(source),
    id:        `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name:      newName,
    version:   'v1',
    status:    'draft',
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  }
}
