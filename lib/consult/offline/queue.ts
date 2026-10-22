// ─── OFFLINE WRITE QUEUE ────────────────────────────────────────────────────
// Field writes (walkthrough taps, observations, photos) go through perform().
// Online with an empty queue → straight to Supabase. Offline, or if anything
// is already queued → appended to IndexedDB and replayed in order when the
// connection returns. Every op is idempotent (upserts keyed by client-made
// ids), so a replay after a half-finished flush is safe.

import { createClient } from '@/lib/supabase/client'
import { idbAdd, idbAll, idbCount, idbDelete } from './idb'

export const CONSULT_BUCKET = 'spd-consult'

export type Op =
  | { kind: 'response.set';   row: Record<string, unknown> }
  | { kind: 'response.clear'; engagementId: string; itemId: string }
  | { kind: 'observation.upsert'; row: Record<string, unknown> }
  | { kind: 'observation.update'; id: string; patch: Record<string, unknown> }
  | { kind: 'observation.delete'; id: string; paths: string[] }
  | { kind: 'photo.upload'; path: string; blob: Blob; contentType: string; row: Record<string, unknown> }
  | { kind: 'photo.delete'; id: string; path: string }

type Stored = Op & { seq?: number }

export interface SyncState { pending: number; syncing: boolean; online: boolean; lastError: string | null }

let state: SyncState = { pending: 0, syncing: false, online: true, lastError: null }
const listeners = new Set<(s: SyncState) => void>()

function emit(patch: Partial<SyncState>) {
  state = { ...state, ...patch }
  for (const l of listeners) l(state)
}

export function subscribeSync(fn: (s: SyncState) => void): () => void {
  listeners.add(fn)
  fn(state)
  return () => { listeners.delete(fn) }
}

export function isNetworkError(e: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true
  const msg = e instanceof Error ? e.message : String((e as { message?: unknown })?.message ?? e)
  return /failed to fetch|load failed|networkerror|network request failed|fetch failed|timed? ?out/i.test(msg)
}

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

async function run(op: Op): Promise<void> {
  const supabase = createClient()
  switch (op.kind) {
    case 'response.set':
      return fail((await supabase.from('consult_responses').upsert(op.row)).error)
    case 'response.clear':
      return fail((await supabase.from('consult_responses').delete().match({ engagement_id: op.engagementId, item_id: op.itemId })).error)
    case 'observation.upsert':
      return fail((await supabase.from('consult_observations').upsert(op.row)).error)
    case 'observation.update':
      return fail((await supabase.from('consult_observations').update(op.patch).eq('id', op.id)).error)
    case 'observation.delete':
      if (op.paths.length) await supabase.storage.from(CONSULT_BUCKET).remove(op.paths)
      return fail((await supabase.from('consult_observations').delete().eq('id', op.id)).error)
    case 'photo.upload': {
      const up = await supabase.storage.from(CONSULT_BUCKET)
        .upload(op.path, op.blob, { contentType: op.contentType, upsert: true })
      fail(up.error)
      return fail((await supabase.from('consult_photos').upsert(op.row)).error)
    }
    case 'photo.delete':
      await supabase.storage.from(CONSULT_BUCKET).remove([op.path])
      return fail((await supabase.from('consult_photos').delete().eq('id', op.id)).error)
  }
}

/**
 * Apply a write now if possible, otherwise queue it. Resolves once the write
 * is either saved or safely queued; rejects only for real (non-network)
 * failures such as RLS or validation errors.
 */
export async function perform(op: Op): Promise<'saved' | 'queued'> {
  const pending = await idbCount().catch(() => 0)
  if (!pending) {
    try {
      await run(op)
      return 'saved'
    } catch (e) {
      if (!isNetworkError(e)) throw e
    }
  }
  await idbAdd(op)
  const online = typeof navigator === 'undefined' || navigator.onLine
  emit({ pending: pending + 1, online })
  // Queued only because older writes are still waiting: push them all now.
  if (online) void flush()
  return 'queued'
}

let flushing: Promise<void> | null = null

/** Replay queued writes in capture order. Stops at the first network failure. */
export function flush(): Promise<void> {
  if (flushing) return flushing
  flushing = (async () => {
    let ops: Stored[]
    try { ops = await idbAll<Stored>() } catch { return }
    if (!ops.length) { emit({ pending: 0, online: true }); return }
    emit({ syncing: true, pending: ops.length })
    for (const op of ops) {
      try {
        await run(op)
      } catch (e) {
        if (isNetworkError(e)) { emit({ syncing: false, online: false }); return }
        // A real rejection (e.g. the engagement was deleted elsewhere) will
        // never succeed; drop it so it can't block everything queued behind it.
        emit({ lastError: e instanceof Error ? e.message : 'A queued change could not be saved' })
      }
      await idbDelete(op.seq!)
      emit({ pending: Math.max(0, state.pending - 1) })
    }
    emit({ syncing: false, online: true, pending: 0 })
  })().finally(() => { flushing = null })
  return flushing
}

let started = false

/** Wire up automatic replay. Safe to call from every page that writes. */
export function startSync(): void {
  if (started || typeof window === 'undefined') return
  started = true
  emit({ online: navigator.onLine })
  window.addEventListener('online', () => { emit({ online: true }); void flush() })
  window.addEventListener('offline', () => emit({ online: false }))
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void flush() })
  setInterval(() => { if (state.pending) void flush() }, 30_000)
  void flush()
}

export function dismissSyncError(): void {
  emit({ lastError: null })
}
