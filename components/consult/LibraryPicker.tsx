'use client'

import { useEffect, useMemo, useState } from 'react'
import { tokens } from '@/lib/constants/design-tokens'
import { listLibrary } from '@/lib/consult/db/library'
import { STARTER_LIBRARY } from '@/lib/consult/starter-library'
import { FRAMEWORK, RATING_COLOR, RATING_LABEL, areaName } from '@/lib/consult/framework'
import { Pill, Select, TextInput } from './fields'
import type { AreaId, LibraryEntry } from '@/lib/consult/types'

/** Modal: search the consultant's library (plus the starter set) and pick one. */
export default function LibraryPicker({ defaultArea, onPick, onClose }: {
  defaultArea?: AreaId
  onPick:       (e: LibraryEntry) => void
  onClose:      () => void
}) {
  const [mine, setMine] = useState<LibraryEntry[]>([])
  const [q, setQ] = useState('')
  const [area, setArea] = useState<AreaId | 'all'>(defaultArea ?? 'all')

  useEffect(() => { listLibrary().then(setMine).catch(() => setMine([])) }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return [...mine, ...STARTER_LIBRARY].filter(e =>
      (area === 'all' || e.area === area) &&
      (!needle || [e.title, e.findingText, e.recommendation, ...e.tags].some(v => v.toLowerCase().includes(needle))))
  }, [mine, q, area])

  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.75)', zIndex: 50,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '6vh 16px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 760, maxHeight: '86vh', display: 'flex', flexDirection: 'column',
        background: tokens.color.surface, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.lg,
      }}>
        <div style={{ padding: 18, borderBottom: `1px solid ${tokens.color.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: tokens.color.textPrimary }}>Insert from knowledge library</h3>
            <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: tokens.color.textMuted, fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: 200 }}><TextInput autoFocus placeholder="Search findings, recommendations, tags…" value={q} onChange={e => setQ(e.target.value)} /></div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <Select<AreaId | 'all'> value={area} onChange={setArea}
                options={[{ value: 'all', label: 'All areas' }, ...FRAMEWORK.map(a => ({ value: a.id, label: a.name }))]} />
            </div>
          </div>
        </div>
        <div style={{ overflowY: 'auto', padding: 12 }}>
          {!results.length && <div style={{ padding: 24, textAlign: 'center', color: tokens.color.textMuted, fontSize: 13 }}>No matches.</div>}
          {results.map(e => (
            <button key={e.id} onClick={() => onPick(e)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: 12, marginBottom: 8, cursor: 'pointer',
              background: tokens.color.bg, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.sm,
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill color={RATING_COLOR[e.rating]}>{RATING_LABEL[e.rating]}</Pill>
                <span style={{ fontSize: 14, fontWeight: 600, color: tokens.color.textPrimary }}>{e.title}</span>
                <span style={{ fontSize: 11, color: tokens.color.textDimmed }}>{areaName(e.area)}{e.builtIn ? ' · starter' : ` · used ${e.useCount}×`}</span>
              </div>
              <div style={{ fontSize: 12.5, color: tokens.color.textMuted, marginTop: 6, lineHeight: 1.45 }}>
                {e.findingText.length > 220 ? `${e.findingText.slice(0, 217)}…` : e.findingText}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
