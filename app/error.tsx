'use client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh', background: '#05091a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        background: '#0d1529',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '48px 40px',
        textAlign: 'center', maxWidth: 420,
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h1 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700, color: '#ef4444' }}>
          Something went wrong
        </h1>
        <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button onClick={reset} style={{
          background: '#3b82f6', color: '#ffffff',
          border: 'none', padding: '10px 24px', borderRadius: 8,
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}>
          Try Again
        </button>
      </div>
    </div>
  )
}
