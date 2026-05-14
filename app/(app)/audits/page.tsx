import Link from 'next/link'

const filterSelect: React.CSSProperties = {
  background: '#0d1529',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8, padding: '8px 12px',
  color: '#94a3b8', fontSize: 14,
  outline: 'none', cursor: 'not-allowed',
}

const muted: React.CSSProperties = { color: '#94a3b8', fontSize: 14 }

export default function AuditsPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
          Audit History
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          All completed and in-progress compliance audits.
        </p>
      </div>

      {/* Filter Bar Stub */}
      <div style={{
        background: '#0d1529',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '16px 20px',
        display: 'flex', gap: 12, flexWrap: 'wrap',
        alignItems: 'center', marginBottom: 28,
      }}>
        <select disabled style={filterSelect}><option>Date Range: All</option></select>
        <select disabled style={filterSelect}><option>Section: All</option></select>
        <select disabled style={filterSelect}><option>Status: All</option></select>
        <span style={{ ...muted, fontSize: 12, marginLeft: 'auto' }}>Filters active in Phase 08</span>
      </div>

      {/* Empty State */}
      <div style={{
        background: '#0d1529',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '64px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <p style={{ ...muted, margin: 0, textAlign: 'center', maxWidth: 380 }}>
          No audits recorded yet. Run your first audit from the Checklist Library.
        </p>
        <Link href="/checklists" style={{
          background: '#3b82f6', color: '#ffffff',
          padding: '10px 20px', borderRadius: 8,
          textDecoration: 'none', fontSize: 14, fontWeight: 500,
        }}>
          Go to Checklist Library
        </Link>
      </div>

    </div>
  )
}
