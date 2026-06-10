// ─── ANALYTICS AGGREGATOR ─────────────────────────────────────────────────────
// Pure chart-data builders over StoredAudit[]. Data now comes from Supabase
// (spd schema) via lib/db/audits.

import { getAllAudits } from '@/lib/db/audits'
import type { StoredAudit } from '@/lib/db/types'

// ─── TREND DATA ───────────────────────────────────────────────────────────────

export interface TrendPoint {
  date:          string   // formatted date label, e.g. "Jan 15"
  score:         number
  auditId:       string
  checklistName: string
}

export function buildTrendData(audits: StoredAudit[], days?: number): TrendPoint[] {
  const completed = audits.filter(a => a.status === 'completed' && a.completedAt)

  const filtered = days
    ? completed.filter(a => {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
        return new Date(a.completedAt!).getTime() >= cutoff
      })
    : completed

  return filtered
    .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
    .map(a => ({
      date:          new Date(a.completedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score:         a.score ?? 0,
      auditId:       a.id,
      checklistName: a.checklistName,
    }))
}

// ─── TOP FAIL ITEMS ───────────────────────────────────────────────────────────

export interface FailItem {
  question:  string   // truncated to 40 chars
  section:   string
  failCount: number
  severity:  'critical' | 'major' | 'minor'
}

export function buildTopFailItems(audits: StoredAudit[], topN = 10): FailItem[] {
  const completed = audits.filter(a => a.status === 'completed')

  const map = new Map<string, FailItem>()

  for (const audit of completed) {
    for (const f of audit.findings) {
      const key = `${f.sectionName}::${f.question}`
      const existing = map.get(key)
      if (existing) {
        existing.failCount++
      } else {
        map.set(key, {
          question:  f.question.length > 40 ? f.question.slice(0, 37) + '…' : f.question,
          section:   f.sectionName,
          failCount: 1,
          severity:  f.severity,
        })
      }
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.failCount - a.failCount)
    .slice(0, topN)
}

// ─── SECTION HEATMAP ─────────────────────────────────────────────────────────

export interface SectionHeat {
  section:    string
  avgScore:   number   // 0-100
  auditCount: number
  status:     'pass' | 'marginal' | 'fail'
}

export function buildSectionHeatmap(audits: StoredAudit[]): SectionHeat[] {
  const completed = audits.filter(a => a.status === 'completed')

  const sectionMap = new Map<string, { totalScore: number; count: number }>()

  for (const audit of completed) {
    const sections = audit.auditScore?.sections ?? []
    for (const sec of sections) {
      const entry = sectionMap.get(sec.sectionName)
      if (entry) {
        entry.totalScore += sec.score
        entry.count++
      } else {
        sectionMap.set(sec.sectionName, { totalScore: sec.score, count: 1 })
      }
    }
  }

  return Array.from(sectionMap.entries()).map(([section, { totalScore, count }]) => {
    const avgScore = Math.round(totalScore / count)
    const status: 'pass' | 'marginal' | 'fail' =
      avgScore >= 90 ? 'pass' : avgScore >= 70 ? 'marginal' : 'fail'
    return { section, avgScore, auditCount: count, status }
  })
}

// ─── AUDITOR STATS ────────────────────────────────────────────────────────────

export interface AuditorStat {
  name:         string
  auditCount:   number
  avgScore:     number
  openFindings: number
}

export function buildAuditorStats(audits: StoredAudit[]): AuditorStat[] {
  const completed = audits.filter(a => a.status === 'completed')
  const map = new Map<string, { totalScore: number; count: number; openFindings: number }>()

  for (const audit of completed) {
    const name = audit.conductedBy ?? 'Unknown'
    const open = audit.findings.filter(f => f.status === 'open').length
    const entry = map.get(name)
    if (entry) {
      entry.totalScore  += audit.score ?? 0
      entry.count++
      entry.openFindings += open
    } else {
      map.set(name, { totalScore: audit.score ?? 0, count: 1, openFindings: open })
    }
  }

  return Array.from(map.entries())
    .map(([name, { totalScore, count, openFindings }]) => ({
      name,
      auditCount:   count,
      avgScore:     Math.round(totalScore / count),
      openFindings,
    }))
    .sort((a, b) => b.auditCount - a.auditCount)
}

// ─── CONVENIENCE LOADER ───────────────────────────────────────────────────────

export function loadAllAudits(): Promise<StoredAudit[]> {
  return getAllAudits()
}
