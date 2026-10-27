import { createElement, type ReactElement } from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getAuditTemplate } from '@/lib/consult/audits/templates'
import { AuditForm, type AuditFormData } from '@/lib/consult/pdf/AuditForm'

export const runtime = 'nodejs'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// GET /api/consult/audit-form?auditId=… → blank paper form for the client's staff.
export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const auditId = new URL(req.url).searchParams.get('auditId') ?? ''
    if (!UUID.test(auditId)) return Response.json({ error: 'auditId is required' }, { status: 400 })

    const { data: audit } = await supabase
      .from('consult_audits')
      .select('id, template_id, title, items, sample_unit, target_per_day, engagement:consult_engagements(client:consult_clients(name))')
      .eq('id', auditId)
      .maybeSingle()
    if (!audit) return Response.json({ error: 'Audit not found' }, { status: 404 })

    const { data: settings } = await supabase
      .from('consult_settings').select('firm_name, consultant_name').eq('user_id', user.id).maybeSingle()

    const t = getAuditTemplate(audit.template_id)
    const engagement = audit.engagement as unknown as { client: { name: string } | null } | null
    const data: AuditFormData = {
      title: audit.title, purpose: t?.purpose ?? '', sampleUnit: audit.sample_unit,
      sampleHint: t?.sampleHint ?? '', targetPerDay: audit.target_per_day, refs: t?.refs ?? [],
      items: audit.items ?? [], clientName: engagement?.client?.name ?? '',
      firmName: settings?.firm_name ?? '', consultant: settings?.consultant_name ?? '',
      auditCode: audit.id.slice(0, 8).toUpperCase(),
    }

    const buffer = await renderToBuffer(createElement(AuditForm, { data }) as ReactElement<DocumentProps>)
    const slug = audit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${slug || 'audit'}-form.pdf"`,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[consult/audit-form]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
