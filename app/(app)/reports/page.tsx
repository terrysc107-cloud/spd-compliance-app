'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getAllAudits, type StoredAudit } from '@/lib/storage/audit-storage'
import { buildReportData, type ReportData } from '@/lib/reports/generator'
import { saveReport, getAllReports, deleteReport, type SavedReport } from '@/lib/storage/report-storage'

const t = tokens.color
const card: React.CSSProperties = {
  background: t.surface, border: `1px solid ${t.border}`, borderRadius: tokens.radius.md, padding: 24,
}

type ReportType = 'audit-summary' | 'gap-analysis' | 'trend'

interface ReportConfig {
  id:          ReportType
  name:        string
  description: string
}

const REPORT_TYPES: ReportConfig[] = [
  { id: 'audit-summary', name: 'Audit Summary', description: 'Full breakdown of audits: pass/fail per item, section scores, and overall compliance percentage.' },
  { id: 'gap-analysis',  name: 'Gap Analysis',  description: 'Identifies non-compliance areas and maps them to AAMI standards with recommended corrective actions.' },
  { id: 'trend',         name: 'Trend & Compliance', description: 'Tracks compliance scores over time, highlighting improving and declining sections across audits.' },
]

function todayStr() { return new Date().toISOString().split('T')[0] }
function ninetyDaysAgo() {
  const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split('T')[0]
}

export default function ReportsPage() {
  const [audits, setAudits]         = useState<StoredAudit[]>([])
  const [history, setHistory]       = useState<SavedReport[]>([])
  const [starts, setStarts]         = useState<Record<ReportType, string>>({ 'audit-summary': ninetyDaysAgo(), 'gap-analysis': ninetyDaysAgo(), 'trend': ninetyDaysAgo() })
  const [ends, setEnds]             = useState<Record<ReportType, string>>({ 'audit-summary': todayStr(), 'gap-analysis': todayStr(), 'trend': todayStr() })
  const [loading, setLoading]       = useState<ReportType | null>(null)
  const [activeReport, setActive]   = useState<{ type: ReportType; text: string; data: ReportData } | null>(null)
  const [error, setError]           = useState('')

  useEffect(() => {
    setAudits(getAllAudits())
    setHistory(getAllReports())
  }, [])

  const generate = async (cfg: ReportConfig) => {
    setError(''); setLoading(cfg.id); setActive(null)
    try {
      const data = buildReportData(cfg.id, audits, {
        start: new Date(starts[cfg.id]),
        end:   new Date(ends[cfg.id] + 'T23:59:59'),
      })
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportData: data }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const json = await res.json()
      const text: string = json.report ?? ''
      setActive({ type: cfg.id, text, data })
      const saved: SavedReport = {
        id: crypto.randomUUID(), title: data.title, reportType: cfg.id,
        generatedAt: data.generatedAt, text, auditCount: data.auditCount, avgScore: data.avgScore,
      }
      saveReport(saved)
      setHistory(getAllReports())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate report')
    } finally {
      setLoading(null)
    }
  }

  const downloadText = (text: string, title: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-${todayStr()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const completedCount = audits.filter(a => a.status === 'completed').length

  return (
    <div style={{ padding: '32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: t.textPrimary }}>Reports</h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: t.textMuted }}>
          Generate AI-powered compliance reports from your audit data. {completedCount === 0 && '(Complete at least one audit to generate reports.)'}
        </p>
      </div>

      {/* Report Type Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
        {REPORT_TYPES.map(cfg => (
          <div key={cfg.id} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: t.textPrimary }}>{cfg.name}</h3>
              <p style={{ margin: 0, fontSize: 13, color: t.textMuted, lineHeight: 1.6 }}>{cfg.description}</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, color: t.textDimmed, marginBottom: 4 }}>Start date</label>
                <input type="date" value={starts[cfg.id]} onChange={e => setStarts(p => ({ ...p, [cfg.id]: e.target.value }))}
                  style={{ width: '100%', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 6, color: t.textPrimary, padding: '6px 8px', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 11, color: t.textDimmed, marginBottom: 4 }}>End date</label>
                <input type="date" value={ends[cfg.id]} onChange={e => setEnds(p => ({ ...p, [cfg.id]: e.target.value }))}
                  style={{ width: '100%', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 6, color: t.textPrimary, padding: '6px 8px', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>
            <Button
              onClick={() => generate(cfg)}
              disabled={loading !== null || completedCount === 0}
              variant={completedCount === 0 ? 'secondary' : 'primary'}
            >
              {loading === cfg.id ? 'Generating…' : 'Generate Report'}
            </Button>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: `1px solid rgba(239,68,68,0.2)`, borderRadius: 8, padding: '12px 16px', marginBottom: 24, color: t.danger, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Generated Report Output */}
      {activeReport && (
        <div style={{ ...card, marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: t.textPrimary }}>{activeReport.data.title}</h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: t.textMuted }}>
                {activeReport.data.scope} · Avg score: {activeReport.data.avgScore}% · Generated {new Date(activeReport.data.generatedAt).toLocaleString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" variant="secondary" onClick={() => downloadText(activeReport.text, activeReport.data.title)}>Download .txt</Button>
              <Button size="sm" variant="secondary" onClick={() => window.print()}>Print</Button>
            </div>
          </div>
          <div style={{ background: t.bg, borderRadius: 8, padding: '20px 24px', whiteSpace: 'pre-wrap', fontSize: 14, color: t.textPrimary, lineHeight: 1.7, maxHeight: 520, overflowY: 'auto', border: `1px solid ${t.border}` }}>
            {activeReport.text || <span style={{ color: t.textMuted }}>No report content returned.</span>}
          </div>
        </div>
      )}

      {/* Report History */}
      <div style={card}>
        <h2 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 600, color: t.textPrimary }}>Report History</h2>
        {history.length === 0 ? (
          <p style={{ margin: 0, color: t.textMuted, fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
            No reports generated yet. Complete an audit and generate your first report above.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: t.bg, borderRadius: 8, border: `1px solid ${t.border}` }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: t.textPrimary }}>{r.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: t.textMuted }}>
                    {r.auditCount} audit{r.auditCount !== 1 ? 's' : ''} · Avg {r.avgScore}% · {new Date(r.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => downloadText(r.text, r.title)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.accentBlue, fontSize: 12, padding: '4px 8px' }}>
                    Download
                  </button>
                  <button onClick={() => { deleteReport(r.id); setHistory(getAllReports()) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.textDimmed, fontSize: 12, padding: '4px 8px' }}
                    onMouseOver={e => (e.currentTarget.style.color = t.danger)}
                    onMouseOut={e => (e.currentTarget.style.color = t.textDimmed)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
