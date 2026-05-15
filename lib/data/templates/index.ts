// ─── BUILT-IN TEMPLATE REGISTRY ───────────────────────────────────────────────
// Import all built-in AAMI templates here. These are never stored in localStorage.

import { ST108_TEMPLATE } from './st108'
import { st79Template }   from './st79'
import { st91Template }   from './st91'
import type { ChecklistTemplate } from '@/lib/types/checklist'

export { ST108_TEMPLATE }
export { st79Template }
export { st91Template }

export const BUILT_IN_TEMPLATES: ChecklistTemplate[] = [
  st79Template,
  st91Template,
  ST108_TEMPLATE,
]

export function getBuiltInTemplate(id: string): ChecklistTemplate | null {
  return BUILT_IN_TEMPLATES.find(t => t.id === id) ?? null
}

export function getAllTemplates(customTemplates: ChecklistTemplate[]): ChecklistTemplate[] {
  return [...BUILT_IN_TEMPLATES, ...customTemplates]
}
