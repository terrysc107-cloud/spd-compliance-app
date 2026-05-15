// ─── CHECKLIST SYSTEM TYPES ───────────────────────────────────────────────────

export type ResponseType    = 'pass-fail' | 'yes-no' | 'numeric' | 'text'
export type Severity        = 'critical' | 'major' | 'minor'
export type ChecklistCategory = 'st79' | 'st91' | 'st108' | 'custom'
export type ChecklistStatus = 'draft' | 'active' | 'archived'

export interface ChecklistItemDef {
  id:            string
  question:      string
  rationale?:    string
  responseType:  ResponseType
  weight:        1 | 2 | 3   // affects scoring: critical=3, major=2, minor=1
  severity:      Severity
  referenceUrl?: string       // AAMI standard link
  order:         number
}

export interface ChecklistTemplate {
  id:          string
  name:        string
  description: string
  category:    ChecklistCategory
  version:     string          // e.g. "v1", "v2"
  status:      ChecklistStatus
  items:       ChecklistItemDef[]
  createdAt:   string          // ISO timestamp
  updatedAt:   string          // ISO timestamp
  isBuiltIn:   boolean         // true for AAMI templates, false for custom
}
