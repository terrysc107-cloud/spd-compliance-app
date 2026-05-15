'use client'

import { useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import { Card, Badge, Button, Input, ProgressBar } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { calculateStaffing } from '@/lib/staffing/calculator'
import type { StaffingInput, StaffingResult } from '@/lib/staffing/calculator'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const statusVariant = (s: StaffingResult['status']): 'success' | 'warning' | 'danger' =>
  s === 'adequate' ? 'success' : s === 'marginal' ? 'warning' : 'danger'

const ratioColor = (s: StaffingResult['status']) =>
  s === 'adequate' ? tokens.color.success : s === 'marginal' ? tokens.color.warning : tokens.color.danger

const selectStyle: React.CSSProperties = {
  background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm, color: tokens.color.textPrimary,
  fontSize: 13, padding: '6px 10px', outline: 'none', cursor: 'pointer', width: '100%',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, color: tokens.color.textMuted, marginBottom: 6, fontWeight: 500,
}

const metricStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm, padding: '12px 16px', flex: 1, minWidth: 140,
}

// ─── DEFAULTS ─────────────────────────────────────────────────────────────────

const DEFAULT_INPUT: StaffingInput = {
  fteCount: 3, hoursPerShift: 8, shiftsPerWeek: 5,
  caseVolumePerDay: 20, instrumentsPerCase: 15, minutesPerTray: 45,
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function StaffingPage() {
  const [form, setForm]       = useState<StaffingInput>(DEFAULT_INPUT)
  const [result, setResult]   = useState<StaffingResult | null>(null)

  const set = (key: keyof StaffingInput, val: string) =>
    setForm(prev => ({ ...prev, [key]: Number(val) }))

  function handleCalculate() {
    setResult(calculateStaffing(form))
  }

  const muted: React.CSSProperties = { color: tokens.color.textMuted, fontSize: 13 }
  const h2: React.CSSProperties    = { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: tokens.color.textPrimary }

  return (
    <PageShell title="Staffing Calculator" description="Estimate whether your FTE headcount meets daily instrument processing demand.">

      {/* ── Input Form ── */}
      <Card padding="md">
        <h2 style={h2}>Staffing Inputs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          <Input label="FTE Count" type="number" value={String(form.fteCount)}
            onChange={e => set('fteCount', e.target.value)} />
          <div>
            <label style={labelStyle}>Hours per Shift</label>
            <select style={selectStyle} value={form.hoursPerShift}
              onChange={e => set('hoursPerShift', e.target.value)}>
              {[8, 10, 12].map(h => <option key={h} value={h}>{h} hours</option>)}
            </select>
          </div>
          <Input label="Shifts per Week" type="number" value={String(form.shiftsPerWeek)}
            onChange={e => set('shiftsPerWeek', e.target.value)} />
          <Input label="Cases per Day" type="number" value={String(form.caseVolumePerDay)}
            onChange={e => set('caseVolumePerDay', e.target.value)} />
          <Input label="Instruments per Case" type="number" value={String(form.instrumentsPerCase)}
            onChange={e => set('instrumentsPerCase', e.target.value)} />
          <Input label="Minutes per Tray" type="number" value={String(form.minutesPerTray)}
            onChange={e => set('minutesPerTray', e.target.value)} />
        </div>
        <Button onClick={handleCalculate}>Calculate</Button>
      </Card>

      {/* ── Results ── */}
      {result && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ margin: '0 0 4px', ...muted }}>Coverage Ratio</p>
                <span style={{ fontSize: 48, fontWeight: 700, color: ratioColor(result.status), lineHeight: 1 }}>
                  {result.coverageRatio.toFixed(2)}×
                </span>
              </div>
              <Badge variant={statusVariant(result.status)} size="md">{result.statusLabel}</Badge>
            </div>

            <div style={{ marginBottom: 20 }}>
              <ProgressBar
                value={Math.min(100, result.coverageRatio * 100)}
                variant={statusVariant(result.status)}
                height={10}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={metricStyle}>
                <p style={{ ...muted, margin: '0 0 4px' }}>Available Min/Day</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: tokens.color.textPrimary }}>
                  {Math.round(result.availableMinutesPerDay).toLocaleString()}
                </p>
              </div>
              <div style={metricStyle}>
                <p style={{ ...muted, margin: '0 0 4px' }}>Required Min/Day</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: tokens.color.textPrimary }}>
                  {Math.round(result.requiredMinutesPerDay).toLocaleString()}
                </p>
              </div>
              <div style={metricStyle}>
                <p style={{ ...muted, margin: '0 0 4px' }}>Staffing Gap (FTEs)</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: result.staffingGap > 0 ? tokens.color.danger : tokens.color.success }}>
                  {result.staffingGap > 0 ? `+${result.staffingGap}` : 'None'}
                </p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: tokens.radius.sm, padding: '12px 16px', border: `1px solid ${tokens.color.border}` }}>
              <p style={{ margin: 0, fontSize: 14, color: tokens.color.textPrimary }}>{result.recommendation}</p>
            </div>
          </Card>

          {/* ── Info Card ── */}
          <Card padding="md">
            <h2 style={{ ...h2, marginBottom: 12 }}>What does this mean?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { range: '1.1× and above', label: 'Adequate', color: tokens.color.success, desc: 'Staff capacity comfortably exceeds processing demand.' },
                { range: '0.9× – 1.09×',  label: 'Marginal',  color: tokens.color.warning, desc: 'Near capacity — minor surges may cause delays.' },
                { range: 'Below 0.9×',    label: 'Understaffed', color: tokens.color.danger, desc: 'Insufficient capacity; instrument turnaround at risk.' },
              ].map(({ range, label, color, desc }) => (
                <div key={label} style={{ display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.02)', borderRadius: tokens.radius.sm,
                  padding: '10px 14px', border: `1px solid ${tokens.color.border}` }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 3 }} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: tokens.color.textPrimary }}>{label}</span>
                    <span style={{ fontSize: 13, color: tokens.color.textMuted }}> — {range}</span>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: tokens.color.textDimmed }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  )
}
