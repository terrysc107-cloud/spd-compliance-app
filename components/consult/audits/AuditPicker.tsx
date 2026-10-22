'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { templatesFor, type AuditTemplate } from '@/lib/consult/audits/templates'
import { areaName } from '@/lib/consult/framework'
import { Field, Pill, TextInput } from '../fields'
import type { AreaId, Observation } from '@/lib/consult/types'

/** Modal: pick an audit template (relevant ones first when started from a finding). */
export default function AuditPicker({ forObservation, onStart, onClose }: {
  forObservation?: Observation | null
  onStart: (t: AuditTemplate, targetPerDay: number) => Promise<void>
  onClose: () => void
}) {
  const area: AreaId | undefined = forObservation?.area
  const list = templatesFor(area)
  const [selected, setSelected] = useState<AuditTemplate>(list[0])
  const [target, setTarget] = useState(String(list[0].defaultPerDay))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const relevant = (t: AuditTemplate) => !!area && t.areas.includes(area)

  async function start() {
    setBusy(true)
    try { await onStart(selected, Number(target) || selected.defaultPerDay) } finally { setBusy(false) }
  }

  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.75)', zIndex: 50,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5vh 16px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        background: tokens.color.surface, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.lg,
      }}>
        <div style={{ padding: 18, borderBottom: `1px solid ${tokens.color.border}`, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: tokens.color.textPrimary }}>Start an instant audit</h3>
            {forObservation && <div style={{ fontSize: 12.5, color: tokens.color.textMuted, marginTop: 4 }}>Linked to finding: “{forObservation.title}”</div>}
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', color: tokens.color.textMuted, fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: 0, overflow: 'auto' }}>
          <div style={{ flex: '1 1 280px', padding: 12, borderRight: `1px solid ${tokens.color.border}` }}>
            {list.map(t => (
              <button key={t.id} onClick={() => { setSelected(t); setTarget(String(t.defaultPerDay)) }} style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: 6, cursor: 'pointer',
                borderRadius: tokens.radius.sm, border: `1px solid ${selected.id === t.id ? tokens.color.accentBlue : 'transparent'}`,
                background: selected.id === t.id ? 'rgba(59,130,246,0.12)' : 'transparent',
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: tokens.color.textPrimary }}>{t.name}</span>
                  {relevant(t) && <Pill color={tokens.color.success}>Suggested</Pill>}
                </div>
                <div style={{ fontSize: 12, color: tokens.color.textDimmed, marginTop: 3 }}>
                  {t.items.length} items · per {t.sampleUnit} · {t.areas.map(areaName).join(', ')}
                </div>
              </button>
            ))}
          </div>

          <div style={{ flex: '1.4 1 340px', padding: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: tokens.color.textPrimary }}>{selected.name}</div>
            <p style={{ fontSize: 13, color: tokens.color.textMuted, margin: '6px 0 12px', lineHeight: 1.5 }}>{selected.purpose}</p>
            <div style={{ fontSize: 12, color: tokens.color.textDimmed, marginBottom: 12 }}>
              Sample = one {selected.sampleUnit} ({selected.sampleHint}) · {selected.refs.join(' · ')}
            </div>
            <ol style={{ margin: '0 0 16px', paddingLeft: 20, color: '#cbd5e1', fontSize: 13, lineHeight: 1.6 }}>
              {selected.items.map(i => (
                <li key={i.id}>{i.text}{i.critical && <span style={{ color: tokens.color.danger, fontWeight: 700 }}> · critical</span>}</li>
              ))}
            </ol>
            <div style={{ maxWidth: 220, marginBottom: 16 }}>
              <Field label={`Target ${selected.sampleUnit}s per day`}>
                <TextInput type="number" min={1} max={200} value={target} onChange={e => setTarget(e.target.value)} />
              </Field>
            </div>
            <Button onClick={start} disabled={busy}>{busy ? 'Starting…' : 'Start audit'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
