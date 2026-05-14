const card: React.CSSProperties = {
  background: '#0d1529',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, padding: '28px',
  marginBottom: 20,
}

const label: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500,
  color: '#94a3b8', marginBottom: 8,
}

const inputStyle: React.CSSProperties = {
  width: '100%', maxWidth: 400,
  background: '#05091a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, padding: '9px 14px',
  color: '#ffffff', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
  cursor: 'not-allowed',
}

const threshold = (label: string, range: string, color: string) => ({ label, range, color })

const thresholds = [
  threshold('Pass', '90% and above', '#22c55e'),
  threshold('Marginal', '70% – 89%', '#f59e0b'),
  threshold('Fail', 'Below 70%', '#ef4444'),
]

const muted: React.CSSProperties = { color: '#94a3b8', fontSize: 14 }

export default function SettingsPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
          Settings
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          Configure your organization profile, compliance thresholds, and team access.
        </p>
      </div>

      {/* Organization */}
      <div style={card}>
        <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 600, color: '#ffffff' }}>
          Organization
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 600 }}>
          <div>
            <span style={label}>Organization Name</span>
            <input disabled placeholder="e.g. General Hospital SPD" style={inputStyle} />
          </div>
          <div>
            <span style={label}>Department</span>
            <input disabled placeholder="e.g. Central Sterile Processing" style={inputStyle} />
          </div>
        </div>
        <p style={{ ...muted, fontSize: 12, marginTop: 16, marginBottom: 0 }}>
          Editable fields active in Phase 08
        </p>
      </div>

      {/* Compliance Thresholds */}
      <div style={card}>
        <h2 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 600, color: '#ffffff' }}>
          Compliance Thresholds
        </h2>
        <p style={{ ...muted, marginTop: 0, marginBottom: 20, fontSize: 13 }}>
          These thresholds determine how audit scores are classified.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {thresholds.map(({ label: t, range, color }) => (
            <div key={t} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 8, padding: '12px 16px',
            }}>
              <span style={{
                display: 'inline-block', width: 10, height: 10,
                borderRadius: '50%', background: color, flexShrink: 0,
              }} />
              <span style={{ color: '#ffffff', fontWeight: 500, minWidth: 70 }}>{t}</span>
              <span style={{ color: '#94a3b8', fontSize: 14 }}>{range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#ffffff' }}>
            Team Members
          </h2>
          <button disabled style={{
            background: 'rgba(59,130,246,0.12)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#3b82f6', padding: '7px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 500, cursor: 'not-allowed',
          }}>
            Invite Member
          </button>
        </div>
        <p style={{ ...muted, margin: 0, fontSize: 13 }}>
          Team management active in Phase 08. Invited members will appear here.
        </p>
      </div>

    </div>
  )
}
