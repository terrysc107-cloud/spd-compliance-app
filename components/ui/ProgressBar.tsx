import React from 'react'
import { tokens } from '@/lib/constants/design-tokens'

type Variant = 'default' | 'success' | 'warning' | 'danger'

interface ProgressBarProps {
  value:       number
  variant?:    Variant
  height?:     number
  showLabel?:  boolean
}

const variantColor: Record<Variant, string> = {
  default: tokens.color.accentBlue,
  success: tokens.color.success,
  warning: tokens.color.warning,
  danger:  tokens.color.danger,
}

export function ProgressBar({ value, variant = 'default', height = 8, showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  const trackStyle: React.CSSProperties = {
    background:   tokens.color.surface,
    border:       `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.pill,
    height:       `${height}px`,
    overflow:     'hidden',
    width:        '100%',
  }

  const fillStyle: React.CSSProperties = {
    background:   variantColor[variant],
    borderRadius: tokens.radius.pill,
    height:       '100%',
    width:        `${clamped}%`,
    transition:   'width 0.3s ease',
  }

  return (
    <div>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: tokens.color.textMuted }}>
          <span>Progress</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div style={trackStyle} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div style={fillStyle} />
      </div>
    </div>
  )
}
