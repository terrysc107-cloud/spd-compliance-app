import { createElement, type ReactElement } from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { loadReportBundle } from '@/lib/consult/report-data'
import { ConsultReport } from '@/lib/consult/pdf/ConsultReport'

export const runtime = 'nodejs'
export const maxDuration = 60

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// GET /api/consult/report-pdf?engagementId=… → the client-ready PDF.
export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const engagementId = new URL(req.url).searchParams.get('engagementId') ?? ''
    if (!UUID.test(engagementId)) return Response.json({ error: 'engagementId is required' }, { status: 400 })

    const bundle = await loadReportBundle(supabase, engagementId, { withPhotos: true })
    if (!bundle) return Response.json({ error: 'Engagement not found' }, { status: 404 })

    const element = createElement(ConsultReport, { bundle }) as ReactElement<DocumentProps>
    const buffer = await renderToBuffer(element)

    const slug = `${bundle.client.name}-${bundle.engagement.visitStart ?? 'report'}`
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slug || 'spd-assessment'}.pdf"`,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[consult/report-pdf]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
