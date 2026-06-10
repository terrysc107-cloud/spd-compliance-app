'use client'

import { tokens } from '@/lib/constants/design-tokens'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { ReadinessFactor } from '@/lib/readiness/engine'

function variantFor(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 85) return 'success'
  if (score >= 65) return 'warning'
  return 'danger'
}

export function FactorBars({ factors }: { factors: ReadinessFactor[] }) {
  return (
    <div style={{
      background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.md, padding: '24px',
    }}>
      <h2 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: tokens.color.textPrimary }}>
        What's driving the score
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {factors.map(f => (
          <div key={f.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6, gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: tokens.color.textPrimary }}>
                {f.label}
                <span style={{ fontSize: 11, color: tokens.color.textDimmed, fontWeight: 500, marginLeft: 8 }}>
                  {Math.round(f.weight * 100)}% weight
                </span>
                {f.missing && (
                  <span style={{ fontSize: 11, color: tokens.color.warning, marginLeft: 8 }}>· no data</span>
                )}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: tokens.color.textPrimary }}>{f.score}%</span>
            </div>
            <ProgressBar value={f.score} variant={variantFor(f.score)} height={6} />
            <div style={{ fontSize: 12, color: tokens.color.textMuted, marginTop: 5 }}>{f.detail}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
