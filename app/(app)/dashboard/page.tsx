'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllAudits, StoredAudit } from '@/lib/storage/audit-storage'
import { Badge } from '@/components/ui/Badge'
import { tokens } from '@/lib/constants/design-tokens'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function scoreVariant(score: number | undefined): 'success' | 'warning' | 'danger' | 'default' {
  if (score === undefined) return 'default'
  if (score >= 85) return 'success'
  if (score >= 65) return 'warning'
  return 'danger'
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [audits, setAudits] = useState<StoredAudit[]>([])

  useEffect(() => {
    setAudits(getAllAudits())
  }, [])

  const completed    = audits.filter(a => a.status === 'completed')
  const openFindings = audits.flatMap(a => a.findings).filter(f => f.status === 'open').length
  const avgScore     = completed.length > 0
    ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
    : null
  const recentAudits = audits.slice(0, 5)

  const card: React.CSSProperties = {
    background:   tokens.color.surface,
    border:       `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    padding:      '24px',
  }

  const muted: React.CSSProperties = { color: tokens.color.textMuted, fontSize: 14 }

  const stats = [
    { label: 'Total Audits',      value: String(audits.length) },
    { label: 'Avg Compliance',    value: avgScore !== null ? `${avgScore}%` : '—' },
    { label: 'Open Findings',     value: String(openFindings) },
    { label: 'Completed Audits',  value: String(completed.length) },
  ]

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: tokens.color.textPrimary }}>
          Dashboard
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          Overview of your sterile processing compliance activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
        {stats.map(({ label, value }) => (
          <div key={label} style={card}>
            <p style={{ ...muted, margin: '0 0 8px' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 700, color: tokens.color.textPrimary }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Audits */}
      <div style={card}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: tokens.color.textPrimary }}>
          Recent Audits
        </h2>

        {recentAudits.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tokens.color.accentBlue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <p style={{ ...muted, margin: 0, textAlign: 'center' }}>
              No audits recorded yet. Start by selecting a checklist template.
            </p>
            <Link href='/checklists' style={{ display: 'inline-block', background: tokens.color.accentBlue, color: tokens.color.textPrimary, padding: '10px 20px', borderRadius: tokens.radius.sm, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
              Run Your First Audit
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 100px 80px', gap: 12, padding: '8px 12px', borderBottom: `1px solid ${tokens.color.border}` }}>
              {['Audit Name', 'Date', 'Score', 'Status', ''].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: tokens.color.textDimmed, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {h}
                </div>
              ))}
            </div>

            {recentAudits.map((audit, i) => (
              <div key={audit.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 80px 100px 80px', gap: 12, padding: '14px 12px', borderBottom: i < recentAudits.length - 1 ? `1px solid ${tokens.color.border}` : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 14, color: tokens.color.textPrimary, fontWeight: 500 }}>
                  {audit.checklistName}
                </div>
                <div style={{ fontSize: 13, color: tokens.color.textMuted }}>
                  {formatDate(audit.startedAt)}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: audit.score !== undefined ? (audit.score >= 85 ? tokens.color.success : audit.score >= 65 ? tokens.color.warning : tokens.color.danger) : tokens.color.textDimmed }}>
                  {audit.score !== undefined ? `${audit.score}%` : '—'}
                </div>
                <div>
                  <Badge variant={audit.status === 'completed' ? scoreVariant(audit.score) : 'default'} size='sm'>
                    {audit.status === 'completed' ? 'Completed' : 'In Progress'}
                  </Badge>
                </div>
                <div>
                  {audit.status === 'completed' && (
                    <Link href={`/audits/${audit.id}/results`} style={{ fontSize: 12, color: tokens.color.accentBlue, textDecoration: 'none', fontWeight: 500 }}>
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
