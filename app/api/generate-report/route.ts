// ─── REPORT GENERATION API ────────────────────────────────────────────────────
// Accepts either structured ReportData (from reports page) or legacy freeform
// checklistData (backward compat). Returns AI-generated report text.
// Auth: requires a valid Supabase session cookie. Unauthenticated requests
// receive 401 before any AI call is made.

import { generateText } from 'ai'
import type { ReportData } from '@/lib/reports/generator'
import { createServerSupabaseClient } from '@/lib/supabase/server'

function buildStructuredPrompt(data: ReportData): string {
  const top = data.topFailingItems.slice(0, 5)
    .map((f, i) => `  ${i + 1}. "${f.question}" (${f.section}) — failed ${f.failCount}×`)
    .join('\n') || '  None identified'

  return `You are an expert sterile processing quality consultant generating a formal compliance report.

Report: ${data.title}
Generated: ${new Date(data.generatedAt).toLocaleString()}
Date Range: ${new Date(data.dateRange.start).toLocaleDateString()} – ${new Date(data.dateRange.end).toLocaleDateString()}
Audits Reviewed: ${data.auditCount}
Average Compliance Score: ${data.avgScore}%
Critical Findings: ${data.criticalFindings}
Major Findings: ${data.majorFindings}
Open Findings: ${data.openFindings}

Top Failing Items:
${top}

Audits:
${data.auditSummaries.map(a => `  - ${a.name} (${new Date(a.date).toLocaleDateString()}): ${a.score}% [${a.status}]`).join('\n') || '  None in range'}

Generate a structured compliance report with exactly these 5 sections using ## headers:
## Executive Summary
## Compliance Overview
## Critical Findings
## Recommendations
## Next Steps

Be clinical, direct, and specific. Reference AAMI ST79, CMS CoP, and Joint Commission standards where relevant.`
}

interface ReadinessAdvisorData {
  score: number
  band: string
  daysToSurvey: number | null
  factors: { label: string; score: number; detail: string }[]
  openCritical: number
  openMajor: number
  overdueCount: number
  topFindings: { question: string; severity: string; status: string; overdueDays: number }[]
}

function buildReadinessPrompt(d: ReadinessAdvisorData): string {
  const factors = d.factors.map(f => `  - ${f.label}: ${f.score}/100 (${f.detail})`).join('\n')
  const findings = d.topFindings.slice(0, 8)
    .map((f, i) => `  ${i + 1}. [${f.severity}] "${f.question}" — ${f.status}${f.overdueDays > 0 ? `, ${f.overdueDays}d overdue` : ''}`)
    .join('\n') || '  None open'

  return `You are a sterile processing (SPD) survey-readiness consultant advising a department leader. You assess readiness for Joint Commission, CMS Conditions of Participation, and AAMI ST79/ST91/ST108 surveys. Your job is to explain the readiness score and tell them exactly what to do next — not to restate the number.

Current Readiness Score: ${d.score}/100 (${d.band})
${d.daysToSurvey !== null ? `Days until survey: ${d.daysToSurvey}` : 'No survey date set'}
Open critical findings: ${d.openCritical} · Open major findings: ${d.openMajor} · Overdue corrective actions: ${d.overdueCount}

Factor breakdown:
${factors}

Highest-priority open findings:
${findings}

Write a tight, clinical briefing with EXACTLY these four sections using ## headers:
## Current Risk Summary
## High-Priority Findings
## Recommended Actions
## Survey-Prep Checklist

Be specific and reference the relevant standard (AAMI ST79/ST91/ST108, CMS CoP, Joint Commission) for each recommendation. Prioritize overdue corrective actions and open critical findings. No filler.`
}

function buildLegacyPrompt(checklistData: Record<string, unknown>): string {
  const { profile, sectionScores, gaps, gapCount } = checklistData as Record<string, string | number>
  return `You are an expert sterile processing quality consultant reviewing a compliance self-assessment for a healthcare facility.

Facility context: ${profile}
Section scores: ${sectionScores}

Findings (${gapCount} total non-compliant items):
${gaps}

Generate a concise, actionable quality improvement report with:
1. Executive Summary (2-3 sentences on overall risk posture)
2. Top 3 Critical Priorities (high-severity items requiring immediate action within 7 days)
3. Section-by-Section Analysis (brief finding + recommended action per section that had findings)
4. 30/60/90 Day Action Framework (categorize all findings into timeframes)
5. Regulatory Risk Note (which standards are most at risk: AAMI, CMS, OSHA, Joint Commission)

Be direct, specific, and clinical. No filler. Format with clear headers using ##.`
}

export async function POST(req: Request) {
  try {
    // ── Auth guard ──────────────────────────────────────────────────────────
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { reportData, readinessData, checklistData } = body as {
      reportData?: ReportData
      readinessData?: ReadinessAdvisorData
      checklistData?: Record<string, unknown>
    }

    if (!reportData && !readinessData && !checklistData) {
      return Response.json({ error: 'reportData, readinessData, or checklistData is required' }, { status: 400 })
    }

    const prompt = readinessData
      ? buildReadinessPrompt(readinessData)
      : reportData
        ? buildStructuredPrompt(reportData)
        : buildLegacyPrompt(checklistData!)

    const result = await generateText({
      model: 'anthropic/claude-opus-4-8',
      prompt,
      maxOutputTokens: 2500,
    })

    return Response.json({ report: result.text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[generate-report]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
