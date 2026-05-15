import React from 'react'
import { tokens } from '@/lib/constants/design-tokens'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info'
type Size    = 'sm' | 'md'

interface BadgeProps {
  variant?:  Variant
  size?:     Size
  children:  React.ReactNode
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  default: { background: tokens.color.surface,  color: tokens.color.textMuted,    border: `1px solid ${tokens.color.border}` },
  success: { background: 'rgba(34,197,94,0.15)', color: tokens.color.success,     border: `1px solid rgba(34,197,94,0.3)` },
  warning: { background: 'rgba(234,179,8,0.15)', color: tokens.color.warning,     border: `1px solid rgba(234,179,8,0.3)` },
  danger:  { background: 'rgba(239,68,68,0.15)', color: tokens.color.danger,      border: `1px solid rgba(239,68,68,0.3)` },
  info:    { background: 'rgba(59,130,246,0.15)', color: tokens.color.accentBlue, border: `1px solid rgba(59,130,246,0.3)` },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '2px 8px',  fontSize: '11px', fontWeight: 600 },
  md: { padding: '4px 12px', fontSize: '12px', fontWeight: 600 },
}

export function Badge({ variant = 'default', size = 'md', children }: BadgeProps) {
  const style: React.CSSProperties = {
    display:      'inline-flex',
    alignItems:   'center',
    borderRadius: tokens.radius.pill,
    letterSpacing: '0.02em',
    whiteSpace:   'nowrap',
    ...variantStyles[variant],
    ...sizeStyles[size],
  }

  return <span style={style}>{children}</span>
}
