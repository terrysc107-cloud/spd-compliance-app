// ─── REPORT DATA GENERATOR ────────────────────────────────────────────────────
// Assembles structured report data from stored audits. No PDF/AI rendering here.

import { type StoredAudit } from '@/lib/storage/audit-storage'

export interface ReportData {
  title:            string
  generatedAt:      string
  dateRange:        { start: string; end: string }
  scope:            string
  auditCount:       number
  avgScore:         number
  criticalFindings: number
  majorFindings:    number
  openFindings:     number
  topFailingItems:  Array<{ question: string; failCount: number; section: string }>
  auditSummaries:   Array<{ id: string; name: string; date: string; score: number; status: string }>
}

const TITLES: Record<string, string> = {
  'audit-summary': 'Audit Summary Report',
  'gap-analysis':  'Gap Analysis Report',
  'trend':         'Trend & Compliance Report',
}

export function buildReportData(
  reportType: 'audit-summary' | 'gap-analysis' | 'trend',
  audits:     StoredAudit[],
  dateRange:  { start: Date; end: Date },
): ReportData {
  // Filter to completed audits within range
  const filtered = audits.filter(a => {
    if (a.status !== 'completed' || !a.completedAt) return false
    const d = new Date(a.completedAt)
    return d >= dateRange.start && d <= dateRange.end
  })

  const auditCount = filtered.length

  const avgScore = auditCount > 0
    ? Math.round(filtered.reduce((sum, a) => sum + (a.score ?? a.auditScore?.overall ?? 0), 0) / auditCount)
    : 0

  // Tally findings across all filtered audits
  let criticalFindings = 0, majorFindings = 0, openFindings = 0
  const failMap: Record<string, { failCount: number; section: string }> = {}

  filtered.forEach(a => {
    a.findings.forEach(f => {
      if (f.severity === 'critical') criticalFindings++
      else if (f.severity === 'major') majorFindings++
      if (f.status === 'open') openFindings++
      const key = f.question
      if (!failMap[key]) failMap[key] = { failCount: 0, section: f.sectionName }
      failMap[key].failCount++
    })
  })

  const topFailingItems = Object.entries(failMap)
    .map(([question, v]) => ({ question, ...v }))
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, 10)

  const auditSummaries = filtered.map(a => ({
    id:     a.id,
    name:   a.checklistName,
    date:   a.completedAt ?? a.startedAt,
    score:  a.score ?? a.auditScore?.overall ?? 0,
    status: a.auditScore?.status ?? (a.score !== undefined && a.score >= 90 ? 'pass' : 'fail'),
  }))

  return {
    title:       TITLES[reportType] ?? 'Compliance Report',
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: dateRange.start.toISOString(),
      end:   dateRange.end.toISOString(),
    },
    scope:            `${auditCount} completed audit${auditCount !== 1 ? 's' : ''}`,
    auditCount,
    avgScore,
    criticalFindings,
    majorFindings,
    openFindings,
    topFailingItems,
    auditSummaries,
  }
}
