'use client'

import { tokens } from '@/lib/constants/design-tokens'
import type { TwinResult } from '@/lib/twin'

// SPD Twin's series colors (dark theme tokens from spd-twin/src/styles.css),
// validated there for colorblind separation. Same colors = same stages across both apps.
export const QUEUE_COLOR: Record<string, string> = {
  deconQ: '#C84B42', washQ: '#BD8A22', prepQ: '#4688CF', sterQ: '#36A074',
}

const HOURS = ['07:00', '13:00', '19:00', '01:00', '07:00']

/** Trays waiting in each queue across the run day. Both scenarios share one y scale. */
export function QueueChart({ title, result, yMax }: { title: string; result: TwinResult; yMax: number }) {
  const W = 480, H = 150, L = 28, B = 18, T = 8
  const n = result.queues[0]?.points.length ?? 0
  const x = (i: number) => L + (i / Math.max(1, n - 1)) * (W - L - 6)
  const y = (v: number) => T + (1 - v / yMax) * (H - T - B)
  const ticks = [0, Math.round(yMax / 2), yMax]
  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{ fontSize: 12.5, fontWeight: 600, color: tokens.color.textMuted, marginBottom: 4 }}>{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img"
        aria-label={`${title}: trays waiting by stage over the day`}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={L} x2={W - 6} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,0.07)" />
            <text x={L - 4} y={y(t) + 3} fontSize="9" fill="#64748b" textAnchor="end">{t}</text>
          </g>
        ))}
        {HOURS.map((h, i) => (
          <text key={i} x={L + (i / 4) * (W - L - 6)} y={H - 4} fontSize="9" fill="#64748b" textAnchor={i === 0 ? 'start' : i === 4 ? 'end' : 'middle'}>{h}</text>
        ))}
        {result.queues.map(q => (
          <polyline key={q.id} fill="none" stroke={QUEUE_COLOR[q.id] ?? '#94a3b8'} strokeWidth="1.6" strokeLinejoin="round"
            points={q.points.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}>
            <title>{q.name}: peak {Math.max(...q.points)} trays</title>
          </polyline>
        ))}
      </svg>
    </figure>
  )
}

export function QueueLegend({ result }: { result: TwinResult }) {
  return (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11.5, color: tokens.color.textMuted }}>
      {result.queues.map(q => (
        <span key={q.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 14, height: 3, borderRadius: 2, background: QUEUE_COLOR[q.id] }} />{q.name} queue
        </span>
      ))}
    </div>
  )
}
