// ─── CONSULT FRAMEWORK REGISTRY + LABELS ────────────────────────────────────

import type {
  AreaId, FrameworkArea, FrameworkItem, Rating, Priority, Answer,
  EngagementType, EngagementStatus, FacilityType, ItemRisk,
} from '@/lib/consult/types'
import { leadership, staffing, pou, decon, iap, steril, storage } from './core-areas'
import { endo, water, environment, quality, equipment, orInterface } from './support-areas'

export const FRAMEWORK: FrameworkArea[] = [
  leadership, staffing, pou, decon, iap, steril, storage,
  endo, water, environment, quality, equipment, orInterface,
]

export const ALL_AREA_IDS: AreaId[] = FRAMEWORK.map(a => a.id)

const AREA_BY_ID = new Map(FRAMEWORK.map(a => [a.id, a]))
const ITEM_BY_ID = new Map(FRAMEWORK.flatMap(a => a.items).map(i => [i.id, i]))

export function getArea(id: AreaId): FrameworkArea | undefined {
  return AREA_BY_ID.get(id)
}

export function getItem(id: string): FrameworkItem | undefined {
  return ITEM_BY_ID.get(id)
}

export function areaName(id: string): string {
  return AREA_BY_ID.get(id as AreaId)?.name ?? id
}

/** Areas in scope for an engagement, in framework order. Empty scope = all. */
export function scopedAreas(scope: AreaId[]): FrameworkArea[] {
  if (!scope.length) return FRAMEWORK
  const set = new Set(scope)
  return FRAMEWORK.filter(a => set.has(a.id))
}

// ── Labels + colors ──────────────────────────────────────────────────────────

export const RATING_LABEL: Record<Rating, string> = {
  strength: 'Strength', opportunity: 'Opportunity', deficiency: 'Deficiency', critical: 'Critical Risk',
}
export const RATING_COLOR: Record<Rating, string> = {
  strength: '#22c55e', opportunity: '#3b82f6', deficiency: '#f97316', critical: '#ef4444',
}
export const RATING_ORDER: Rating[] = ['critical', 'deficiency', 'opportunity', 'strength']

export const PRIORITY_LABEL: Record<Priority, string> = {
  immediate: 'Immediate', '30-day': '30 days', '60-day': '60 days', '90-day': '90 days',
}
export const PRIORITY_ORDER: Priority[] = ['immediate', '30-day', '60-day', '90-day']

export const ANSWER_LABEL: Record<Answer, string> = {
  met: 'Met', partial: 'Partial', 'not-met': 'Not met', na: 'N/A',
}
export const ANSWER_COLOR: Record<Answer, string> = {
  met: '#22c55e', partial: '#eab308', 'not-met': '#ef4444', na: '#64748b',
}

export const ENGAGEMENT_TYPE_LABEL: Record<EngagementType, string> = {
  baseline: 'Baseline Assessment', 'mock-survey': 'Mock Survey', 'follow-up': 'Follow-up Visit',
  focused: 'Focused Review', remediation: 'Post-Survey Remediation',
}
export const STATUS_LABEL: Record<EngagementStatus, string> = {
  planned: 'Planned', 'on-site': 'On-site', drafting: 'Drafting report', delivered: 'Delivered',
}
export const FACILITY_LABEL: Record<FacilityType, string> = {
  hospital: 'Hospital', asc: 'Ambulatory Surgery Center', clinic: 'Clinic / Physician Office',
  idn: 'Health System / IDN', other: 'Other',
}

/** A failed item's default observation rating and priority, from its risk. */
export function defaultsForRisk(risk: ItemRisk, answer: Answer): { rating: Rating; priority: Priority } {
  if (risk === 'critical') return answer === 'not-met'
    ? { rating: 'critical', priority: 'immediate' }
    : { rating: 'deficiency', priority: '30-day' }
  if (risk === 'major') return answer === 'not-met'
    ? { rating: 'deficiency', priority: '30-day' }
    : { rating: 'opportunity', priority: '60-day' }
  return { rating: 'opportunity', priority: '90-day' }
}
