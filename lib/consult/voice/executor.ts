// ─── VOICE COPILOT: TOOL EXECUTOR (BROWSER) ─────────────────────────────────
// Runs tool calls from the realtime model against the same data layer a tap
// uses (so writes are offline-queued and RLS-checked). Every argument is
// validated here — the model's JSON is untrusted input. Every write pushes an
// inverse onto an undo stack and an entry onto the activity feed.

import { areaName, getItem, RATING_LABEL, PRIORITY_LABEL, ALL_AREA_IDS, PRIORITY_ORDER, RATING_ORDER } from '@/lib/consult/framework'
import { getAuditTemplate } from '@/lib/consult/audits/templates'
import { scoreEngagement } from '@/lib/consult/scoring'
import { clearResponse, setResponse } from '@/lib/consult/db/engagements'
import { createObservation, deleteObservation, updateObservation, type ObservationInput } from '@/lib/consult/db/observations'
import { addSample, deleteAudit, deleteSample, startAudit, today } from '@/lib/consult/db/audits'
import { PROFILE_FIELDS } from './tools'
import type {
  Answer, AreaId, Audit, AuditAnswer, AuditSample, DepartmentProfile, Engagement, FrameworkArea,
  Observation, Priority, Rating, ResponseMap,
} from '@/lib/consult/types'

export type Tab = 'overview' | 'walkthrough' | 'observations' | 'audits' | 'report'

/** Live view of page state. Getters, not values, so a long voice session never acts on stale data. */
export interface VoiceHost {
  engagement:      () => Engagement
  areas:           () => FrameworkArea[]
  responses:       () => ResponseMap
  setResponses:    (fn: (r: ResponseMap) => ResponseMap) => void
  observations:    () => Observation[]
  setObservations: (fn: (o: Observation[]) => Observation[]) => void
  audits:          () => Audit[]
  setAudits:       (fn: (a: Audit[]) => Audit[]) => void
  samples:         () => AuditSample[]
  setSamples:      (fn: (s: AuditSample[]) => AuditSample[]) => void
  patchEngagement: (u: Partial<Engagement>) => Promise<void>
  navigate:        (tab: Tab, area?: AreaId) => void
  requestPhoto:    (obs: Observation) => void
}

export interface FeedEntry { id: string; at: number; text: string; kind: 'write' | 'read' | 'nav' | 'error' | 'undo' | 'you' | 'assistant'; undone?: boolean }

interface Undoable { feedId: string; label: string; run: () => Promise<void> }

type Args = Record<string, unknown>
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isStr) : [])
const oneOf = <T extends string>(v: unknown, values: readonly T[]): T | undefined =>
  (typeof v === 'string' && (values as readonly string[]).includes(v) ? (v as T) : undefined)

class ToolError extends Error {}
const fail = (msg: string): never => { throw new ToolError(msg) }

export class VoiceExecutor {
  private undoStack: Undoable[] = []
  constructor(private host: VoiceHost, private onFeed: (e: FeedEntry) => void, private onUndone: (feedId: string) => void) {}

  private feed(text: string, kind: FeedEntry['kind']): string {
    const id = crypto.randomUUID()
    this.onFeed({ id, at: Date.now(), text, kind })
    return id
  }

  private pushUndo(feedId: string, label: string, run: () => Promise<void>) {
    this.undoStack.push({ feedId, label, run })
    if (this.undoStack.length > 50) this.undoStack.shift()
  }

  /** Undo a specific feed entry (from the UI) or the latest (from voice). */
  async undo(feedId?: string): Promise<string | null> {
    const idx = feedId ? this.undoStack.findIndex(u => u.feedId === feedId) : this.undoStack.length - 1
    if (idx < 0) return null
    const [u] = this.undoStack.splice(idx, 1)
    await u.run()
    this.onUndone(u.feedId)
    this.feed(`Undid: ${u.label}`, 'undo')
    return u.label
  }

  canUndo(feedId: string): boolean {
    return this.undoStack.some(u => u.feedId === feedId)
  }

  /** Returns the JSON string sent back to the model as the function output. */
  async run(name: string, rawArgs: string): Promise<string> {
    let args: Args
    try { args = rawArgs ? JSON.parse(rawArgs) : {} } catch { return JSON.stringify({ ok: false, error: 'Arguments were not valid JSON' }) }
    if (!args || typeof args !== 'object' || Array.isArray(args)) args = {}
    try {
      const out = await this.dispatch(name, args)
      return JSON.stringify({ ok: true, ...out })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed'
      if (!(e instanceof ToolError)) this.feed(`Couldn't ${name.replace(/_/g, ' ')}: ${msg}`, 'error')
      return JSON.stringify({ ok: false, error: msg })
    }
  }

  private async dispatch(name: string, a: Args): Promise<Record<string, unknown>> {
    switch (name) {
      case 'get_status':             return this.getStatus(a)
      case 'set_checkpoints':        return this.setCheckpoints(a)
      case 'add_observation':        return this.addObservation(a)
      case 'update_observation':     return this.updateObservation(a)
      case 'request_photo':          return this.requestPhoto(a)
      case 'start_audit':            return this.startAudit(a)
      case 'log_audit_sample':       return this.logSample(a)
      case 'set_department_profile': return this.setProfile(a)
      case 'go_to':                  return this.goTo(a)
      case 'undo_last': {
        const label = await this.undo()
        return label ? { undone: label } : fail('Nothing to undo')
      }
      default: return fail(`Unknown tool ${name}`)
    }
  }

  // ── reads ──────────────────────────────────────────────────────────────────

  private getStatus(a: Args) {
    const h = this.host
    const score = scoreEngagement(h.areas(), h.responses(), h.observations())
    const area = oneOf(a.area, ALL_AREA_IDS)
    const out: Record<string, unknown> = {
      overall_conformance: score.overall, checkpoints_answered: score.answered, checkpoints_total: score.total,
      areas: score.areas.map(s => ({ id: s.areaId, name: s.name, answered: `${s.answered}/${s.total}`, score: s.score })),
      observations: h.observations().slice(-30).map(o => ({ id: o.id, area: o.area, title: o.title, rating: o.rating })),
      audits: h.audits().filter(x => x.status === 'active').map(x => ({
        id: x.id, title: x.title, samples: h.samples().filter(s => s.auditId === x.id).length,
        items: x.items.map(i => ({ id: i.id, text: i.text })),
      })),
    }
    if (area) {
      const fa = h.areas().find(x => x.id === area)
      out.unanswered_in_area = (fa?.items ?? []).filter(i => !h.responses()[i.id]).map(i => ({ id: i.id, text: i.text }))
    }
    this.feed(area ? `Checked status of ${areaName(area)}` : 'Checked engagement status', 'read')
    return out
  }

  // ── walkthrough ────────────────────────────────────────────────────────────

  private async setCheckpoints(a: Args) {
    const h = this.host
    const list = Array.isArray(a.answers) ? a.answers as Args[] : fail('answers must be a list')
    const inScope = new Set(h.areas().flatMap(x => x.items.map(i => i.id)))
    const done: string[] = []
    for (const entry of list) {
      const itemId = isStr(entry.item_id) ? entry.item_id : fail('Each answer needs an item_id')
      const item = getItem(itemId)
      if (!item || !inScope.has(itemId)) fail(`Checkpoint ${itemId} is not in this engagement's scope`)
      const answer = oneOf<Answer>(entry.answer, ['met', 'partial', 'not-met', 'na']) ?? fail(`Invalid answer for ${itemId}`)
      const note = isStr(entry.note) ? entry.note.trim() : (h.responses()[itemId]?.note ?? '')
      const prev = h.responses()[itemId]
      await setResponse(h.engagement().id, itemId, answer, note)
      h.setResponses(r => ({ ...r, [itemId]: { answer, note } }))
      const label = `${item!.text.slice(0, 60)}${item!.text.length > 60 ? '…' : ''}: ${answer.replace('-', ' ')}`
      const fid = this.feed(label, 'write')
      this.pushUndo(fid, label, async () => {
        if (prev) await setResponse(h.engagement().id, itemId, prev.answer, prev.note)
        else await clearResponse(h.engagement().id, itemId)
        h.setResponses(r => { const n = { ...r }; if (prev) n[itemId] = prev; else delete n[itemId]; return n })
      })
      done.push(`${itemId}=${answer}`)
    }
    return { recorded: done }
  }

  // ── observations ───────────────────────────────────────────────────────────

  private findObs(id: unknown): Observation {
    const obs = this.host.observations()
    if (isStr(id)) return obs.find(o => o.id === id) ?? fail(`No observation with id ${id}; call get_status for ids`)
    return obs[obs.length - 1] ?? fail('There are no observations yet')
  }

  private async addObservation(a: Args) {
    const h = this.host
    const area = oneOf<AreaId>(a.area, ALL_AREA_IDS) ?? fail('area must be a valid area id')
    const title = isStr(a.title) ? a.title.trim().slice(0, 140) : fail('title is required')
    const rating = oneOf<Rating>(a.rating, RATING_ORDER) ?? fail('rating must be strength, opportunity, deficiency or critical')
    const item = isStr(a.item_id) ? getItem(a.item_id) : undefined
    const refs = strArr(a.standard_refs)
    const input: ObservationInput = {
      engagementId: h.engagement().id, area, title, rating,
      detail: isStr(a.detail) ? a.detail.trim() : '',
      priority: oneOf<Priority>(a.priority, PRIORITY_ORDER) ?? (rating === 'critical' ? 'immediate' : '30-day'),
      recommendation: isStr(a.recommendation) ? a.recommendation.trim() : (item?.fix ?? ''),
      ownerRole: isStr(a.owner_role) ? a.owner_role.trim() : '',
      standardRefs: refs.length ? refs : (item?.refs ?? []),
      itemId: item?.id ?? null, source: 'voice', needsReview: true,
    }
    const obs = await createObservation(input)
    h.setObservations(o => [...o, obs])
    const label = `${RATING_LABEL[rating]}: ${title} (${areaName(area)}${rating !== 'strength' ? `, ${PRIORITY_LABEL[input.priority]}` : ''})`
    const fid = this.feed(label, 'write')
    this.pushUndo(fid, title, async () => {
      const cur = h.observations().find(o => o.id === obs.id) ?? obs
      await deleteObservation(cur)
      h.setObservations(o => o.filter(x => x.id !== obs.id))
    })
    return { observation_id: obs.id }
  }

  private async updateObservation(a: Args) {
    const h = this.host
    const obs = this.findObs(a.observation_id)
    const patch: Partial<ObservationInput> = { needsReview: true }
    if (isStr(a.title)) patch.title = a.title.trim().slice(0, 140)
    if (isStr(a.detail)) patch.detail = a.detail.trim()
    if (isStr(a.append_detail)) patch.detail = `${patch.detail ?? obs.detail}${obs.detail ? ' ' : ''}${a.append_detail.trim()}`
    if (a.rating !== undefined) patch.rating = oneOf<Rating>(a.rating, RATING_ORDER) ?? fail('Invalid rating')
    if (a.priority !== undefined) patch.priority = oneOf<Priority>(a.priority, PRIORITY_ORDER) ?? fail('Invalid priority')
    if (isStr(a.recommendation)) patch.recommendation = a.recommendation.trim()
    if (isStr(a.owner_role)) patch.ownerRole = a.owner_role.trim()
    if (Object.keys(patch).length === 1) fail('Nothing to change')
    const before: Partial<ObservationInput> = Object.fromEntries(Object.keys(patch).map(k => [k, obs[k as keyof Observation]]))
    await updateObservation(obs.id, patch)
    h.setObservations(o => o.map(x => (x.id === obs.id ? { ...x, ...patch } : x)))
    const label = `Updated “${obs.title}”`
    const fid = this.feed(label, 'write')
    this.pushUndo(fid, label, async () => {
      await updateObservation(obs.id, before)
      h.setObservations(o => o.map(x => (x.id === obs.id ? { ...x, ...before } : x)))
    })
    return { observation_id: obs.id }
  }

  private requestPhoto(a: Args) {
    const obs = this.findObs(a.observation_id)
    this.host.requestPhoto(obs)
    this.feed(`Camera ready for “${obs.title}”`, 'nav')
    return { observation_id: obs.id, note: 'A camera button is showing; the consultant taps it to take the photo.' }
  }

  // ── audits ─────────────────────────────────────────────────────────────────

  private async startAudit(a: Args) {
    const h = this.host
    const t = (isStr(a.template_id) ? getAuditTemplate(a.template_id) : undefined) ?? fail('Unknown audit template')
    const obsId = isStr(a.observation_id) ? this.findObs(a.observation_id).id : null
    const target = typeof a.target_per_day === 'number' && a.target_per_day > 0 ? a.target_per_day : undefined
    const audit = await startAudit(h.engagement().id, t!, { observationId: obsId, targetPerDay: target })
    h.setAudits(list => [...list, audit])
    const fid = this.feed(`Started audit: ${audit.title}`, 'write')
    this.pushUndo(fid, `start ${audit.title}`, async () => {
      await deleteAudit(audit.id)
      h.setAudits(list => list.filter(x => x.id !== audit.id))
    })
    return { audit_id: audit.id, items: audit.items.map(i => ({ id: i.id, text: i.text })) }
  }

  private async logSample(a: Args) {
    const h = this.host
    const audit = h.audits().find(x => x.id === a.audit_id) ?? fail('No audit with that id; call get_status for ids')
    const ids = new Set(audit.items.map(i => i.id))
    const failed = strArr(a.failed_items), na = strArr(a.na_items)
    const bad = [...failed, ...na].filter(id => !ids.has(id))
    if (bad.length) fail(`Unknown item ids for this audit: ${bad.join(', ')}`)
    const answers: Record<string, AuditAnswer> = {}
    for (const it of audit.items) answers[it.id] = failed.includes(it.id) ? 'no' : na.includes(it.id) ? 'na' : 'yes'
    const date = isStr(a.date) && /^\d{4}-\d{2}-\d{2}$/.test(a.date) ? a.date : today()
    const paper = a.from_paper === true
    const sample = await addSample({
      auditId: audit.id, sampledOn: date, sampleRef: isStr(a.sample_ref) ? a.sample_ref : '',
      source: paper ? 'paper' : 'observed', auditor: paper && isStr(a.auditor) ? a.auditor : '',
      answers, note: isStr(a.note) ? a.note : '',
    })
    h.setSamples(s => [...s, sample])
    const label = `${audit.title}: ${sample.sampleRef || audit.sampleUnit} — ${failed.length ? `${failed.length} No` : 'all Yes'}`
    const fid = this.feed(label, 'write')
    this.pushUndo(fid, label, async () => {
      await deleteSample(sample.id)
      h.setSamples(s => s.filter(x => x.id !== sample.id))
    })
    return { sample_id: sample.id, failed: failed.length }
  }

  // ── profile + navigation ───────────────────────────────────────────────────

  private async setProfile(a: Args) {
    const h = this.host
    const prev = h.engagement().profile
    const next: DepartmentProfile = { ...prev }
    const set: string[] = []
    for (const f of PROFILE_FIELDS) {
      const v = a[f]
      if (v === undefined || v === null || v === '') continue
      if (typeof v === 'number') {
        if (!Number.isFinite(v) || v < 0) fail(`${f} must be a non-negative number`)
        ;(next as Record<string, unknown>)[f] = v
      } else if (typeof v === 'string') (next as Record<string, unknown>)[f] = v.trim()
      else continue
      set.push(f)
    }
    if (!set.length) fail('No department fields given')
    await h.patchEngagement({ profile: next })
    const label = `Department profile: ${set.join(', ')}`
    const fid = this.feed(label, 'write')
    this.pushUndo(fid, label, () => h.patchEngagement({ profile: prev }))
    return { updated: set }
  }

  private goTo(a: Args) {
    const tab = oneOf<Tab>(a.tab, ['overview', 'walkthrough', 'observations', 'audits', 'report']) ?? fail('Unknown tab')
    const area = oneOf<AreaId>(a.area, ALL_AREA_IDS)
    this.host.navigate(tab!, area)
    this.feed(`Opened ${tab}${area ? ` · ${areaName(area)}` : ''}`, 'nav')
    return { tab }
  }
}
