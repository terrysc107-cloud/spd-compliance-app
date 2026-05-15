'use client'

import { useState, useEffect } from 'react'
import PageShell from '@/components/layout/PageShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { getThresholds, saveThresholds, DEFAULT_THRESHOLDS, ThresholdConfig } from '@/lib/storage/threshold-storage'
import { tokens } from '@/lib/constants/design-tokens'

// ─── SCORE BAND PREVIEW ───────────────────────────────────────────────────────

function BandPreview({ pass, marginal }: { pass: number; marginal: number }) {
  const bands = [
    { label: 'PASS',     range: `≥${pass}%`,                  color: tokens.color.success, bg: 'rgba(34,197,94,0.10)' },
    { label: 'MARGINAL', range: `${marginal}–${pass - 1}%`,   color: tokens.color.warning, bg: 'rgba(234,179,8,0.10)' },
    { label: 'FAIL',     range: `<${marginal}%`,              color: tokens.color.danger,  bg: 'rgba(239,68,68,0.10)' },
  ]
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
      {bands.map(b => (
        <div key={b.label} style={{ flex: 1, minWidth: 120, padding: '12px 16px', borderRadius: tokens.radius.md, background: b.bg, border: `1px solid ${b.color}40` }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.07em', color: b.color, marginBottom: '4px' }}>{b.label}</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: b.color }}>{b.range}</div>
        </div>
      ))}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ThresholdsPage() {
  const [pass,     setPass]     = useState<number>(DEFAULT_THRESHOLDS.passThreshold)
  const [marginal, setMarginal] = useState<number>(DEFAULT_THRESHOLDS.marginalThreshold)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    const t = getThresholds()
    setPass(t.passThreshold)
    setMarginal(t.marginalThreshold)
  }, [])

  const validate = (): string | null => {
    if (pass < 1 || pass > 99)         return 'Pass threshold must be between 1 and 99.'
    if (marginal < 1 || marginal > 99) return 'Marginal threshold must be between 1 and 99.'
    if (marginal >= pass)              return 'Marginal threshold must be less than pass threshold.'
    return null
  }

  const handleSave = () => {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    const config: ThresholdConfig = { passThreshold: pass, marginalThreshold: marginal, updatedAt: new Date().toISOString() }
    saveThresholds(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    setPass(DEFAULT_THRESHOLDS.passThreshold)
    setMarginal(DEFAULT_THRESHOLDS.marginalThreshold)
    setError(null)
    setSaved(false)
  }

  const numInput = (val: number, setter: (n: number) => void) => (
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const n = parseInt(e.target.value, 10)
      setter(isNaN(n) ? val : n)
      setSaved(false); setError(null)
    }
  )

  return (
    <PageShell
      title="Compliance Thresholds"
      description="Configure the score bands used to classify audit results as Pass, Marginal, or Fail."
    >
      <div style={{ maxWidth: 560 }}>
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              label="Pass threshold (%)"
              type="number" min={1} max={99}
              value={pass}
              onChange={numInput(pass, setPass)}
              hint="Audits scoring at or above this value are classified as Pass."
            />
            <Input
              label="Marginal threshold (%)"
              type="number" min={1} max={99}
              value={marginal}
              onChange={numInput(marginal, setMarginal)}
              hint="Audits between marginal and pass thresholds are classified as Marginal."
            />
          </div>

          {error && (
            <p style={{ margin: '16px 0 0', fontSize: '13px', color: tokens.color.danger }}>{error}</p>
          )}

          <div style={{ marginTop: '24px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: tokens.color.textDimmed, textTransform: 'uppercase' }}>Score Band Preview</p>
            <BandPreview pass={pass} marginal={marginal} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <Button variant="primary" onClick={handleSave}>
              {saved ? 'Saved' : 'Save Changes'}
            </Button>
            <Button variant="ghost" onClick={handleReset}>Reset to Defaults</Button>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
