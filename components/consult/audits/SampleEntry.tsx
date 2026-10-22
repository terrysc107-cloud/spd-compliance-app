'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { addSample, today } from '@/lib/consult/db/audits'
import { Field, Segmented, TextArea, TextInput, errMsg } from '../fields'
import type { Audit, AuditAnswer, AuditSample } from '@/lib/consult/types'

const ANSWERS: { value: AuditAnswer; label: string; color: string }[] = [
  { value: 'yes', label: 'Yes', color: '#22c55e' },
  { value: 'no',  label: 'No',  color: '#ef4444' },
  { value: 'na',  label: 'N/A', color: '#64748b' },
]

/** "Load 4" → "Load 5", "Tray A" → "Tray A" — speeds up keying a stack of paper forms. */
function nextRef(ref: string): string {
  const m = ref.match(/^(.*?)(\d+)(\D*)$/)
  return m ? `${m[1]}${Number(m[2]) + 1}${m[3]}` : ref
}

/**
 * Fast entry for one sample. Date, source, and auditor persist between saves
 * so a stack of a week's paper forms can be keyed in one pass.
 */
export default function SampleEntry({ audit, hint, onSaved, onError }: {
  audit:   Audit
  hint:    string
  onSaved: (s: AuditSample) => void
  onError: (msg: string) => void
}) {
  const [sampledOn, setSampledOn] = useState(today())
  const [source, setSource] = useState<AuditSample['source']>('observed')
  const [auditor, setAuditor] = useState('')
  const [sampleRef, setSampleRef] = useState('')
  const [answers, setAnswers] = useState<Record<string, AuditAnswer>>({})
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [count, setCount] = useState(0)

  const answered = audit.items.filter(i => answers[i.id]).length

  async function save() {
    setBusy(true)
    try {
      const s = await addSample({ auditId: audit.id, sampledOn, sampleRef, source, auditor, answers, note })
      onSaved(s)
      setCount(c => c + 1)
      setAnswers({}); setNote(''); setSampleRef(r => nextRef(r))
    } catch (e) { onError(errMsg(e)) } finally { setBusy(false) }
  }

  return (
    <Card padding="lg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15, color: tokens.color.textPrimary }}>Log a {audit.sampleUnit}</h3>
        {count > 0 && <span style={{ fontSize: 12.5, color: tokens.color.success }}>{count} saved this session</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
        <Field label="Date performed"><TextInput type="date" value={sampledOn} max={today()} onChange={e => setSampledOn(e.target.value)} /></Field>
        <Field label="Source">
          <Segmented<AuditSample['source']> value={source} onChange={setSource} options={[
            { value: 'observed', label: 'I observed', color: tokens.color.accentBlue },
            { value: 'paper', label: 'Paper form', color: tokens.color.accentPurple },
          ]} />
        </Field>
        {source === 'paper' && (
          <Field label="Audited by"><TextInput value={auditor} placeholder="Name on the form" onChange={e => setAuditor(e.target.value)} /></Field>
        )}
        <Field label="Sample reference"><TextInput value={sampleRef} placeholder={hint} onChange={e => setSampleRef(e.target.value)} /></Field>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
        <Button size="sm" variant="ghost" onClick={() => setAnswers(Object.fromEntries(audit.items.map(i => [i.id, 'yes' as const])))}>All yes</Button>
        <Button size="sm" variant="ghost" onClick={() => setAnswers({})}>Clear</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {audit.items.map((it, n) => (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
            padding: '8px 10px', borderRadius: tokens.radius.sm, background: answers[it.id] === 'no' ? 'rgba(239,68,68,0.08)' : 'transparent',
          }}>
            <span style={{ fontSize: 13.5, color: tokens.color.textPrimary, flex: '1 1 260px' }}>
              <span style={{ color: tokens.color.textDimmed }}>{n + 1}. </span>{it.text}
              {it.critical && <span style={{ color: tokens.color.danger, fontWeight: 700, fontSize: 11 }}> CRITICAL</span>}
            </span>
            <Segmented<AuditAnswer> value={answers[it.id] ?? null} options={ANSWERS}
              onChange={v => setAnswers(a => ({ ...a, [it.id]: v }))} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <TextArea rows={2} value={note} placeholder="Note (what failed, who was told, action taken)" onChange={e => setNote(e.target.value)} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <Button onClick={save} disabled={busy || !answered}>{busy ? 'Saving…' : 'Save & next'}</Button>
        <span style={{ fontSize: 12.5, color: tokens.color.textDimmed }}>{answered}/{audit.items.length} answered</span>
      </div>
    </Card>
  )
}
