// ─── OBSERVATION BUILDERS ───────────────────────────────────────────────────
// Prefill an observation from a walkthrough gap or a library entry, and turn
// an observation back into a library entry. Pure; no I/O.

import { defaultsForRisk, getItem } from '@/lib/consult/framework'
import type { ObservationInput } from '@/lib/consult/db/observations'
import type { LibraryInput } from '@/lib/consult/db/library'
import type { AreaId, LibraryEntry, Observation, ResponseMap } from '@/lib/consult/types'

export function observationFromGap(engagementId: string, itemId: string, responses: ResponseMap): ObservationInput | null {
  const item = getItem(itemId)
  const r = responses[itemId]
  if (!item || !r || (r.answer !== 'not-met' && r.answer !== 'partial')) return null
  const { rating, priority } = defaultsForRisk(item.risk, r.answer)
  const status = r.answer === 'partial' ? 'Partially met' : 'Not met'
  return {
    engagementId, area: item.area, itemId: item.id, source: 'walkthrough',
    title: item.text.length > 90 ? `${item.text.slice(0, 87)}…` : item.text,
    detail: [`${status}: ${item.text}.`, r.note].filter(Boolean).join(' '),
    rating, priority, standardRefs: item.refs, recommendation: item.fix ?? '', ownerRole: '',
  }
}

/** Gaps (not-met/partial) that don't already have a linked observation. */
export function unconvertedGaps(responses: ResponseMap, observations: Observation[], scopeItemIds: Set<string>): string[] {
  const linked = new Set(observations.map(o => o.itemId).filter(Boolean))
  return Object.entries(responses)
    .filter(([id, r]) => scopeItemIds.has(id) && (r.answer === 'not-met' || r.answer === 'partial') && !linked.has(id))
    .map(([id]) => id)
}

export function observationFromLibrary(engagementId: string, e: LibraryEntry, area?: AreaId): ObservationInput {
  return {
    engagementId, area: area ?? e.area, itemId: null, source: 'library',
    title: e.title, detail: e.findingText, rating: e.rating, priority: e.priority,
    standardRefs: e.standardRefs, recommendation: e.recommendation, ownerRole: '',
  }
}

export function libraryFromObservation(o: Observation): LibraryInput {
  return {
    area: o.area, title: o.title, findingText: o.detail, recommendation: o.recommendation,
    standardRefs: o.standardRefs, rating: o.rating, priority: o.priority, tags: [],
  }
}

/** Action plan as CSV — clients drop this straight into their CAPA tracker. */
export function actionPlanCsv(observations: Observation[], areaName: (id: string) => string): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
  const order = ['immediate', '30-day', '60-day', '90-day']
  const rows = observations
    .filter(o => o.rating !== 'strength')
    .sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority))
    .map((o, i) => [String(i + 1), o.priority, o.rating, areaName(o.area), o.title, o.recommendation,
      o.ownerRole, o.standardRefs.join('; '), '', ''].map(esc).join(','))
  return [['#', 'Priority', 'Rating', 'Area', 'Finding', 'Recommended action', 'Owner', 'Standards', 'Due date', 'Status'].map(esc).join(','), ...rows].join('\n')
}
