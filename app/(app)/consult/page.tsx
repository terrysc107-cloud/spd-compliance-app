'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageShell from '@/components/layout/PageShell'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { listEngagements } from '@/lib/consult/db/engagements'
import { listClients } from '@/lib/consult/db/clients'
import { listLibrary } from '@/lib/consult/db/library'
import { STATUS_LABEL } from '@/lib/consult/framework'
import { ErrorNote, Empty, errMsg, grid } from '@/components/consult/fields'
import EngagementList, { STATUS_COLOR } from '@/components/consult/EngagementList'
import type { Engagement, EngagementStatus } from '@/lib/consult/types'

const STAGES: EngagementStatus[] = ['planned', 'on-site', 'drafting', 'delivered']

export default function ConsultHomePage() {
  const [engagements, setEngagements] = useState<Engagement[] | null>(null)
  const [clientCount, setClientCount] = useState(0)
  const [libraryCount, setLibraryCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listEngagements(), listClients(), listLibrary()])
      .then(([e, c, l]) => { setEngagements(e); setClientCount(c.length); setLibraryCount(l.length) })
      .catch(e => { setError(errMsg(e)); setEngagements([]) })
  }, [])

  const active = (engagements ?? []).filter(e => e.status !== 'delivered')
  const delivered = (engagements ?? []).filter(e => e.status === 'delivered')

  return (
    <PageShell
      title="Consulting Workspace"
      description="Document site visits, assess against AAMI/AORN/CMS standards, and deliver client-ready reports."
      actions={<Button href="/consult/engagements/new">+ New engagement</Button>}
    >
      <ErrorNote message={error} onDismiss={() => setError(null)} />

      <div style={{ ...grid(180), marginBottom: 24 }}>
        {STAGES.map(s => (
          <Card key={s} padding="md">
            <div style={{ fontSize: 12, color: tokens.color.textMuted, fontWeight: 600 }}>{STATUS_LABEL[s]}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: STATUS_COLOR[s], marginTop: 4 }}>
              {(engagements ?? []).filter(e => e.status === s).length}
            </div>
          </Card>
        ))}
        <Link href="/consult/clients" style={{ textDecoration: 'none' }}>
          <Card padding="md" hoverable>
            <div style={{ fontSize: 12, color: tokens.color.textMuted, fontWeight: 600 }}>Clients</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: tokens.color.textPrimary, marginTop: 4 }}>{clientCount}</div>
          </Card>
        </Link>
        <Link href="/consult/library" style={{ textDecoration: 'none' }}>
          <Card padding="md" hoverable>
            <div style={{ fontSize: 12, color: tokens.color.textMuted, fontWeight: 600 }}>My library entries</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: tokens.color.accentPurple, marginTop: 4 }}>{libraryCount}</div>
          </Card>
        </Link>
      </div>

      <h2 style={sectionTitle}>Active engagements</h2>
      {engagements === null ? (
        <div style={{ color: tokens.color.textMuted, fontSize: 14 }}>Loading…</div>
      ) : !active.length ? (
        <Card><Empty
          title="No active engagements"
          body="Start with a client, then open an engagement for your next site visit."
          action={<Button href="/consult/engagements/new">Start an engagement</Button>}
        /></Card>
      ) : (
        <EngagementList items={active} />
      )}

      {delivered.length > 0 && (
        <>
          <h2 style={{ ...sectionTitle, marginTop: 28 }}>Delivered</h2>
          <EngagementList items={delivered} />
        </>
      )}
    </PageShell>
  )
}

const sectionTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: tokens.color.textPrimary, margin: '0 0 12px' }
