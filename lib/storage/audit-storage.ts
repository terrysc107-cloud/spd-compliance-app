// ─── TYPES ────────────────────────────────────────────────────────────────────

import type { AuditScore } from '@/lib/scoring/engine'
export type { AuditScore }

export interface StoredFinding {
  itemIndex:       number
  sectionName:     string
  question:        string
  severity:        'critical' | 'major' | 'minor'
  comment:         string
  status:          'open' | 'in-progress' | 'resolved'
  correctiveAction?: string
  resolvedAt?:     string
}

export interface StoredAudit {
  id:              string                     // crypto.randomUUID()
  checklistName:   string
  mode:            'full' | 'focus'
  startedAt:       string                     // ISO timestamp
  completedAt?:    string
  status:          'in-progress' | 'completed'
  responses:       Record<number, { answer: 'yes' | 'no' | 'na'; comment: string }>
  sectionIndex?:   number                     // for focus audits
  score?:          number                     // overall % compliance
  auditScore?:     AuditScore                 // full weighted scoring result (Phase 06+)
  findings:        StoredFinding[]
  departmentId?:   string                     // Phase 07: org department scoping
  conductedBy?:    string                     // Phase 07: user display name
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'spd_audits'

function readAll(): StoredAudit[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as StoredAudit[]) : []
  } catch {
    return []
  }
}

function writeAll(audits: StoredAudit[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(audits))
  } catch {
    // localStorage quota exceeded — fail silently
  }
}

// ─── PUBLIC API ───────────────────────────────────────────────────────────────

export function saveAudit(audit: StoredAudit): void {
  const audits = readAll()
  const idx    = audits.findIndex(a => a.id === audit.id)
  if (idx >= 0) {
    audits[idx] = audit
  } else {
    audits.unshift(audit)
  }
  writeAll(audits)
}

export function getAudit(id: string): StoredAudit | null {
  return readAll().find(a => a.id === id) ?? null
}

export function getAllAudits(): StoredAudit[] {
  return readAll()
}

export function updateAudit(id: string, updates: Partial<StoredAudit>): void {
  const audits = readAll()
  const idx    = audits.findIndex(a => a.id === id)
  if (idx < 0) return
  audits[idx] = { ...audits[idx], ...updates }
  writeAll(audits)
}

export function updateFinding(
  auditId:   string,
  itemIndex: number,
  updates:   Partial<StoredFinding>
): void {
  const audits = readAll()
  const idx    = audits.findIndex(a => a.id === auditId)
  if (idx < 0) return
  const findings   = audits[idx].findings
  const findingIdx = findings.findIndex(f => f.itemIndex === itemIndex)
  if (findingIdx < 0) return
  findings[findingIdx] = { ...findings[findingIdx], ...updates }
  audits[idx] = { ...audits[idx], findings }
  writeAll(audits)
}

export function deleteAudit(id: string): void {
  writeAll(readAll().filter(a => a.id !== id))
}
