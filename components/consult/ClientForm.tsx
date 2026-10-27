'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { FACILITY_LABEL } from '@/lib/consult/framework'
import { ErrorNote, Field, Select, TextArea, TextInput, errMsg, grid } from './fields'
import type { ClientInput } from '@/lib/consult/db/clients'
import type { Client, FacilityType } from '@/lib/consult/types'

const EMPTY: ClientInput = {
  name: '', facilityType: 'hospital', city: null, state: null, bedCount: null, annualSurgicalCases: null,
  contactName: null, contactTitle: null, contactEmail: null, contactPhone: null, notes: null,
}

function num(v: string): number | null {
  const n = parseInt(v, 10)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export default function ClientForm({ initial, submitLabel, onSubmit, onCancel }: {
  initial?: Client
  submitLabel: string
  onSubmit: (input: ClientInput) => Promise<void>
  onCancel?: () => void
}) {
  const [f, setF] = useState<ClientInput>(initial ? { ...EMPTY, ...initial } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof ClientInput>(k: K, v: ClientInput[K]) => setF(prev => ({ ...prev, [k]: v }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!f.name.trim()) return setError('Facility name is required')
    if (f.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.contactEmail)) return setError('Contact email looks invalid')
    setSaving(true); setError(null)
    try { await onSubmit(f) } catch (err) { setError(errMsg(err)) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <div style={grid(220)}>
        <Field label="Facility name *"><TextInput value={f.name} onChange={e => set('name', e.target.value)} required /></Field>
        <Field label="Facility type">
          <Select<FacilityType> value={f.facilityType} onChange={v => set('facilityType', v)}
            options={(Object.keys(FACILITY_LABEL) as FacilityType[]).map(k => ({ value: k, label: FACILITY_LABEL[k] }))} />
        </Field>
        <Field label="City"><TextInput value={f.city ?? ''} onChange={e => set('city', e.target.value)} /></Field>
        <Field label="State"><TextInput value={f.state ?? ''} maxLength={30} onChange={e => set('state', e.target.value)} /></Field>
        <Field label="Licensed beds"><TextInput type="number" min={0} value={f.bedCount ?? ''} onChange={e => set('bedCount', num(e.target.value))} /></Field>
        <Field label="Annual surgical cases"><TextInput type="number" min={0} value={f.annualSurgicalCases ?? ''} onChange={e => set('annualSurgicalCases', num(e.target.value))} /></Field>
        <Field label="Primary contact"><TextInput value={f.contactName ?? ''} onChange={e => set('contactName', e.target.value)} /></Field>
        <Field label="Contact title"><TextInput value={f.contactTitle ?? ''} placeholder="e.g. Director of Perioperative Services" onChange={e => set('contactTitle', e.target.value)} /></Field>
        <Field label="Contact email"><TextInput type="email" value={f.contactEmail ?? ''} onChange={e => set('contactEmail', e.target.value)} /></Field>
        <Field label="Contact phone"><TextInput type="tel" value={f.contactPhone ?? ''} onChange={e => set('contactPhone', e.target.value)} /></Field>
      </div>
      <div style={{ marginTop: 14 }}>
        <Field label="Notes"><TextArea value={f.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Contract scope, politics, history, anything you want to remember" /></Field>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</Button>
        {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
