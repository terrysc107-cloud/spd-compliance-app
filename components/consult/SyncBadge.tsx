'use client'

import { useEffect, useState } from 'react'
import { tokens } from '@/lib/constants/design-tokens'
import { dismissSyncError, flush, startSync, subscribeSync, type SyncState } from '@/lib/consult/offline/queue'

/** "All saved" / "Offline — 4 changes saved on this device" / "Syncing…". */
export default function SyncBadge() {
  const [s, setS] = useState<SyncState | null>(null)

  useEffect(() => {
    startSync()
    return subscribeSync(setS)
  }, [])

  if (!s) return null

  const color = s.lastError ? tokens.color.danger
    : s.pending ? (s.online ? tokens.color.accentBlue : tokens.color.warning)
    : tokens.color.success
  const text = s.lastError ? 'A change was rejected'
    : s.syncing ? `Syncing ${s.pending}…`
    : s.pending ? `${s.online ? '' : 'Offline · '}${s.pending} change${s.pending === 1 ? '' : 's'} saved on this device`
    : s.online ? 'All changes saved' : 'Offline'

  return (
    <span
      role="status"
      title={s.lastError ?? (s.pending ? 'Changes will upload automatically when the connection returns.' : undefined)}
      onClick={() => (s.lastError ? dismissSyncError() : s.pending ? void flush() : undefined)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color,
        cursor: s.lastError || s.pending ? 'pointer' : 'default', whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
      {text}
    </span>
  )
}
