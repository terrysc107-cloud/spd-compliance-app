// ─── AI REPORT DRAFT PROMPT ─────────────────────────────────────────────────
// Turns a ReportBundle into the drafting prompt. The consultant's own library
// entries and voice notes are passed as style + knowledge context, so drafts
// read like the consultant wrote them — not like a generic compliance memo.

import { areaName, FACILITY_LABEL, ENGAGEMENT_TYPE_LABEL, PRIORITY_LABEL, RATING_LABEL, getItem } from '@/lib/consult/framework'
import { BAND_LABEL } from '@/lib/consult/scoring'
import type { ReportBundle } from '@/lib/consult/report-data'

export const DRAFT_SECTIONS = [
  'Executive Summary',
  'Department Overview',
  'Key Strengths',
  'Priority Findings',
  'Recommendations & Next Steps',
] as const

export const DRAFT_SYSTEM = `You are drafting a client deliverable for an independent sterile processing (SPD) consultant. The consultant will edit your draft and sign it, so write in their voice, in the first person plural ("we observed"), for a hospital executive and SPD leadership audience.

Ground rules:
- Use only the facts provided. Never invent observations, numbers, staff names, or dates. If something wasn't assessed, don't imply it was.
- Cite standards exactly as they appear in the data (e.g. "ANSI/AAMI ST79"). Do not add clause numbers that aren't in the data.
- Lead with patient-safety risk, then regulatory exposure, then operational efficiency.
- Be specific and direct. No filler, no hedging boilerplate, no marketing tone.
- Output GitHub-flavored markdown with exactly these "## " sections, in order: ${DRAFT_SECTIONS.join(', ')}.`

function line(label: string, v: unknown): string | null {
  return v === undefined || v === null || v === '' ? null : `${label}: ${v}`
}

export function buildDraftPrompt(b: ReportBundle): string {
  const { engagement: e, client: c, score, observations, settings } = b
  const p = e.profile

  const facts = [
    line('Client', c.name),
    line('Facility type', FACILITY_LABEL[c.facilityType]),
    line('Location', [c.city, c.state].filter(Boolean).join(', ')),
    line('Beds', c.bedCount),
    line('Annual surgical cases', c.annualSurgicalCases),
    line('Engagement', `${e.title} (${ENGAGEMENT_TYPE_LABEL[e.type]})`),
    line('Visit dates', [e.visitStart, e.visitEnd].filter(Boolean).join(' to ')),
    line('Department', p.departmentName), line('Department leader', p.leaderName), line('Reports to', p.reportsTo),
    line('FTEs budgeted / actual', p.fteBudgeted || p.fteActual ? `${p.fteBudgeted ?? '?'} / ${p.fteActual ?? '?'}` : null),
    line('Certified technicians (%)', p.certifiedPct), line('Shifts', p.shifts),
    line('Hours of operation', p.hoursOfOperation),
    line('Steam / low-temp sterilizers', p.steamSterilizers || p.lowTempSterilizers ? `${p.steamSterilizers ?? 0} / ${p.lowTempSterilizers ?? 0}` : null),
    line('Washers', p.washers), line('Trays per day', p.trayVolumeDaily),
    line('Flexible scope inventory', p.flexScopesInventory), line('Tracking system', p.trackingSystem),
    line('Last regulatory survey', p.lastSurvey), line('Client-stated concerns', p.keyConcerns),
  ].filter(Boolean).join('\n')

  const areaLines = score.areas
    .map(a => `- ${a.name}: ${a.score === null ? 'not assessed' : `${a.score}%`} (${a.answered}/${a.total} checkpoints; ${a.notMet} not met, ${a.partial} partial${a.criticalGaps ? `, ${a.criticalGaps} critical gap(s)` : ''})`)
    .join('\n')

  const gapLines = Object.entries(b.responses)
    .filter(([, r]) => r.answer === 'not-met' || r.answer === 'partial')
    .map(([id, r]) => {
      const item = getItem(id)
      if (!item) return null
      return `- [${r.answer}] [${item.risk}] ${areaName(item.area)}: ${item.text}${r.note ? ` — consultant note: ${r.note}` : ''}`
    })
    .filter(Boolean).join('\n') || '- none recorded'

  const obsLines = observations.length
    ? observations.map((o, i) => [
        `${i + 1}. [${RATING_LABEL[o.rating]}] [${PRIORITY_LABEL[o.priority]}] ${areaName(o.area)} — ${o.title}`,
        o.detail && `   Observed: ${o.detail}`,
        o.recommendation && `   Recommendation: ${o.recommendation}`,
        o.standardRefs.length && `   Standards: ${o.standardRefs.join('; ')}`,
        o.ownerRole && `   Suggested owner: ${o.ownerRole}`,
      ].filter(Boolean).join('\n')).join('\n')
    : '- none recorded'

  // Prior phrasing from the consultant's own library, limited to areas that
  // actually have issues in this engagement, as style + knowledge reference.
  const issueAreas = new Set(observations.filter(o => o.rating !== 'strength').map(o => o.area))
  const libLines = b.library
    .filter(l => issueAreas.has(l.area))
    .slice(0, 12)
    .map(l => `- (${areaName(l.area)}) ${l.title}: ${l.findingText} → ${l.recommendation}`)
    .join('\n')

  const auditLines = b.audits.map(({ audit: a, summary: m, linkedTitle }) => {
    const worst = m.items.filter(i => i.no).slice(0, 2).map(i => `"${i.text}" ${i.failRate}% No`).join('; ')
    return `- ${a.title}${linkedTitle ? ` (measures: ${linkedTitle})` : ''}: ${m.samples} ${a.sampleUnit}s over ${m.days} days; ` +
      `baseline ${m.baseline ?? 'n/a'}% (${m.baselineLabel}) → current ${m.current ?? 'n/a'}% (${m.currentLabel}); ` +
      `critical misses ${m.criticalMisses}${worst ? `; most-failed: ${worst}` : ''}`
  }).join('\n')

  const prior = b.priorScore
    ? `Prior engagement "${b.priorScore.title}"${b.priorScore.date ? ` (${b.priorScore.date})` : ''}: overall ${b.priorScore.overall ?? 'n/a'}%. Comment on the change.`
    : 'No prior engagement on record for this client.'

  return `<engagement_facts>
${facts}
</engagement_facts>

<scores>
Overall standards conformance: ${score.overall ?? 'not enough data'}${score.overall !== null ? '%' : ''} — ${BAND_LABEL[score.band]}
Checkpoints assessed: ${score.answered} of ${score.total}
Critical gaps: ${score.criticalGaps}
Observation counts: ${score.ratingCounts.critical} critical, ${score.ratingCounts.deficiency} deficiency, ${score.ratingCounts.opportunity} opportunity, ${score.ratingCounts.strength} strength
${prior}
By area:
${areaLines}
</scores>

<walkthrough_gaps>
${gapLines}
</walkthrough_gaps>

<observations>
${obsLines}
</observations>
${auditLines ? `
<instant_audits>
Audits started during the engagement to measure fixes. Baseline = first stretch of logging, current = latest. Cite these numbers as evidence of improvement (or lack of it).
${auditLines}
</instant_audits>
` : ''}
${libLines ? `
<consultant_prior_language>
How this consultant has phrased similar findings before. Match the tone and level of specificity; reuse wording where it fits the facts above.
${libLines}
</consultant_prior_language>
` : ''}${settings.voiceNotes ? `
<consultant_voice>
${settings.voiceNotes}
</consultant_voice>
` : ''}
Write the report draft now. Section guidance:
- Executive Summary: 2 short paragraphs — overall risk posture and the 3 most important things leadership must act on.
- Department Overview: who/what was assessed, scope, and the department profile in prose.
- Key Strengths: specific practices worth sustaining (from strength observations and well-performing areas). If none were recorded, say so in one sentence.
- Priority Findings: the most significant issues only (critical and deficiency first), grouped by theme rather than restating every observation. For each: what was observed, why it matters (patient/regulatory risk), and the standard.
- Recommendations & Next Steps: the sequenced improvement roadmap in prose (what to do first and why), and the recommended follow-up visit.
The full observation list, area scorecard, and itemized 30/60/90-day action plan are appended to the report automatically — do not reproduce them as tables.`
}
