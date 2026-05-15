// ─── CSV PARSER ───────────────────────────────────────────────────────────────
// Basic RFC 4180 subset: handles quoted fields, commas inside quotes, CRLF/LF.

export interface ParsedCSV {
  headers:  string[]
  rows:     Record<string, string>[]
  rowCount: number
  errors:   string[]
}

export interface ColumnMapping {
  csvColumn:   string
  targetField: string
}

export const TARGET_FIELDS = [
  { value: 'date',             label: 'Date'                   },
  { value: 'department',       label: 'Department'             },
  { value: 'staff_name',       label: 'Staff Name'             },
  { value: 'case_count',       label: 'Case Count'             },
  { value: 'instrument_count', label: 'Instrument Count'       },
  { value: 'defect_count',     label: 'Defect Count'           },
  { value: 'notes',            label: 'Notes'                  },
  { value: 'ignore',           label: '— Ignore this column —' },
] as const

// Split one line into fields, respecting double-quoted values.
function parseLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { current += '"'; i++ }  // escaped quote
      else { inQuote = !inQuote }
    } else if (ch === ',' && !inQuote) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

export function parseCSVText(text: string): ParsedCSV {
  const errors: string[] = []
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const nonEmpty = lines.filter(l => l.trim().length > 0)

  if (nonEmpty.length === 0) {
    return { headers: [], rows: [], rowCount: 0, errors: ['File is empty'] }
  }

  const headers = parseLine(nonEmpty[0])
  if (headers.length === 0 || headers.every(h => h === '')) {
    return { headers: [], rows: [], rowCount: 0, errors: ['No headers detected'] }
  }

  const rows: Record<string, string>[] = []

  for (let i = 1; i < nonEmpty.length; i++) {
    try {
      const fields = parseLine(nonEmpty[i])
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => { row[h] = fields[idx] ?? '' })
      rows.push(row)
    } catch {
      errors.push(`Row ${i + 1}: parse error — skipped`)
    }
  }

  return { headers, rows, rowCount: rows.length, errors }
}
