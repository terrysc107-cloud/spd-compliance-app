'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const card: React.CSSProperties = {
  background: '#0d1332',
  border: '1px solid #1e2a5a',
  borderRadius: 12,
  padding: '2.5rem 2rem',
  width: '100%',
  maxWidth: 400,
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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={card}>
      <h1 style={{ color: '#e8eaf6', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        Sign in
      </h1>
      <p style={{ color: '#8899cc', fontSize: 13, marginBottom: 24 }}>
        SPD Compliance Platform
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', color: '#a5b4fc', background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 999, padding: '2px 6px', marginLeft: 8 }}>BETA</span>
      </p>

      <form onSubmit={handleSubmit}>
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

        <div style={{ marginBottom: 20 }}>
          <label style={label} htmlFor="password">Password</label>
          <input
            id="password"
            style={input}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button type="submit" style={btn} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ color: '#8899cc', fontSize: 13, marginTop: 20, textAlign: 'center' }}>
        No account?{' '}
        <Link href="/signup" style={{ color: '#3b82f6' }}>
          Create one
        </Link>
      </p>
    </div>
  )
}
