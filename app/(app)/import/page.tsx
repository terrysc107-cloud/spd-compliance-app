const muted: React.CSSProperties = { color: '#94a3b8', fontSize: 14 }

export default function ImportPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
          Import Data
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          Upload existing audit data or legacy checklists in CSV or Excel format.
        </p>
      </div>

      {/* Drop Zone */}
      <div style={{
        background: '#0d1529',
        border: '2px dashed rgba(59,130,246,0.35)',
        borderRadius: 12,
        padding: '64px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        marginBottom: 32, cursor: 'not-allowed',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
        </svg>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#ffffff' }}>
          Drop a CSV file here or click to browse
        </p>
        <p style={{ ...muted, margin: 0, fontSize: 13, textAlign: 'center' }}>
          Supported formats: CSV, Excel (.xlsx). Column mapping will appear after upload.
        </p>
        <button disabled style={{
          background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.3)',
          color: '#3b82f6', padding: '9px 20px', borderRadius: 8,
          fontSize: 14, fontWeight: 500, cursor: 'not-allowed',
        }}>
          Browse Files
        </button>
        <p style={{ ...muted, fontSize: 12, margin: 0 }}>File upload active in Phase 08</p>
      </div>

      {/* Previous Imports */}
      <div style={{
        background: '#0d1529',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12, padding: '24px',
      }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#ffffff' }}>
          Previous Imports
        </h2>
        <div style={{
          padding: '40px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        }}>
          <p style={{ ...muted, margin: 0, textAlign: 'center' }}>
            No imports yet. Uploaded files will appear here.
          </p>
        </div>
      </div>

    </div>
  )
}
