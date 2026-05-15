'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const card: React.CSSProperties = {
  background: '#0d1332',
  border: '1px solid #1e2a5a',
  borderRadius: 12,
  padding: '2.5rem 2rem',
  width: '100%',
  maxWidth: 420,
}

const label: React.CSSProperties = {
  display: 'block',
  color: '#8899cc',
  fontSize: 13,
  marginBottom: 6,
  fontWeight: 500,
}

const input: React.CSSProperties = {
  width: '100%',
  background: '#05091a',
  border: '1px solid #1e2a5a',
  borderRadius: 8,
  color: '#e8eaf6',
  fontSize: 15,
  padding: '10px 12px',
  outline: 'none',
  boxSizing: 'border-box',
}

const btn: React.CSSProperties = {
  width: '100%',
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '11px 0',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8,
}

export default function SignupPage() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [done, setDone]           = useState(false)
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div style={card}>
        <h1 style={{ color: '#e8eaf6', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          Check your email
        </h1>
        <p style={{ color: '#8899cc', fontSize: 14, lineHeight: 1.6 }}>
          We sent a confirmation link to <strong style={{ color: '#e8eaf6' }}>{email}</strong>.
          Click it to activate your account, then{' '}
          <Link href="/login" style={{ color: '#3b82f6' }}>sign in</Link>.
        </p>
      </div>
    )
  }

  return (
    <div style={card}>
      <h1 style={{ color: '#e8eaf6', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        Create account
      </h1>
      <p style={{ color: '#8899cc', fontSize: 13, marginBottom: 24 }}>
        SPD Compliance Platform
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={label} htmlFor="name">Full name</label>
          <input
            id="name"
            style={input}
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={label} htmlFor="email">Email</label>
          <input
            id="email"
            style={input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={label} htmlFor="password">Password</label>
          <input
            id="password"
            style={input}
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={label} htmlFor="confirm">Confirm password</label>
          <input
            id="confirm"
            style={input}
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button type="submit" style={btn} disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ color: '#8899cc', fontSize: 13, marginTop: 20, textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#3b82f6' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
