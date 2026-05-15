import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#05091a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: "system-ui, -apple-system, sans-serif",
      textAlign: 'center',
    }}>
      <p style={{ margin: '0 0 8px', fontSize: 64, fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>404</p>
      <h1 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: '#ffffff' }}>
        Page Not Found
      </h1>
      <p style={{ margin: '0 0 28px', color: '#94a3b8', fontSize: 15, maxWidth: 340, lineHeight: 1.6 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/dashboard" style={{
        background: '#3b82f6', color: '#ffffff',
        padding: '10px 24px', borderRadius: 8,
        textDecoration: 'none', fontSize: 14, fontWeight: 500,
      }}>
        Go to Dashboard
      </Link>
    </div>
  )
}
