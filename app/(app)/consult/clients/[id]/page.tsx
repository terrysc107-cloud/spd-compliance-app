'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { deleteClientRecord, getClient, updateClientRecord } from '@/lib/consult/db/clients'
import { getResponsesFor, listEngagements } from '@/lib/consult/db/engagements'
import { ENGAGEMENT_TYPE_LABEL, FACILITY_LABEL, STATUS_LABEL, scopedAreas } from '@/lib/consult/framework'
import { scoreColor, scoreEngagement } from '@/lib/consult/scoring'
import ClientForm from '@/components/consult/ClientForm'
import { STATUS_COLOR } from '@/components/consult/EngagementList'
import { ErrorNote, Empty, Pill, errMsg, fmtDay } from '@/components/consult/fields'
import type { Client, Engagement } from '@/lib/consult/types'

type Row = Engagement & { overall: number | null }

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [client, setClient] = useState<Client | null | undefined>(undefined)
  const [rows, setRows] = useState<Row[]>([])
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const [c, engagements] = await Promise.all([getClient(id), listEngagements(id)])
        setClient(c)
        const responses = await getResponsesFor(engagements.map(e => e.id))
        setRows(engagements.map(e => ({
          ...e,
          overall: scoreEngagement(scopedAreas(e.scopeAreas), responses[e.id] ?? {}, []).overall,
        })))
      } catch (e) { setError(errMsg(e)); setClient(null) }
    })()
  }, [id])

  if (client === undefined) return <PageShell title="Client"><div style={{ color: tokens.color.textMuted }}>Loading…</div></PageShell>
  if (client === null) return <PageShell title="Client not found"><ErrorNote message={error} /><Button href="/consult/clients" variant="secondary">Back to clients</Button></PageShell>

  // Oldest → newest for the trend strip.
  const trend = [...rows].filter(r => r.overall !== null).reverse()

  async function remove() {
    if (!confirm(`Delete ${client!.name} and all of its engagements, observations, and photos? This cannot be undone.`)) return
    try { await deleteClientRecord(id); router.push('/consult/clients') } catch (e) { setError(errMsg(e)) }
  }

  return (
    <PageShell
      title={client.name}
      description={`${FACILITY_LABEL[client.facilityType]}${client.city || client.state ? ` · ${[client.city, client.state].filter(Boolean).join(', ')}` : ''}`}
      actions={<>
        <Button variant="secondary" onClick={() => setEditing(v => !v)}>{editing ? 'Close' : 'Edit'}</Button>
        <Button href={`/consult/engagements/new?clientId=${id}`}>+ New engagement</Button>
      </>}
    >
      <ErrorNote message={error} onDismiss={() => setError(null)} />

      {editing ? (
        <div style={{ marginBottom: 24 }}>
          <Card padding="lg">
            <ClientForm initial={client} submitLabel="Save changes" onCancel={() => setEditing(false)}
              onSubmit={async input => {
                await updateClientRecord(id, input)
                setClient({ ...client, ...input })
                setEditing(false)
              }} />
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${tokens.color.border}` }}>
              <Button variant="danger" size="sm" onClick={remove}>Delete client</Button>
            </div>
          </Card>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 24 }}>
          <Card>
            <Info label="Primary contact" value={[client.contactName, client.contactTitle].filter(Boolean).join(', ')} />
            <Info label="Email" value={client.contactEmail} />
            <Info label="Phone" value={client.contactPhone} />
          </Card>
          <Card>
            <Info label="Licensed beds" value={client.bedCount?.toLocaleString()} />
            <Info label="Annual surgical cases" value={client.annualSurgicalCases?.toLocaleString()} />
            <Info label="Notes" value={client.notes} />
          </Card>
          <Card>
            <div style={{ fontSize: 12, fontWeight: 600, color: tokens.color.textMuted, marginBottom: 10 }}>Conformance trend</div>
            {trend.length ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 90 }}>
                {trend.map(r => (
                  <div key={r.id} title={`${r.title}: ${r.overall}%`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(r.overall) }}>{r.overall}%</span>
                    <div style={{ width: '100%', maxWidth: 36, height: `${Math.max(4, (r.overall ?? 0) * 0.6)}px`, background: scoreColor(r.overall), borderRadius: 4 }} />
                    <span style={{ fontSize: 10, color: tokens.color.textDimmed }}>{fmtDay(r.visitStart).replace(/, \d{4}$/, '')}</span>
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: 13, color: tokens.color.textDimmed }}>Scores appear after the first walkthrough.</div>}
          </Card>
        </div>
      )}

      <h2 style={{ fontSize: 15, fontWeight: 700, color: tokens.color.textPrimary, margin: '0 0 12px' }}>Engagements</h2>
      {!rows.length ? (
        <Card><Empty title="No engagements yet" action={<Button href={`/consult/engagements/new?clientId=${id}`}>Start the first one</Button>} /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(e => (
            <Link key={e.id} href={`/consult/engagements/${e.id}`} style={{ textDecoration: 'none' }}>
              <Card hoverable padding="md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: tokens.color.textPrimary }}>{e.title}</div>
                    <div style={{ fontSize: 13, color: tokens.color.textMuted, marginTop: 3 }}>{ENGAGEMENT_TYPE_LABEL[e.type]} · {fmtDay(e.visitStart)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {e.overall !== null && <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor(e.overall) }}>{e.overall}%</span>}
                    <Pill color={STATUS_COLOR[e.status]}>{STATUS_LABEL[e.status]}</Pill>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: tokens.color.textDimmed, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? tokens.color.textPrimary : tokens.color.textDimmed, marginTop: 2, whiteSpace: 'pre-wrap' }}>{value || '—'}</div>
    </div>
  )
}
