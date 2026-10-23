// ─── VOICE SESSION API ──────────────────────────────────────────────────────
// POST { engagementId, mode } → { value, model }. Mints a short-lived OpenAI
// Realtime client secret with this engagement's instructions and tools baked
// in. The browser then talks to OpenAI directly over WebRTC; the real API key
// never leaves the server. Auth: session cookie; RLS scopes the engagement.

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { FACILITY_LABEL } from '@/lib/consult/framework'
import { VOICE_TOOLS, buildVoiceInstructions, turnDetection, type VoiceMode } from '@/lib/consult/voice/tools'
import type { AreaId } from '@/lib/consult/types'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODEL = process.env.OPENAI_REALTIME_MODEL || 'gpt-realtime-2.1'
const VOICE = process.env.OPENAI_REALTIME_VOICE || 'marin'

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const key = process.env.OPENAI_API_KEY
    if (!key) return Response.json({ error: 'Voice is not configured (OPENAI_API_KEY)' }, { status: 503 })

    const body = await req.json().catch(() => ({})) as { engagementId?: unknown; mode?: unknown }
    if (typeof body.engagementId !== 'string' || !UUID.test(body.engagementId)) {
      return Response.json({ error: 'engagementId is required' }, { status: 400 })
    }
    const mode: VoiceMode = body.mode === 'handsfree' ? 'handsfree' : 'ptt'

    const { data: e } = await supabase
      .from('consult_engagements')
      .select('title, scope_areas, client:consult_clients(name, facility_type)')
      .eq('id', body.engagementId)
      .maybeSingle()
    if (!e) return Response.json({ error: 'Engagement not found' }, { status: 404 })
    const { data: s } = await supabase
      .from('consult_settings').select('consultant_name, credentials, voice_notes').eq('user_id', user.id).maybeSingle()

    const client = e.client as unknown as { name: string; facility_type: keyof typeof FACILITY_LABEL } | null
    const instructions = buildVoiceInstructions({
      clientName: client?.name ?? 'the client',
      facility: client ? FACILITY_LABEL[client.facility_type] ?? '' : '',
      engagement: e.title,
      scope: (e.scope_areas ?? []) as AreaId[],
      consultant: [s?.consultant_name, s?.credentials].filter(Boolean).join(', '),
      voiceNotes: s?.voice_notes ?? '',
    })

    const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expires_after: { anchor: 'created_at', seconds: 60 },
        session: {
          type: 'realtime',
          model: MODEL,
          instructions,
          tools: VOICE_TOOLS,
          tool_choice: 'auto',
          output_modalities: ['audio'],
          audio: {
            input: {
              transcription: { model: 'gpt-4o-mini-transcribe' },
              noise_reduction: { type: 'far_field' },
              turn_detection: turnDetection(mode),
            },
            output: { voice: VOICE },
          },
        },
      }),
    })
    const json = await r.json().catch(() => ({})) as { value?: string; error?: { message?: string } }
    if (!r.ok || !json.value) {
      console.error('[consult/voice/session]', r.status, json.error?.message)
      return Response.json({ error: json.error?.message ?? `Voice session failed (${r.status})` }, { status: 502 })
    }
    return Response.json({ value: json.value, model: MODEL })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[consult/voice/session]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
