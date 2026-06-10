// ─── READINESS ENGINE ─────────────────────────────────────────────────────────
// Pure aggregate over per-audit results → a single facility readiness score.
// Does NOT touch lib/scoring/engine (that scores one audit). This answers:
// "If surveyors walked in today, are we ready?"
//
// Forward-compatible: factors are an open array. To add competency/water/steam
// readiness later, push a factor and the weights renormalize automatically.

import type { StoredAudit, StoredFinding } from '@/lib/db/types'

export type ReadinessBand = 'ready' | 'at-risk' | 'not-ready'

export interface ReadinessFactor {
  key:     string
  label:   string
  weight:  number   // intended weight (sum ≈ 1.0)
  score:   number   // 0–100
  detail:  string
  missing: boolean  // true when the input is absent (scored 100 but flagged)
}

export interface ReadinessResult {
  score:        number          // 0–100, weighted (renormalized over present factors)
  band:         ReadinessBand
  confidence:   'low' | 'medium' | 'high'
  factors:      ReadinessFactor[]
  auditCount:   number
  openCritical: number
  openMajor:    number
  openMinor:    number
  overdueCount: number
  daysToSurvey: number | null
  assessed:     boolean         // false when there is nothing to score yet
}

const DAY = 24 * 60 * 60 * 1000

interface Options {
  nextSurveyDate?: string | null
  now?: number
}

function daysOpen(f: StoredFinding, now: number): number {
  // Findings don't carry created_at in StoredFinding; approximate aging via
  // dueDate where present, else treat as freshly open (0). Aging is refined
  // once findings expose created_at to the UI.
  if (!f.dueDate) return 0
  return Math.max(0, Math.floor((now - new Date(f.dueDate).getTime()) / DAY))
}

function sevPenalty(sev: StoredFinding['severity']): number {
  return sev === 'critical' ? 12 : sev === 'major' ? 5 : 1
}

export function computeReadiness(audits: StoredAudit[], opts: Options = {}): ReadinessResult {
  const now = opts.now ?? Date.now()
  const completed = audits
    .filter(a => a.status === 'completed' && a.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())

  const openFindings = audits
    .flatMap(a => a.findings)
    .filter(f => f.status !== 'resolved')

  const openCritical = openFindings.filter(f => f.severity === 'critical').length
  const openMajor    = openFindings.filter(f => f.severity === 'major').length
  const openMinor    = openFindings.filter(f => f.severity === 'minor').length

  const overdue = openFindings.filter(f => f.dueDate && new Date(f.dueDate).getTime() < now)
  const overdueCount = overdue.length

  const daysToSurvey = opts.nextSurveyDate
    ? Math.ceil((new Date(opts.nextSurveyDate).getTime() - now) / DAY)
    : null

  // ── Factor 1: Latest compliance (recency-weighted avg of recent audits) ──
  const recent = completed.slice(0, 5)
  let complianceScore = 100
  let complianceMissing = true
  if (recent.length) {
    complianceMissing = false
    let wsum = 0, weighted = 0
    recent.forEach((a, i) => {
      const w = 1 / (i + 1) // most-recent weighted highest
      weighted += (a.score ?? 0) * w
      wsum += w
    })
    complianceScore = Math.round(weighted / wsum)
  }

  // ── Factor 2: Open critical/major findings ──
  const findingPenalty = Math.min(100, 12 * openCritical + 5 * openMajor + 1 * openMinor)
  const findingScore = 100 - findingPenalty

  // ── Factor 3: Overdue corrective actions ──
  const overduePenalty = Math.min(100, overdue.reduce((s, f) => s + sevPenalty(f.severity) * 2, 0))
  const overdueScore = 100 - overduePenalty

  // ── Factor 4: Aging findings (penalty steps at 30/60/90 days) ──
  const agingPenalty = Math.min(100, openFindings.reduce((s, f) => {
    const d = daysOpen(f, now)
    if (d >= 90) return s + 10
    if (d >= 60) return s + 6
    if (d >= 30) return s + 3
    return s
  }, 0))
  const agingScore = 100 - agingPenalty

  // ── Factor 5: Coverage (audits in last 180d vs ~quarterly target of 3) ──
  const auditsIn180 = completed.filter(a => now - new Date(a.completedAt!).getTime() <= 180 * DAY).length
  const coverageMissing = completed.length === 0
  const coverageScore = Math.min(100, Math.round((auditsIn180 / 3) * 100))

  // ── Factor 6: Recency (newest audit ≤30d = 100, linear decay to 0 at 180d) ──
  let recencyScore = 0
  let recencyMissing = true
  if (completed.length) {
    recencyMissing = false
    const ageDays = (now - new Date(completed[0].completedAt!).getTime()) / DAY
    if (ageDays <= 30) recencyScore = 100
    else if (ageDays >= 180) recencyScore = 0
    else recencyScore = Math.round(100 * (1 - (ageDays - 30) / 150))
  }

  const factors: ReadinessFactor[] = [
    { key: 'compliance', label: 'Latest compliance',          weight: 0.35, score: complianceScore, missing: complianceMissing,
      detail: complianceMissing ? 'No completed audits yet' : `Recency-weighted avg of last ${recent.length} audit${recent.length !== 1 ? 's' : ''}` },
    { key: 'findings',   label: 'Open critical/major findings', weight: 0.20, score: findingScore, missing: false,
      detail: `${openCritical} critical · ${openMajor} major · ${openMinor} minor open` },
    { key: 'overdue',    label: 'Overdue corrective actions',   weight: 0.15, score: overdueScore, missing: false,
      detail: overdueCount ? `${overdueCount} corrective action${overdueCount !== 1 ? 's' : ''} past due` : 'No overdue corrective actions' },
    { key: 'aging',      label: 'Aging findings',               weight: 0.10, score: agingScore, missing: false,
      detail: 'Penalty grows past 30/60/90 days open' },
    { key: 'coverage',   label: 'Audit coverage',               weight: 0.12, score: coverageScore, missing: coverageMissing,
      detail: `${auditsIn180} audit${auditsIn180 !== 1 ? 's' : ''} in last 180 days` },
    { key: 'recency',    label: 'Audit recency',                weight: 0.08, score: recencyScore, missing: recencyMissing,
      detail: recencyMissing ? 'No audits on record' : 'Freshness of most recent audit' },
  ]

  // Weighted score, renormalized over factors so partial inputs still produce a
  // meaningful number. If nothing is assessed yet, surface that explicitly.
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0)
  const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0) / totalWeight)

  const band: ReadinessBand = score >= 85 ? 'ready' : score >= 65 ? 'at-risk' : 'not-ready'

  const confidence: ReadinessResult['confidence'] =
    completed.length === 0 ? 'low' : completed.length < 3 ? 'low' : completed.length < 6 ? 'medium' : 'high'

  return {
    score,
    band,
    confidence,
    factors,
    auditCount: completed.length,
    openCritical,
    openMajor,
    openMinor,
    overdueCount,
    daysToSurvey,
    assessed: completed.length > 0,
  }
}

export function bandLabel(band: ReadinessBand): string {
  return band === 'ready' ? 'Survey Ready' : band === 'at-risk' ? 'At Risk' : 'Not Ready'
}

export function bandColor(band: ReadinessBand): string {
  return band === 'ready' ? '#22c55e' : band === 'at-risk' ? '#eab308' : '#ef4444'
}
