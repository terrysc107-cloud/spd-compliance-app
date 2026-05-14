const chip = (label: string): React.CSSProperties => ({
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20, padding: '6px 14px',
  color: '#94a3b8', fontSize: 13, cursor: 'not-allowed',
  whiteSpace: 'nowrap',
})

const muted: React.CSSProperties = { color: '#94a3b8', fontSize: 14 }

export default function FindingsPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
          Findings
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          Non-conformances and corrective action items flagged during audits.
        </p>
      </div>

      {/* Filter Stubs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        <span style={{ ...muted, fontSize: 13, alignSelf: 'center' }}>Severity:</span>
        {['All', 'Critical', 'Major', 'Minor'].map((s) => (
          <button key={s} disabled style={chip(s)}>{s}</button>
        ))}
        <span style={{ ...muted, fontSize: 13, alignSelf: 'center', marginLeft: 12 }}>Status:</span>
        {['Open', 'In Progress', 'Resolved'].map((s) => (
          <button key={s} disabled style={chip(s)}>{s}</button>
        ))}
      </div>

      {/* Empty State */}
      <div style={{
        background: '#0d1529',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '64px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ ...muted, margin: 0, textAlign: 'center', maxWidth: 400 }}>
          No findings yet. Findings are generated automatically when an audit item fails.
        </p>
      </div>

    </div>
  )
}
