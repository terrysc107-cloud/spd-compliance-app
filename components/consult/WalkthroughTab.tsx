'use client'

import { useEffect, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { ANSWER_COLOR, ANSWER_LABEL } from '@/lib/consult/framework'
import { scoreColor, type EngagementScore } from '@/lib/consult/scoring'
import { clearResponse, setResponse } from '@/lib/consult/db/engagements'
import { createObservation } from '@/lib/consult/db/observations'
import { observationFromGap } from '@/lib/consult/builders'
import { Pill, Segmented, Select, TextArea, errMsg } from './fields'
import type { Answer, AreaId, Engagement, FrameworkArea, FrameworkItem, Observation, ResponseMap } from '@/lib/consult/types'

const RISK_COLOR = { critical: '#ef4444', major: '#f97316', minor: '#64748b' } as const
const ANSWERS: Answer[] = ['met', 'partial', 'not-met', 'na']

interface Props {
  engagement:      Engagement
  areas:           FrameworkArea[]
  score:           EngagementScore
  responses:       ResponseMap
  setResponses:    React.Dispatch<React.SetStateAction<ResponseMap>>
  observations:    Observation[]
  setObservations: React.Dispatch<React.SetStateAction<Observation[]>>
  onError:         (msg: string) => void
  /** Jump to an area (set by the voice assistant); `n` changes on every request. */
  focusArea?:      { area: AreaId; n: number } | null
}

/** Tablet portrait / phone: the area list collapses into a dropdown. */
function useNarrow(query = '(max-width: 900px)'): boolean {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    setNarrow(mq.matches)
    const on = (e: MediaQueryListEvent) => setNarrow(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return narrow
}

export default function WalkthroughTab(p: Props) {
  const narrow = useNarrow()
  const [areaId, setAreaId] = useState<AreaId>(() =>
    // Resume at the first area that still has unanswered checkpoints.
    (p.areas.find(a => a.items.some(i => !p.responses[i.id])) ?? p.areas[0])?.id)
  useEffect(() => { if (p.focusArea) setAreaId(p.focusArea.area) }, [p.focusArea])
  const idx = p.areas.findIndex(a => a.id === areaId)
  const area = p.areas[idx] ?? p.areas[0]
  if (!area) return null

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      {!narrow && <nav style={{ width: 250, flexShrink: 0, position: 'sticky', top: 12 }} aria-label="Assessment areas">
        {p.areas.map(a => {
          const s = p.score.areas.find(x => x.areaId === a.id)
          const active = a.id === area.id
          return (
            <button key={a.id} onClick={() => setAreaId(a.id)} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', marginBottom: 4,
              borderRadius: tokens.radius.sm, cursor: 'pointer', border: 'none',
              background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#fff' : tokens.color.textMuted }}>{a.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(s?.score ?? null) }}>{s?.score != null ? `${s.score}%` : ''}</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: 3, borderRadius: 2, width: `${s ? (s.answered / s.total) * 100 : 0}%`, background: s?.answered === s?.total ? tokens.color.success : tokens.color.accentBlue }} />
              </div>
            </button>
          )
        })}
      </nav>}

      <div style={{ flex: 1, minWidth: 0 }}>
        {narrow && (
          <div style={{ marginBottom: 14 }}>
            <Select<AreaId> value={area.id} onChange={setAreaId} options={p.areas.map(a => {
              const s = p.score.areas.find(x => x.areaId === a.id)
              return { value: a.id, label: `${a.name} — ${s?.answered ?? 0}/${a.items.length}${s?.score != null ? ` · ${s.score}%` : ''}` }
            })} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: tokens.color.textPrimary }}>{area.name}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: tokens.color.textMuted }}>{area.description}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {area.items.map(item => <ItemCard key={item.id} item={item} {...p} />)}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
          <Button variant="secondary" disabled={idx <= 0} onClick={() => setAreaId(p.areas[idx - 1].id)}>← Previous area</Button>
          <Button disabled={idx >= p.areas.length - 1} onClick={() => { setAreaId(p.areas[idx + 1].id); window.scrollTo({ top: 0 }) }}>Next area →</Button>
        </div>
      </div>
    </div>
  )
}

function ItemCard({ item, engagement, responses, setResponses, observations, setObservations, onError }: Props & { item: FrameworkItem }) {
  const r = responses[item.id]
  const [note, setNote] = useState(r?.note ?? '')
  // Keep in sync when the note changes elsewhere (e.g. dictated by voice).
  useEffect(() => { setNote(r?.note ?? '') }, [r?.note])
  const [showTip, setShowTip] = useState(false)
  const [busy, setBusy] = useState(false)
  const linked = observations.find(o => o.itemId === item.id)
  const isGap = r?.answer === 'not-met' || r?.answer === 'partial'

  async function answer(a: Answer) {
    const prev = responses[item.id]
    if (prev?.answer === a) {
      // Tapping the active answer clears it.
      setResponses(m => { const n = { ...m }; delete n[item.id]; return n })
      try { await clearResponse(engagement.id, item.id) } catch (e) {
        setResponses(m => ({ ...m, [item.id]: prev })); onError(errMsg(e))
      }
      return
    }
    setResponses(m => ({ ...m, [item.id]: { answer: a, note } }))
    try { await setResponse(engagement.id, item.id, a, note) } catch (e) {
      setResponses(m => { const n = { ...m }; if (prev) n[item.id] = prev; else delete n[item.id]; return n })
      onError(errMsg(e))
    }
  }

  async function saveNote() {
    if (!r || note === r.note) return
    setResponses(m => ({ ...m, [item.id]: { ...r, note } }))
    try { await setResponse(engagement.id, item.id, r.answer, note) } catch (e) { onError(errMsg(e)) }
  }

  async function addFinding() {
    const input = observationFromGap(engagement.id, item.id, { ...responses, [item.id]: { ...r!, note } })
    if (!input) return
    setBusy(true)
    try {
      const obs = await createObservation(input)
      setObservations(list => [...list, obs])
    } catch (e) { onError(errMsg(e)) } finally { setBusy(false) }
  }

  return (
    <Card padding="md">
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14.5, color: tokens.color.textPrimary, lineHeight: 1.45, fontWeight: 500 }}>{item.text}</div>
        <Pill color={RISK_COLOR[item.risk]}>{item.risk.toUpperCase()}</Pill>
      </div>
      <div style={{ fontSize: 11.5, color: tokens.color.textDimmed, marginTop: 6 }}>
        {item.refs.join(' · ')}
        {item.lookFor && (
          <button type="button" onClick={() => setShowTip(v => !v)} style={{ marginLeft: 10, background: 'none', border: 'none', color: tokens.color.accentBlue, cursor: 'pointer', fontSize: 11.5, padding: 0 }}>
            {showTip ? 'Hide tip' : 'What to look for'}
          </button>
        )}
      </div>
      {showTip && item.lookFor && (
        <div style={{ fontSize: 12.5, color: '#bfdbfe', background: 'rgba(59,130,246,0.08)', borderRadius: 6, padding: '8px 10px', marginTop: 8 }}>
          {item.lookFor}
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Segmented<Answer> value={r?.answer ?? null} onChange={answer}
          options={ANSWERS.map(a => ({ value: a, label: ANSWER_LABEL[a], color: ANSWER_COLOR[a] }))} />
      </div>

      {r && (
        <div style={{ marginTop: 10 }}>
          <TextArea rows={2} value={note} placeholder={isGap ? 'What did you see? (evidence, location, who you spoke with)' : 'Note (optional)'}
            onChange={e => setNote(e.target.value)} onBlur={saveNote} />
        </div>
      )}

      {isGap && (
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          {linked
            ? <span style={{ fontSize: 12.5, color: tokens.color.success }}>✓ Finding recorded: “{linked.title}”</span>
            : <Button size="sm" variant="secondary" disabled={busy} onClick={addFinding}>{busy ? 'Adding…' : '+ Add as finding'}</Button>}
        </div>
      )}
    </Card>
  )
}
