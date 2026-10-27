'use client'

import { useState } from 'react'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { ENGAGEMENT_TYPE_LABEL, FRAMEWORK } from '@/lib/consult/framework'
import { Field, Select, TextArea, TextInput, grid } from './fields'
import type { AreaId, DepartmentProfile, Engagement, EngagementType } from '@/lib/consult/types'

type NumKey = 'fteBudgeted' | 'fteActual' | 'certifiedPct' | 'steamSterilizers' | 'lowTempSterilizers' | 'washers' | 'trayVolumeDaily' | 'flexScopesInventory'
type TextKey = 'departmentName' | 'leaderName' | 'reportsTo' | 'shifts' | 'hoursOfOperation' | 'trackingSystem' | 'lastSurvey'

const TEXT_FIELDS: { key: TextKey; label: string; placeholder?: string }[] = [
  { key: 'departmentName', label: 'Department name', placeholder: 'Central Sterile Processing' },
  { key: 'leaderName', label: 'Department leader' },
  { key: 'reportsTo', label: 'Reports to', placeholder: 'e.g. Director of Surgical Services' },
  { key: 'shifts', label: 'Shifts', placeholder: '3 shifts, 24/7' },
  { key: 'hoursOfOperation', label: 'Hours of operation' },
  { key: 'trackingSystem', label: 'Instrument tracking system' },
  { key: 'lastSurvey', label: 'Last regulatory survey', placeholder: 'e.g. TJC, March 2025 — 2 RFIs in IC' },
]

const NUM_FIELDS: { key: NumKey; label: string }[] = [
  { key: 'fteBudgeted', label: 'FTEs budgeted' },
  { key: 'fteActual', label: 'FTEs actual' },
  { key: 'certifiedPct', label: 'Certified technicians (%)' },
  { key: 'trayVolumeDaily', label: 'Trays processed / day' },
  { key: 'steamSterilizers', label: 'Steam sterilizers' },
  { key: 'lowTempSterilizers', label: 'Low-temp sterilizers' },
  { key: 'washers', label: 'Washer-disinfectors' },
  { key: 'flexScopesInventory', label: 'Flexible scope inventory' },
]

export default function OverviewTab({ engagement, onPatch }: {
  engagement: Engagement
  onPatch: (u: Partial<Engagement>) => Promise<void>
}) {
  const [title, setTitle] = useState(engagement.title)
  const [type, setType] = useState<EngagementType>(engagement.type)
  const [visitStart, setVisitStart] = useState(engagement.visitStart ?? '')
  const [visitEnd, setVisitEnd] = useState(engagement.visitEnd ?? '')
  const [scope, setScope] = useState<Set<AreaId>>(new Set(engagement.scopeAreas.length ? engagement.scopeAreas : FRAMEWORK.map(a => a.id)))
  const [profile, setProfile] = useState<DepartmentProfile>(engagement.profile)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const setNum = (k: NumKey, v: string) => {
    const n = v === '' ? undefined : Number(v)
    setProfile(p => ({ ...p, [k]: n !== undefined && Number.isFinite(n) && n >= 0 ? n : undefined }))
  }

  async function save() {
    if (!title.trim() || !scope.size) return
    setSaving(true)
    await onPatch({
      title: title.trim(), type, visitStart: visitStart || null, visitEnd: visitEnd || null,
      scopeAreas: FRAMEWORK.map(a => a.id).filter(a => scope.has(a)), profile,
    })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fteGap = profile.fteBudgeted !== undefined && profile.fteActual !== undefined ? profile.fteActual - profile.fteBudgeted : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Card padding="lg">
        <h3 style={h3}>Engagement</h3>
        <div style={grid(220)}>
          <Field label="Title"><TextInput value={title} onChange={e => setTitle(e.target.value)} /></Field>
          <Field label="Type">
            <Select<EngagementType> value={type} onChange={setType}
              options={(Object.keys(ENGAGEMENT_TYPE_LABEL) as EngagementType[]).map(k => ({ value: k, label: ENGAGEMENT_TYPE_LABEL[k] }))} />
          </Field>
          <Field label="Visit start"><TextInput type="date" value={visitStart} onChange={e => setVisitStart(e.target.value)} /></Field>
          <Field label="Visit end"><TextInput type="date" value={visitEnd} min={visitStart} onChange={e => setVisitEnd(e.target.value)} /></Field>
        </div>
        <div style={{ marginTop: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: tokens.color.textMuted }}>Scope</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {FRAMEWORK.map(a => {
              const on = scope.has(a.id)
              return (
                <button key={a.id} type="button" onClick={() => setScope(prev => {
                  const next = new Set(prev)
                  if (on) next.delete(a.id)
                  else next.add(a.id)
                  return next
                })} style={{
                  padding: '6px 10px', fontSize: 12, borderRadius: tokens.radius.pill, cursor: 'pointer',
                  border: `1px solid ${on ? tokens.color.accentBlue : tokens.color.border}`,
                  background: on ? 'rgba(59,130,246,0.15)' : 'transparent', color: on ? '#bfdbfe' : tokens.color.textMuted,
                }}>{a.name}</button>
              )
            })}
          </div>
          {!scope.size && <div style={{ fontSize: 12, color: tokens.color.danger, marginTop: 6 }}>Select at least one area.</div>}
        </div>
      </Card>

      <Card padding="lg">
        <h3 style={h3}>Department profile</h3>
        <p style={{ fontSize: 13, color: tokens.color.textMuted, margin: '-6px 0 14px' }}>
          Context for the report narrative. Fill in what you learn during the opening interview.
        </p>
        <div style={grid(220)}>
          {TEXT_FIELDS.map(f => (
            <Field key={f.key} label={f.label}>
              <TextInput value={profile[f.key] ?? ''} placeholder={f.placeholder} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
            </Field>
          ))}
          {NUM_FIELDS.map(f => (
            <Field key={f.key} label={f.label}
              hint={f.key === 'fteActual' && fteGap !== null && fteGap < 0 ? `${Math.abs(fteGap)} FTE below budget` : undefined}>
              <TextInput type="number" min={0} step="any" value={profile[f.key] ?? ''} onChange={e => setNum(f.key, e.target.value)} />
            </Field>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <Field label="Client-stated concerns / reason for engagement">
            <TextArea rows={3} value={profile.keyConcerns ?? ''} onChange={e => setProfile(p => ({ ...p, keyConcerns: e.target.value }))} />
          </Field>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button onClick={save} disabled={saving || !title.trim() || !scope.size}>{saving ? 'Saving…' : 'Save overview'}</Button>
        {saved && <span style={{ fontSize: 13, color: tokens.color.success }}>Saved</span>}
      </div>
    </div>
  )
}

const h3: React.CSSProperties = { margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: tokens.color.textPrimary }
