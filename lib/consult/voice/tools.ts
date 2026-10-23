// ─── VOICE COPILOT: TOOLS + INSTRUCTIONS ────────────────────────────────────
// Pure (server + browser). The realtime model can only act through these
// tools; each one is executed in the browser by lib/consult/voice/executor.ts
// through the same data layer (and offline queue) as a tap.

import { ALL_AREA_IDS, FRAMEWORK, PRIORITY_ORDER, RATING_ORDER, scopedAreas } from '@/lib/consult/framework'
import { AUDIT_TEMPLATES } from '@/lib/consult/audits/templates'
import type { AreaId } from '@/lib/consult/types'

type Schema = Record<string, unknown>
export interface VoiceTool { type: 'function'; name: string; description: string; parameters: Schema }

const str = (description: string, extra: Schema = {}): Schema => ({ type: 'string', description, ...extra })
const obj = (properties: Record<string, Schema>, required: string[] = []): Schema =>
  ({ type: 'object', properties, required, additionalProperties: false })

export const PROFILE_FIELDS = [
  'departmentName', 'leaderName', 'reportsTo', 'fteBudgeted', 'fteActual', 'certifiedPct', 'shifts',
  'hoursOfOperation', 'steamSterilizers', 'lowTempSterilizers', 'washers', 'trayVolumeDaily',
  'flexScopesInventory', 'trackingSystem', 'lastSurvey', 'keyConcerns',
] as const

export const VOICE_TOOLS: VoiceTool[] = [
  {
    type: 'function', name: 'get_status',
    description: 'Read the current state of the engagement: progress by area, unanswered checkpoints in an area, open findings, active audits with their ids. Call this before answering "what\'s left", and whenever you need an id.',
    parameters: obj({ area: str('Optional area id to list its unanswered checkpoints', { enum: ALL_AREA_IDS }) }),
  },
  {
    type: 'function', name: 'set_checkpoints',
    description: 'Record walkthrough answers for one or more checkpoints by id (ids are in your instructions). Use when the consultant says a standard is met, partly met, not met, or not applicable.',
    parameters: obj({
      answers: {
        type: 'array', description: 'One entry per checkpoint',
        items: obj({
          item_id: str('Checkpoint id, e.g. "st-2"'),
          answer: str('Result', { enum: ['met', 'partial', 'not-met', 'na'] }),
          note: str('What was seen, in the consultant\'s words (optional)'),
        }, ['item_id', 'answer']),
      },
    }, ['answers']),
  },
  {
    type: 'function', name: 'add_observation',
    description: 'Create a finding or strength from what the consultant describes. Write report-ready text: a short headline title, factual detail, and a concrete recommendation.',
    parameters: obj({
      area: str('Area id', { enum: ALL_AREA_IDS }),
      title: str('Short headline, under 90 characters'),
      detail: str('What was observed, facts only'),
      rating: str('Severity', { enum: RATING_ORDER }),
      priority: str('When it must be fixed', { enum: PRIORITY_ORDER }),
      recommendation: str('What the department should do'),
      owner_role: str('Suggested owner role, e.g. "SPD Manager" (optional)'),
      standard_refs: { type: 'array', items: { type: 'string' }, description: 'Standards cited, e.g. "ANSI/AAMI ST79". Only documents, never invented clause numbers.' },
      item_id: str('Checkpoint id this finding came from, if any (optional)'),
    }, ['area', 'title', 'rating']),
  },
  {
    type: 'function', name: 'update_observation',
    description: 'Change an existing observation (by id from get_status), e.g. raise its rating, add to the detail, change the owner.',
    parameters: obj({
      observation_id: str('Observation id'),
      title: str('New title (optional)'),
      detail: str('Replacement detail text (optional)'),
      append_detail: str('Text to add to the end of the detail (optional)'),
      rating: str('New rating (optional)', { enum: RATING_ORDER }),
      priority: str('New priority (optional)', { enum: PRIORITY_ORDER }),
      recommendation: str('New recommendation (optional)'),
      owner_role: str('New owner role (optional)'),
    }, ['observation_id']),
  },
  {
    type: 'function', name: 'request_photo',
    description: 'Ask the app to show a camera button for an observation so the consultant can take a photo. Use when they say "get a picture of this" or similar.',
    parameters: obj({ observation_id: str('Observation id; omit to use the most recent observation') }),
  },
  {
    type: 'function', name: 'start_audit',
    description: 'Start an instant audit from the library (template ids are in your instructions), optionally linked to a finding.',
    parameters: obj({
      template_id: str('Audit template id', { enum: AUDIT_TEMPLATES.map(t => t.id) }),
      observation_id: str('Finding this audit measures (optional)'),
      target_per_day: { type: 'integer', description: 'Samples per day to aim for (optional)' },
    }, ['template_id']),
  },
  {
    type: 'function', name: 'log_audit_sample',
    description: 'Log one audit sample (one load, tray, scope cycle...). Items not listed as failed or N/A are recorded as Yes. Get audit and item ids from get_status.',
    parameters: obj({
      audit_id: str('Audit id'),
      sample_ref: str('Which sample, e.g. "Sterilizer 2 load 4"'),
      failed_items: { type: 'array', items: { type: 'string' }, description: 'Item ids answered No' },
      na_items: { type: 'array', items: { type: 'string' }, description: 'Item ids answered N/A' },
      note: str('What failed and what was done (optional)'),
      date: str('YYYY-MM-DD the audit was performed, if not today (optional)'),
      from_paper: { type: 'boolean', description: 'True if read from a paper form (optional)' },
      auditor: str('Who performed it, for paper forms (optional)'),
    }, ['audit_id']),
  },
  {
    type: 'function', name: 'set_department_profile',
    description: 'Record facts about the department (staffing, equipment, volume, systems). Only the fields mentioned.',
    parameters: obj(Object.fromEntries(PROFILE_FIELDS.map(f => [f,
      ['fteBudgeted', 'fteActual', 'certifiedPct', 'steamSterilizers', 'lowTempSterilizers', 'washers', 'trayVolumeDaily', 'flexScopesInventory'].includes(f)
        ? { type: 'number', description: f } : { type: 'string', description: f }]))),
  },
  {
    type: 'function', name: 'go_to',
    description: 'Switch the screen to a tab, and optionally to a walkthrough area.',
    parameters: obj({
      tab: str('Tab', { enum: ['overview', 'walkthrough', 'observations', 'audits', 'report'] }),
      area: str('Walkthrough area id (optional)', { enum: ALL_AREA_IDS }),
    }, ['tab']),
  },
  {
    type: 'function', name: 'undo_last',
    description: 'Reverse the most recent change made by voice. Use when the consultant says "undo", "scratch that", or "that\'s wrong".',
    parameters: obj({}),
  },
]

export type VoiceMode = 'ptt' | 'handsfree'

/** Push-to-talk: no server VAD; the client commits each turn on button release.
 *  Hands-free: server VAD with a high threshold for loud departments. */
export function turnDetection(mode: VoiceMode) {
  return mode === 'ptt' ? null : {
    type: 'server_vad', threshold: 0.75, prefix_padding_ms: 300, silence_duration_ms: 700,
    create_response: true, interrupt_response: true,
  }
}

export interface VoiceContext {
  clientName:  string
  facility:    string
  engagement:  string
  scope:       AreaId[]
  consultant:  string
  voiceNotes:  string
}

/** The session instructions. Checkpoint ids for the engagement's scope are
 *  listed inline so the model can map speech to ids without a lookup. */
export function buildVoiceInstructions(c: VoiceContext): string {
  const areas = scopedAreas(c.scope)
  const checkpoints = areas.map(a =>
    `${a.id} — ${a.name}\n${a.items.map(i => `  ${i.id}: ${i.text}${i.risk === 'critical' ? ' [critical]' : ''}`).join('\n')}`,
  ).join('\n')
  const audits = AUDIT_TEMPLATES.map(t => `  ${t.id}: ${t.name} (per ${t.sampleUnit})`).join('\n')
  const areaList = FRAMEWORK.map(a => `${a.id}=${a.name}`).join(', ')

  return `You are the field assistant for ${c.consultant || 'an independent sterile processing (SPD) consultant'} during a site assessment at ${c.clientName}${c.facility ? ` (${c.facility})` : ''}, engagement "${c.engagement}". The consultant is walking the department, often gloved and gowned, and talks to you instead of typing. Your job is to turn what they say into the engagement record using your tools, accurately and fast.

How to behave:
- Act, then confirm in one short sentence ("Logged: implants released before BI, critical, immediate."). No small talk, no repeating everything back.
- When you record anything rated critical, read the title back and add "say undo to reverse".
- If something is genuinely ambiguous (which area, which audit, met or partial), ask one short question instead of guessing. Never invent facts, numbers, names, or standard clause numbers.
- One utterance can mean several tool calls (e.g. a not-met checkpoint plus a finding). Do them all.
- Write observation text in report-ready, professional language, even when the consultant speaks casually.
- Privacy: never record patient names, MRNs, or other patient identifiers. If one is spoken, leave it out and say you left it out.
- Use get_status whenever you need an id or the consultant asks what is left.
- Speak English, briefly. You may be overheard in a busy department.
${c.voiceNotes ? `\nThe consultant's own writing guidance (apply it to observation text):\n${c.voiceNotes}\n` : ''}
Area ids: ${areaList}

Walkthrough checkpoints in scope (id: text):
${checkpoints}

Audit templates (id: name):
${audits}`
}
