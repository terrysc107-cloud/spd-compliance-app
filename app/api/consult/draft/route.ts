// ─── CONSULT REPORT DRAFT API ───────────────────────────────────────────────
// POST { engagementId } → { draft }. Builds the prompt from the same bundle the
// PDF uses, calls Claude, and stores the draft on the engagement. Auth: session
// cookie required; RLS scopes the engagement to the caller's org.

import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { loadReportBundle } from '@/lib/consult/report-data'
import { buildDraftPrompt, DRAFT_SYSTEM } from '@/lib/consult/prompt'

export const runtime = 'nodejs'
export const maxDuration = 300

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const engagementId = (body as { engagementId?: unknown }).engagementId
    if (typeof engagementId !== 'string' || !UUID.test(engagementId)) {
      return Response.json({ error: 'engagementId is required' }, { status: 400 })
    }

    const bundle = await loadReportBundle(supabase, engagementId)
    if (!bundle) return Response.json({ error: 'Engagement not found' }, { status: 404 })
    if (!bundle.observations.length && !bundle.score.answered) {
      return Response.json({ error: 'Record walkthrough responses or observations before drafting' }, { status: 400 })
    }

    const client = new Anthropic()
    const message = await client.beta.messages.stream({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'high' },
      // Server-side refusal fallback: a policy decline re-runs on a fallback model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: DRAFT_SYSTEM,
      messages: [{ role: 'user', content: buildDraftPrompt(bundle) }],
    }).finalMessage()

    if (message.stop_reason === 'refusal') {
      return Response.json({ error: 'The model declined to draft this report. Edit the observations and try again.' }, { status: 422 })
    }

    const draft = message.content
      .flatMap(b => (b.type === 'text' ? [b.text] : []))
      .join('')
      .trim()
    if (!draft) return Response.json({ error: 'Empty draft returned' }, { status: 502 })

    await supabase
      .from('consult_engagements')
      .update({ ai_draft: draft, updated_at: new Date().toISOString() })
      .eq('id', engagementId)

    return Response.json({ draft, truncated: message.stop_reason === 'max_tokens' })
  } catch (err: unknown) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('[consult/draft] auth', err.message)
      return Response.json({ error: 'AI drafting is not configured (ANTHROPIC_API_KEY)' }, { status: 503 })
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'AI drafting is busy — try again in a minute' }, { status: 429 })
    }
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[consult/draft]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
