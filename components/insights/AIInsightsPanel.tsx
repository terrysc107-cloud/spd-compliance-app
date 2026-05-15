'use client'

import { useEffect, useRef, useState } from 'react'
import { tokens } from '@/lib/constants/design-tokens'
import { loadAllAudits, buildTopFailItems, buildTrendData } from '@/lib/analytics/aggregator'

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface AIInsightsPanelProps {
  checklistName?: string
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function trendDirection(audits: ReturnType<typeof loadAllAudits>): 'improving' | 'declining' | 'stable' {
  const pts = buildTrendData(audits)
  if (pts.length < 6) return 'stable'
  const prev = pts.slice(-10, -5).reduce((s, p) => s + p.score, 0) / 5
  const last = pts.slice(-5).reduce((s, p) => s + p.score, 0) / 5
  const delta = last - prev
  if (delta >= 3)  return 'improving'
  if (delta <= -3) return 'declining'
  return 'stable'
}

function buildPrompt(
  totalAudits: number,
  avgScore:    number,
  topFails:    { question: string; failCount: number }[],
  trend:       string,
  scopeName?:  string
): string {
  const scope = scopeName ? `Checklist: ${scopeName}` : 'All checklists (org-wide)'
  const failsText = topFails
    .map((f, i) => `  ${i + 1}. "${f.question}" — failed ${f.failCount}× across audits`)
    .join('\n') || '  None recorded'

  return `You are an expert sterile processing quality consultant. Generate 3–5 concise, actionable quality insights for a department based on real audit data.

Scope: ${scope}
Total Completed Audits: ${totalAudits}
Average Compliance Score: ${avgScore}%
Score Trend: ${trend}

Top Failing Items:
${failsText}

Respond with numbered insights. Each insight should: name the problem, cite the data point, and recommend a specific corrective action tied to AAMI ST79, CMS CoP, or Joint Commission standards. Be direct and clinical. No filler.`
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'pulse 1.5s infinite' }}>
      {[90, 75, 85, 60].map((w, i) => (
        <div key={i} style={{ height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.07)', width: `${w}%` }} />
      ))}
    </div>
  )
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export function AIInsightsPanel({ checklistName }: AIInsightsPanelProps) {
  const [text,    setText]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const abortRef              = useRef<AbortController | null>(null)

  async function generate() {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setText('')
    setError(null)

    try {
      const all      = loadAllAudits()
      const completed = all.filter(a => a.status === 'completed' && (!checklistName || a.checklistName === checklistName))
      const avgScore = completed.length > 0
        ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
        : 0
      const topFails = buildTopFailItems(completed, 3)
      const trend    = trendDirection(all)
      const prompt   = buildPrompt(completed.length, avgScore, topFails, trend, checklistName)

      const res = await fetch('/api/generate-report', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ checklistData: { profile: prompt, sectionScores: '', gaps: '', gapCount: 0 } }),
        signal:  abortRef.current.signal,
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)

      const json = await res.json() as { report?: string; error?: string }
      if (json.error) throw new Error(json.error)

      setText(json.report ?? '')
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generate() }, [checklistName])  // eslint-disable-line react-hooks/exhaustive-deps

  const card: React.CSSProperties = {
    background:   tokens.color.surface,
    border:       `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    padding:      '24px',
  }

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: tokens.radius.sm, background: 'rgba(99,102,241,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tokens.color.accentIndigo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: tokens.color.textPrimary }}>AI Quality Insights</h3>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          style={{ padding: '6px 14px', borderRadius: tokens.radius.pill, border: `1px solid ${tokens.color.border}`, background: 'transparent', color: tokens.color.textMuted, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
        >
          {loading ? 'Generating…' : 'Regenerate'}
        </button>
      </div>

      {loading && <Skeleton />}

      {error && (
        <div style={{ color: tokens.color.danger, fontSize: 13, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: tokens.radius.sm }}>
          {error}
        </div>
      )}

      {!loading && !error && text && (
        <div style={{ fontSize: 14, color: tokens.color.textMuted, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
          {text}
        </div>
      )}

      {!loading && !error && !text && (
        <div style={{ color: tokens.color.textDimmed, fontSize: 14 }}>No insights generated yet.</div>
      )}
    </div>
  )
}
