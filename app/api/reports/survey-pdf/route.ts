import { createElement, type ReactElement } from 'react'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { computeReadiness } from '@/lib/readiness/engine'
import { bandLabel, bandColor } from '@/lib/readiness/engine'
import { SurveyReport, type SurveyReportData, type SurveyReportFinding } from '@/lib/pdf/SurveyReport'
import type { StoredAudit, StoredFinding } from '@/lib/db/types'

export const runtime = 'nodejs'

type FindingRow = {
  id: string; audit_id: string; question: string; section_name: string | null
  severity: string; status: string; corrective_action: string | null; due_date: string | null
  assigned_to: string | null; owner?: { name: string | null } | null
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: org } = await supabase
      .from('organizations')
      .select('name, next_survey_date')
      .limit(1)
      .maybeSingle()

    const { data: audits } = await supabase
      .from('audits')
      .select('id, status, overall_score, completed_at')

    const auditIds = (audits ?? []).map(a => a.id)

    let findings: FindingRow[] = []
    if (auditIds.length) {
      const { data } = await supabase
        .from('findings')
        .select('id, audit_id, question, section_name, severity, status, corrective_action, due_date, assigned_to, owner:profiles!assigned_to(name)')
        .in('audit_id', auditIds)
      findings = (data ?? []) as unknown as FindingRow[]
    }

    // Evidence filenames per finding
    const evidenceByFinding = new Map<string, string[]>()
    const findingIds = findings.map(f => f.id)
    if (findingIds.length) {
      const { data: ev } = await supabase
        .from('finding_evidence')
        .select('finding_id, file_name')
        .in('finding_id', findingIds)
      for (const e of ev ?? []) {
        const arr = evidenceByFinding.get(e.finding_id) ?? []
        arr.push(e.file_name)
        evidenceByFinding.set(e.finding_id, arr)
      }
    }

    // Build StoredAudit[] for the readiness engine
    const findingsByAudit = new Map<string, StoredFinding[]>()
    for (const f of findings) {
      const arr = findingsByAudit.get(f.audit_id) ?? []
      arr.push({
        id: f.id, itemIndex: 0, sectionName: f.section_name ?? '', question: f.question,
        severity: f.severity as StoredFinding['severity'], comment: '',
        status: f.status as StoredFinding['status'], dueDate: f.due_date,
      })
      findingsByAudit.set(f.audit_id, arr)
    }
    const storedAudits: StoredAudit[] = (audits ?? []).map(a => ({
      id: a.id, checklistName: 'SPD Compliance Audit', mode: 'full',
      startedAt: a.completed_at ?? new Date().toISOString(),
      completedAt: a.completed_at ?? undefined,
      status: a.status as StoredAudit['status'], responses: {},
      score: a.overall_score ?? undefined, findings: findingsByAudit.get(a.id) ?? [],
    }))

    const readiness = computeReadiness(storedAudits, { nextSurveyDate: org?.next_survey_date })

    const capa: SurveyReportFinding[] = findings
      .filter(f => f.status !== 'resolved')
      .sort((a, b) => sevRank(b.severity) - sevRank(a.severity))
      .map(f => ({
        question: f.question, section: f.section_name ?? '', severity: f.severity,
        status: f.status, owner: f.owner?.name ?? null, due: f.due_date,
        correctiveAction: f.corrective_action, evidence: evidenceByFinding.get(f.id) ?? [],
      }))

    const data: SurveyReportData = {
      orgName: org?.name ?? 'Your Facility',
      generatedAt: new Date().toISOString(),
      score: readiness.score,
      bandLabel: bandLabel(readiness.band),
      bandColor: bandColor(readiness.band),
      daysToSurvey: readiness.daysToSurvey,
      surveyDate: org?.next_survey_date ?? null,
      auditCount: readiness.auditCount,
      factors: readiness.factors.map(f => ({ label: f.label, score: f.score, detail: f.detail })),
      findings: capa,
    }

    const element = createElement(SurveyReport, { data }) as ReactElement<DocumentProps>
    const buffer = await renderToBuffer(element)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="survey-readiness-report.pdf"',
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[survey-pdf]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}

function sevRank(s: string): number {
  return s === 'critical' ? 3 : s === 'major' ? 2 : 1
}
