'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { tokens } from '@/lib/constants/design-tokens'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps {
  variant?:  Variant
  size?:     Size
  disabled?: boolean
  onClick?:  () => void
  href?:     string
  children:  React.ReactNode
  type?:     'button' | 'submit' | 'reset'
}

const variantBase: Record<Variant, React.CSSProperties> = {
  primary:   { background: tokens.color.accentBlue,   color: tokens.color.textPrimary, border: 'none' },
  secondary: { background: tokens.color.surface,      color: tokens.color.textPrimary, border: `1px solid ${tokens.color.border}` },
  ghost:     { background: 'transparent',              color: tokens.color.textMuted,   border: 'none' },
  danger:    { background: tokens.color.danger,        color: tokens.color.textPrimary, border: 'none' },
}

const variantHover: Record<Variant, React.CSSProperties> = {
  primary:   { background: tokens.color.accentIndigo },
  secondary: { background: tokens.color.surfaceHover, borderColor: tokens.color.borderHover },
  ghost:     { background: tokens.color.surfaceHover,  color: tokens.color.textPrimary },
  danger:    { opacity: 0.85 },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 12px',  fontSize: '13px', borderRadius: tokens.radius.sm },
  md: { padding: '10px 20px', fontSize: '14px', borderRadius: tokens.radius.md },
  lg: { padding: '14px 28px', fontSize: '16px', borderRadius: tokens.radius.md },
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  disabled = false,
  onClick,
  href,
  children,
  type     = 'button',
}: ButtonProps) {
  const [hovered, setHovered] = useState(false)

  const base: React.CSSProperties = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            '6px',
    fontWeight:     500,
    cursor:         disabled ? 'not-allowed' : 'pointer',
    opacity:        disabled ? 0.5 : 1,
    textDecoration: 'none',
    transition:     'background 0.15s, opacity 0.15s',
    outline:        'none',
    lineHeight:     1.2,
    ...variantBase[variant],
    ...sizeStyles[size],
    ...(hovered && !disabled ? variantHover[variant] : {}),
  }

  if (href) {
    return (
      <Link href={href} style={base}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </Link>
    )
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} style={base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  )
}
