'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { RATING_COLOR, RATING_LABEL, RATING_ORDER, areaName } from '@/lib/consult/framework'
import { scoreColor, type EngagementScore } from '@/lib/consult/scoring'
import { getConsultSettings } from '@/lib/consult/db/library'
import { actionPlanCsv } from '@/lib/consult/builders'
import { flush } from '@/lib/consult/offline/queue'
import { TextArea, errMsg } from './fields'
import type { ConsultSettings, Engagement, Observation } from '@/lib/consult/types'

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function ReportTab({ engagement, score, observations, openGaps, onPatch, onError }: {
  engagement:   Engagement
  openGaps:     number
  score:        EngagementScore
  observations: Observation[]
  onPatch:      (u: Partial<Engagement>) => Promise<void>
  onError:      (msg: string) => void
}) {
  const [narrative, setNarrative] = useState(engagement.executiveSummary ?? '')
  const [drafting, setDrafting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [settings, setSettings] = useState<ConsultSettings | null>(null)
  const dirty = narrative !== (engagement.executiveSummary ?? '')

  useEffect(() => { getConsultSettings().then(setSettings).catch(() => {}) }, [])

  async function draft() {
    if (narrative.trim() && !confirm('Replace the current narrative with a fresh AI draft? Your edits will be lost.')) return
    setDrafting(true)
    try {
      await flush()   // the server drafts from the DB: push any offline edits first
      const res = await fetch('/api/consult/draft', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagementId: engagement.id }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `Draft failed (${res.status})`)
      setNarrative(json.draft)
      await onPatch({ aiDraft: json.draft, executiveSummary: json.draft, status: engagement.status === 'delivered' ? 'delivered' : 'drafting' })
      if (json.truncated) onError('The draft hit the length limit and may be cut off at the end — review the last section.')
    } catch (e) { onError(errMsg(e)) } finally { setDrafting(false) }
  }

  async function save() {
    setSaving(true)
    await onPatch({ executiveSummary: narrative })
    setSaving(false)
  }

  async function pdf() {
    if (dirty) await onPatch({ executiveSummary: narrative })
    setPdfBusy(true)
    try {
      await flush()
      const res = await fetch(`/api/consult/report-pdf?engagementId=${engagement.id}`)
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `PDF failed (${res.status})`)
      const name = res.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? 'spd-assessment.pdf'
      download(await res.blob(), name)
    } catch (e) { onError(errMsg(e)) } finally { setPdfBusy(false) }
  }

  function csv() {
    download(new Blob([actionPlanCsv(observations, areaName)], { type: 'text/csv' }), `action-plan-${engagement.visitStart ?? 'engagement'}.csv`)
  }

  const checks = [
    { ok: score.answered === score.total, text: `Walkthrough complete (${score.answered}/${score.total} checkpoints)` },
    { ok: openGaps === 0, text: openGaps > 0 ? `${openGaps} walkthrough gap(s) not yet written up as findings` : 'All walkthrough gaps written up' },
    { ok: observations.some(o => o.rating === 'strength'), text: 'At least one strength recorded (clients notice when there are none)' },
    { ok: narrative.trim().length > 200, text: 'Narrative written and reviewed' },
    { ok: !!settings?.consultantName, text: 'Consultant name & credentials set for the cover page', href: '/consult/settings' },
  ]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-start' }}>
      <div style={{ flex: '2 1 520px', minWidth: 0 }}>
        <Card padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <h3 style={h3}>Report narrative</h3>
              <div style={{ fontSize: 12.5, color: tokens.color.textMuted, marginTop: 2 }}>
                Markdown. The AI drafts from your walkthrough, observations, library phrasing, and voice notes — you edit and sign.
              </div>
            </div>
            <Button variant="secondary" disabled={drafting} onClick={draft}>{drafting ? 'Drafting… (up to a minute)' : narrative.trim() ? '↻ Redraft with AI' : '✦ Draft with AI'}</Button>
          </div>
          <TextArea rows={22} value={narrative} onChange={e => setNarrative(e.target.value)}
            placeholder={'## Executive Summary\n\nWrite here, or click “Draft with AI”.'} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 12 }}>
            <Button disabled={!dirty || saving} onClick={save}>{saving ? 'Saving…' : 'Save narrative'}</Button>
            {dirty && <span style={{ fontSize: 12.5, color: tokens.color.warning }}>Unsaved changes</span>}
          </div>
        </Card>
      </div>

      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Card padding="lg">
          <h3 style={h3}>Deliverables</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            <Button disabled={pdfBusy} onClick={pdf}>{pdfBusy ? 'Building PDF…' : '⬇ Download client report (PDF)'}</Button>
            <Button variant="secondary" disabled={!observations.length} onClick={csv}>⬇ Action plan (CSV)</Button>
            {engagement.status !== 'delivered'
              ? <Button variant="ghost" onClick={() => onPatch({ status: 'delivered', deliveredAt: new Date().toISOString() })}>Mark as delivered</Button>
              : <span style={{ fontSize: 12.5, color: tokens.color.success, textAlign: 'center' }}>Delivered {engagement.deliveredAt ? new Date(engagement.deliveredAt).toLocaleDateString() : ''}</span>}
          </div>
        </Card>

        <Card padding="lg">
          <h3 style={h3}>Before you deliver</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checks.map(c => (
              <li key={c.text} style={{ display: 'flex', gap: 8, fontSize: 13, color: c.ok ? tokens.color.textMuted : tokens.color.textPrimary }}>
                <span style={{ color: c.ok ? tokens.color.success : tokens.color.warning }}>{c.ok ? '✓' : '○'}</span>
                {c.href && !c.ok ? <Link href={c.href} style={{ color: tokens.color.accentBlue }}>{c.text}</Link> : c.text}
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg">
          <h3 style={h3}>Scorecard</h3>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {score.areas.map(a => (
              <div key={a.areaId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span style={{ color: tokens.color.textMuted }}>{a.name}</span>
                  <span style={{ color: scoreColor(a.score), fontWeight: 700 }}>{a.score === null ? '—' : `${a.score}%`}</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 4 }}>
                  <div style={{ height: 4, borderRadius: 2, width: `${a.score ?? 0}%`, background: scoreColor(a.score) }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
            {RATING_ORDER.map(r => (
              <span key={r} style={{ fontSize: 12, color: RATING_COLOR[r] }}>{score.ratingCounts[r]} {RATING_LABEL[r]}</span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

const h3: React.CSSProperties = { margin: 0, fontSize: 15, fontWeight: 700, color: tokens.color.textPrimary }
