'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getAudit, StoredAudit, StoredFinding } from '@/lib/storage/audit-storage'
import { getScoreStatus, getScoreColor, SectionResult } from '@/lib/scoring/engine'
import { getThresholds } from '@/lib/storage/threshold-storage'
import { tokens } from '@/lib/constants/design-tokens'
import { SECTIONS } from '@/lib/data/checklist-sections'
import TrendComparison from '@/components/assessment/TrendComparison'
import FindingLifecycle from '@/components/assessment/FindingLifecycle'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function statusToVariant(status: 'pass' | 'marginal' | 'fail'): 'success' | 'warning' | 'danger' {
  return status === 'pass' ? 'success' : status === 'marginal' ? 'warning' : 'danger'
}

function statusLabel(status: 'pass' | 'marginal' | 'fail'): string {
  return status === 'pass' ? 'Pass' : status === 'marginal' ? 'Marginal' : 'Fail'
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Fallback for audits stored before Phase 06 (no auditScore). Count-based approximation.
function legacySectionRows(audit: StoredAudit) {
  const config = getThresholds()
  return SECTIONS.map(sec => {
    const fails = audit.findings.filter(f => f.sectionName === sec.label).length
    const score = Math.round(((sec.items.length - fails) / sec.items.length) * 100)
    return { label: sec.label, score, status: getScoreStatus(score, config) }
  })
}

function engineSectionRows(sections: SectionResult[]) {
  return sections.map(s => ({ label: s.sectionName, score: s.score, status: s.status }))
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function AuditResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [audit,    setAudit]    = useState<StoredAudit | null>(null)
  const [findings, setFindings] = useState<StoredFinding[]>([])
  const [notFound, setNotFound] = useState(false)

  const loadAudit = useCallback(() => {
    const stored = getAudit(id)
    if (!stored) { setNotFound(true); return }
    setAudit(stored)
    setFindings(stored.findings)
  }, [id])

  useEffect(() => { loadAudit() }, [loadAudit])

  if (notFound) return (
    <PageShell title="Audit Not Found">
      <p style={{ color: tokens.color.textMuted }}>
        No audit found. <Button href="/audits" variant="ghost" size="sm">Back to Audits</Button>
      </p>
    </PageShell>
  )
  if (!audit) return <PageShell title="Loading…"><p style={{ color: tokens.color.textMuted }}>Loading…</p></PageShell>

  const score    = audit.score ?? 0
  const config   = getThresholds()
  const status   = audit.auditScore?.status ?? getScoreStatus(score, config)
  const color    = getScoreColor(status)
  const variant  = statusToVariant(status)

  const openCount   = findings.filter(f => f.status === 'open').length
  const resolvedCnt = findings.filter(f => f.status === 'resolved').length

  // Prefer engine section data; fall back to legacy approximation for old audits
  const sectionRows = audit.auditScore
    ? engineSectionRows(audit.auditScore.sections)
    : legacySectionRows(audit)

  // Severity breakdown: prefer engine counts, fall back to counting findings
  const criticalFails = audit.auditScore?.criticalFailCount
    ?? findings.filter(f => f.severity === 'critical').length
  const majorFails    = audit.auditScore?.majorFailCount
    ?? findings.filter(f => f.severity === 'major').length
  const minorFails    = audit.auditScore?.minorFailCount
    ?? findings.filter(f => f.severity === 'minor').length

  const thStyle: React.CSSProperties = {
    padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700,
    color: tokens.color.textDimmed, letterSpacing: '0.06em', textTransform: 'uppercase',
    borderBottom: `1px solid ${tokens.color.border}`, background: tokens.color.bg,
  }

  return (
    <PageShell
      title={audit.checklistName}
      description={`Completed ${audit.completedAt ? fmtDate(audit.completedAt) : '—'} · ${audit.mode === 'full' ? 'Full Audit' : 'Focus Audit'}`}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>Download Report</Button>
          <Button href="/audits" variant="ghost" size="sm">Back to Audits</Button>
        </div>
      }
    >
      {/* Score hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1, color }}>{score}%</div>
          <div style={{ marginTop: '8px' }}>
            <span style={{ display: 'inline-block', padding: '3px 12px', borderRadius: tokens.radius.pill, background: `${color}18`, border: `1px solid ${color}40`, fontSize: '12px', fontWeight: 700, color }}>
              {statusLabel(status)}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: tokens.color.textMuted, marginTop: '6px' }}>Overall Compliance</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <ProgressBar value={score} variant={variant} height={12} />
          <div style={{ display: 'flex', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',    val: findings.length, color: tokens.color.textMuted },
              { label: 'Open',     val: openCount,       color: tokens.color.danger },
              { label: 'Resolved', val: resolvedCnt,     color: tokens.color.success },
              { label: 'Critical', val: criticalFails,   color: tokens.color.danger },
              { label: 'Major',    val: majorFails,      color: tokens.color.warning },
              { label: 'Minor',    val: minorFails,      color: tokens.color.textMuted },
            ].map(({ label, val, color: c }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 700, color: c }}>{val}</div>
                <div style={{ fontSize: '11px', color: tokens.color.textDimmed }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend comparison */}
      {audit.status === 'completed' && audit.score !== undefined && (
        <div style={{ marginBottom: '24px' }}>
          <TrendComparison
            currentAuditId={id}
            currentScore={audit.score}
            checklistName={audit.checklistName}
          />
        </div>
      )}

      {/* Section scores */}
      <Card padding="md">
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: tokens.color.textPrimary }}>Section Scores</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sectionRows.map(row => {
            const rowColor   = getScoreColor(row.status)
            const rowVariant = statusToVariant(row.status)
            return (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 160, fontSize: '13px', color: tokens.color.textMuted, flexShrink: 0 }}>{row.label}</div>
                <div style={{ flex: 1 }}><ProgressBar value={row.score} variant={rowVariant} height={6} /></div>
                <div style={{ width: 40, textAlign: 'right', fontSize: '13px', fontWeight: 700, color: rowColor }}>{row.score}%</div>
                <Badge variant={rowVariant} size="sm">{statusLabel(row.status)}</Badge>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Findings — FindingLifecycle cards */}
      <div style={{ marginTop: '24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: tokens.color.textPrimary }}>
          Findings ({findings.length})
        </h2>
        {findings.length === 0 ? (
          <Card padding="lg">
            <div style={{ textAlign: 'center', color: tokens.color.success, fontSize: '14px' }}>
              No findings — full compliance.
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {findings.map(f => (
              <FindingLifecycle
                key={f.itemIndex}
                finding={f}
                auditId={id}
                onUpdate={loadAudit}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
