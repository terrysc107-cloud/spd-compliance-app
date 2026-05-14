import Link from 'next/link'

const statCards = [
  { label: 'Total Audits', value: '0' },
  { label: 'Compliance Score', value: '—' },
  { label: 'Open Findings', value: '0' },
  { label: 'Reports Generated', value: '0' },
]

const card: React.CSSProperties = {
  background: '#0d1529',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '24px',
}

const muted: React.CSSProperties = { color: '#94a3b8', fontSize: 14 }

export default function DashboardPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
          Dashboard
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          Overview of your sterile processing compliance activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
        {statCards.map(({ label, value }) => (
          <div key={label} style={card}>
            <p style={{ ...muted, margin: '0 0 8px' }}>{label}</p>
            <p style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#ffffff' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Audits */}
      <div style={card}>
        <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 600, color: '#ffffff' }}>
          Recent Audits
        </h2>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '48px 24px',
          gap: 16,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(59,130,246,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <p style={{ ...muted, margin: 0, textAlign: 'center' }}>
            No audits recorded yet. Start by selecting a checklist template.
          </p>
          <Link href="/checklists" style={{
            display: 'inline-block',
            background: '#3b82f6', color: '#ffffff',
            padding: '10px 20px', borderRadius: 8,
            textDecoration: 'none', fontSize: 14, fontWeight: 500,
          }}>
            Run Your First Audit
          </Link>
        </div>
      </div>

    </div>
  )
}
