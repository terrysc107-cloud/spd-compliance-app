'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { tokens } from '@/lib/constants/design-tokens'
import { RealtimeVoice, type VoiceState } from '@/lib/consult/voice/realtime'
import { VoiceExecutor, type FeedEntry, type VoiceHost } from '@/lib/consult/voice/executor'
import { uploadPhoto } from '@/lib/consult/db/observations'
import type { VoiceMode } from '@/lib/consult/voice/tools'
import type { Observation, Photo } from '@/lib/consult/types'

const MODE_KEY = 'spd-consult-voice-mode'

const STATE_LABEL: Record<VoiceState, string> = {
  off: 'Voice off', connecting: 'Connecting…', ready: 'Hold to talk', listening: 'Listening…',
  thinking: 'Working…', speaking: 'Speaking', error: 'Voice unavailable',
}
const STATE_COLOR: Record<VoiceState, string> = {
  off: '#64748b', connecting: '#eab308', ready: '#3b82f6', listening: '#ef4444',
  thinking: '#a78bfa', speaking: '#22c55e', error: '#ef4444',
}

const MicIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
  </svg>
)

/**
 * Floating voice copilot for an engagement. The page supplies live getters
 * and setters (host); this component owns the WebRTC session, the activity
 * feed with per-entry undo, and the camera prompt the model can raise.
 */
export default function VoiceDock({ engagementId, host }: {
  engagementId: string
  host: Omit<VoiceHost, 'requestPhoto'>
}) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<VoiceState>('off')
  const [mode, setMode] = useState<VoiceMode>('ptt')
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const [photoFor, setPhotoFor] = useState<Observation | null>(null)
  const [uploading, setUploading] = useState(false)
  const [online, setOnline] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const feedEnd = useRef<HTMLDivElement>(null)

  const push = useCallback((e: FeedEntry) => setFeed(f => [...f.slice(-80), e]), [])
  const err = useCallback((text: string) => push({ id: crypto.randomUUID(), at: Date.now(), text, kind: 'error' }), [push])

  // The host object changes every render; the executor reads it through a ref.
  const hostRef = useRef(host)
  hostRef.current = host
  const executor = useMemo(() => new VoiceExecutor(
    {
      engagement: () => hostRef.current.engagement(), areas: () => hostRef.current.areas(),
      responses: () => hostRef.current.responses(), setResponses: fn => hostRef.current.setResponses(fn),
      observations: () => hostRef.current.observations(), setObservations: fn => hostRef.current.setObservations(fn),
      audits: () => hostRef.current.audits(), setAudits: fn => hostRef.current.setAudits(fn),
      samples: () => hostRef.current.samples(), setSamples: fn => hostRef.current.setSamples(fn),
      patchEngagement: u => hostRef.current.patchEngagement(u),
      navigate: (t, a) => hostRef.current.navigate(t, a),
      requestPhoto: obs => setPhotoFor(obs),
    },
    push,
    id => setFeed(f => f.map(x => (x.id === id ? { ...x, undone: true } : x))),
  ), [push])

  const voice = useMemo(() => new RealtimeVoice({
    onState: setState,
    onTranscript: (who, text) => push({ id: crypto.randomUUID(), at: Date.now(), text, kind: who }),
    onToolCall: (name, args) => executor.run(name, args),
    onError: err,
  }), [executor, push, err])

  useEffect(() => {
    try { const m = localStorage.getItem(MODE_KEY); if (m === 'handsfree' || m === 'ptt') setMode(m) } catch {}
    setOnline(navigator.onLine)
    const on = () => setOnline(true), off = () => setOnline(false)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); voice.disconnect() }
  }, [voice])

  useEffect(() => { feedEnd.current?.scrollIntoView({ block: 'end' }) }, [feed.length])

  // Spacebar = push-to-talk, unless typing in a field.
  useEffect(() => {
    if (!open) return
    const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
    const down = (e: KeyboardEvent) => { if (e.code === 'Space' && !e.repeat && !typing(e.target) && mode === 'ptt') { e.preventDefault(); voice.pressTalk() } }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space' && !typing(e.target) && mode === 'ptt') { e.preventDefault(); voice.releaseTalk() } }
    window.addEventListener('keydown', down); window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [open, mode, voice])

  const connected = state !== 'off' && state !== 'error' && state !== 'connecting'

  function start() {
    setOpen(true)
    if (!online) return err('Voice needs a connection. Taps and typing still save offline.')
    void voice.connect(engagementId, mode)
  }

  function switchMode(m: VoiceMode) {
    setMode(m)
    try { localStorage.setItem(MODE_KEY, m) } catch {}
    if (connected) voice.setMode(m)
  }

  async function onPhoto(files: FileList | null) {
    if (!files?.length || !photoFor) return
    setUploading(true)
    try {
      const added: Photo[] = []
      for (const f of Array.from(files)) added.push(await uploadPhoto(photoFor, f))
      const id = photoFor.id
      host.setObservations(list => list.map(o => (o.id === id ? { ...o, photos: [...(o.photos ?? []), ...added] } : o)))
      push({ id: crypto.randomUUID(), at: Date.now(), text: `Photo added to “${photoFor.title}”`, kind: 'write' })
      setPhotoFor(null)
    } catch (e) { err(e instanceof Error ? e.message : 'Photo failed') } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  if (!open) return (
    <button onClick={start} aria-label="Open voice assistant" style={{
      position: 'fixed', right: 24, bottom: 90, zIndex: 40, width: 58, height: 58, borderRadius: 29,
      border: 'none', cursor: 'pointer', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
      background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}><MicIcon /></button>
  )

  const talkActive = state === 'listening'
  return (
    <div role="region" aria-label="Voice assistant" style={{
      position: 'fixed', right: 16, bottom: 76, zIndex: 40, width: 'min(380px, calc(100vw - 32px))', maxHeight: 'min(600px, calc(100vh - 96px))',
      display: 'flex', flexDirection: 'column', background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.lg, boxShadow: '0 16px 48px rgba(0,0,0,0.55)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: `1px solid ${tokens.color.border}` }}>
        <span style={{ width: 9, height: 9, borderRadius: 5, background: STATE_COLOR[state], boxShadow: talkActive ? `0 0 0 4px ${STATE_COLOR[state]}33` : 'none' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: tokens.color.textPrimary, flex: 1 }}>{mode === 'handsfree' && state === 'ready' ? 'Listening…' : STATE_LABEL[state]}</span>
        <div style={{ display: 'flex', border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.pill, overflow: 'hidden' }}>
          {(['ptt', 'handsfree'] as VoiceMode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              padding: '4px 10px', fontSize: 11.5, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: mode === m ? tokens.color.accentBlue : 'transparent', color: mode === m ? '#fff' : tokens.color.textMuted,
            }}>{m === 'ptt' ? 'Tap to talk' : 'Hands-free'}</button>
          ))}
        </div>
        <button aria-label="Close voice" onClick={() => { voice.disconnect(); setOpen(false) }} style={{ background: 'none', border: 'none', color: tokens.color.textMuted, fontSize: 18, cursor: 'pointer' }}>×</button>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', minHeight: 140 }}>
        {!feed.length && (
          <div style={{ fontSize: 12.5, color: tokens.color.textDimmed, lineHeight: 1.6 }}>
            Try: “Decon, PPE not met — two techs without face shields. Make that a critical finding.” · “Start a steam load audit for that.” ·
            “Sterilizer two load four, everything good except no sign-off.” · “What&apos;s left in sterilization?” · “Undo.”
          </div>
        )}
        {feed.map(f => (
          <div key={f.id} style={{
            display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7, fontSize: 12.5, lineHeight: 1.45,
            opacity: f.undone ? 0.45 : 1, textDecoration: f.undone ? 'line-through' : 'none',
            color: f.kind === 'you' ? '#e2e8f0' : f.kind === 'assistant' ? '#a5b4fc' : f.kind === 'error' ? '#fca5a5' : f.kind === 'write' ? '#86efac' : tokens.color.textMuted,
          }}>
            <span style={{ flexShrink: 0, width: 16 }}>{f.kind === 'you' ? '🗣' : f.kind === 'assistant' ? '🤖' : f.kind === 'write' ? '✓' : f.kind === 'error' ? '!' : f.kind === 'undo' ? '↶' : '·'}</span>
            <span style={{ flex: 1 }}>{f.text}</span>
            {f.kind === 'write' && !f.undone && executor.canUndo(f.id) && (
              <button onClick={() => void executor.undo(f.id).catch(e => err(e instanceof Error ? e.message : 'Undo failed'))}
                style={{ flexShrink: 0, background: 'none', border: `1px solid ${tokens.color.border}`, borderRadius: 6, color: tokens.color.textMuted, fontSize: 11, padding: '1px 7px', cursor: 'pointer' }}>Undo</button>
            )}
          </div>
        ))}
        <div ref={feedEnd} />
      </div>

      {/* Camera prompt raised by the model */}
      {photoFor && (
        <div style={{ margin: '0 14px 10px', padding: 10, borderRadius: tokens.radius.sm, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.35)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ flex: 1, fontSize: 12.5, color: '#bfdbfe' }}>Photo for “{photoFor.title}”</span>
          <button disabled={uploading} onClick={() => fileRef.current?.click()} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: tokens.color.accentBlue, color: '#fff', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>
            {uploading ? 'Saving…' : '📷 Take photo'}
          </button>
          <button aria-label="Dismiss" onClick={() => setPhotoFor(null)} style={{ background: 'none', border: 'none', color: tokens.color.textMuted, cursor: 'pointer' }}>×</button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={e => void onPhoto(e.target.files)} />
        </div>
      )}

      {/* Controls */}
      <div style={{ padding: 14, borderTop: `1px solid ${tokens.color.border}` }}>
        {!online && <div style={{ fontSize: 12, color: tokens.color.warning, marginBottom: 8 }}>Offline: voice paused. Taps still save on this device.</div>}
        {!connected ? (
          <button onClick={start} disabled={state === 'connecting'} style={bigBtn(tokens.color.accentBlue)}>
            <MicIcon /> {state === 'connecting' ? 'Connecting…' : state === 'error' ? 'Retry voice' : 'Start voice'}
          </button>
        ) : mode === 'ptt' ? (
          <button
            onPointerDown={e => { e.preventDefault(); (e.target as HTMLElement).setPointerCapture?.(e.pointerId); voice.pressTalk() }}
            onPointerUp={() => voice.releaseTalk()} onPointerCancel={() => voice.releaseTalk()}
            onContextMenu={e => e.preventDefault()}
            style={{ ...bigBtn(talkActive ? '#ef4444' : tokens.color.accentBlue), touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
            <MicIcon /> {talkActive ? 'Release to send' : 'Hold to talk (or Space)'}
          </button>
        ) : (
          <button onClick={() => { voice.disconnect() }} style={bigBtn('#334155')}>Stop listening</button>
        )}
        <div style={{ fontSize: 10.5, color: tokens.color.textDimmed, marginTop: 8, textAlign: 'center' }}>
          Voice edits are flagged for review. Don&apos;t say patient names. Audio isn&apos;t stored by this app.
        </div>
      </div>
    </div>
  )
}

function bigBtn(bg: string): React.CSSProperties {
  return {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 14px',
    borderRadius: 14, border: 'none', cursor: 'pointer', background: bg, color: '#fff', fontSize: 15, fontWeight: 700,
    transition: 'background 0.12s',
  }
}
