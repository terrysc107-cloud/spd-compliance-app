// ─── CONSULT IDENTITY (OFFLINE-SAFE) ────────────────────────────────────────
// Writes need the caller's profile + org id. Offline we can't ask Supabase, so
// the last known identity is cached on the device.

import { getMyProfile } from '@/lib/db/org'

export interface ConsultIdentity { userId: string; orgId: string }

const KEY = 'spd-consult-identity'
let cached: ConsultIdentity | null = null

export async function consultIdentity(): Promise<ConsultIdentity> {
  if (cached) return cached
  try {
    const p = await getMyProfile()
    if (p?.orgId) {
      cached = { userId: p.id, orgId: p.orgId }
      try { localStorage.setItem(KEY, JSON.stringify(cached)) } catch {}
      return cached
    }
  } catch {}
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const v = JSON.parse(raw) as ConsultIdentity
      if (v?.userId && v?.orgId) return (cached = v)
    }
  } catch {}
  throw new Error('No profile/org — sign in again while online')
}
