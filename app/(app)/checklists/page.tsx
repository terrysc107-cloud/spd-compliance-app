import Link from 'next/link'

const templates = [
  {
    id: 'st79',
    name: 'AAMI ST79',
    full: 'Comprehensive Sterile Processing',
    description:
      'Covers decontamination, packaging, sterilization, and storage. The foundational standard for central sterile processing departments.',
  },
  {
    id: 'st91',
    name: 'AAMI ST91',
    full: 'Flexible Endoscope Reprocessing',
    description:
      'End-to-end reprocessing workflow for flexible endoscopes, including pre-cleaning, leak testing, HLD, and drying.',
  },
  {
    id: 'st108',
    name: 'AAMI ST108',
    full: 'Water Quality',
    description:
      'Water quality requirements for reprocessing and sterilization: microbial limits, chemistry, and monitoring frequencies.',
  },
]

const card: React.CSSProperties = {
  background: '#0d1529',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const muted: React.CSSProperties = { color: '#94a3b8', fontSize: 14 }

export default function ChecklistsPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
          Checklist Library
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          Choose an AAMI-aligned template to start a compliance audit.
        </p>
      </div>

      {/* Search Stub */}
      <div style={{ marginBottom: 32 }}>
        <input
          placeholder="Search templates..."
          disabled
          style={{
            width: '100%', maxWidth: 480,
            background: '#0d1529',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '10px 16px',
            color: '#94a3b8', fontSize: 14,
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        <p style={{ ...muted, marginTop: 8, fontSize: 12 }}>Search active in Phase 05</p>
      </div>

      {/* Template Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {templates.map((t) => (
          <div key={t.id} style={card}>
            <div>
              <span style={{
                display: 'inline-block',
                background: 'rgba(59,130,246,0.12)',
                color: '#3b82f6', fontSize: 12, fontWeight: 600,
                padding: '3px 10px', borderRadius: 20, marginBottom: 8,
              }}>
                {t.name}
              </span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#ffffff' }}>{t.full}</h3>
            </div>
            <p style={{ ...muted, margin: 0, lineHeight: 1.6 }}>{t.description}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <Link href="/checklist" style={{
                flex: 1, textAlign: 'center',
                background: '#3b82f6', color: '#ffffff',
                padding: '9px 0', borderRadius: 8,
                textDecoration: 'none', fontSize: 14, fontWeight: 500,
              }}>
                Start Audit
              </Link>
              <button style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8', padding: '9px 0', borderRadius: 8,
                fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>
                View Template
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
