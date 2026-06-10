// ─── TYPES ────────────────────────────────────────────────────────────────────
// Canonical shapes now live in lib/db/types. Re-exported here for back-compat
// with existing imports. NOTE: the localStorage functions below are DEPRECATED —
// the app persists to Supabase via lib/db/audits. Kept only until all call sites
// migrate; do not add new usages.

export type { AuditScore, StoredFinding, StoredAudit } from '@/lib/db/types'
import type { StoredAudit, StoredFinding } from '@/lib/db/types'

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
