const charts = [
  {
    label: 'Compliance Trend',
    sub: 'Line chart — coming in Phase 09',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Top Failing Items',
    sub: 'Bar chart — coming in Phase 09',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="9" /><rect x="9" y="7" width="4" height="14" /><rect x="15" y="3" width="4" height="18" />
      </svg>
    ),
  },
  {
    label: 'Section Heatmap',
    sub: 'Grid visualization — coming in Phase 09',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
]

const muted: React.CSSProperties = { color: '#94a3b8', fontSize: 14 }

export default function AnalyticsPage() {
  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
          Analytics
        </h1>
        <p style={{ ...muted, marginTop: 8 }}>
          Visual compliance trends and performance insights across your department.
        </p>
      </div>

      {/* Chart Placeholder Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {charts.map(({ label, sub, icon }) => (
          <div key={label} style={{
            background: '#0d1529',
            border: '1px dashed rgba(59,130,246,0.3)',
            borderRadius: 12,
            padding: '48px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            minHeight: 220,
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(59,130,246,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {icon}
            </div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#ffffff' }}>{label}</p>
            <p style={{ ...muted, margin: 0, fontSize: 13, textAlign: 'center' }}>{sub}</p>
          </div>
        ))}
      </div>

      <p style={{ ...muted, marginTop: 28, fontSize: 13 }}>
        Intelligence features including trend analysis and section heatmaps will be activated in Phase 09.
      </p>

    </div>
  )
}
