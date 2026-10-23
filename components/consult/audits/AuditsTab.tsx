'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { startAudit } from '@/lib/consult/db/audits'
import { summarize } from '@/lib/consult/audits/scoring'
import { scoreColor } from '@/lib/consult/scoring'
import AuditPicker from './AuditPicker'
import AuditDetail, { Delta } from './AuditDetail'
import { Empty, Pill, errMsg } from '../fields'
import type { Audit, AuditSample, Engagement, Observation } from '@/lib/consult/types'

export default function AuditsTab({ engagement, observations, audits, setAudits, samples, setSamples, startFor, onStartHandled, onError }: {
  engagement:     Engagement
  observations:   Observation[]
  audits:         Audit[] | null
  setAudits:      React.Dispatch<React.SetStateAction<Audit[] | null>>
  samples:        AuditSample[]
  setSamples:     React.Dispatch<React.SetStateAction<AuditSample[]>>
  /** Set when "Start audit" was pressed on a finding; opens the picker for it. */
  startFor:       Observation | null
  onStartHandled: () => void
  onError:        (msg: string) => void
}) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [picking, setPicking] = useState<{ obs: Observation | null } | null>(null)

  useEffect(() => {
    if (startFor) { setPicking({ obs: startFor }); onStartHandled() }
  }, [startFor, onStartHandled])

  const byAudit = useMemo(() => {
    const m = new Map<string, AuditSample[]>()
    for (const s of samples) m.set(s.auditId, [...(m.get(s.auditId) ?? []), s])
    return m
  }, [samples])

  const obsById = useMemo(() => new Map(observations.map(o => [o.id, o])), [observations])
  const open = audits?.find(a => a.id === openId) ?? null

  if (audits === null) return <div style={{ color: tokens.color.textMuted }}>Loading audits…</div>

  const picker = picking && (
    <AuditPicker forObservation={picking.obs} onClose={() => setPicking(null)}
      onStart={async (t, target) => {
        try {
          const a = await startAudit(engagement.id, t, { observationId: picking.obs?.id ?? null, targetPerDay: target })
          setAudits(list => [...(list ?? []), a]); setPicking(null); setOpenId(a.id)
        } catch (e) { onError(errMsg(e)) }
      }} />
  )

  if (open) return (
    <>
      <AuditDetail audit={open} samples={byAudit.get(open.id) ?? []}
        linked={open.observationId ? obsById.get(open.observationId) ?? null : null}
        onBack={() => setOpenId(null)} onError={onError}
        onChange={a => setAudits(list => (list ?? []).map(x => (x.id === a.id ? a : x)))}
        onSamples={fn => setSamples(all => [...all.filter(s => s.auditId !== open.id), ...fn(all.filter(s => s.auditId === open.id))])}
        onDeleted={id => { setAudits(list => (list ?? []).filter(x => x.id !== id)); setSamples(all => all.filter(s => s.auditId !== id)); setOpenId(null) }} />
      {picker}
    </>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <p style={{ margin: 0, fontSize: 13.5, color: tokens.color.textMuted, maxWidth: 640, lineHeight: 1.5 }}>
          See a gap, start an audit on the spot. Log samples you observe or key in the client&apos;s paper forms; the
          report shows baseline vs. current for every audit.
        </p>
        <Button onClick={() => setPicking({ obs: null })}>+ Start audit</Button>
      </div>

      {!audits.length ? (
        <Card><Empty title="No audits running"
          body="Start one from here, or press “Start audit” on any finding to measure its fix." /></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {audits.map(a => {
            const sum = summarize(a, byAudit.get(a.id) ?? [])
            const linked = a.observationId ? obsById.get(a.observationId) : null
            return (
              <Card key={a.id} hoverable onClick={() => setOpenId(a.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: tokens.color.textPrimary }}>{a.title}</span>
                  {a.status === 'closed' ? <Pill color={tokens.color.textMuted}>Closed</Pill> : <Pill color={tokens.color.accentBlue}>Active</Pill>}
                </div>
                {linked && <div style={{ fontSize: 12, color: tokens.color.textDimmed, marginTop: 4 }}>↳ {linked.title}</div>}
                <div style={{ display: 'flex', gap: 18, marginTop: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor(sum.current ?? sum.compliance) }}>
                    {(sum.current ?? sum.compliance) === null ? '—' : `${sum.current ?? sum.compliance}%`}
                  </span>
                  <span style={{ fontSize: 12.5 }}><Delta value={sum.delta} /></span>
                  <span style={{ fontSize: 12, color: tokens.color.textDimmed }}>{sum.samples} {a.sampleUnit}s · {sum.days} days</span>
                  {sum.criticalMisses > 0 && <span style={{ fontSize: 12, color: tokens.color.danger }}>{sum.criticalMisses} critical misses</span>}
                </div>
                {sum.series.length > 1 && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 28, marginTop: 10 }}>
                    {sum.series.slice(-30).map(d => (
                      <div key={d.date} style={{ flex: 1, height: `${Math.max(2, (d.compliance ?? 0) * 0.28)}px`, background: scoreColor(d.compliance), borderRadius: 1 }} />
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
      {picker}
    </div>
  )
}
