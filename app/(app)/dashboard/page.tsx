'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { tokens } from '@/lib/constants/design-tokens'
import { getCurrentReadiness, getSnapshots, type ReadinessSnapshot } from '@/lib/db/readiness'
import { getAllAudits } from '@/lib/db/audits'
import type { StoredAudit, StoredFinding } from '@/lib/db/types'
import { computeReadiness, type ReadinessResult } from '@/lib/readiness/engine'
import { ReadinessHero } from '@/components/readiness/ReadinessHero'
import { FactorBars } from '@/components/readiness/FactorBars'
import { AIInsightsPanel } from '@/components/insights/AIInsightsPanel'
import { Badge } from '@/components/ui/Badge'

interface OpenFinding extends StoredFinding {
  auditId: string
}

const EMPTY: ReadinessResult = computeReadiness([])

export default function DashboardPage() {
  const [result, setResult]       = useState<ReadinessResult>(EMPTY)
  const [orgName, setOrgName]     = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<ReadinessSnapshot[]>([])
  const [openFindings, setOpen]   = useState<OpenFinding[]>([])
  const [loading, setLoading]     = useState(true)
  const [downloading, setDownloading] = useState(false)

  async function downloadPdf() {
    setDownloading(true)
    try {
      const res = await fetch('/api/reports/survey-pdf', { method: 'POST' })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'survey-readiness-report.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore */ }
    setDownloading(false)
  }

  useEffect(() => {
    (async () => {
      const [{ result, orgName }, snaps, audits] = await Promise.all([
        getCurrentReadiness(), getSnapshots(), getAllAudits(),
      ])
      setResult(result); setOrgName(orgName); setSnapshots(snaps)

      const now = Date.now()
      const flat = audits.flatMap(a => a.findings.map(f => ({ ...f, auditId: a.id })))
      const open = flat
        .filter(f => f.status !== 'resolved')
        .sort((a, b) => severityRank(b.severity) - severityRank(a.severity)
          || overdueDays(b, now) - overdueDays(a, now))
      setOpen(open)
      setLoading(false)
    })().catch(() => setLoading(false))
  }, [])

  const trendData = snapshots.map(s => ({
    date: new Date(s.capturedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: s.score,
  }))

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={downloadPdf}
          disabled={downloading || !result.assessed}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px',
            borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.border}`,
            background: tokens.color.surface, color: result.assessed ? tokens.color.textPrimary : tokens.color.textDimmed,
            fontSize: 13, fontWeight: 600, cursor: result.assessed && !downloading ? 'pointer' : 'not-allowed',
          }}
        >
          {downloading ? 'Preparing…' : '⬇ Download survey report (PDF)'}
        </button>
      </div>

      {!loading && !result.assessed && (
        <Link href="/onboarding" style={{ textDecoration: 'none' }}>
          <div style={{ ...card, borderColor: tokens.color.accentBlue, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 14, color: tokens.color.textPrimary }}>
              👋 New here? Set up your facility and reach your first readiness score in under 30 minutes.
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: tokens.color.accentBlue, whiteSpace: 'nowrap' }}>Start setup →</span>
          </div>
        </Link>
      )}

      <ReadinessHero result={result} orgName={orgName} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        <FactorBars factors={result.factors} />

        {/* Readiness over time */}
        <div style={card}>
          <h2 style={cardTitle}>Readiness over time</h2>
          <div style={{ height: 220 }}>
            {trendData.length < 2 ? (
              <Empty msg="Complete a couple of audits to plot the readiness trend." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" tick={{ fill: tokens.color.textDimmed, fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                  <YAxis domain={[0, 100]} width={32} tick={{ fill: tokens.color.textDimmed, fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
                  <Tooltip contentStyle={{ background: tokens.color.surfaceHover, border: `1px solid ${tokens.color.border}`, borderRadius: 8, fontSize: 12 }} />
                  <ReferenceLine y={85} stroke={tokens.color.success} strokeDasharray="4 4" />
                  <ReferenceLine y={65} stroke={tokens.color.warning} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="score" stroke={tokens.color.accentBlue} strokeWidth={2} dot={{ r: 3, fill: tokens.color.accentBlue }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Overdue & open critical findings */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ ...cardTitle, margin: 0 }}>Priority corrective actions</h2>
          <Link href="/findings" style={{ fontSize: 13, color: tokens.color.accentBlue, textDecoration: 'none' }}>
            Open CAPA workspace →
          </Link>
        </div>
        {loading ? (
          <p style={muted}>Loading…</p>
        ) : openFindings.length === 0 ? (
          <p style={{ ...muted, color: tokens.color.success }}>No open findings — fully defensible.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {openFindings.slice(0, 8).map((f, i) => {
              const od = overdueDays(f, Date.now())
              return (
                <Link key={`${f.auditId}-${f.itemIndex}-${i}`} href={`/audits/${f.auditId}/results`}
                  style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', background: tokens.color.bg, border: `1px solid ${tokens.color.border}`, borderRadius: 8, textDecoration: 'none' }}>
                  <Badge variant={f.severity === 'critical' ? 'danger' : f.severity === 'major' ? 'warning' : 'info'} size="sm">{f.severity}</Badge>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: tokens.color.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.question}
                  </span>
                  {f.dueDate && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: od > 0 ? tokens.color.danger : tokens.color.textMuted, whiteSpace: 'nowrap' }}>
                      {od > 0 ? `${od}d overdue` : `due ${new Date(f.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </span>
                  )}
                  <Badge variant={f.status === 'in-progress' ? 'warning' : 'default'} size="sm">{f.status}</Badge>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* AI Readiness Advisor */}
      <AIInsightsPanel readiness={result} openFindings={openFindings} />
    </div>
  )
}

function severityRank(s: StoredFinding['severity']): number {
  return s === 'critical' ? 3 : s === 'major' ? 2 : 1
}
function overdueDays(f: StoredFinding, now: number): number {
  if (!f.dueDate) return 0
  return Math.floor((now - new Date(f.dueDate).getTime()) / (24 * 60 * 60 * 1000))
}

const card: React.CSSProperties = {
  background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.md, padding: 24,
}
const cardTitle: React.CSSProperties = { margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: tokens.color.textPrimary }
const muted: React.CSSProperties = { color: tokens.color.textMuted, fontSize: 14, margin: 0 }

function Empty({ msg }: { msg: string }) {
  return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: tokens.color.textDimmed, fontSize: 13 }}>{msg}</div>
}
