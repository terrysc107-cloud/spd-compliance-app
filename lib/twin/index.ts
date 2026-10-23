// ─── SPD TWIN FACADE ────────────────────────────────────────────────────────
// Typed wrapper over the vendored SPD Twin engine (lib/twin/vendor, synced
// verbatim from the spd-twin repo). The engine computes; this file only
// adapts. Every input change goes through Twin's own allowlist
// (validateChanges), so this app can never feed the engine a value Twin's UI
// would refuse.

import { DEFAULTS, clone, clockStr, simulate, riskOf, constraintOf, leverCandidates } from './vendor/engine.js'
import { EDITABLE, validateChanges, applyChanges, describeChanges, getAt } from './vendor/ai/schema.js'
import { diffParams, mergeParams, encodeShare } from './vendor/codec.js'
import { varyDay, pctl } from './vendor/analysis.js'
import type { DepartmentProfile } from '@/lib/consult/types'

/** Full engine input object (shape of Twin's DEFAULTS). Opaque to this app. */
export type TwinParams = Record<string, unknown>
/** Compact diff against DEFAULTS — what an engagement stores. */
export type TwinDiff = Record<string, unknown>
export interface TwinChange { path: string; to: unknown }
export interface TwinAccepted { path: string; label: string; from: unknown; to: unknown; note: string }

export interface TwinKpis {
  total: number; doneN: number; backlog: number; statN: number; statOK: number; statLate: number
  firstN: number; firstOK: number; firstMiss: number; avgTat: number
}

export interface TwinResult {
  kpis:       TwinKpis
  risk:       number                      // Twin's lever score: rushLate×3 + firstMiss×5 + backlog
  constraint: { stage: string; share: number; peakTrays: number; peakAt: string } | null
  util:       { wash: number; ster: number; lt: number; decon: number; prep: number }
  queues:     { id: string; name: string; points: number[] }[]   // trays waiting, every 15 min
}

export const TWIN_URL = process.env.NEXT_PUBLIC_SPD_TWIN_URL || 'https://spd-twin.vercel.app'
export const TWIN_VERSION = '7ce67ee'   // keep in sync with lib/twin/vendor/VERSION

export const EDITABLE_INPUTS = (EDITABLE as { path: string; label: string; kind: string; min?: number; max?: number; step?: number; unit?: string }[])
  .filter(e => e.kind !== 'object')

export function defaults(): TwinParams { return clone(DEFAULTS) }

export function fromDiff(diff: TwinDiff | null | undefined): TwinParams {
  return diff ? (mergeParams(diff) as { p: TwinParams }).p : defaults()
}

export function toDiff(p: TwinParams): TwinDiff { return diffParams(p) as unknown as TwinDiff }

export function valueAt(p: TwinParams, path: string): unknown { return getAt(p, path) }

/** Validate through Twin's allowlist. Clamps/rounds like Twin's UI does. */
export function validate(p: TwinParams, changes: TwinChange[]): { ok: TwinAccepted[]; rejected: { path: string; reason: string }[] } {
  const r = validateChanges(p, changes) as { ok: TwinAccepted[]; rejected: { path: string; reason: string }[] }
  return { ok: r.ok, rejected: r.rejected }
}

export function apply(p: TwinParams, ok: TwinAccepted[]): TwinParams { return applyChanges(p, ok) }

export function describe(ok: TwinAccepted[], p: TwinParams): string[] { return describeChanges(ok, p) }

/** What the engine's simulate() returns, as far as this app reads it. */
interface SimRaw {
  k: TwinKpis
  QS: { id: string; name: string }[]
  S: Record<string, Float32Array>
  util: { wash: number; ster: number; lt: number; decon: number; prep: number }
}
type ConstraintRaw = { q: { name: string }; share: number; peak: { n: number; m: number } } | null

export function run(p: TwinParams): TwinResult {
  const r = simulate(p) as unknown as SimRaw
  const c = constraintOf(r) as unknown as ConstraintRaw
  const queues = r.QS.map(q => {
    const a = r.S[q.id]
    const points: number[] = []
    for (let m = 0; m < a.length; m += 15) points.push(a[m])
    return { id: q.id, name: q.name, points }
  })
  return {
    kpis: r.k,
    risk: riskOf(r as never),
    constraint: c ? { stage: c.q.name, share: c.share, peakTrays: c.peak.n, peakAt: clockStr(c.peak.m) } : null,
    util: { wash: r.util.wash, ster: r.util.ster, lt: r.util.lt, decon: r.util.decon, prep: r.util.prep },
    queues,
  }
}

export interface RiskSummary { days: number; firstMissDays: number; rushLateDays: number; backlogP50: number; backlogP90: number }

/** Twin's 100-day run: new seed each day, case volume ±15%, loaners ±30%. */
export function risk100(p: TwinParams, days = 100): RiskSummary {
  const seed0 = (p.seed as number) | 0
  let firstMissDays = 0, rushLateDays = 0
  const backlogs: number[] = []
  for (let i = 0; i < days; i++) {
    const k = (simulate(varyDay(p, seed0, i)) as unknown as SimRaw).k
    if (k.firstMiss > 0) firstMissDays++
    if (k.statLate > 0) rushLateDays++
    backlogs.push(k.backlog)
  }
  return { days, firstMissDays, rushLateDays, backlogP50: pctl(backlogs, 0.5), backlogP90: pctl(backlogs, 0.9) }
}

export interface Lever { label: string; cost: string; riskBefore: number; riskAfter: number; firstMissAfter: number }

/** Twin's lever test: try each one-step change, rank by risk reduction. */
export function bestLevers(p: TwinParams, n = 3): Lever[] {
  const base = run(p)
  const out: Lever[] = []
  for (const L of leverCandidates(p) as { label: string; cost: string; f: (q: TwinParams) => void }[]) {
    const q = clone(p)
    L.f(q)
    const r = run(q)
    if (r.risk < base.risk) out.push({ label: L.label, cost: L.cost, riskBefore: base.risk, riskAfter: r.risk, firstMissAfter: r.kpis.firstMiss })
  }
  return out.sort((a, b) => a.riskAfter - b.riskAfter || a.cost.localeCompare(b.cost)).slice(0, n)
}

export function shareUrl(p: TwinParams): string {
  return `${TWIN_URL.replace(/\/$/, "")}/#s=${encodeShare(diffParams(p))}`
}

/**
 * Map what the consultant captured about the department onto Twin inputs.
 * Only fields the profile actually has are mapped; everything else stays at
 * Twin's defaults (which the consultant then adjusts on the Twin tab).
 */
export function profileChanges(profile: DepartmentProfile, p: TwinParams = defaults()): TwinChange[] {
  const ch: TwinChange[] = []
  const tpc = (p.traysPerCase as number) || 3.5
  if (profile.trayVolumeDaily) ch.push({ path: 'cases', to: Math.round(profile.trayVolumeDaily / tpc) })
  if (profile.washers) ch.push({ path: 'washers', to: profile.washers })
  if (profile.steamSterilizers) ch.push({ path: 'sterilizers', to: profile.steamSterilizers })
  if (profile.lowTempSterilizers !== undefined) {
    ch.push({ path: 'lowTemp', to: profile.lowTempSterilizers })
    if (profile.lowTempSterilizers === 0) ch.push({ path: 'ltPct', to: 0 })
  }
  return ch
}

/** Inputs where b differs from a, as changes that would turn a into b. */
export function diffBetween(a: TwinParams, b: TwinParams): TwinChange[] {
  return EDITABLE_INPUTS
    .filter(e => JSON.stringify(getAt(a, e.path)) !== JSON.stringify(getAt(b, e.path)))
    .map(e => ({ path: e.path, to: getAt(b, e.path) }))
}

/** Plain-language list of what the ideal changes vs current. */
export function describeDiff(a: TwinParams, b: TwinParams): string[] {
  return describeChanges(validate(a, diffBetween(a, b)).ok, a)
}
