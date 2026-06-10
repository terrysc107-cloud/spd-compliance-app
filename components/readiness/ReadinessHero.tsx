'use client'

import { tokens } from '@/lib/constants/design-tokens'
import { bandColor, bandLabel, type ReadinessResult } from '@/lib/readiness/engine'

export function ReadinessHero({ result, orgName }: { result: ReadinessResult; orgName?: string | null }) {
  const color = bandColor(result.band)

  const surveyText =
    result.daysToSurvey === null ? 'No survey date set'
    : result.daysToSurvey < 0    ? `Survey was ${Math.abs(result.daysToSurvey)}d ago`
    : result.daysToSurvey === 0  ? 'Survey is today'
    : `${result.daysToSurvey} days to survey`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap',
      background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.md, padding: '28px 32px',
    }}>
      {/* Score dial */}
      <div style={{ textAlign: 'center', minWidth: 150 }}>
        <div style={{ fontSize: 13, color: tokens.color.textMuted, marginBottom: 4 }}>
          {orgName ?? 'Survey Readiness'}
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, color }}>
          {result.assessed ? result.score : '—'}
          {result.assessed && <span style={{ fontSize: 28, fontWeight: 700 }}>%</span>}
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: tokens.radius.pill, background: `${color}1a`, border: `1px solid ${color}40`, fontSize: 13, fontWeight: 700, color }}>
            {result.assessed ? bandLabel(result.band) : 'Not Yet Assessed'}
          </span>
        </div>
      </div>

      {/* Headline + meta */}
      <div style={{ flex: 1, minWidth: 240 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: tokens.color.textPrimary }}>
          {result.assessed
            ? (result.band === 'ready' ? "You're survey-ready today" : result.band === 'at-risk' ? 'Readiness is at risk' : 'Not survey-ready today')
            : 'Run your first audit to see readiness'}
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: tokens.color.textMuted, lineHeight: 1.6 }}>
          {result.assessed
            ? `Based on ${result.auditCount} completed audit${result.auditCount !== 1 ? 's' : ''}. ${result.openCritical} critical and ${result.openMajor} major findings open${result.overdueCount ? `, ${result.overdueCount} corrective action${result.overdueCount !== 1 ? 's' : ''} overdue` : ''}.`
            : 'Complete an audit and a readiness score, factor breakdown, and trend will appear here.'}
        </p>

        <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
          <Meta label={surveyText} accent={result.daysToSurvey !== null && result.daysToSurvey <= 30 ? color : undefined} />
          <Meta label={`Confidence: ${result.confidence}`} />
        </div>
      </div>
    </div>
  )
}

function Meta({ label, accent }: { label: string; accent?: string }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 600,
      color: accent ?? tokens.color.textMuted,
      padding: '6px 12px', borderRadius: tokens.radius.sm,
      background: tokens.color.bg, border: `1px solid ${tokens.color.border}`,
    }}>
      {label}
    </div>
  )
}
