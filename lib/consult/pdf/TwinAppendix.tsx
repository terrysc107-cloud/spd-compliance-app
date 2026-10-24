// ─── APPENDIX E: FLOW MODEL (SPD TWIN) ──────────────────────────────────────
import { Text, View, Svg, Polyline, Line, StyleSheet } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import type { ReportTwin } from '@/lib/consult/report-data'
import type { TwinResult } from '@/lib/twin'

// SPD Twin's light-theme series colors (spd-twin/src/styles.css).
const COLOR: Record<string, string> = { deconQ: '#B5443A', washQ: '#B37E0A', prepQ: '#2A66A6', sterQ: '#1F8460' }

const s = StyleSheet.create({
  h1: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 10, paddingBottom: 6, borderBottom: '1.5pt solid #2563eb' },
  h2: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginTop: 12, marginBottom: 5 },
  muted: { fontSize: 8.5, color: '#64748b' },
  tr: { flexDirection: 'row', borderBottom: '1pt solid #e2e8f0', paddingVertical: 4 },
  th: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#334155' },
  td: { fontSize: 9 },
  li: { fontSize: 9, marginBottom: 2, color: '#1e293b' },
})

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '-')
const hm = (m: number) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, '0')}m`

function Chart({ title, r, yMax }: { title: string; r: TwinResult; yMax: number }) {
  const W = 240, H = 90
  const n = r.queues[0]?.points.length ?? 1
  return (
    <View style={{ width: W, marginRight: 14 }}>
      <Text style={[s.muted, { marginBottom: 3 }]}>{title}: trays waiting, 07:00 to 07:00</Text>
      <Svg width={W} height={H}>
        <Line x1={0} y1={H - 1} x2={W} y2={H - 1} stroke="#cbd5e1" strokeWidth={0.75} />
        {r.queues.map(q => (
          <Polyline key={q.id} fill="none" stroke={COLOR[q.id] ?? '#64748b'} strokeWidth={1.2}
            points={q.points.map((v, i) => `${((i / Math.max(1, n - 1)) * W).toFixed(1)},${(H - 2 - (v / yMax) * (H - 6)).toFixed(1)}`).join(' ')} />
        ))}
      </Svg>
    </View>
  )
}

export function TwinAppendix({ t }: { t: ReportTwin }): ReactElement {
  const rows: [string, (r: TwinResult) => string][] = [
    ['Ready for 7:30 cases', r => `${r.kpis.firstOK}/${r.kpis.firstN} (${pct(r.kpis.firstOK, r.kpis.firstN)})`],
    ['Rush trays on time', r => `${r.kpis.statOK}/${r.kpis.statN} (${pct(r.kpis.statOK, r.kpis.statN)})`],
    ['Still in SPD at 7am', r => `${r.kpis.backlog} trays`],
    ['Avg time in SPD', r => hm(r.kpis.avgTat)],
    ['Bottleneck', r => (r.constraint ? `${r.constraint.stage} (${Math.round(r.constraint.share * 100)}% of waiting)` : '-')],
    ['Peak queue', r => (r.constraint ? `${r.constraint.peakTrays} trays at ${r.constraint.peakAt}` : '-')],
    ['Steam / washer busy', r => `${Math.round(r.util.ster * 100)}% / ${Math.round(r.util.wash * 100)}%`],
  ]
  const yMax = Math.max(5, ...[t.current, t.ideal].flatMap(r => r.queues.flatMap(q => q.points)))
  return (
    <View break>
      <Text style={s.h1}>Appendix E — Flow Model (SPD Twin)</Text>
      <Text style={[s.muted, { marginBottom: 8 }]}>
        One OR day simulated minute by minute for the department as observed (current) and as recommended (ideal).
        Modeled, not measured: inputs not observed use SPD Twin standard values. 100-day risk varies case volume ±15% and loaners ±30% per day.
      </Text>
      <View style={[s.tr, { backgroundColor: '#f1f5f9' }]}>
        <Text style={[s.th, { width: 150 }]}>Outcome</Text><Text style={[s.th, { width: 170 }]}>Current state</Text><Text style={[s.th, { width: 170 }]}>Ideal state</Text>
      </View>
      {rows.map(([label, f]) => (
        <View key={label} style={s.tr} wrap={false}>
          <Text style={[s.td, { width: 150, color: '#475569' }]}>{label}</Text>
          <Text style={[s.td, { width: 170 }]}>{f(t.current)}</Text>
          <Text style={[s.td, { width: 170, fontFamily: 'Helvetica-Bold' }]}>{f(t.ideal)}</Text>
        </View>
      ))}
      <View style={s.tr} wrap={false}>
        <Text style={[s.td, { width: 150, color: '#475569' }]}>Days with first-case misses</Text>
        <Text style={[s.td, { width: 170 }]}>{t.riskCurrent.firstMissDays} of {t.riskCurrent.days}</Text>
        <Text style={[s.td, { width: 170, fontFamily: 'Helvetica-Bold' }]}>{t.riskIdeal.firstMissDays} of {t.riskIdeal.days}</Text>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 12 }} wrap={false}>
        <Chart title="Current" r={t.current} yMax={yMax} />
        <Chart title="Ideal" r={t.ideal} yMax={yMax} />
      </View>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {t.current.queues.map(q => (
          <Text key={q.id} style={[s.muted, { marginRight: 10, color: COLOR[q.id] }]}>■ {q.name}</Text>
        ))}
      </View>

      <Text style={s.h2}>Recommended changes (ideal vs current)</Text>
      {t.changes.length ? t.changes.map(c => <Text key={c} style={s.li}>• {c}</Text>) : <Text style={s.li}>None modeled.</Text>}
      {t.levers.length > 0 && (
        <>
          <Text style={s.h2}>Cheapest single moves from the current state</Text>
          {t.levers.map(l => <Text key={l.label} style={s.li}>• {l.label} ({l.cost})</Text>)}
        </>
      )}
      <Text style={[s.muted, { marginTop: 10 }]}>Engine: SPD Twin {t.version}.</Text>
    </View>
  )
}
