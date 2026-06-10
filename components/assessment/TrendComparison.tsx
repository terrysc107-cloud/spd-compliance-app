'use client'

import { useEffect, useState } from 'react'
import { getAllAudits } from '@/lib/db/audits'
import { tokens } from '@/lib/constants/design-tokens'
import { Card } from '@/components/ui/Card'

interface TrendComparisonProps {
  currentAuditId: string
  currentScore: number
  checklistName: string
}

interface TileData {
  label: string
  score: number | null
  delta: number | null
}

function barColor(score: number): string {
  if (score >= 90) return tokens.color.success
  if (score >= 70) return tokens.color.warning
  return tokens.color.danger
}

function DeltaArrow({ delta }: { delta: number | null }) {
  if (delta === null) return <span style={{ color: tokens.color.textDimmed }}>—</span>
  if (delta > 0)
    return <span style={{ color: tokens.color.success, fontWeight: 700 }}>↑ {delta.toFixed(1)}</span>
  if (delta < 0)
    return <span style={{ color: tokens.color.danger, fontWeight: 700 }}>↓ {Math.abs(delta).toFixed(1)}</span>
  return <span style={{ color: tokens.color.textDimmed }}>— 0.0</span>
}

function MetricTile({ label, score, delta }: TileData) {
  return (
    <div style={{
      flex: 1,
      background: tokens.color.bg,
      border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.md,
      padding: '14px 16px',
      textAlign: 'center',
      minWidth: 100,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: tokens.color.textDimmed, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 800,
        lineHeight: 1,
        color: score !== null ? barColor(score) : tokens.color.textDimmed,
        marginBottom: 4,
      }}>
        {score !== null ? `${score}%` : '—'}
      </div>
      <div style={{ fontSize: 12 }}>
        <DeltaArrow delta={delta} />
      </div>
    </div>
  )
}

export default function TrendComparison({ currentAuditId, currentScore, checklistName }: TrendComparisonProps) {
  const [prev, setPrev] = useState<number | null>(null)
  const [avg90, setAvg90] = useState<number | null>(null)
  const [recent5, setRecent5] = useState<number[]>([])

  useEffect(() => {
    getAllAudits().then(all => {
      const peers = all
        .filter(a => a.checklistName === checklistName && a.status === 'completed' && a.score !== undefined)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

      const currentIdx = peers.findIndex(a => a.id === currentAuditId)
      const others = peers.filter(a => a.id !== currentAuditId)

      // Previous: most recent completed before current
      const prevAudit = currentIdx >= 0 ? peers[currentIdx + 1] : others[0]
      setPrev(prevAudit?.score ?? null)

      // 90-day average excluding current
      const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000
      const in90 = others.filter(a => new Date(a.completedAt!).getTime() >= cutoff)
      if (in90.length > 0) {
        const mean = in90.reduce((s, a) => s + a.score!, 0) / in90.length
        setAvg90(Math.round(mean * 10) / 10)
      }

      // Last 5 completed (including current, most recent first)
      const top5 = peers.slice(0, 5).map(a => a.score!)
      setRecent5(top5)
    }).catch(() => {})
  }, [currentAuditId, checklistName])

  const prevDelta  = prev  !== null ? +(currentScore - prev).toFixed(1)  : null
  const avg90Delta = avg90 !== null ? +(currentScore - avg90).toFixed(1) : null

  return (
    <Card padding="md">
      <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: tokens.color.textPrimary }}>
        Trend Comparison
      </h3>

      {/* Metric tiles */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <MetricTile label="Current"   score={currentScore} delta={null} />
        <MetricTile label="Previous"  score={prev}         delta={prevDelta} />
        <MetricTile label="90-Day Avg" score={avg90}       delta={avg90Delta} />
      </div>

      {/* Mini trend bar */}
      {recent5.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: tokens.color.textDimmed, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Last {recent5.length} audits
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 36 }}>
            {recent5.map((s, i) => (
              <div key={i} title={`${s}%`} style={{
                flex: 1,
                height: `${Math.max(20, s * 0.36)}px`,
                background: barColor(s),
                borderRadius: tokens.radius.sm,
                opacity: i === 0 ? 1 : 0.55 + i * 0.05,
                transition: 'height 0.3s',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {recent5.map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: tokens.color.textDimmed }}>{s}%</div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
