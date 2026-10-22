'use client'

// Small form + display primitives for the consult workspace. Same dark tokens
// as components/ui; these cover the controls that set doesn't (select,
// textarea, segmented choice, pills, error banner).

import React from 'react'
import { tokens } from '@/lib/constants/design-tokens'

export const fieldStyle: React.CSSProperties = {
  width: '100%', background: tokens.color.bg, border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm, color: tokens.color.textPrimary, fontSize: 14,
  padding: '9px 12px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

export const labelStyle: React.CSSProperties = {
  display: 'block', color: tokens.color.textMuted, fontSize: 12, fontWeight: 600,
  marginBottom: 6, letterSpacing: '0.02em',
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', width: '100%' }}>
      <span style={labelStyle}>{label}</span>
      {children}
      {hint && <span style={{ display: 'block', fontSize: 11, color: tokens.color.textDimmed, marginTop: 4 }}>{hint}</span>}
    </label>
  )
}

export function TextInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style'>) {
  return <input {...props} style={fieldStyle} />
}

export function TextArea({ rows = 3, ...props }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'>) {
  return <textarea rows={rows} {...props} style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.5 }} />
}

export function Select<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[]
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value as T)} style={{ ...fieldStyle, cursor: 'pointer' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

/** Big tap targets for on-site use (tablet in one hand). */
export function Segmented<T extends string>({ value, onChange, options }: {
  value: T | null; onChange: (v: T) => void; options: { value: T; label: string; color: string }[]
}) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o.value
        return (
          <button key={o.value} type="button" onClick={() => onChange(o.value)} style={{
            minWidth: 72, padding: '8px 12px', borderRadius: tokens.radius.sm, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', border: `1px solid ${active ? o.color : tokens.color.border}`,
            background: active ? `${o.color}26` : 'transparent', color: active ? o.color : tokens.color.textMuted,
          }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: tokens.radius.pill,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', whiteSpace: 'nowrap',
      color, background: `${color}22`, border: `1px solid ${color}55`,
    }}>
      {children}
    </span>
  )
}

export function ErrorNote({ message, onDismiss }: { message: string | null; onDismiss?: () => void }) {
  if (!message) return null
  return (
    <div role="alert" style={{
      display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center',
      padding: '10px 14px', marginBottom: 16, borderRadius: tokens.radius.sm, fontSize: 13,
      color: '#fecaca', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
    }}>
      <span>{message}</span>
      {onDismiss && <button type="button" onClick={onDismiss} style={{ background: 'none', border: 'none', color: '#fecaca', cursor: 'pointer', fontSize: 16 }}>×</button>}
    </div>
  )
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: tokens.color.textMuted }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: tokens.color.textPrimary, marginBottom: 6 }}>{title}</div>
      {body && <div style={{ fontSize: 13, marginBottom: 16 }}>{body}</div>}
      {action}
    </div>
  )
}

export function grid(min = 220): React.CSSProperties {
  return { display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 14 }
}

export function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong'
}

/** "2026-10-14" → "Oct 14, 2026" without timezone drift. */
export function fmtDay(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
