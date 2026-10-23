// ─── VOICE COPILOT: REALTIME CLIENT (BROWSER) ───────────────────────────────
// WebRTC session with OpenAI Realtime using a short-lived client secret from
// /api/consult/voice/session. Audio flows browser ↔ OpenAI directly; events
// (tool calls, transcripts) flow over the "oai-events" data channel.
//
// Push-to-talk: server VAD is off; the mic track is enabled only while the
// button is held, and release commits the turn. Hands-free: server VAD on, mic
// always live. Pressing talk while the assistant speaks cuts it off (barge-in).

import { turnDetection, type VoiceMode } from './tools'

export type VoiceState = 'off' | 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error'

export interface RealtimeHandlers {
  onState:      (s: VoiceState) => void
  onTranscript: (who: 'you' | 'assistant', text: string) => void
  onToolCall:   (name: string, args: string) => Promise<string>
  onError:      (message: string) => void
}

const IDLE_LIMIT_MS = 10 * 60_000   // hang up after 10 quiet minutes so a forgotten session stops billing
const PTT_TAIL_MS = 250             // keep the mic open briefly after release so the last word isn't clipped

type Evt = { type: string; [k: string]: unknown }
type OutputItem = { type: string; name?: string; call_id?: string; arguments?: string }

export class RealtimeVoice {
  private pc: RTCPeerConnection | null = null
  private dc: RTCDataChannel | null = null
  private mic: MediaStreamTrack | null = null
  private audio: HTMLAudioElement | null = null
  private mode: VoiceMode = 'ptt'
  private speaking = false
  private holding = false
  private idleTimer: ReturnType<typeof setTimeout> | null = null
  private state: VoiceState = 'off'

  constructor(private h: RealtimeHandlers) {}

  private set(s: VoiceState) { this.state = s; this.h.onState(s) }
  get current(): VoiceState { return this.state }

  async connect(engagementId: string, mode: VoiceMode): Promise<void> {
    if (this.pc) return
    this.mode = mode
    this.set('connecting')
    try {
      const res = await fetch('/api/consult/voice/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagementId, mode }),
      })
      const tok = await res.json().catch(() => ({})) as { value?: string; model?: string; error?: string }
      if (!res.ok || !tok.value) throw new Error(tok.error ?? `Voice unavailable (${res.status})`)

      const pc = new RTCPeerConnection()
      this.pc = pc
      this.audio = new Audio()
      this.audio.autoplay = true
      pc.ontrack = e => { if (this.audio) this.audio.srcObject = e.streams[0] }
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          this.h.onError('Voice connection dropped. Tap the mic to reconnect; taps still work offline.')
          this.disconnect()
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      })
      this.mic = stream.getAudioTracks()[0]
      this.mic.enabled = mode === 'handsfree'
      pc.addTrack(this.mic, stream)

      const dc = pc.createDataChannel('oai-events')
      this.dc = dc
      dc.onmessage = m => { void this.onEvent(JSON.parse(m.data) as Evt) }
      dc.onopen = () => { this.set(mode === 'handsfree' ? 'listening' : 'ready'); this.touch() }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      const sdp = await fetch(`https://api.openai.com/v1/realtime/calls${tok.model ? `?model=${encodeURIComponent(tok.model)}` : ''}`, {
        method: 'POST', body: offer.sdp,
        headers: { Authorization: `Bearer ${tok.value}`, 'Content-Type': 'application/sdp' },
      })
      if (!sdp.ok) throw new Error(`Voice connection refused (${sdp.status})`)
      await pc.setRemoteDescription({ type: 'answer', sdp: await sdp.text() })
    } catch (e) {
      this.disconnect()
      this.set('error')
      const msg = e instanceof Error ? e.message : 'Voice failed to start'
      this.h.onError(/Permission|NotAllowed/i.test(msg) ? 'Microphone access was blocked. Allow it in the browser settings.' : msg)
    }
  }

  disconnect(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = null
    try { this.dc?.close() } catch {}
    try { this.mic?.stop() } catch {}
    try { this.pc?.close() } catch {}
    if (this.audio) this.audio.srcObject = null
    this.pc = null; this.dc = null; this.mic = null; this.audio = null
    this.speaking = false; this.holding = false
    if (this.state !== 'error') this.set('off')
  }

  private send(evt: Record<string, unknown>) {
    if (this.dc?.readyState === 'open') this.dc.send(JSON.stringify(evt))
  }

  private touch() {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(() => {
      this.h.onError('Voice hung up after 10 quiet minutes. Tap the mic to start again.')
      this.disconnect()
    }, IDLE_LIMIT_MS)
  }

  /** Cut off the assistant mid-sentence. */
  private bargeIn() {
    if (!this.speaking) return
    this.send({ type: 'response.cancel' })
    this.send({ type: 'output_audio_buffer.clear' })
    this.speaking = false
  }

  pressTalk(): void {
    if (!this.mic || this.mode !== 'ptt' || this.holding) return
    this.holding = true
    this.bargeIn()
    this.send({ type: 'input_audio_buffer.clear' })
    this.mic.enabled = true
    this.set('listening')
    this.touch()
  }

  releaseTalk(): void {
    if (!this.mic || this.mode !== 'ptt' || !this.holding) return
    this.holding = false
    setTimeout(() => {
      if (this.mic && !this.holding) this.mic.enabled = false
      // response.create is sent on input_audio_buffer.committed, so an empty tap never triggers a reply.
      this.send({ type: 'input_audio_buffer.commit' })
      this.set('thinking')
    }, PTT_TAIL_MS)
  }

  setMode(mode: VoiceMode): void {
    this.mode = mode
    this.send({ type: 'session.update', session: { type: 'realtime', audio: { input: { turn_detection: turnDetection(mode) } } } })
    if (this.mic) this.mic.enabled = mode === 'handsfree'
    if (this.pc) this.set(mode === 'handsfree' ? 'listening' : 'ready')
  }

  private idle(): VoiceState { return this.mode === 'handsfree' ? 'listening' : 'ready' }

  private async onEvent(e: Evt): Promise<void> {
    this.touch()
    switch (e.type) {
      case 'input_audio_buffer.speech_started':
        if (this.mode === 'handsfree') { this.bargeIn(); this.set('listening') }
        break
      case 'input_audio_buffer.speech_stopped':
        if (this.mode === 'handsfree') this.set('thinking')
        break
      case 'input_audio_buffer.committed':
        if (this.mode === 'ptt') this.send({ type: 'response.create' })
        break
      case 'conversation.item.input_audio_transcription.completed':
        if (typeof e.transcript === 'string' && e.transcript.trim()) this.h.onTranscript('you', e.transcript.trim())
        break
      case 'response.output_audio_transcript.done':
      case 'response.audio_transcript.done':
        if (typeof e.transcript === 'string' && e.transcript.trim()) this.h.onTranscript('assistant', e.transcript.trim())
        break
      case 'output_audio_buffer.started':
        this.speaking = true
        this.set('speaking')
        break
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared':
        this.speaking = false
        if (!this.holding) this.set(this.idle())
        break
      case 'response.done': {
        const output = ((e.response as { output?: OutputItem[] })?.output ?? []).filter(o => o.type === 'function_call')
        if (!output.length) { if (!this.speaking && !this.holding) this.set(this.idle()); break }
        this.set('thinking')
        // Run calls in order (later calls may use ids from earlier ones), then one follow-up response.
        for (const call of output) {
          const result = await this.h.onToolCall(call.name ?? '', call.arguments ?? '{}')
          this.send({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: call.call_id, output: result } })
        }
        this.send({ type: 'response.create' })
        break
      }
      case 'error': {
        const err = e.error as { code?: string; message?: string } | undefined
        // A tap too short to contain audio isn't worth surfacing.
        if (err?.code === 'input_audio_buffer_commit_empty') { this.set(this.idle()); break }
        this.h.onError(err?.message ?? 'Voice error')
        break
      }
    }
  }
}
