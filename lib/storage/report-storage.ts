// ─── REPORT STORAGE ───────────────────────────────────────────────────────────
// Persists generated report records to localStorage under key `spd_reports`.

export interface SavedReport {
  id:          string
  title:       string
  reportType:  string
  generatedAt: string
  text:        string
  auditCount:  number
  avgScore:    number
}

const KEY = 'spd_reports'

function readAll(): SavedReport[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedReport[]) : []
  } catch {
    return []
  }
}

function writeAll(reports: SavedReport[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(reports))
  } catch {
    // quota exceeded — fail silently
  }
}

export function saveReport(report: SavedReport): void {
  const all = readAll()
  all.unshift(report)
  writeAll(all.slice(0, 50)) // cap at 50 stored reports
}

export function getAllReports(): SavedReport[] {
  return readAll()
}

export function deleteReport(id: string): void {
  writeAll(readAll().filter(r => r.id !== id))
}
