'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'
import { Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getEngagement, getResponses, updateEngagement } from '@/lib/consult/db/engagements'
import { listObservations } from '@/lib/consult/db/observations'
import { ENGAGEMENT_TYPE_LABEL, STATUS_LABEL, scopedAreas } from '@/lib/consult/framework'
import { BAND_COLOR, BAND_LABEL, scoreColor, scoreEngagement } from '@/lib/consult/scoring'
import { STATUS_COLOR } from '@/components/consult/EngagementList'
import { unconvertedGaps } from '@/lib/consult/builders'
import { ErrorNote, Select, errMsg, fmtDay } from '@/components/consult/fields'
import OverviewTab from '@/components/consult/OverviewTab'
import WalkthroughTab from '@/components/consult/WalkthroughTab'
import ObservationsTab from '@/components/consult/ObservationsTab'
import ReportTab from '@/components/consult/ReportTab'
import type { Engagement, EngagementStatus, Observation, ResponseMap } from '@/lib/consult/types'

type Tab = 'overview' | 'walkthrough' | 'observations' | 'report'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'walkthrough', label: 'Walkthrough' },
  { id: 'observations', label: 'Observations' },
  { id: 'report', label: 'Report' },
]

export default function EngagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [engagement, setEngagement] = useState<Engagement | null | undefined>(undefined)
  const [responses, setResponses] = useState<ResponseMap>({})
  const [observations, setObservations] = useState<Observation[]>([])
  const [tab, setTab] = useState<Tab>('walkthrough')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getEngagement(id), getResponses(id), listObservations(id)])
      .then(([e, r, o]) => {
        setEngagement(e); setResponses(r); setObservations(o)
        if (e && (e.status === 'drafting' || e.status === 'delivered')) setTab('report')
      })
      .catch(e => { setError(errMsg(e)); setEngagement(null) })
  }, [id])

  const areas = useMemo(() => scopedAreas(engagement?.scopeAreas ?? []), [engagement?.scopeAreas])
  const score = useMemo(() => scoreEngagement(areas, responses, observations), [areas, responses, observations])
  const openGaps = useMemo(() => unconvertedGaps(responses, observations, new Set(areas.flatMap(a => a.items.map(i => i.id)))).length,
    [areas, responses, observations])

  if (engagement === undefined) return <PageShell title="Engagement"><div style={{ color: tokens.color.textMuted }}>Loading…</div></PageShell>
  if (engagement === null) return (
    <PageShell title="Engagement not found">
      <ErrorNote message={error} />
      <Button href="/consult" variant="secondary">Back to workspace</Button>
    </PageShell>
  )

  async function patch(u: Partial<Engagement>) {
    const prev = engagement!
    setEngagement({ ...prev, ...u })
    try { await updateEngagement(prev.id, u) } catch (e) { setEngagement(prev); setError(errMsg(e)) }
  }

  return (
    <PageShell
      title={engagement.title}
      description={`${ENGAGEMENT_TYPE_LABEL[engagement.type]} · ${fmtDay(engagement.visitStart)}${engagement.visitEnd && engagement.visitEnd !== engagement.visitStart ? ` – ${fmtDay(engagement.visitEnd)}` : ''}`}
      actions={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href={`/consult/clients/${engagement.clientId}`} style={{ fontSize: 13, color: tokens.color.accentBlue, textDecoration: 'none' }}>
            {engagement.clientName ?? 'Client'} →
          </Link>
          <div style={{ width: 170 }}>
            <Select<EngagementStatus> value={engagement.status}
              onChange={v => patch({ status: v, deliveredAt: v === 'delivered' ? (engagement.deliveredAt ?? new Date().toISOString()) : engagement.deliveredAt })}
              options={(Object.keys(STATUS_LABEL) as EngagementStatus[]).map(k => ({ value: k, label: STATUS_LABEL[k] }))} />
          </div>
        </div>
      }
    >
      <ErrorNote message={error} onDismiss={() => setError(null)} />

      {/* Score strip */}
      <div style={{
        display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', padding: '14px 18px', marginBottom: 18,
        background: tokens.color.surface, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.md,
      }}>
        <Stat label="Conformance" value={score.overall === null ? '—' : `${score.overall}%`} color={scoreColor(score.overall)} />
        <Stat label="Risk" value={BAND_LABEL[score.band]} color={BAND_COLOR[score.band]} />
        <Stat label="Assessed" value={`${score.answered}/${score.total}`} color={tokens.color.textPrimary} />
        <Stat label="Critical gaps" value={String(score.criticalGaps)} color={score.criticalGaps ? tokens.color.danger : tokens.color.textPrimary} />
        <Stat label="Observations" value={String(observations.length)} color={tokens.color.textPrimary} />
        <div style={{ flex: 1, minWidth: 140 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
            <div style={{ height: 6, borderRadius: 3, width: `${score.total ? (score.answered / score.total) * 100 : 0}%`, background: tokens.color.accentBlue, transition: 'width 0.3s' }} />
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLOR[engagement.status] }}>{STATUS_LABEL[engagement.status].toUpperCase()}</span>
      </div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${tokens.color.border}`, marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
            fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? tokens.color.textPrimary : tokens.color.textMuted,
            borderBottom: `2px solid ${tab === t.id ? tokens.color.accentBlue : 'transparent'}`, marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab engagement={engagement} onPatch={patch} />}
      {tab === 'walkthrough' && (
        <WalkthroughTab engagement={engagement} areas={areas} score={score} responses={responses}
          setResponses={setResponses} observations={observations} setObservations={setObservations} onError={setError} />
      )}
      {tab === 'observations' && (
        <ObservationsTab engagement={engagement} areas={areas} responses={responses}
          observations={observations} setObservations={setObservations} onError={setError} />
      )}
      {tab === 'report' && (
        <ReportTab engagement={engagement} score={score} observations={observations} openGaps={openGaps} onPatch={patch} onError={setError} />
      )}
    </PageShell>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: tokens.color.textDimmed, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
    </div>
  )
}
