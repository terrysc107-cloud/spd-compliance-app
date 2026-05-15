// ─── REPORT GENERATION API ────────────────────────────────────────────────────
// Accepts either structured ReportData (from reports page) or legacy freeform
// checklistData (backward compat). Returns AI-generated report text.

import { generateText } from 'ai'
import type { ReportData } from '@/lib/reports/generator'

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
    const body = await req.json()
    const { reportData, checklistData } = body as { reportData?: ReportData; checklistData?: Record<string, unknown> }

    if (!reportData && !checklistData) {
      return Response.json({ error: 'Either reportData or checklistData is required' }, { status: 400 })
    }

    const prompt = reportData ? buildStructuredPrompt(reportData) : buildLegacyPrompt(checklistData!)

    const result = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      prompt,
      maxOutputTokens: 2000,
    })

    return Response.json({ report: result.text })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[generate-report]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
