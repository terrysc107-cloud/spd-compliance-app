'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { parseCSVText, TARGET_FIELDS, type ParsedCSV, type ColumnMapping } from '@/lib/csv/parser'
import { saveImport, getAllImports, deleteImport, type ImportedDataset } from '@/lib/storage/import-storage'

type Step = 'upload' | 'map' | 'success'

const t = tokens.color
const card: React.CSSProperties = {
  background: t.surface, border: `1px solid ${t.border}`, borderRadius: tokens.radius.md, padding: 24,
}

export default function ImportPage() {
  const fileRef   = useRef<HTMLInputElement>(null)
  const [step, setStep]         = useState<Step>('upload')
  const [filename, setFilename] = useState('')
  const [parsed, setParsed]     = useState<ParsedCSV | null>(null)
  const [mapping, setMapping]   = useState<ColumnMapping[]>([])
  const [dragging, setDragging] = useState(false)
  const [lastImport, setLastImport] = useState<ImportedDataset | null>(null)
  const [imports, setImports]   = useState<ImportedDataset[]>([])
  const [parseErr, setParseErr] = useState('')

  useEffect(() => { setImports(getAllImports()) }, [])

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) { setParseErr('Only .csv files are supported.'); return }
    setFilename(file.name)
    setParseErr('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const result = parseCSVText(text)
      setParsed(result)
      setMapping(result.headers.map(h => ({ csvColumn: h, targetField: 'ignore' })))
      setStep('map')
    }
    reader.readAsText(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const updateMapping = (csvColumn: string, targetField: string) => {
    setMapping(prev => prev.map(m => m.csvColumn === csvColumn ? { ...m, targetField } : m))
  }

  const doImport = () => {
    if (!parsed) return
    const dataset: ImportedDataset = {
      id: crypto.randomUUID(), filename, uploadedAt: new Date().toISOString(),
      rowCount: parsed.rowCount, columnMapping: mapping, rows: parsed.rows,
    }
    saveImport(dataset)
    setLastImport(dataset)
    setImports(getAllImports())
    setStep('success')
  }

  const doDelete = (id: string) => {
    deleteImport(id)
    setImports(getAllImports())
  }

  const reset = () => {
    setStep('upload'); setFilename(''); setParsed(null); setMapping([]); setLastImport(null); setParseErr('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const activeMapping = mapping.filter(m => m.targetField !== 'ignore')
  const preview = parsed?.rows.slice(0, 3) ?? []

  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: t.textPrimary }}>Import Data</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: t.textMuted }}>
          Upload CSV audit data, map columns, and save to your dataset history.
        </p>
      </div>

      {/* ── STEP 1: UPLOAD ── */}
      {step === 'upload' && (
        <div style={{ ...card, marginBottom: 28 }}>
          <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, color: t.textPrimary }}>Step 1 — Upload CSV File</h2>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? t.accentBlue : 'rgba(59,130,246,0.35)'}`,
              borderRadius: tokens.radius.md, padding: '48px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              cursor: 'pointer', background: dragging ? 'rgba(59,130,246,0.04)' : 'transparent',
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={t.accentBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
            </svg>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: t.textPrimary }}>
              Drop a CSV file here or click to browse
            </p>
            <p style={{ margin: 0, fontSize: 13, color: t.textMuted }}>Supported: .csv</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={onFileChange} style={{ display: 'none' }} />
          {parseErr && <p style={{ margin: '10px 0 0', color: t.danger, fontSize: 13 }}>{parseErr}</p>}
        </div>
      )}

      {/* ── STEP 2: MAP COLUMNS ── */}
      {step === 'map' && parsed && (
        <div style={{ ...card, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: t.textPrimary }}>
              Step 2 — Map Columns ({parsed.rowCount} rows detected)
            </h2>
            <button onClick={reset} style={{ background: 'none', border: 'none', color: t.textMuted, cursor: 'pointer', fontSize: 13 }}>
              ← Change file
            </button>
          </div>
          {parsed.errors.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              {parsed.errors.map((e, i) => <p key={i} style={{ margin: 0, fontSize: 13, color: t.danger }}>{e}</p>)}
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr>
                {['CSV Column', 'Map to Field', 'Sample Values'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, fontWeight: 600, color: t.textMuted, borderBottom: `1px solid ${t.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.headers.map((header) => (
                <tr key={header}>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: t.textPrimary, borderBottom: `1px solid ${t.border}` }}>{header}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${t.border}` }}>
                    <select
                      value={mapping.find(m => m.csvColumn === header)?.targetField ?? 'ignore'}
                      onChange={e => updateMapping(header, e.target.value)}
                      style={{ background: t.bg, border: `1px solid ${t.border}`, borderRadius: 6, color: t.textPrimary, padding: '6px 10px', fontSize: 13, width: '100%' }}
                    >
                      {TARGET_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: t.textMuted, borderBottom: `1px solid ${t.border}` }}>
                    {preview.map((row, i) => row[header]).filter(Boolean).slice(0, 3).join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button onClick={doImport} disabled={activeMapping.length === 0}>
              Import Data ({activeMapping.length} field{activeMapping.length !== 1 ? 's' : ''} mapped)
            </Button>
            <Button variant="ghost" onClick={reset}>Cancel</Button>
          </div>
        </div>
      )}

      {/* ── STEP 3: SUCCESS ── */}
      {step === 'success' && lastImport && (
        <div style={{ ...card, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: t.success }}>Import Successful</h2>
          </div>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: t.textMuted }}><strong style={{ color: t.textPrimary }}>{lastImport.rowCount}</strong> rows imported from <strong style={{ color: t.textPrimary }}>{lastImport.filename}</strong></p>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: t.textMuted }}>
            Mapped fields: {lastImport.columnMapping.filter(m => m.targetField !== 'ignore').map(m => m.targetField).join(', ') || 'none'}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button href="/analytics">View Analytics</Button>
            <Button variant="secondary" onClick={reset}>Import Another File</Button>
          </div>
        </div>
      )}

      {/* ── PREVIOUS IMPORTS ── */}
      <div style={card}>
        <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, color: t.textPrimary }}>Previous Imports</h2>
        {imports.length === 0 ? (
          <p style={{ margin: 0, color: t.textMuted, fontSize: 14, textAlign: 'center', padding: '24px 0' }}>No imports yet. Uploaded files will appear here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {imports.map(imp => (
              <div key={imp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: t.bg, borderRadius: 8, border: `1px solid ${t.border}` }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: t.textPrimary }}>{imp.filename}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: t.textMuted }}>
                    {imp.rowCount} rows · {new Date(imp.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => doDelete(imp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textDimmed, fontSize: 12, padding: '4px 8px' }}
                  onMouseOver={e => (e.currentTarget.style.color = t.danger)}
                  onMouseOut={e => (e.currentTarget.style.color = t.textDimmed)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
