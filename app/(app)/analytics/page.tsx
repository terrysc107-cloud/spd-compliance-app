'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, Cell,
} from 'recharts'
import PageShell from '@/components/layout/PageShell'
import { tokens } from '@/lib/constants/design-tokens'
import {
  loadAllAudits,
  buildTrendData,
  buildTopFailItems,
  buildSectionHeatmap,
  buildAuditorStats,
  type FailItem,
  type SectionHeat,
  type AuditorStat,
} from '@/lib/analytics/aggregator'
import type { StoredAudit } from '@/lib/storage/audit-storage'

// ─── DATE RANGE FILTER ────────────────────────────────────────────────────────

type Range = 30 | 90 | 0   // 0 = all time

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: 'Last 30 Days', value: 30 },
  { label: 'Last 90 Days', value: 90 },
  { label: 'All Time',     value: 0  },
]

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────

function TrendTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string; score: number; checklistName: string } }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: tokens.color.surfaceHover, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.sm, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: tokens.color.textMuted, marginBottom: 4 }}>{d.date}</div>
      <div style={{ color: tokens.color.textPrimary, fontWeight: 700, fontSize: 16 }}>{d.score}%</div>
      <div style={{ color: tokens.color.textDimmed, marginTop: 2 }}>{d.checklistName}</div>
    </div>
  )
}

// ─── SECTION HEATMAP CARD ─────────────────────────────────────────────────────

function HeatCard({ item }: { item: SectionHeat }) {
  const bg =
    item.status === 'pass'     ? 'rgba(34,197,94,0.15)'  :
    item.status === 'marginal' ? 'rgba(234,179,8,0.15)'  :
                                 'rgba(239,68,68,0.15)'
  const textColor =
    item.status === 'pass'     ? tokens.color.success :
    item.status === 'marginal' ? tokens.color.warning  :
                                 tokens.color.danger

  return (
    <div style={{ background: bg, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.sm, padding: '16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 12, color: tokens.color.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {item.section}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: textColor }}>{item.avgScore}%</div>
      <div style={{ fontSize: 12, color: tokens.color.textDimmed }}>{item.auditCount} audit{item.auditCount !== 1 ? 's' : ''}</div>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 140, color: tokens.color.textDimmed, fontSize: 14 }}>
      {message}
    </div>
  )
}

// ─── SEVERITY BAR COLOR ───────────────────────────────────────────────────────

function severityColor(item: FailItem): string {
  if (item.severity === 'critical') return tokens.color.danger
  if (item.severity === 'major')    return tokens.color.warning
  return tokens.color.accentBlue
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

const chartBg  = tokens.color.surface      // #0d1529
const gridLine = 'rgba(255,255,255,0.06)'
const axisText = tokens.color.textDimmed

export default function AnalyticsPage() {
  const router             = useRouter()
  const [audits, setAudits] = useState<StoredAudit[]>([])
  const [range, setRange]  = useState<Range>(90)

  useEffect(() => { setAudits(loadAllAudits()) }, [])

  const trendData   = useMemo(() => buildTrendData(audits, range || undefined), [audits, range])
  const failItems   = useMemo(() => buildTopFailItems(audits),                  [audits])
  const heatmap     = useMemo(() => buildSectionHeatmap(audits),                [audits])
  const auditorData = useMemo(() => buildAuditorStats(audits),                  [audits])

  const completed = audits.filter(a => a.status === 'completed').length

  const filterBtn = (opt: { label: string; value: Range }) => {
    const active = opt.value === range
    return (
      <button
        key={opt.value}
        onClick={() => setRange(opt.value)}
        style={{
          padding:       '7px 16px',
          borderRadius:  tokens.radius.pill,
          border:        `1px solid ${active ? tokens.color.accentBlue : tokens.color.border}`,
          background:    active ? 'rgba(59,130,246,0.18)' : 'transparent',
          color:         active ? tokens.color.accentBlue : tokens.color.textMuted,
          fontSize:      13,
          fontWeight:    active ? 600 : 400,
          cursor:        'pointer',
        }}
      >
        {opt.label}
      </button>
    )
  }

  const sectionCard: React.CSSProperties = {
    background:   chartBg,
    border:       `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    padding:      '20px',
  }

  const sectionTitle: React.CSSProperties = {
    margin: '0 0 16px',
    fontSize: 16,
    fontWeight: 600,
    color: tokens.color.textPrimary,
  }

  return (
    <PageShell
      title="Analytics"
      description={`Compliance trends and performance insights. ${completed} completed audit${completed !== 1 ? 's' : ''} in dataset.`}
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          {RANGE_OPTIONS.map(filterBtn)}
        </div>
      }
    >
      {/* ── ROW 1: Compliance Trend ──────────────────────────────────────── */}
      <div style={{ ...sectionCard, marginBottom: 20 }}>
        <h2 style={sectionTitle}>Compliance Trend</h2>
        <div style={{ height: 260 }}>
          {trendData.length < 2 ? (
            <EmptyState message="Run at least 2 completed audits to see the trend line." />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}
                onClick={e => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const payload = (e as any)?.activePayload?.[0]?.payload
                  if (payload?.auditId) {
                    router.push(`/audits/${payload.auditId}/results`)
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                <XAxis dataKey="date" tick={{ fill: axisText, fontSize: 12 }} axisLine={{ stroke: gridLine }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: axisText, fontSize: 12 }} axisLine={{ stroke: gridLine }} tickLine={false} width={36} />
                <Tooltip content={<TrendTooltip />} />
                <ReferenceLine y={90} stroke={tokens.color.success}  strokeDasharray="4 4" label={{ value: 'Pass',     fill: tokens.color.success,  fontSize: 11, position: 'insideTopRight' }} />
                <ReferenceLine y={70} stroke={tokens.color.warning}  strokeDasharray="4 4" label={{ value: 'Marginal', fill: tokens.color.warning,  fontSize: 11, position: 'insideTopRight' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={tokens.color.accentBlue}
                  strokeWidth={2}
                  dot={{ fill: tokens.color.accentBlue, r: 4, cursor: 'pointer' }}
                  activeDot={{ r: 6, fill: tokens.color.accentBlue }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── ROW 2: Fail Items + Section Heatmap ─────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Top Failing Items */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}>Top Failing Items</h2>
          <div style={{ height: 300 }}>
            {failItems.length === 0 ? (
              <EmptyState message="No failures recorded yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failItems} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLine} horizontal={false} />
                  <XAxis type="number" tick={{ fill: axisText, fontSize: 11 }} axisLine={{ stroke: gridLine }} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="question" tick={{ fill: axisText, fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip
                    contentStyle={{ background: tokens.color.surfaceHover, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.sm, fontSize: 12 }}
                    labelStyle={{ color: tokens.color.textPrimary }}
                    itemStyle={{ color: tokens.color.textMuted }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(val: any, _: any, props: any) => [
                      `${val} failure${val !== 1 ? 's' : ''}`,
                      (props?.payload as FailItem)?.section ?? '',
                    ]}
                  />
                  <Bar dataKey="failCount" radius={[0, 4, 4, 0]}>
                    {failItems.map((item, i) => (
                      <Cell key={i} fill={severityColor(item)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
            {([['critical', tokens.color.danger], ['major', tokens.color.warning], ['minor', tokens.color.accentBlue]] as const).map(([label, color]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: tokens.color.textDimmed }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Section Heatmap */}
        <div style={sectionCard}>
          <h2 style={sectionTitle}>Section Heatmap</h2>
          {heatmap.length === 0 ? (
            <EmptyState message="Complete an audit with section scoring to see the heatmap." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {heatmap.map(item => <HeatCard key={item.section} item={item} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 3: Auditor Breakdown ─────────────────────────────────────── */}
      <div style={sectionCard}>
        <h2 style={sectionTitle}>Auditor Breakdown</h2>
        {auditorData.length === 0 ? (
          <EmptyState message="No auditor data found. Set conductedBy in org settings." />
        ) : (
          <div>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 110px 130px', gap: 12, padding: '8px 12px', borderBottom: `1px solid ${tokens.color.border}` }}>
              {['Auditor', 'Audits Run', 'Avg Score', 'Open Findings'].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: tokens.color.textDimmed, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</div>
              ))}
            </div>
            {auditorData.map((row: AuditorStat, i: number) => (
              <div key={row.name} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 110px 130px', gap: 12, padding: '14px 12px', borderBottom: i < auditorData.length - 1 ? `1px solid ${tokens.color.border}` : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: tokens.color.textPrimary, fontWeight: 500 }}>{row.name}</div>
                <div style={{ fontSize: 14, color: tokens.color.textMuted }}>{row.auditCount}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: row.avgScore >= 90 ? tokens.color.success : row.avgScore >= 70 ? tokens.color.warning : tokens.color.danger }}>
                  {row.avgScore}%
                </div>
                <div style={{ fontSize: 14, color: row.openFindings > 0 ? tokens.color.danger : tokens.color.textMuted }}>{row.openFindings}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
