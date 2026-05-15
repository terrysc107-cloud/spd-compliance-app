'use client'

import { useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import { Card, Badge, Button, Input } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { analyzeSchedule } from '@/lib/staffing/calculator'
import type { ScheduleDay, ScheduleInput } from '@/lib/staffing/calculator'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

interface DayEntry { day: DayKey; caseVolume: number; staffAvailable: number }

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────

const INITIAL_DAYS: DayEntry[] = [
  { day: 'Mon', caseVolume: 25, staffAvailable: 3 },
  { day: 'Tue', caseVolume: 25, staffAvailable: 3 },
  { day: 'Wed', caseVolume: 25, staffAvailable: 3 },
  { day: 'Thu', caseVolume: 25, staffAvailable: 3 },
  { day: 'Fri', caseVolume: 25, staffAvailable: 3 },
  { day: 'Sat', caseVolume: 10, staffAvailable: 2 },
  { day: 'Sun', caseVolume: 0,  staffAvailable: 0 },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusVariant = (s: ScheduleDay['status']): 'success' | 'warning' | 'danger' =>
  s === 'adequate' ? 'success' : s === 'marginal' ? 'warning' : 'danger'

const statusRowBg = (s: ScheduleDay['status']) =>
  s === 'adequate'    ? 'rgba(34,197,94,0.05)' :
  s === 'marginal'    ? 'rgba(234,179,8,0.05)' :
  'rgba(239,68,68,0.05)'

const thStyle: React.CSSProperties = {
  padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600,
  color: tokens.color.textMuted, borderBottom: `1px solid ${tokens.color.border}`,
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px', fontSize: 13, color: tokens.color.textPrimary,
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [minutesPerTray,    setMinutesPerTray]    = useState(45)
  const [instrumentsPerCase, setInstrumentsPerCase] = useState(15)
  const [days, setDays]                           = useState<DayEntry[]>(INITIAL_DAYS)
  const [results, setResults]                     = useState<ScheduleDay[] | null>(null)

  function updateDay(index: number, field: 'caseVolume' | 'staffAvailable', val: string) {
    setDays(prev => prev.map((d, i) => i === index ? { ...d, [field]: Number(val) } : d))
  }

  function handleAnalyze() {
    const input: ScheduleInput = { weeklyPattern: days, minutesPerTray, instrumentsPerCase }
    setResults(analyzeSchedule(input))
  }

  const muted: React.CSSProperties  = { color: tokens.color.textMuted, fontSize: 13 }
  const h2: React.CSSProperties     = { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: tokens.color.textPrimary }

  const totalCases       = results ? results.reduce((s, r) => s + r.caseVolume, 0) : 0
  const understaffedDays = results ? results.filter(r => r.status === 'understaffed').length : 0
  const adequateDays     = results ? results.filter(r => r.status === 'adequate').length : 0
  const busiestDay       = results ? results.reduce((a, b) => a.caseVolume > b.caseVolume ? a : b) : null

  return (
    <PageShell title="Smart Scheduler" description="Analyze weekly staffing coverage against expected surgical case volume.">

      {/* ── Config ── */}
      <Card padding="md">
        <h2 style={h2}>Processing Configuration</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 180 }}>
            <Input label="Minutes per Tray" type="number" value={String(minutesPerTray)}
              onChange={e => setMinutesPerTray(Number(e.target.value))} />
          </div>
          <div style={{ minWidth: 180 }}>
            <Input label="Instruments per Case" type="number" value={String(instrumentsPerCase)}
              onChange={e => setInstrumentsPerCase(Number(e.target.value))} />
          </div>
        </div>
      </Card>

      {/* ── Weekly Grid ── */}
      <div style={{ marginTop: 16 }}>
        <Card padding="md">
          <h2 style={h2}>Weekly Schedule</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
            {days.map((entry, i) => (
              <div key={entry.day} style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokens.color.border}`,
                borderRadius: tokens.radius.sm, padding: '12px',
              }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: tokens.color.textPrimary }}>{entry.day}</p>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ display: 'block', fontSize: 11, color: tokens.color.textMuted, marginBottom: 4 }}>Cases</label>
                  <input type="number" value={entry.caseVolume} onChange={e => updateDay(i, 'caseVolume', e.target.value)}
                    style={{ width: '100%', background: tokens.color.bg, border: `1px solid ${tokens.color.border}`,
                      borderRadius: tokens.radius.sm, color: tokens.color.textPrimary, fontSize: 13,
                      padding: '5px 8px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: tokens.color.textMuted, marginBottom: 4 }}>Staff</label>
                  <input type="number" value={entry.staffAvailable} onChange={e => updateDay(i, 'staffAvailable', e.target.value)}
                    style={{ width: '100%', background: tokens.color.bg, border: `1px solid ${tokens.color.border}`,
                      borderRadius: tokens.radius.sm, color: tokens.color.textPrimary, fontSize: 13,
                      padding: '5px 8px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            ))}
          </div>
          <Button onClick={handleAnalyze}>Analyze Schedule</Button>
        </Card>
      </div>

      {/* ── Results Table ── */}
      {results && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h2 style={h2}>Coverage Analysis</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Day', 'Cases', 'Staff Available', 'Staff Required', 'Variance', 'Status'].map(col => (
                      <th key={col} style={thStyle}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map(row => (
                    <tr key={row.day} style={{ background: statusRowBg(row.status) }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{row.day}</td>
                      <td style={tdStyle}>{row.caseVolume}</td>
                      <td style={tdStyle}>{row.staffAvailable}</td>
                      <td style={tdStyle}>{row.requiredStaff}</td>
                      <td style={{ ...tdStyle, color: row.variance >= 0 ? tokens.color.success : tokens.color.danger, fontWeight: 600 }}>
                        {row.variance >= 0 ? `+${row.variance}` : row.variance}
                      </td>
                      <td style={tdStyle}>
                        <Badge variant={statusVariant(row.status)} size="sm">
                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {/* Summary row */}
                  <tr style={{ borderTop: `2px solid ${tokens.color.border}`, background: 'rgba(255,255,255,0.02)' }}>
                    <td style={{ ...tdStyle, fontWeight: 700, color: tokens.color.textMuted }}>Total</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{totalCases}</td>
                    <td style={tdStyle} colSpan={2} />
                    <td style={tdStyle}>
                      <span style={{ fontSize: 12, color: tokens.color.danger }}>{understaffedDays} understaffed</span>
                      {' / '}
                      <span style={{ fontSize: 12, color: tokens.color.success }}>{adequateDays} adequate</span>
                    </td>
                    <td style={tdStyle} />
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* ── Risk Summary ── */}
          <Card padding="md">
            <h2 style={{ ...h2, marginBottom: 12 }}>Risk Summary</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { label: 'Days Understaffed', value: `${understaffedDays} of 7`, color: understaffedDays > 0 ? tokens.color.danger : tokens.color.success },
                { label: 'Days Adequate',      value: `${adequateDays} of 7`,    color: tokens.color.success },
                { label: 'Busiest Day',        value: busiestDay ? `${busiestDay.day} (${busiestDay.caseVolume} cases)` : '—', color: tokens.color.textPrimary },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ flex: 1, minWidth: 140, background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.sm, padding: '12px 16px' }}>
                  <p style={{ ...muted, margin: '0 0 4px' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color }}>{value}</p>
                </div>
              ))}
            </div>
            {understaffedDays > 0 ? (
              <div style={{ background: 'rgba(239,68,68,0.07)', border: `1px solid rgba(239,68,68,0.2)`,
                borderRadius: tokens.radius.sm, padding: '12px 16px' }}>
                <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: tokens.color.danger }}>Recommended Actions</p>
                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <li style={{ fontSize: 13, color: tokens.color.textMuted }}>Add per-diem staff on peak days</li>
                  <li style={{ fontSize: 13, color: tokens.color.textMuted }}>Shift cases from high-volume days to low-volume days where possible</li>
                  <li style={{ fontSize: 13, color: tokens.color.textMuted }}>Review overtime eligibility for existing FTEs</li>
                </ul>
              </div>
            ) : (
              <div style={{ background: 'rgba(34,197,94,0.07)', border: `1px solid rgba(34,197,94,0.2)`,
                borderRadius: tokens.radius.sm, padding: '12px 16px' }}>
                <p style={{ margin: 0, fontSize: 13, color: tokens.color.success }}>
                  All days are adequately staffed. Current schedule meets processing demand.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </PageShell>
  )
}
