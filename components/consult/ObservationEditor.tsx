'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { FRAMEWORK, PRIORITY_LABEL, PRIORITY_ORDER, RATING_COLOR, RATING_LABEL, RATING_ORDER } from '@/lib/consult/framework'
import { Field, Segmented, Select, TextArea, TextInput, grid } from './fields'
import type { AreaId, Priority, Rating } from '@/lib/consult/types'

export interface ObservationDraft {
  area:           AreaId
  title:          string
  detail:         string
  rating:         Rating
  priority:       Priority
  recommendation: string
  standardRefs:   string[]
  ownerRole:      string
}

export const BLANK_DRAFT: ObservationDraft = {
  area: 'decon', title: '', detail: '', rating: 'opportunity', priority: '30-day',
  recommendation: '', standardRefs: [], ownerRole: '',
}

const OWNER_SUGGESTIONS = ['SPD Manager', 'SPD Director', 'Perioperative Director', 'OR Manager', 'Infection Prevention', 'Facilities / Engineering', 'Biomedical Engineering', 'Endoscopy Manager', 'Education Coordinator', 'Supply Chain']

/** Shared editor for observations and library entries. */
export default function ObservationEditor({ initial, submitLabel, onSubmit, onCancel, hideOwner }: {
  initial:     ObservationDraft
  submitLabel: string
  onSubmit:    (d: ObservationDraft) => Promise<void>
  onCancel:    () => void
  hideOwner?:  boolean
}) {
  const [d, setD] = useState(initial)
  const [refs, setRefs] = useState(initial.standardRefs.join('\n'))
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof ObservationDraft>(k: K, v: ObservationDraft[K]) => setD(p => ({ ...p, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!d.title.trim()) return
    setSaving(true)
    try {
      await onSubmit({ ...d, standardRefs: refs.split('\n').map(s => s.trim()).filter(Boolean) })
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={grid(220)}>
        <Field label="Title *"><TextInput value={d.title} onChange={e => set('title', e.target.value)} required placeholder="Short, report-ready headline" /></Field>
        <Field label="Area">
          <Select<AreaId> value={d.area} onChange={v => set('area', v)} options={FRAMEWORK.map(a => ({ value: a.id, label: a.name }))} />
        </Field>
      </div>
      <Field label="Rating">
        <Segmented<Rating> value={d.rating} onChange={v => set('rating', v)}
          options={RATING_ORDER.map(r => ({ value: r, label: RATING_LABEL[r], color: RATING_COLOR[r] }))} />
      </Field>
      <Field label="What was observed">
        <TextArea rows={3} value={d.detail} onChange={e => set('detail', e.target.value)} placeholder="Facts only: what, where, how often, evidence reviewed" />
      </Field>
      <Field label={d.rating === 'strength' ? 'Recommendation (optional)' : 'Recommendation'}>
        <TextArea rows={3} value={d.recommendation} onChange={e => set('recommendation', e.target.value)} />
      </Field>
      <div style={grid(220)}>
        {d.rating !== 'strength' && (
          <Field label="Priority">
            <Select<Priority> value={d.priority} onChange={v => set('priority', v)} options={PRIORITY_ORDER.map(p => ({ value: p, label: PRIORITY_LABEL[p] }))} />
          </Field>
        )}
        {!hideOwner && (
          <Field label="Suggested owner">
            <TextInput list="owner-suggestions" value={d.ownerRole} onChange={e => set('ownerRole', e.target.value)} />
            <datalist id="owner-suggestions">{OWNER_SUGGESTIONS.map(o => <option key={o} value={o} />)}</datalist>
          </Field>
        )}
      </div>
      <Field label="Standards / references" hint="One per line, e.g. ANSI/AAMI ST79">
        <TextArea rows={2} value={refs} onChange={e => setRefs(e.target.value)} />
      </Field>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button type="submit" disabled={saving || !d.title.trim()}>{saving ? 'Saving…' : submitLabel}</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
