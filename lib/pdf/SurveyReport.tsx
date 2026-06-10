import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

export interface SurveyReportFinding {
  question: string
  section: string
  severity: string
  status: string
  owner: string | null
  due: string | null
  correctiveAction: string | null
  evidence: string[]
}

export interface SurveyReportData {
  orgName: string
  generatedAt: string
  score: number
  bandLabel: string
  bandColor: string
  daysToSurvey: number | null
  surveyDate: string | null
  auditCount: number
  factors: { label: string; score: number; detail: string }[]
  findings: SurveyReportFinding[]
}

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: '#1e293b', fontFamily: 'Helvetica' },
  h1: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#0f172a' },
  sub: { fontSize: 10, color: '#64748b', marginTop: 4 },
  heroRow: { flexDirection: 'row', marginTop: 18, marginBottom: 8, alignItems: 'center' },
  scoreBox: { width: 120, alignItems: 'center', padding: 12, borderRadius: 6, border: '1pt solid #e2e8f0' },
  score: { fontSize: 36, fontFamily: 'Helvetica-Bold' },
  band: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  heroMeta: { flex: 1, paddingLeft: 18 },
  metaLine: { fontSize: 10, color: '#334155', marginBottom: 3 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 8, paddingBottom: 4, borderBottom: '1pt solid #e2e8f0' },
  factorRow: { flexDirection: 'row', marginBottom: 5 },
  factorLabel: { width: 160, fontSize: 10 },
  factorScore: { width: 40, fontFamily: 'Helvetica-Bold' },
  factorDetail: { flex: 1, fontSize: 9, color: '#64748b' },
  capa: { marginBottom: 10, padding: 8, border: '1pt solid #e2e8f0', borderRadius: 4 },
  capaQ: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  capaMeta: { fontSize: 9, color: '#475569', marginBottom: 2 },
  tag: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, fontSize: 8, color: '#94a3b8', textAlign: 'center', borderTop: '1pt solid #e2e8f0', paddingTop: 6 },
})

function sevColor(sev: string): string {
  return sev === 'critical' ? '#dc2626' : sev === 'major' ? '#d97706' : '#2563eb'
}

export function SurveyReport({ data }: { data: SurveyReportData }): ReactElement {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>Survey Readiness Report</Text>
        <Text style={s.sub}>{data.orgName} · Generated {new Date(data.generatedAt).toLocaleString()}</Text>

        <View style={s.heroRow}>
          <View style={s.scoreBox}>
            <Text style={[s.score, { color: data.bandColor }]}>{data.score}</Text>
            <Text style={[s.band, { color: data.bandColor }]}>{data.bandLabel}</Text>
          </View>
          <View style={s.heroMeta}>
            <Text style={s.metaLine}>Readiness score: {data.score} / 100</Text>
            <Text style={s.metaLine}>
              Survey date: {data.surveyDate ? new Date(data.surveyDate).toLocaleDateString() : 'not set'}
              {data.daysToSurvey !== null ? `  (${data.daysToSurvey} days)` : ''}
            </Text>
            <Text style={s.metaLine}>Completed audits on record: {data.auditCount}</Text>
            <Text style={s.metaLine}>Open corrective actions: {data.findings.filter(f => f.status !== 'resolved').length}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Readiness Factor Breakdown</Text>
          {data.factors.map((f, i) => (
            <View key={i} style={s.factorRow}>
              <Text style={s.factorLabel}>{f.label}</Text>
              <Text style={s.factorScore}>{f.score}%</Text>
              <Text style={s.factorDetail}>{f.detail}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Corrective Action Plan ({data.findings.length})</Text>
          {data.findings.length === 0 ? (
            <Text style={{ fontSize: 10, color: '#16a34a' }}>No open findings — full compliance.</Text>
          ) : (
            data.findings.map((f, i) => (
              <View key={i} style={s.capa} wrap={false}>
                <Text style={s.capaQ}>{f.question}</Text>
                <Text style={s.capaMeta}>
                  <Text style={[s.tag, { color: sevColor(f.severity) }]}>{f.severity.toUpperCase()}</Text>
                  {`  ·  ${f.section}  ·  status: ${f.status}`}
                </Text>
                <Text style={s.capaMeta}>
                  Owner: {f.owner ?? 'Unassigned'}   Due: {f.due ? new Date(f.due).toLocaleDateString() : '—'}
                </Text>
                {f.correctiveAction ? <Text style={s.capaMeta}>Action: {f.correctiveAction}</Text> : null}
                <Text style={s.capaMeta}>
                  Evidence: {f.evidence.length ? f.evidence.join(', ') : 'none attached'}
                </Text>
              </View>
            ))
          )}
        </View>

        <Text style={s.footer} fixed>
          SPD Intel — Survey Readiness Operating System. Confidential compliance document.
        </Text>
      </Page>
    </Document>
  )
}
