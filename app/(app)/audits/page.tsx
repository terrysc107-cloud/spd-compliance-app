'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'
import { Card, Badge, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getAllAudits } from '@/lib/storage/audit-storage'

type StatusFilter  = 'all' | 'in-progress' | 'completed'
type DateFilter    = '7d' | '30d' | 'all'

interface StoredAudit {
  id: string
  checklistName: string
  mode: 'full' | 'focus'
  startedAt: string
  completedAt?: string
  status: 'in-progress' | 'completed'
  score?: number
  findings: unknown[]
}

function scoreColor(score?: number): string {
  if (score === undefined) return tokens.color.textMuted
  if (score >= 80) return tokens.color.success
  if (score >= 60) return tokens.color.warning
  return tokens.color.danger
}

function statusVariant(s: string): 'success' | 'info' | 'default' {
  if (s === 'completed')  return 'success'
  if (s === 'in-progress') return 'info'
  return 'default'
}

function statusLabel(s: string): string {
  if (s === 'in-progress') return 'In Progress'
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function cutoff(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

const selectStyle: React.CSSProperties = {
  background: tokens.color.surface,
  border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm,
  color: tokens.color.textMuted,
  fontSize: 13,
  padding: '7px 12px',
  outline: 'none',
  cursor: 'pointer',
}

export default function AuditsPage() {
  const [audits, setAudits]         = useState<StoredAudit[]>([])
  const [statusFilter, setStatus]   = useState<StatusFilter>('all')
  const [dateFilter, setDate]       = useState<DateFilter>('all')

  useEffect(() => {
    const raw = getAllAudits() as StoredAudit[]
    const sorted = [...raw].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
    setAudits(sorted)
  }, [])

  const filtered = audits.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (dateFilter === '7d'  && new Date(a.startedAt) < cutoff(7))  return false
    if (dateFilter === '30d' && new Date(a.startedAt) < cutoff(30)) return false
    return true
  })

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <PageShell
      title="Audit History"
      description="All completed and in-progress compliance audits."
    >
      {/* Filter bar */}
      <Card padding="sm">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: tokens.color.textMuted, fontSize: 13 }}>Status:</span>
          <select style={selectStyle} value={statusFilter}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="all">All</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <span style={{ color: tokens.color.textMuted, fontSize: 13, marginLeft: 8 }}>Date:</span>
          <select style={selectStyle} value={dateFilter}
            onChange={(e) => setDate(e.target.value as DateFilter)}>
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <span style={{ marginLeft: 'auto', color: tokens.color.textDimmed, fontSize: 12 }}>
            {filtered.length} audit{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        {filtered.length === 0 ? (
          <Card padding="lg">
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke={tokens.color.accentBlue} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ display: 'block', margin: '0 auto 16px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="21" x2="9" y2="9" />
              </svg>
              <p style={{ color: tokens.color.textMuted, margin: '0 0 16px', fontSize: 14 }}>
                {audits.length === 0
                  ? 'No audits yet. Start one from the Checklist Library.'
                  : 'No audits match the current filters.'}
              </p>
              {audits.length === 0 && (
                <Button href="/checklists" size="sm">Go to Checklist Library</Button>
              )}
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((audit) => (
              <Card key={audit.id} padding="md" hoverable>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 16, flexWrap: 'wrap',
                }}>
                  {/* Checklist name + date */}
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14,
                      color: tokens.color.textPrimary }}>
                      {audit.checklistName}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: tokens.color.textDimmed }}>
                      {fmt(audit.startedAt)}
                      {audit.completedAt ? ` – ${fmt(audit.completedAt)}` : ''}
                    </p>
                  </div>

                  {/* Mode */}
                  <Badge variant="default" size="sm">
                    {audit.mode === 'full' ? 'Full Audit' : 'Focus Audit'}
                  </Badge>

                  {/* Score */}
                  <span style={{
                    fontWeight: 700, fontSize: 15,
                    color: scoreColor(audit.score),
                    minWidth: 44, textAlign: 'right',
                  }}>
                    {audit.score !== undefined ? `${audit.score}%` : '—'}
                  </span>

                  {/* Status */}
                  <Badge variant={statusVariant(audit.status)} size="sm">
                    {statusLabel(audit.status)}
                  </Badge>

                  {/* Action */}
                  <Button href={`/audits/${audit.id}/results`} variant="secondary" size="sm">
                    View Results
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
