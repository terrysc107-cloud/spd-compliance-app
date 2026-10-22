'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { createClientRecord, listClients } from '@/lib/consult/db/clients'
import { FACILITY_LABEL } from '@/lib/consult/framework'
import ClientForm from '@/components/consult/ClientForm'
import { ErrorNote, Empty, TextInput, errMsg, grid } from '@/components/consult/fields'
import type { Client } from '@/lib/consult/types'

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[] | null>(null)
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClients().then(setClients).catch(e => { setError(errMsg(e)); setClients([]) })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients ?? []
    return (clients ?? []).filter(c =>
      [c.name, c.city, c.state, c.contactName].some(v => v?.toLowerCase().includes(q)))
  }, [clients, query])

  return (
    <PageShell
      title="Clients"
      description="Facilities you consult for. Each client keeps its engagement history and score trend."
      actions={!adding && <Button onClick={() => setAdding(true)}>+ New client</Button>}
    >
      <ErrorNote message={error} onDismiss={() => setError(null)} />

      {adding && (
        <div style={{ marginBottom: 24 }}>
          <Card padding="lg">
            <h2 style={{ margin: '0 0 16px', fontSize: 16, color: tokens.color.textPrimary }}>New client</h2>
            <ClientForm
              submitLabel="Create client"
              onCancel={() => setAdding(false)}
              onSubmit={async input => {
                const c = await createClientRecord(input)
                router.push(`/consult/clients/${c.id}`)
              }}
            />
          </Card>
        </div>
      )}

      {(clients?.length ?? 0) > 6 && (
        <div style={{ maxWidth: 320, marginBottom: 16 }}>
          <TextInput placeholder="Search clients…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      )}

      {clients === null ? (
        <div style={{ color: tokens.color.textMuted, fontSize: 14 }}>Loading…</div>
      ) : !clients.length && !adding ? (
        <Card><Empty title="No clients yet" body="Add the first facility you're working with."
          action={<Button onClick={() => setAdding(true)}>Add a client</Button>} /></Card>
      ) : (
        <div style={grid(280)}>
          {filtered.map(c => (
            <Link key={c.id} href={`/consult/clients/${c.id}`} style={{ textDecoration: 'none' }}>
              <Card hoverable>
                <div style={{ fontSize: 15, fontWeight: 600, color: tokens.color.textPrimary }}>{c.name}</div>
                <div style={{ fontSize: 13, color: tokens.color.textMuted, marginTop: 4 }}>
                  {FACILITY_LABEL[c.facilityType]}{c.city || c.state ? ` · ${[c.city, c.state].filter(Boolean).join(', ')}` : ''}
                </div>
                {c.contactName && (
                  <div style={{ fontSize: 12, color: tokens.color.textDimmed, marginTop: 8 }}>
                    {c.contactName}{c.contactTitle ? `, ${c.contactTitle}` : ''}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
