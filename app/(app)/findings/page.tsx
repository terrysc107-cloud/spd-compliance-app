'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'
import { Card, Badge } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getAllAudits } from '@/lib/storage/audit-storage'
import { getCurrentUser, canViewAllDepartments } from '@/lib/storage/org-storage'

type SeverityFilter = 'all' | 'critical' | 'major' | 'minor'
type StatusFilter   = 'all' | 'open' | 'in-progress' | 'resolved'
type Sev = 'critical' | 'major' | 'minor'
type Sta = 'open' | 'in-progress' | 'resolved'

interface FlatFinding {
  itemIndex: number; sectionName: string; question: string
  severity: Sev; comment: string; status: Sta; correctiveAction?: string
  auditId: string; auditDate: string; checklistName: string; departmentId?: string
}

const sevVariant = (s: string) => s === 'critical' ? 'danger' : s === 'major' ? 'warning' : 'info' as const
const staVariant = (s: string) => s === 'open' ? 'danger' : s === 'in-progress' ? 'warning' : s === 'resolved' ? 'success' : 'default' as const
const staLabel   = (s: string) => s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)

const selectStyle: React.CSSProperties = {
  background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm, color: tokens.color.textMuted,
  fontSize: 13, padding: '7px 12px', outline: 'none', cursor: 'pointer',
}

export default function FindingsPage() {
  const [findings, setFindings]   = useState<FlatFinding[]>([])
  const [severity, setSeverity]   = useState<SeverityFilter>('all')
  const [statusFilter, setStatus] = useState<StatusFilter>('all')
  const [canViewAll, setCanViewAll] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    const viewAll = canViewAllDepartments(user.role)
    setCanViewAll(viewAll)
    type AuditRow = { id: string; checklistName: string; startedAt: string; status: string; findings: FlatFinding[]; departmentId?: string }
    const audits = getAllAudits() as unknown as AuditRow[]
    const scoped = viewAll
      ? audits
      : audits.filter(a => !a.departmentId || a.departmentId === user.departmentId)
    setFindings(
      scoped.filter(a => a.status === 'completed')
        .flatMap(a => (a.findings ?? []).map(f => ({
          ...f, auditId: a.id, auditDate: a.startedAt,
          checklistName: a.checklistName, departmentId: a.departmentId,
        })))
    )
  }, [])

  const filtered = findings.filter(f =>
    (severity === 'all' || f.severity === severity) &&
    (statusFilter === 'all' || f.status === statusFilter)
  )

  const openCounts = {
    critical: findings.filter(f => f.severity === 'critical' && f.status !== 'resolved').length,
    major:    findings.filter(f => f.severity === 'major'    && f.status !== 'resolved').length,
    minor:    findings.filter(f => f.severity === 'minor'    && f.status !== 'resolved').length,
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const truncate = (s: string, n = 80) => s.length > n ? s.slice(0, n) + '…' : s

  return (
    <PageShell title="Findings"
      description={canViewAll ? 'All departments — non-conformances and corrective action items.' : 'Findings for your department.'}>

      {findings.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {([['critical', openCounts.critical, tokens.color.danger],
             ['major',    openCounts.major,    tokens.color.warning],
             ['minor',    openCounts.minor,    tokens.color.accentBlue]] as const).map(([k, n, c]) => (
            <Card key={k} padding="sm">
              <span style={{ fontSize: 13, color: c, fontWeight: 700 }}>{n}</span>
              <span style={{ fontSize: 12, color: tokens.color.textMuted, marginLeft: 6 }}>
                {k.charAt(0).toUpperCase() + k.slice(1)} open
              </span>
            </Card>
          ))}
        </div>
      )}

      <Card padding="sm">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: tokens.color.textMuted, fontSize: 13 }}>Severity:</span>
          <select style={selectStyle} value={severity} onChange={e => setSeverity(e.target.value as SeverityFilter)}>
            {(['all','critical','major','minor'] as const).map(v =>
              <option key={v} value={v}>{v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
          </select>
          <span style={{ color: tokens.color.textMuted, fontSize: 13, marginLeft: 8 }}>Status:</span>
          <select style={selectStyle} value={statusFilter} onChange={e => setStatus(e.target.value as StatusFilter)}>
            {(['all','open','in-progress','resolved'] as const).map(v =>
              <option key={v} value={v}>{staLabel(v === 'all' ? 'all' : v)}</option>)}
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
                stroke={tokens.color.accentBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ display: 'block', margin: '0 auto 16px' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p style={{ color: tokens.color.textMuted, margin: 0, fontSize: 14 }}>
                No findings yet. Complete an audit to see findings here.
              </p>
            </div>
          </Card>
        ) : filtered.length === 0 ? (
          <Card padding="lg">
            <p style={{ color: tokens.color.textMuted, textAlign: 'center', margin: 0, fontSize: 14, padding: '24px 0' }}>
              No findings match the current filters.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((f, i) => (
              <Card key={`${f.auditId}-${f.itemIndex}-${i}`} padding="md" hoverable>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: tokens.color.textPrimary, lineHeight: 1.4 }}>
                      {truncate(f.question)}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: tokens.color.textDimmed }}>
                      {f.sectionName} &middot; {f.checklistName} &middot; {fmt(f.auditDate)}
                      {f.departmentId ? ` · ${f.departmentId}` : ''}
                    </p>
                  </div>
                  <Badge variant={sevVariant(f.severity) as 'danger' | 'warning' | 'info'} size="sm">
                    {f.severity.charAt(0).toUpperCase() + f.severity.slice(1)}
                  </Badge>
                  <Badge variant={staVariant(f.status) as 'danger' | 'warning' | 'success' | 'default'} size="sm">
                    {staLabel(f.status)}
                  </Badge>
                  <Link href={`/audits/${f.auditId}/results`} style={{
                    fontSize: 12, color: tokens.color.accentBlue,
                    textDecoration: 'none', whiteSpace: 'nowrap', alignSelf: 'center',
                  }}>View Audit</Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
