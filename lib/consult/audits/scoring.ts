// ─── AUDIT SCORING ──────────────────────────────────────────────────────────
// Compliance = Yes ÷ (Yes + No); N/A drops out. Improvement is measured as the
// first stretch of logging (baseline) vs the latest stretch (current):
// first 7 vs last 7 days once two weeks are logged, otherwise the first half
// of logged days vs the second half.

import type { Audit, AuditSample } from '@/lib/consult/types'

export interface DayPoint { date: string; compliance: number | null; samples: number }
export interface ItemStat { id: string; text: string; critical: boolean; no: number; answered: number; failRate: number }

export interface AuditSummary {
  samples:        number
  days:           number
  compliance:     number | null      // all samples
  baseline:       number | null
  current:        number | null
  delta:          number | null      // current − baseline, percentage points
  baselineLabel:  string
  currentLabel:   string
  criticalMisses: number             // "No" answers on critical items, all time
  currentCriticalMisses: number
  perDayAvg:      number
  series:         DayPoint[]
  items:          ItemStat[]         // most-failed first
}

function tally(samples: AuditSample[]): { yes: number; no: number } {
  let yes = 0, no = 0
  for (const s of samples) for (const a of Object.values(s.answers)) {
    if (a === 'yes') yes++
    else if (a === 'no') no++
  }
  return { yes, no }
}

export function compliance(samples: AuditSample[]): number | null {
  const { yes, no } = tally(samples)
  return yes + no ? Math.round((yes / (yes + no)) * 100) : null
}

const DAY = 86_400_000
const toMs = (d: string) => Date.parse(`${d}T12:00:00Z`)

function fmt(d: string): string {
  return new Date(toMs(d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export function summarize(audit: Audit, samples: AuditSample[]): AuditSummary {
  const byDay = new Map<string, AuditSample[]>()
  for (const s of samples) {
    const arr = byDay.get(s.sampledOn) ?? []
    arr.push(s)
    byDay.set(s.sampledOn, arr)
  }
  const dates = [...byDay.keys()].sort()
  const series: DayPoint[] = dates.map(d => ({ date: d, compliance: compliance(byDay.get(d)!), samples: byDay.get(d)!.length }))

  let baseDates: string[] = dates, curDates: string[] = dates
  if (dates.length >= 2) {
    const first = toMs(dates[0]), last = toMs(dates[dates.length - 1])
    if ((last - first) / DAY >= 13) {
      baseDates = dates.filter(d => toMs(d) - first < 7 * DAY)
      curDates  = dates.filter(d => last - toMs(d) < 7 * DAY)
    } else {
      const mid = Math.ceil(dates.length / 2)
      baseDates = dates.slice(0, mid)
      curDates  = dates.slice(mid)
    }
  }
  const pick = (ds: string[]) => ds.flatMap(d => byDay.get(d)!)
  const base = pick(baseDates), cur = pick(curDates)
  const baseline = compliance(base)
  const current = dates.length >= 2 ? compliance(cur) : null
  const label = (ds: string[]) => (ds.length ? (ds.length === 1 ? fmt(ds[0]) : `${fmt(ds[0])}–${fmt(ds[ds.length - 1])}`) : '—')

  const critical = new Set(audit.items.filter(i => i.critical).map(i => i.id))
  const misses = (ss: AuditSample[]) => ss.reduce((n, s) =>
    n + Object.entries(s.answers).filter(([id, a]) => a === 'no' && critical.has(id)).length, 0)

  const items: ItemStat[] = audit.items.map(it => {
    let no = 0, answered = 0
    for (const s of samples) {
      const a = s.answers[it.id]
      if (a === 'yes' || a === 'no') answered++
      if (a === 'no') no++
    }
    return { id: it.id, text: it.text, critical: !!it.critical, no, answered, failRate: answered ? Math.round((no / answered) * 100) : 0 }
  }).sort((a, b) => b.failRate - a.failRate || b.no - a.no)

  return {
    samples: samples.length,
    days: dates.length,
    compliance: compliance(samples),
    baseline,
    current,
    delta: baseline !== null && current !== null ? current - baseline : null,
    baselineLabel: label(baseDates),
    currentLabel: dates.length >= 2 ? label(curDates) : '—',
    criticalMisses: misses(samples),
    currentCriticalMisses: dates.length >= 2 ? misses(cur) : misses(samples),
    perDayAvg: dates.length ? Math.round((samples.length / dates.length) * 10) / 10 : 0,
    series,
    items,
  }
}
