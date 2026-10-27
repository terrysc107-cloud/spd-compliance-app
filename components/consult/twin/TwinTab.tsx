'use client'

import { useMemo, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import * as T from '@/lib/twin'
import { QueueChart, QueueLegend } from './TwinCharts'
import { errMsg } from '../fields'
import type { Engagement } from '@/lib/consult/types'

type Scenario = 'current' | 'ideal'

// Curated inputs shown here; everything else is one click away in the full Twin.
const INPUT_PATHS = [
  'cases', 'traysPerCase', 'statPct', 'firstPct', 'loaners', 'carryover',
  'washers', 'sterilizers', 'lowTemp', 'sterCycle', 'deconMin', 'prepMin', 'productive',
]
const SHIFTS = [['day', 'Day'], ['mid', 'Mid'], ['eve', 'Evening'], ['night', 'Night']] as const
const ROLES = [['decon', 'Decon techs'], ['prep', 'Prep & pack techs']] as const

const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '—')
const hm = (m: number) => `${Math.floor(m / 60)}h ${String(Math.round(m % 60)).padStart(2, '0')}m`

export function twinScenarios(e: Engagement) {
  const current = T.fromDiff(e.twin?.current)
  const ideal = T.fromDiff(e.twin?.ideal ?? e.twin?.current)
  return { current, ideal }
}

export default function TwinTab({ engagement, onPatch, onError }: {
  engagement: Engagement
  onPatch:    (u: Partial<Engagement>) => Promise<void>
  onError:    (msg: string) => void
}) {
  const { current, ideal } = useMemo(() => twinScenarios(engagement), [engagement])
  const P: Record<Scenario, T.TwinParams> = { current, ideal }
  const R = useMemo(() => ({ current: T.run(current), ideal: T.run(ideal) }), [current, ideal])
  const levers = useMemo(() => T.bestLevers(current, 3), [current])
  const [risk, setRisk] = useState<Record<Scenario, T.RiskSummary> | null>(null)
  const [riskBusy, setRiskBusy] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const hasTwin = !!engagement.twin?.current

  const byPath = useMemo(() => new Map(T.EDITABLE_INPUTS.map(e => [e.path, e])), [])

  async function save(next: Record<Scenario, T.TwinParams>) {
    setRisk(null)
    try { await onPatch({ twin: { current: T.toDiff(next.current), ideal: T.toDiff(next.ideal) } }) } catch (e) { onError(errMsg(e)) }
  }

  function change(s: Scenario, path: string, raw: string) {
    if (raw.trim() === '') return
    const v = T.validate(P[s], [{ path, to: Number(raw) }])
    if (v.rejected.length) return onError(`${path}: ${v.rejected[0].reason}`)
    if (!v.ok.length) return
    setNotes(v.ok.filter(o => o.note).map(o => `${o.label}: ${o.note}`))
    void save({ ...P, [s]: T.apply(P[s], v.ok) })
  }

  function fromProfile() {
    const ch = T.profileChanges(engagement.profile)
    if (!ch.length) return onError('Add trays/day, washers, or sterilizers on the Overview tab (or say them to voice) first.')
    const v = T.validate(T.defaults(), ch)
    const next = T.apply(T.defaults(), v.ok)
    setNotes(T.describe(v.ok, T.defaults()))
    void save({ current: next, ideal: hasTwin ? ideal : next })
  }

  function runRisk() {
    setRiskBusy(true)
    // Yield so the button state paints before ~0.6s of simulation.
    setTimeout(() => {
      try { setRisk({ current: T.risk100(current), ideal: T.risk100(ideal) }) } finally { setRiskBusy(false) }
    }, 30)
  }

  const yMax = Math.max(5, ...(['current', 'ideal'] as Scenario[]).flatMap(s => R[s].queues.flatMap(q => q.points)))
  const changes = T.describeDiff(current, ideal)

  // better(current, ideal) > 0 means the ideal improves on current (shown green).
  const rows: { label: string; get: (r: T.TwinResult) => string; better: (a: T.TwinResult, b: T.TwinResult) => number }[] = [
    { label: 'Ready for 7:30 cases', get: r => `${r.kpis.firstOK}/${r.kpis.firstN} (${pct(r.kpis.firstOK, r.kpis.firstN)})`, better: (a, b) => a.kpis.firstMiss - b.kpis.firstMiss },
    { label: 'Rush trays on time', get: r => `${r.kpis.statOK}/${r.kpis.statN} (${pct(r.kpis.statOK, r.kpis.statN)})`, better: (a, b) => a.kpis.statLate - b.kpis.statLate },
    { label: 'Still in SPD at 7am', get: r => `${r.kpis.backlog} trays`, better: (a, b) => a.kpis.backlog - b.kpis.backlog },
    { label: 'Avg time in SPD', get: r => hm(r.kpis.avgTat), better: (a, b) => a.kpis.avgTat - b.kpis.avgTat },
    { label: 'Bottleneck', get: r => (r.constraint ? `${r.constraint.stage} (${Math.round(r.constraint.share * 100)}% of waiting)` : '—'), better: () => 0 },
    { label: 'Peak queue', get: r => (r.constraint ? `${r.constraint.peakTrays} trays at ${r.constraint.peakAt}` : '—'), better: (a, b) => (a.constraint?.peakTrays ?? 0) - (b.constraint?.peakTrays ?? 0) },
    { label: 'Steam / washer busy', get: r => `${Math.round(r.util.ster * 100)}% / ${Math.round(r.util.wash * 100)}%`, better: () => 0 },
    { label: 'Decon / prep techs busy', get: r => `${Math.round(r.util.decon * 100)}% / ${Math.round(r.util.prep * 100)}%`, better: () => 0 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <p style={{ margin: 0, fontSize: 13.5, color: tokens.color.textMuted, maxWidth: 620, lineHeight: 1.5 }}>
          SPD Twin runs one OR day minute by minute. Model the department as you found it, sketch the ideal, and show the client where trays back up and what fixes it.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button size="sm" variant="secondary" onClick={fromProfile}>{hasTwin ? 'Rebuild current from profile' : 'Build from department profile'}</Button>
          <Button size="sm" variant="ghost" onClick={() => void save({ current, ideal: current })}>Reset ideal to current</Button>
        </div>
      </div>

      {notes.length > 0 && (
        <div style={{ fontSize: 12.5, color: '#bfdbfe', background: 'rgba(59,130,246,0.08)', borderRadius: 8, padding: '8px 12px' }}>
          {notes.join(' · ')}
        </div>
      )}

      {/* Results */}
      <Card padding="lg">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ color: tokens.color.textDimmed, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>
                <th style={th}>Outcome</th><th style={th}>Current state</th><th style={th}>Ideal state</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const d = r.better(R.current, R.ideal)
                return (
                  <tr key={r.label} style={{ borderTop: `1px solid ${tokens.color.border}` }}>
                    <td style={{ ...td, color: tokens.color.textMuted }}>{r.label}</td>
                    <td style={{ ...td, color: tokens.color.textPrimary }}>{r.get(R.current)}</td>
                    <td style={{ ...td, color: d > 0 ? tokens.color.success : d < 0 ? tokens.color.danger : tokens.color.textPrimary, fontWeight: d ? 600 : 400 }}>{r.get(R.ideal)}</td>
                  </tr>
                )
              })}
              <tr style={{ borderTop: `1px solid ${tokens.color.border}` }}>
                <td style={{ ...td, color: tokens.color.textMuted }}>100-day risk</td>
                {risk ? (['current', 'ideal'] as Scenario[]).map(s => (
                  <td key={s} style={{ ...td, color: tokens.color.textPrimary }}>
                    First-case misses on {risk[s].firstMissDays}/{risk[s].days} days · backlog p90 {risk[s].backlogP90}
                  </td>
                )) : (
                  <td colSpan={2} style={td}><Button size="sm" variant="secondary" disabled={riskBusy} onClick={runRisk}>{riskBusy ? 'Running 200 days…' : 'Run 100-day risk for both'}</Button></td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
          <QueueChart title="Current state" result={R.current} yMax={yMax} />
          <QueueChart title="Ideal state" result={R.ideal} yMax={yMax} />
        </div>
        <div style={{ marginTop: 8 }}><QueueLegend result={R.current} /></div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, alignItems: 'start' }}>
        {/* Inputs */}
        <Card padding="lg">
          <h3 style={h3}>Inputs</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ color: tokens.color.textDimmed, fontSize: 11, textAlign: 'left' }}><th style={th}></th><th style={th}>Current</th><th style={th}>Ideal</th></tr></thead>
              <tbody>
                {INPUT_PATHS.map(path => {
                  const e = byPath.get(path)
                  if (!e) return null
                  return <InputRow key={path} label={`${e.label}${e.unit ? ` (${e.unit})` : ''}`} path={path} min={e.min} max={e.max} step={e.step} P={P} onChange={change} />
                })}
                {ROLES.map(([role, roleLabel]) => SHIFTS.map(([sh, shLabel]) => (
                  <InputRow key={`${role}.${sh}`} label={`${shLabel} ${roleLabel.toLowerCase()}`} path={`staff.${role}.${sh}`} min={0} max={5} step={1} P={P} onChange={change} />
                )))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 11.5, color: tokens.color.textDimmed, marginTop: 8 }}>Values are checked against SPD Twin&apos;s own input limits.</div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="lg">
            <h3 style={h3}>Cheapest moves from current</h3>
            {levers.length ? levers.map(l => (
              <div key={l.label} style={{ padding: '7px 0', borderBottom: `1px solid ${tokens.color.border}`, fontSize: 13 }}>
                <div style={{ color: tokens.color.textPrimary, fontWeight: 600 }}>{l.label}</div>
                <div style={{ color: tokens.color.textDimmed, fontSize: 12 }}>{l.cost} · risk score {l.riskBefore} → {l.riskAfter}{l.firstMissAfter === 0 ? ' · no first-case misses' : ''}</div>
              </div>
            )) : <div style={{ fontSize: 13, color: tokens.color.textMuted }}>No single change lowers the risk score; the day already runs clean.</div>}
          </Card>
          <Card padding="lg">
            <h3 style={h3}>Ideal vs current</h3>
            {changes.length ? (
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{changes.map(c => <li key={c}>{c}</li>)}</ul>
            ) : <div style={{ fontSize: 13, color: tokens.color.textMuted }}>Ideal is the same as current. Change inputs in the Ideal column, or tell voice: “in the ideal, add an evening prep tech.”</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <a href={T.shareUrl(current)} target="_blank" rel="noreferrer" style={link}>Open current in SPD Twin ↗</a>
              <a href={T.shareUrl(ideal)} target="_blank" rel="noreferrer" style={link}>Open ideal in SPD Twin ↗</a>
            </div>
          </Card>
          <div style={{ fontSize: 11.5, color: tokens.color.textDimmed, lineHeight: 1.5 }}>
            Modeled, not measured: results use SPD Twin&apos;s standard tray times and arrival curve unless you change them. Engine spd-twin@{T.TWIN_VERSION}.
          </div>
        </div>
      </div>
    </div>
  )
}

function InputRow({ label, path, min, max, step, P, onChange }: {
  label: string; path: string; min?: number; max?: number; step?: number
  P: Record<Scenario, T.TwinParams>; onChange: (s: Scenario, path: string, raw: string) => void
}) {
  const cur = T.valueAt(P.current, path), ide = T.valueAt(P.ideal, path)
  return (
    <tr style={{ borderTop: `1px solid ${tokens.color.border}` }}>
      <td style={{ ...td, color: tokens.color.textMuted, fontSize: 12.5 }}>{label}</td>
      {(['current', 'ideal'] as Scenario[]).map(s => {
        const v = s === 'current' ? cur : ide
        return (
          <td key={s} style={td}>
            <input key={`${s}-${String(v)}`} type="number" defaultValue={String(v ?? '')} min={min} max={max} step={step}
              onBlur={e => { if (e.target.value !== String(v)) onChange(s, path, e.target.value) }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
              style={{
                width: 72, padding: '5px 7px', borderRadius: 6, fontSize: 13, outline: 'none',
                background: tokens.color.bg, color: tokens.color.textPrimary,
                border: `1px solid ${s === 'ideal' && v !== cur ? 'rgba(34,197,94,0.6)' : tokens.color.border}`,
              }} />
          </td>
        )
      })}
    </tr>
  )
}

const th: React.CSSProperties = { padding: '6px 8px', fontWeight: 600 }
const td: React.CSSProperties = { padding: '7px 8px', verticalAlign: 'middle' }
const h3: React.CSSProperties = { margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: tokens.color.textPrimary }
const link: React.CSSProperties = {
  fontSize: 12.5, color: tokens.color.accentBlue, textDecoration: 'none', padding: '6px 10px',
  border: `1px solid ${tokens.color.border}`, borderRadius: 8,
}
