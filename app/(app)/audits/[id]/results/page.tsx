'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getAudit, StoredAudit, StoredFinding } from '@/lib/storage/audit-storage'
import { tokens } from '@/lib/constants/design-tokens'
import { SECTIONS } from '@/lib/data/checklist-sections'
import TrendComparison from '@/components/assessment/TrendComparison'
import FindingLifecycle from '@/components/assessment/FindingLifecycle'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function scoreVariant(pct: number): 'success' | 'warning' | 'danger' {
  return pct >= 85 ? 'success' : pct >= 65 ? 'warning' : 'danger'
}
function scoreColor(pct: number): string {
  return pct >= 85 ? tokens.color.success : pct >= 65 ? tokens.color.warning : tokens.color.danger
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function buildSectionRows(audit: StoredAudit) {
  return SECTIONS.map(sec => {
    const fails = audit.findings.filter(f => f.sectionName === sec.label).length
    const score = Math.round(((sec.items.length - fails) / sec.items.length) * 100)
    return { label: sec.label, score, passing: score >= 85 }
  })
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

  const score       = audit.score ?? 0
  const variant     = scoreVariant(score)
  const openCount   = findings.filter(f => f.status === 'open').length
  const resolvedCnt = findings.filter(f => f.status === 'resolved').length
  const sectionRows = buildSectionRows(audit)

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
          <div style={{ fontSize: '64px', fontWeight: 800, lineHeight: 1, color: scoreColor(score) }}>{score}%</div>
          <div style={{ fontSize: '13px', color: tokens.color.textMuted, marginTop: '4px' }}>Overall Compliance</div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <ProgressBar value={score} variant={variant} height={12} />
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
            {[
              { label: 'Total Findings', val: findings.length, color: tokens.color.textMuted },
              { label: 'Open',           val: openCount,        color: tokens.color.danger },
              { label: 'Resolved',       val: resolvedCnt,      color: tokens.color.success },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: '11px', color: tokens.color.textDimmed }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend comparison — only for completed audits with a score */}
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
          {sectionRows.map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 160, fontSize: '13px', color: tokens.color.textMuted, flexShrink: 0 }}>{row.label}</div>
              <div style={{ flex: 1 }}><ProgressBar value={row.score} variant={scoreVariant(row.score)} height={6} /></div>
              <div style={{ width: 40, textAlign: 'right', fontSize: '13px', fontWeight: 700, color: scoreColor(row.score) }}>{row.score}%</div>
              <Badge variant={row.passing ? 'success' : 'danger'} size="sm">{row.passing ? 'Pass' : 'Fail'}</Badge>
            </div>
          ))}
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
