'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { submitFeedback, type FeedbackCategory } from '@/lib/db/feedback'
import { tokens } from '@/lib/constants/design-tokens'

const CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: 'idea', label: '💡 Improvement' },
  { value: 'bug', label: '🐞 Bug' },
  { value: 'other', label: '💬 Other' },
]

export default function FeedbackWidget() {
  const pathname = usePathname()
  const [open, setOpen]         = useState(false)
  const [category, setCategory] = useState<FeedbackCategory>('idea')
  const [message, setMessage]   = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)

  async function send() {
    if (!message.trim() || sending) return
    setSending(true)
    const { error } = await submitFeedback({ message: message.trim(), category, page: pathname })
    setSending(false)
    if (!error) {
      setSent(true)
      setMessage('')
      setTimeout(() => { setSent(false); setOpen(false) }, 1800)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Send feedback"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 60,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 16px', borderRadius: 999,
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          boxShadow: '0 6px 24px rgba(0,0,0,0.4)',
        }}
      >
        💬 Feedback
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', bottom: 74, right: 20, zIndex: 60, width: 320,
            background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
            borderRadius: 12, padding: 18, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <strong style={{ color: tokens.color.textPrimary, fontSize: 14 }}>Help shape SPD Intel</strong>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: tokens.color.textDimmed, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>

          {sent ? (
            <p style={{ color: tokens.color.success, fontSize: 14, margin: '8px 0' }}>Thanks — got it! 🙌</p>
          ) : (
            <>
              <p style={{ color: tokens.color.textMuted, fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>
                This is a <strong style={{ color: tokens.color.textPrimary }}>beta</strong>. Tell us what to fix or add — every note goes straight to the team.
              </p>

              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    style={{
                      flex: 1, padding: '6px 4px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${category === c.value ? tokens.color.accentBlue : tokens.color.border}`,
                      background: category === c.value ? 'rgba(59,130,246,0.18)' : 'transparent',
                      color: category === c.value ? tokens.color.accentBlue : tokens.color.textMuted,
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder="What would make this better for your department?"
                style={{
                  width: '100%', boxSizing: 'border-box', background: tokens.color.bg,
                  border: `1px solid ${tokens.color.border}`, borderRadius: 8,
                  color: tokens.color.textPrimary, fontSize: 13, padding: '8px 10px',
                  outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5,
                }}
              />

              <button
                onClick={send}
                disabled={sending || !message.trim()}
                style={{
                  width: '100%', marginTop: 10, padding: '9px 0', borderRadius: 8, border: 'none',
                  background: message.trim() ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,0.06)',
                  color: message.trim() ? '#fff' : tokens.color.textDimmed,
                  fontSize: 13, fontWeight: 700, cursor: message.trim() && !sending ? 'pointer' : 'not-allowed',
                }}
              >
                {sending ? 'Sending…' : 'Send feedback'}
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
