'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'
import { Card, Badge } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getAllAudits } from '@/lib/storage/audit-storage'

type SeverityFilter = 'all' | 'critical' | 'major' | 'minor'
type StatusFilter   = 'all' | 'open' | 'in-progress' | 'resolved'

interface Finding {
  itemIndex: number
  sectionName: string
  question: string
  severity: 'critical' | 'major' | 'minor'
  comment: string
  status: 'open' | 'in-progress' | 'resolved'
  correctiveAction?: string
}

interface FlatFinding extends Finding {
  auditId: string
  auditDate: string
  checklistName: string
}

function severityVariant(s: string): 'danger' | 'warning' | 'info' {
  if (s === 'critical') return 'danger'
  if (s === 'major')    return 'warning'
  return 'info'
}

function statusVariant(s: string): 'danger' | 'warning' | 'success' | 'default' {
  if (s === 'open')        return 'danger'
  if (s === 'in-progress') return 'warning'
  if (s === 'resolved')    return 'success'
  return 'default'
}

function statusLabel(s: string): string {
  if (s === 'in-progress') return 'In Progress'
  return s.charAt(0).toUpperCase() + s.slice(1)
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

export default function FindingsPage() {
  const [findings, setFindings]       = useState<FlatFinding[]>([])
  const [severity, setSeverity]       = useState<SeverityFilter>('all')
  const [statusFilter, setStatus]     = useState<StatusFilter>('all')

  useEffect(() => {
    const audits = getAllAudits() as Array<{
      id: string
      checklistName: string
      startedAt: string
      status: string
      findings: Finding[]
    }>
    const flat: FlatFinding[] = audits
      .filter((a) => a.status === 'completed')
      .flatMap((a) =>
        (a.findings ?? []).map((f) => ({
          ...f,
          auditId: a.id,
          auditDate: a.startedAt,
          checklistName: a.checklistName,
        }))
      )
    setFindings(flat)
  }, [])

  const filtered = findings.filter((f) => {
    if (severity !== 'all' && f.severity !== severity) return false
    if (statusFilter !== 'all' && f.status !== statusFilter) return false
    return true
  })

  const openCounts = {
    critical: findings.filter((f) => f.severity === 'critical' && f.status !== 'resolved').length,
    major:    findings.filter((f) => f.severity === 'major'    && f.status !== 'resolved').length,
    minor:    findings.filter((f) => f.severity === 'minor'    && f.status !== 'resolved').length,
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const truncate = (s: string, n = 80) => s.length > n ? s.slice(0, n) + '…' : s

  return (
    <PageShell
      title="Findings"
      description="Non-conformances and corrective action items flagged during audits."
    >
      {/* Summary row */}
      {findings.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <Card padding="sm">
            <span style={{ fontSize: 13, color: tokens.color.danger, fontWeight: 700 }}>
              {openCounts.critical}
            </span>
            <span style={{ fontSize: 12, color: tokens.color.textMuted, marginLeft: 6 }}>
              Critical open
            </span>
          </Card>
          <Card padding="sm">
            <span style={{ fontSize: 13, color: tokens.color.warning, fontWeight: 700 }}>
              {openCounts.major}
            </span>
            <span style={{ fontSize: 12, color: tokens.color.textMuted, marginLeft: 6 }}>
              Major open
            </span>
          </Card>
          <Card padding="sm">
            <span style={{ fontSize: 13, color: tokens.color.accentBlue, fontWeight: 700 }}>
              {openCounts.minor}
            </span>
            <span style={{ fontSize: 12, color: tokens.color.textMuted, marginLeft: 6 }}>
              Minor open
            </span>
          </Card>
        </div>
      )}

      {/* Filter bar */}
      <Card padding="sm">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: tokens.color.textMuted, fontSize: 13 }}>Severity:</span>
          <select style={selectStyle} value={severity}
            onChange={(e) => setSeverity(e.target.value as SeverityFilter)}>
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>

          <span style={{ color: tokens.color.textMuted, fontSize: 13, marginLeft: 8 }}>Status:</span>
          <select style={selectStyle} value={statusFilter}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <span style={{ marginLeft: 'auto', color: tokens.color.textDimmed, fontSize: 12 }}>
            {filtered.length} finding{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        {findings.length === 0 ? (
          <Card padding="lg">
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke={tokens.color.accentBlue} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ display: 'block', margin: '0 auto 16px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ color: tokens.color.textMuted, margin: 0, fontSize: 14 }}>
                No findings yet. Complete an audit to see findings here.
              </p>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card padding="lg">
            <p style={{ color: tokens.color.textMuted, textAlign: 'center',
              margin: 0, fontSize: 14, padding: '24px 0' }}>
              No findings match the current filters.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((f, i) => (
              <Card key={`${f.auditId}-${f.itemIndex}-${i}`} padding="md" hoverable>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Question + section */}
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500,
                      color: tokens.color.textPrimary, lineHeight: 1.4 }}>
                      {truncate(f.question)}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 12,
                      color: tokens.color.textDimmed }}>
                      {f.sectionName} &middot; {f.checklistName} &middot; {fmt(f.auditDate)}
                    </p>
                  </div>

                  {/* Severity */}
                  <Badge variant={severityVariant(f.severity)} size="sm">
                    {f.severity.charAt(0).toUpperCase() + f.severity.slice(1)}
                  </Badge>

                  {/* Status */}
                  <Badge variant={statusVariant(f.status)} size="sm">
                    {statusLabel(f.status)}
                  </Badge>

                  {/* Link */}
                  <Link href={`/audits/${f.auditId}/results`} style={{
                    fontSize: 12, color: tokens.color.accentBlue,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                    alignSelf: 'center',
                  }}>
                    View Audit →
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
