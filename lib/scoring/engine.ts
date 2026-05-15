// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
// All audit scoring flows through here. Weighted scoring only.
// Score = sum(weight of yes) / sum(weight of yes + no) × 100.
// N/A answers are excluded from both numerator and denominator.

import { tokens } from '@/lib/constants/design-tokens'

export interface ScoringConfig {
  passThreshold:     number  // default 90
  marginalThreshold: number  // default 70
}

export interface SectionResult {
  sectionName:   string
  totalItems:    number
  answeredItems: number
  passedItems:   number  // count of "yes" answers
  naItems:       number
  score:         number  // weighted % of yes / (yes + no), excluding na
  status:        'pass' | 'marginal' | 'fail'
}

export interface AuditScore {
  overall:        number
  status:         'pass' | 'marginal' | 'fail'
  sections:       SectionResult[]
  criticalFailCount: number
  majorFailCount:    number
  minorFailCount:    number
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function getScoreStatus(
  score: number,
  config: ScoringConfig
): 'pass' | 'marginal' | 'fail' {
  if (score >= config.passThreshold)     return 'pass'
  if (score >= config.marginalThreshold) return 'marginal'
  return 'fail'
}

export function getScoreColor(status: 'pass' | 'marginal' | 'fail'): string {
  if (status === 'pass')     return tokens.color.success  // #22c55e
  if (status === 'marginal') return tokens.color.warning  // #eab308
  return tokens.color.danger                               // #ef4444
}

// ─── MAIN CALCULATION ─────────────────────────────────────────────────────────

export function calculateScore(
  responses:  Record<number, { answer: string; comment: string }>,
  items:      Array<{ weight: number; severity: string }>,
  sectionMap: Array<{ name: string; itemIndices: number[] }>,
  config:     ScoringConfig
): AuditScore {
  let totalWeightYes = 0
  let totalWeightApplicable = 0
  let criticalFailCount = 0
  let majorFailCount    = 0
  let minorFailCount    = 0

  const sections: SectionResult[] = sectionMap.map(sec => {
    let secWeightYes  = 0
    let secWeightAppl = 0
    let passedItems   = 0
    let naItems       = 0
    let answeredItems = 0

    sec.itemIndices.forEach(idx => {
      const item   = items[idx]
      const resp   = responses[idx]
      const answer = resp?.answer ?? ''

      if (!answer || answer === '') return  // unanswered — skip entirely

      answeredItems++

      if (answer === 'na') {
        naItems++
        return  // excluded from scoring denominator
      }

      const w = item?.weight ?? 1
      secWeightAppl     += w
      totalWeightApplicable += w

      if (answer === 'yes') {
        secWeightYes  += w
        totalWeightYes += w
        passedItems++
      } else {
        // "no" answer — count fail by severity
        const sev = item?.severity ?? 'minor'
        if (sev === 'critical') criticalFailCount++
        else if (sev === 'major') majorFailCount++
        else minorFailCount++
      }
    })

    const score  = secWeightAppl > 0 ? Math.round((secWeightYes / secWeightAppl) * 100) : 0
    const status = getScoreStatus(score, config)

    return {
      sectionName:   sec.name,
      totalItems:    sec.itemIndices.length,
      answeredItems,
      passedItems,
      naItems,
      score,
      status,
    }
  })

  const overall = totalWeightApplicable > 0
    ? Math.round((totalWeightYes / totalWeightApplicable) * 100)
    : 0

  return {
    overall,
    status: getScoreStatus(overall, config),
    sections,
    criticalFailCount,
    majorFailCount,
    minorFailCount,
  }
}
