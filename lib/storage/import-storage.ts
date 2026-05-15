// ─── IMPORT STORAGE ───────────────────────────────────────────────────────────
// Persists imported CSV datasets to localStorage under key `spd_imports`.

export interface ImportedDataset {
  id:             string
  filename:       string
  uploadedAt:     string
  rowCount:       number
  columnMapping:  Array<{ csvColumn: string; targetField: string }>
  rows:           Record<string, string>[]
  linkedCategory?: string
}

const KEY = 'spd_imports'

function readAll(): ImportedDataset[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ImportedDataset[]) : []
  } catch {
    return []
  }
}

function writeAll(datasets: ImportedDataset[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(datasets))
  } catch {
    // quota exceeded — fail silently
  }
}

export function saveImport(dataset: ImportedDataset): void {
  const all = readAll()
  const idx = all.findIndex(d => d.id === dataset.id)
  if (idx >= 0) { all[idx] = dataset } else { all.unshift(dataset) }
  writeAll(all)
}

export function getAllImports(): ImportedDataset[] {
  return readAll()
}

export function deleteImport(id: string): void {
  writeAll(readAll().filter(d => d.id !== id))
}
