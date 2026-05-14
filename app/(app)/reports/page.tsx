const reportTypes = [
  {
    id: 'summary',
    name: 'Audit Summary Report',
    description:
      'A full breakdown of a single audit session: pass/fail per item, section scores, and overall compliance percentage.',
  },
  {
    id: 'gap',
    name: 'Gap Analysis Report',
    description:
      'Identifies areas of non-compliance and maps them to AAMI standards. Includes recommended corrective actions.',
  },
  {
    id: 'trend',
    name: 'Trend and Compliance Report',
    description:
      'Tracks compliance scores over time across multiple audits. Highlights improving and declining sections.',
  },
]

const card: React.CSSProperties = {
  background: '#0d1529',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, padding: '24px',
  display: 'flex', flexDirection: 'column', gap: 12,
}

const muted: React.CSSProperties = { color: '#94a3b8', fontSize: 14 }

export default function ReportsPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
          Reports
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          Generate compliance reports from your audit data for documentation and accreditation.
        </p>
      </div>

      {/* Report Type Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
        {reportTypes.map(({ id, name, description }) => (
          <div key={id} style={card}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#ffffff' }}>{name}</h3>
            <p style={{ ...muted, margin: 0, lineHeight: 1.6, flex: 1 }}>{description}</p>
            <button disabled style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94a3b8', padding: '9px 16px', borderRadius: 8,
              fontSize: 14, fontWeight: 500, cursor: 'not-allowed', textAlign: 'center',
            }}>
              Generate (requires audit data)
            </button>
          </div>
        ))}
      </div>

      {/* Generated Reports */}
      <div style={card}>
        <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600, color: '#ffffff' }}>
          Generated Reports
        </h2>
        <div style={{
          padding: '40px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <p style={{ ...muted, margin: 0, textAlign: 'center' }}>
            No reports generated yet. Complete an audit to unlock report generation.
          </p>
        </div>
      </div>

    </div>
  )
}
