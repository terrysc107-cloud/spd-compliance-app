'use client'

import React, { useState } from 'react'
import { tokens } from '@/lib/constants/design-tokens'

type InputHTMLProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'>

interface InputProps extends InputHTMLProps {
  label?: string
  error?: string
  hint?:  string
}

export function Input({ label, error, hint, id, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false)

  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  const inputStyle: React.CSSProperties = {
    width:        '100%',
    background:   tokens.color.surface,
    border:       `1px solid ${error ? tokens.color.danger : focused ? tokens.color.accentBlue : tokens.color.border}`,
    borderRadius: tokens.radius.md,
    color:        tokens.color.textPrimary,
    fontSize:     '14px',
    outline:      'none',
    padding:      '10px 14px',
    transition:   'border-color 0.15s',
    boxShadow:    focused ? `0 0 0 3px rgba(59,130,246,0.15)` : 'none',
  }

  const labelStyle: React.CSSProperties = {
    display:      'block',
    color:        tokens.color.textMuted,
    fontSize:     '13px',
    fontWeight:   500,
    marginBottom: '6px',
  }

  const subTextStyle: React.CSSProperties = {
    fontSize:   '12px',
    marginTop:  '4px',
    color:      error ? tokens.color.danger : tokens.color.textDimmed,
  }

  return (
    <div style={{ width: '100%' }}>
      {label && <label htmlFor={inputId} style={labelStyle}>{label}</label>}
      <input
        id={inputId}
        style={inputStyle}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
      {(error || hint) && (
        <p style={subTextStyle}>{error ?? hint}</p>
      )}
    </div>
  )
}
