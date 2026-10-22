// ─── CONSULT SCORING ────────────────────────────────────────────────────────
// Pure functions: walkthrough responses + observations → area scores, overall
// score, and a risk band. Weighting mirrors lib/scoring/engine (critical=3,
// major=2, minor=1); partial earns half credit; N/A and unanswered drop out.

import type {
  AreaId, FrameworkArea, ItemRisk, Observation, Rating, ResponseMap,
} from '@/lib/consult/types'

const WEIGHT: Record<ItemRisk, number> = { critical: 3, major: 2, minor: 1 }

export type RiskBand = 'low' | 'moderate' | 'high' | 'severe'

export interface AreaScore {
  areaId:        AreaId
  name:          string
  score:         number | null   // null when nothing applicable was answered
  answered:      number
  total:         number
  notMet:        number
  partial:       number
  criticalGaps:  number          // critical-risk items answered not-met
}

export interface EngagementScore {
  overall:       number | null
  band:          RiskBand
  areas:         AreaScore[]
  answered:      number
  total:         number
  criticalGaps:  number
  ratingCounts:  Record<Rating, number>
}

export function scoreArea(area: FrameworkArea, responses: ResponseMap): AreaScore {
  let earned = 0, possible = 0, answered = 0, notMet = 0, partial = 0, criticalGaps = 0
  for (const item of area.items) {
    const r = responses[item.id]
    if (!r) continue
    answered++
    if (r.answer === 'na') continue
    const w = WEIGHT[item.risk]
    possible += w
    if (r.answer === 'met') earned += w
    if (r.answer === 'partial') { earned += w / 2; partial++ }
    if (r.answer === 'not-met') {
      notMet++
      if (item.risk === 'critical') criticalGaps++
    }
  }
  return {
    areaId: area.id, name: area.name,
    score: possible ? Math.round((earned / possible) * 100) : null,
    answered, total: area.items.length, notMet, partial, criticalGaps,
  }
}

export function scoreEngagement(
  areas: FrameworkArea[],
  responses: ResponseMap,
  observations: Observation[],
): EngagementScore {
  const areaScores = areas.map(a => scoreArea(a, responses))

  // Overall = item-weighted across areas (not a mean of area %, which would let
  // a 3-item area count as much as a 9-item one).
  let earned = 0, possible = 0
  for (const area of areas) {
    for (const item of area.items) {
      const r = responses[item.id]
      if (!r || r.answer === 'na') continue
      const w = WEIGHT[item.risk]
      possible += w
      if (r.answer === 'met') earned += w
      if (r.answer === 'partial') earned += w / 2
    }
  }
  const overall = possible ? Math.round((earned / possible) * 100) : null

  const ratingCounts: Record<Rating, number> = { strength: 0, opportunity: 0, deficiency: 0, critical: 0 }
  for (const o of observations) ratingCounts[o.rating]++

  const criticalGaps = areaScores.reduce((n, a) => n + a.criticalGaps, 0)

  return {
    overall,
    band: riskBand(overall, criticalGaps + ratingCounts.critical),
    areas: areaScores,
    answered: areaScores.reduce((n, a) => n + a.answered, 0),
    total: areaScores.reduce((n, a) => n + a.total, 0),
    criticalGaps,
    ratingCounts,
  }
}

/**
 * Score alone understates risk: one unaddressed critical gap (e.g. no implant
 * BI quarantine) is a survey-level finding regardless of a 90% average. Any
 * critical issue caps the band at 'high'; several push it to 'severe'.
 */
export function riskBand(score: number | null, criticalIssues: number): RiskBand {
  if (criticalIssues >= 3) return 'severe'
  let band: RiskBand =
    score === null ? 'moderate'
    : score >= 90 ? 'low'
    : score >= 75 ? 'moderate'
    : score >= 60 ? 'high'
    : 'severe'
  if (criticalIssues > 0 && (band === 'low' || band === 'moderate')) band = 'high'
  return band
}

export const BAND_LABEL: Record<RiskBand, string> = {
  low: 'Low Risk', moderate: 'Moderate Risk', high: 'High Risk', severe: 'Severe Risk',
}
export const BAND_COLOR: Record<RiskBand, string> = {
  low: '#22c55e', moderate: '#eab308', high: '#f97316', severe: '#ef4444',
}

export function scoreColor(score: number | null): string {
  if (score === null) return '#64748b'
  return score >= 90 ? '#22c55e' : score >= 75 ? '#eab308' : score >= 60 ? '#f97316' : '#ef4444'
}
