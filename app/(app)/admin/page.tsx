'use client'

import { useEffect, useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getMyEmail, listAllOrgs, updateSubscription } from '@/lib/db/org'
import type { OrgInfo, SubscriptionStatus } from '@/lib/db/types'

const OWNER_EMAIL = 'terrysc107@gmail.com'
const STATUSES: SubscriptionStatus[] = ['trial', 'active', 'past_due', 'canceled']

const selectStyle: React.CSSProperties = {
  background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm, color: tokens.color.textPrimary,
  fontSize: 13, padding: '7px 10px', outline: 'none',
}

export default function AdminPage() {
  const [email, setEmail]   = useState<string | null>(null)
  const [orgs, setOrgs]     = useState<OrgInfo[]>([])
  const [loaded, setLoaded] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId]   = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const e = await getMyEmail()
      setEmail(e)
      if (e === OWNER_EMAIL) setOrgs(await listAllOrgs())
      setLoaded(true)
    })().catch(() => setLoaded(true))
  }, [])

  function patchLocal(id: string, patch: Partial<OrgInfo>) {
    setOrgs(prev => prev.map(o => (o.id === id ? { ...o, ...patch } : o)))
    setSavedId(null)
  }

  async function save(org: OrgInfo) {
    setSavingId(org.id)
    const { error } = await updateSubscription(org.id, {
      subscription_status: org.subscriptionStatus,
      plan: org.plan,
      subscription_renews_at: org.subscriptionRenewsAt,
    })
    setSavingId(null)
    if (!error) { setSavedId(org.id); setTimeout(() => setSavedId(null), 2000) }
  }

  if (!loaded) return <PageShell title="Admin"><p style={{ color: tokens.color.textMuted }}>Loading…</p></PageShell>

  if (email !== OWNER_EMAIL) {
    return (
      <PageShell title="Admin">
        <Card padding="lg">
          <p style={{ color: tokens.color.textMuted, margin: 0 }}>
            This area is restricted to the platform owner.
          </p>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell title="Subscriptions" description="Manual / sales-led billing. Toggle each facility's plan after closing the annual deal.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {orgs.length === 0 && (
          <Card padding="lg"><p style={{ color: tokens.color.textMuted, margin: 0 }}>No organizations yet.</p></Card>
        )}
        {orgs.map(org => (
          <Card key={org.id} padding="md">
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: tokens.color.textPrimary }}>{org.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: tokens.color.textDimmed }}>{org.id}</p>
              </div>

              <label style={{ fontSize: 11, color: tokens.color.textDimmed }}>
                Status
                <select
                  style={{ ...selectStyle, display: 'block', marginTop: 4 }}
                  value={org.subscriptionStatus}
                  onChange={e => patchLocal(org.id, { subscriptionStatus: e.target.value as SubscriptionStatus })}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>

              <label style={{ fontSize: 11, color: tokens.color.textDimmed }}>
                Plan
                <input
                  style={{ ...selectStyle, display: 'block', marginTop: 4, width: 130 }}
                  value={org.plan ?? ''}
                  placeholder="e.g. ASC Annual"
                  onChange={e => patchLocal(org.id, { plan: e.target.value || null })}
                />
              </label>

              <label style={{ fontSize: 11, color: tokens.color.textDimmed }}>
                Renews
                <input
                  type="date"
                  style={{ ...selectStyle, display: 'block', marginTop: 4 }}
                  value={org.subscriptionRenewsAt ?? ''}
                  onChange={e => patchLocal(org.id, { subscriptionRenewsAt: e.target.value || null })}
                />
              </label>

              <Button size="sm" variant="primary" onClick={() => save(org)} disabled={savingId === org.id}>
                {savingId === org.id ? 'Saving…' : savedId === org.id ? 'Saved' : 'Save'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}
