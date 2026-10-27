'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { createClientRecord, listClients } from '@/lib/consult/db/clients'
import { createEngagement } from '@/lib/consult/db/engagements'
import { ALL_AREA_IDS, ENGAGEMENT_TYPE_LABEL, FRAMEWORK } from '@/lib/consult/framework'
import { ErrorNote, Field, Select, TextInput, errMsg, grid } from '@/components/consult/fields'
import type { AreaId, Client, EngagementType } from '@/lib/consult/types'

const NEW_CLIENT = '__new__'

const PRESETS: { label: string; areas: AreaId[] }[] = [
  { label: 'Full department', areas: ALL_AREA_IDS },
  { label: 'Sterilization focus', areas: ['leadership', 'decon', 'iap', 'steril', 'storage', 'quality'] },
  { label: 'Endoscopy focus', areas: ['leadership', 'staffing', 'endo', 'water', 'environment', 'quality'] },
  { label: 'Survey readiness', areas: ['leadership', 'staffing', 'decon', 'steril', 'endo', 'environment', 'quality'] },
]

function defaultTitle(type: EngagementType): string {
  const month = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  return `${ENGAGEMENT_TYPE_LABEL[type]} — ${month}`
}

function NewEngagementForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(params.get('clientId') ?? '')
  const [newClientName, setNewClientName] = useState('')
  const [type, setType] = useState<EngagementType>('baseline')
  const [title, setTitle] = useState(defaultTitle('baseline'))
  const [titleTouched, setTitleTouched] = useState(false)
  const [visitStart, setVisitStart] = useState(new Date().toISOString().slice(0, 10))
  const [visitEnd, setVisitEnd] = useState('')
  const [scope, setScope] = useState<Set<AreaId>>(new Set(ALL_AREA_IDS))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClients().then(cs => {
      setClients(cs)
      setClientId(prev => prev || (cs.length ? cs[0].id : NEW_CLIENT))
    }).catch(e => setError(errMsg(e)))
  }, [])

  function toggle(a: AreaId) {
    setScope(prev => {
      const next = new Set(prev)
      if (next.has(a)) next.delete(a)
      else next.add(a)
      return next
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!scope.size) return setError('Pick at least one area to assess')
    if (clientId === NEW_CLIENT && !newClientName.trim()) return setError('Enter the new client\'s name')
    setSaving(true); setError(null)
    try {
      let cid = clientId
      if (cid === NEW_CLIENT) {
        cid = (await createClientRecord({
          name: newClientName, facilityType: 'hospital', city: null, state: null, bedCount: null,
          annualSurgicalCases: null, contactName: null, contactTitle: null, contactEmail: null,
          contactPhone: null, notes: null,
        })).id
      }
      const eng = await createEngagement({
        clientId: cid, title, type, visitStart: visitStart || null, visitEnd: visitEnd || null,
        scopeAreas: ALL_AREA_IDS.filter(a => scope.has(a)),
      })
      router.push(`/consult/engagements/${eng.id}`)
    } catch (err) {
      setError(errMsg(err))
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <Card padding="lg">
        <div style={grid(240)}>
          <Field label="Client">
            <Select value={clientId} onChange={setClientId}
              options={[...clients.map(c => ({ value: c.id, label: c.name })), { value: NEW_CLIENT, label: '+ New client…' }]} />
          </Field>
          {clientId === NEW_CLIENT && (
            <Field label="New client name" hint="You can add details on the client page later.">
              <TextInput value={newClientName} onChange={e => setNewClientName(e.target.value)} autoFocus />
            </Field>
          )}
          <Field label="Engagement type">
            <Select<EngagementType> value={type} onChange={v => { setType(v); if (!titleTouched) setTitle(defaultTitle(v)) }}
              options={(Object.keys(ENGAGEMENT_TYPE_LABEL) as EngagementType[]).map(k => ({ value: k, label: ENGAGEMENT_TYPE_LABEL[k] }))} />
          </Field>
          <Field label="Title">
            <TextInput value={title} onChange={e => { setTitle(e.target.value); setTitleTouched(true) }} required />
          </Field>
          <Field label="Visit start"><TextInput type="date" value={visitStart} onChange={e => setVisitStart(e.target.value)} /></Field>
          <Field label="Visit end (optional)"><TextInput type="date" value={visitEnd} min={visitStart} onChange={e => setVisitEnd(e.target.value)} /></Field>
        </div>
      </Card>

      <div style={{ marginTop: 20 }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: tokens.color.textPrimary }}>Assessment scope</div>
              <div style={{ fontSize: 13, color: tokens.color.textMuted, marginTop: 2 }}>
                {scope.size} of {FRAMEWORK.length} areas · {FRAMEWORK.filter(a => scope.has(a.id)).reduce((n, a) => n + a.items.length, 0)} checkpoints
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <Button key={p.label} size="sm" variant="secondary" onClick={() => setScope(new Set(p.areas))}>{p.label}</Button>
              ))}
            </div>
          </div>
          <div style={grid(260)}>
            {FRAMEWORK.map(a => (
              <label key={a.id} style={{
                display: 'flex', gap: 10, padding: 12, borderRadius: tokens.radius.sm, cursor: 'pointer',
                border: `1px solid ${scope.has(a.id) ? 'rgba(59,130,246,0.5)' : tokens.color.border}`,
                background: scope.has(a.id) ? 'rgba(59,130,246,0.08)' : 'transparent',
              }}>
                <input type="checkbox" checked={scope.has(a.id)} onChange={() => toggle(a.id)} style={{ marginTop: 2 }} />
                <span>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: tokens.color.textPrimary }}>{a.name}</span>
                  <span style={{ display: 'block', fontSize: 12, color: tokens.color.textMuted, marginTop: 2 }}>{a.items.length} checkpoints · {a.description}</span>
                </span>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <Button type="submit" size="lg" disabled={saving}>{saving ? 'Creating…' : 'Create engagement'}</Button>
      </div>
    </form>
  )
}

export default function NewEngagementPage() {
  return (
    <PageShell title="New engagement" description="One engagement = one site visit or assessment for a client.">
      <Suspense fallback={<div style={{ color: tokens.color.textMuted }}>Loading…</div>}>
        <NewEngagementForm />
      </Suspense>
    </PageShell>
  )
}
