// ─── CONSULTATION REPORT (PDF) ──────────────────────────────────────────────
// Cover → consultant narrative → Appendix A scorecard → B detailed findings
// (with photos) → C action plan → methodology/limitations + signature.

import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import {
  areaName, ENGAGEMENT_TYPE_LABEL, FACILITY_LABEL, PRIORITY_LABEL, PRIORITY_ORDER,
  RATING_COLOR, RATING_LABEL, RATING_ORDER,
} from '@/lib/consult/framework'
import { BAND_COLOR, BAND_LABEL, scoreColor } from '@/lib/consult/scoring'
import type { ReportBundle } from '@/lib/consult/report-data'
import type { Observation } from '@/lib/consult/types'
import { Markdown } from './markdown'
import { TwinAppendix } from './TwinAppendix'

const DEFAULT_METHODOLOGY =
  'The assessment combined direct observation of processing activities, interviews with department leadership and staff, and review of policies, logs, and records. Practices were evaluated against nationally recognized standards and guidelines, including ANSI/AAMI ST79, ST91, ST108, and ST58, AORN Guidelines, and applicable CMS and OSHA requirements. Each checkpoint was rated Met, Partial, or Not Met; scores are weighted by patient-safety risk (critical ×3, major ×2, minor ×1).'
const DEFAULT_DISCLAIMER =
  'This report reflects conditions observed during the visit dates listed and the information made available to the consultant. It is not a guarantee of regulatory survey outcomes. Standards references should be verified against the current editions adopted by the facility.'

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 56, paddingHorizontal: 44, fontSize: 10, color: '#1e293b', fontFamily: 'Helvetica' },
  coverFirm: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#2563eb', letterSpacing: 1 },
  coverTitle: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginTop: 90 },
  coverClient: { fontSize: 18, color: '#334155', marginTop: 8 },
  coverMeta: { fontSize: 10.5, color: '#475569', marginTop: 4 },
  scoreRow: { flexDirection: 'row', marginTop: 40, alignItems: 'center' },
  scoreBox: { width: 140, padding: 14, borderRadius: 6, border: '1pt solid #e2e8f0', alignItems: 'center' },
  scoreNum: { fontSize: 36, fontFamily: 'Helvetica-Bold' },
  scoreBand: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  scoreCap: { fontSize: 8, color: '#64748b', marginTop: 4 },
  snapshot: { flex: 1, paddingLeft: 20 },
  snapLine: { fontSize: 10, marginBottom: 4, color: '#334155' },
  prepared: { position: 'absolute', bottom: 70, left: 44, right: 44, borderTop: '1pt solid #e2e8f0', paddingTop: 10 },
  h1: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginBottom: 10, paddingBottom: 6, borderBottom: '1.5pt solid #2563eb' },
  h2: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginTop: 14, marginBottom: 6 },
  muted: { fontSize: 9, color: '#64748b' },
  tr: { flexDirection: 'row', borderBottom: '1pt solid #e2e8f0', paddingVertical: 4, alignItems: 'center' },
  thRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 4 },
  th: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#334155', paddingHorizontal: 4 },
  td: { fontSize: 9, paddingHorizontal: 4 },
  barTrack: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, flex: 1 },
  obs: { marginBottom: 10, padding: 9, border: '1pt solid #e2e8f0', borderRadius: 4 },
  obsHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  tag: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#ffffff', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, marginRight: 6 },
  obsTitle: { fontSize: 10.5, fontFamily: 'Helvetica-Bold', flex: 1 },
  label: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b', marginTop: 4 },
  body: { fontSize: 9.5, lineHeight: 1.45 },
  photoRow: { flexDirection: 'row', marginTop: 6 },
  photo: { width: 200, height: 140, objectFit: 'cover', marginRight: 8, borderRadius: 3 },
  caption: { fontSize: 7.5, color: '#64748b', marginTop: 2, width: 200 },
  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.5, color: '#94a3b8', borderTop: '1pt solid #e2e8f0', paddingTop: 6 },
  sigLine: { marginTop: 36, width: 240, borderTop: '1pt solid #334155', paddingTop: 4 },
})

function fmtDate(d: string | null | undefined): string {
  return d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
}

function visitDates(b: ReportBundle): string {
  const { visitStart, visitEnd } = b.engagement
  if (!visitStart) return 'Visit date not recorded'
  return visitEnd && visitEnd !== visitStart ? `${fmtDate(visitStart)} – ${fmtDate(visitEnd)}` : fmtDate(visitStart)
}

function Footer({ b }: { b: ReportBundle }) {
  return (
    <View style={s.footer} fixed>
      <Text>{b.client.name} · {b.engagement.title} · Confidential</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

function Cover({ b }: { b: ReportBundle }) {
  const { score, client: c, engagement: e, settings: st } = b
  const delta = b.priorScore?.overall != null && score.overall != null ? score.overall - b.priorScore.overall : null
  return (
    <Page size="LETTER" style={s.page}>
      <Text style={s.coverFirm}>{(st.firmName || 'SPD CONSULTATION').toUpperCase()}</Text>
      <Text style={s.coverTitle}>Sterile Processing Assessment Report</Text>
      <Text style={s.coverClient}>{c.name}</Text>
      <Text style={s.coverMeta}>
        {[FACILITY_LABEL[c.facilityType], [c.city, c.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
      </Text>
      <Text style={s.coverMeta}>{ENGAGEMENT_TYPE_LABEL[e.type]} · {visitDates(b)}</Text>

      <View style={s.scoreRow}>
        <View style={s.scoreBox}>
          <Text style={[s.scoreNum, { color: scoreColor(score.overall) }]}>{score.overall ?? '—'}{score.overall !== null ? '%' : ''}</Text>
          <Text style={[s.scoreBand, { color: BAND_COLOR[score.band] }]}>{BAND_LABEL[score.band]}</Text>
          <Text style={s.scoreCap}>Standards conformance</Text>
        </View>
        <View style={s.snapshot}>
          <Text style={s.snapLine}>Checkpoints assessed: {score.answered} of {score.total}</Text>
          <Text style={s.snapLine}>Critical gaps: {score.criticalGaps}</Text>
          {RATING_ORDER.map(r => (
            <Text key={r} style={s.snapLine}>{RATING_LABEL[r]} observations: {score.ratingCounts[r]}</Text>
          ))}
          {b.priorScore && (
            <Text style={s.snapLine}>
              Prior visit ({b.priorScore.title}): {b.priorScore.overall ?? '—'}%
              {delta !== null ? `  (${delta >= 0 ? '+' : ''}${delta} pts)` : ''}
            </Text>
          )}
        </View>
      </View>

      <View style={s.prepared}>
        <Text style={s.muted}>Prepared by</Text>
        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 }}>
          {st.consultantName || 'Consultant'}{st.credentials ? `, ${st.credentials}` : ''}
        </Text>
        {st.firmName ? <Text style={s.muted}>{st.firmName}</Text> : null}
        <Text style={[s.muted, { marginTop: 6 }]}>
          Report date: {fmtDate((e.deliveredAt ?? new Date().toISOString()).slice(0, 10))}
        </Text>
      </View>
    </Page>
  )
}

function Scorecard({ b }: { b: ReportBundle }) {
  const cols = [190, 46, 120, 52, 52, 52]
  return (
    <View>
      <Text style={s.h1}>Appendix A — Area Scorecard</Text>
      <View style={s.thRow}>
        {['Area', 'Score', '', 'Assessed', 'Not met', 'Critical'].map((h, i) => (
          <Text key={i} style={[s.th, { width: cols[i] }]}>{h}</Text>
        ))}
      </View>
      {b.score.areas.map(a => (
        <View key={a.areaId} style={s.tr} wrap={false}>
          <Text style={[s.td, { width: cols[0] }]}>{a.name}</Text>
          <Text style={[s.td, { width: cols[1], fontFamily: 'Helvetica-Bold', color: scoreColor(a.score) }]}>
            {a.score === null ? '—' : `${a.score}%`}
          </Text>
          <View style={{ width: cols[2], paddingHorizontal: 4 }}>
            <View style={s.barTrack}>
              <View style={{ height: 6, borderRadius: 3, width: `${a.score ?? 0}%`, backgroundColor: scoreColor(a.score) }} />
            </View>
          </View>
          <Text style={[s.td, { width: cols[3] }]}>{a.answered}/{a.total}</Text>
          <Text style={[s.td, { width: cols[4] }]}>{a.notMet}</Text>
          <Text style={[s.td, { width: cols[5], color: a.criticalGaps ? '#dc2626' : '#1e293b' }]}>{a.criticalGaps}</Text>
        </View>
      ))}
      <Text style={[s.muted, { marginTop: 6 }]}>
        Scores weight each checkpoint by patient-safety risk (critical ×3, major ×2, minor ×1); Partial earns half credit; N/A is excluded.
      </Text>
    </View>
  )
}

function ObservationCard({ o, b }: { o: Observation; b: ReportBundle }) {
  const photos = b.photos.filter(p => p.observationId === o.id)
  return (
    <View style={s.obs} wrap={false}>
      <View style={s.obsHead}>
        <Text style={[s.tag, { backgroundColor: RATING_COLOR[o.rating] }]}>{RATING_LABEL[o.rating].toUpperCase()}</Text>
        <Text style={s.obsTitle}>{o.title}</Text>
        {o.rating !== 'strength' && <Text style={s.muted}>{PRIORITY_LABEL[o.priority]}</Text>}
      </View>
      {o.detail ? <><Text style={s.label}>OBSERVATION</Text><Text style={s.body}>{o.detail}</Text></> : null}
      {o.recommendation ? <><Text style={s.label}>RECOMMENDATION</Text><Text style={s.body}>{o.recommendation}</Text></> : null}
      {o.standardRefs.length ? <><Text style={s.label}>REFERENCES</Text><Text style={s.body}>{o.standardRefs.join('; ')}</Text></> : null}
      {o.ownerRole ? <Text style={[s.muted, { marginTop: 4 }]}>Suggested owner: {o.ownerRole}</Text> : null}
      {photos.length ? (
        <View style={s.photoRow}>
          {photos.map((p, i) => (
            <View key={i}>
              <Image src={p.dataUri} style={s.photo} />
              {p.caption ? <Text style={s.caption}>{p.caption}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

function Findings({ b }: { b: ReportBundle }) {
  const rank = (o: Observation) => RATING_ORDER.indexOf(o.rating)
  const byArea = new Map<string, Observation[]>()
  for (const o of [...b.observations].sort((x, y) => rank(x) - rank(y))) {
    const arr = byArea.get(o.area) ?? []
    arr.push(o)
    byArea.set(o.area, arr)
  }
  // Framework order; areas outside the engagement scope (field observations) last.
  const order = b.score.areas.map(a => a.areaId as string)
  const pos = (a: string) => (order.includes(a) ? order.indexOf(a) : order.length)
  const areas = [...byArea.keys()].sort((x, y) => pos(x) - pos(y))
  return (
    <View break>
      <Text style={s.h1}>Appendix B — Detailed Observations</Text>
      {!b.observations.length && <Text style={s.body}>No observations were recorded.</Text>}
      {areas.map(area => (
        <View key={area}>
          <Text style={s.h2} minPresenceAhead={90}>{areaName(area)}</Text>
          {byArea.get(area)!.map(o => <ObservationCard key={o.id} o={o} b={b} />)}
        </View>
      ))}
    </View>
  )
}

function AuditResults({ b }: { b: ReportBundle }) {
  if (!b.audits.length) return null
  const pct = (v: number | null) => (v === null ? '—' : `${v}%`)
  return (
    <View break>
      <Text style={s.h1}>Appendix D — Instant Audit Results</Text>
      <Text style={[s.muted, { marginBottom: 8 }]}>
        Audits started during the engagement to measure corrective actions. Baseline is the first stretch of logging; current is the latest.
        Compliance = Yes ÷ (Yes + No).
      </Text>
      <View style={s.thRow}>
        {['Audit', 'Samples', 'Baseline', 'Current', 'Change', 'Critical misses'].map((h, i) => (
          <Text key={i} style={[s.th, { width: i === 0 ? 200 : 62 }]}>{h}</Text>
        ))}
      </View>
      {b.audits.map(({ audit: a, summary: m, linkedTitle }) => (
        <View key={a.id} style={s.tr} wrap={false}>
          <View style={{ width: 200, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{a.title}</Text>
            {linkedTitle ? <Text style={{ fontSize: 7.5, color: '#64748b' }}>Measures: {linkedTitle}</Text> : null}
          </View>
          <Text style={[s.td, { width: 62 }]}>{m.samples} / {m.days}d</Text>
          <Text style={[s.td, { width: 62, color: scoreColor(m.baseline) }]}>{pct(m.baseline)}</Text>
          <Text style={[s.td, { width: 62, color: scoreColor(m.current), fontFamily: 'Helvetica-Bold' }]}>{pct(m.current)}</Text>
          <Text style={[s.td, { width: 62, color: m.delta === null ? '#64748b' : m.delta >= 0 ? '#16a34a' : '#dc2626' }]}>
            {m.delta === null ? '—' : `${m.delta >= 0 ? '+' : ''}${m.delta} pts`}
          </Text>
          <Text style={[s.td, { width: 62, color: m.criticalMisses ? '#dc2626' : '#1e293b' }]}>{m.criticalMisses}</Text>
        </View>
      ))}
      {b.audits.map(({ audit: a, summary: m }) => {
        const worst = m.items.filter(i => i.no > 0).slice(0, 3)
        if (!worst.length) return null
        return (
          <View key={`w-${a.id}`} style={{ marginTop: 10 }} wrap={false}>
            <Text style={{ fontSize: 9.5, fontFamily: 'Helvetica-Bold', marginBottom: 3 }}>{a.title} — most-failed items</Text>
            {worst.map(i => (
              <Text key={i.id} style={{ fontSize: 8.5, color: '#334155', marginBottom: 1 }}>
                • {i.text}{i.critical ? ' (critical)' : ''}: {i.failRate}% No ({i.no} of {i.answered})
              </Text>
            ))}
          </View>
        )
      })}
    </View>
  )
}

function ActionPlan({ b }: { b: ReportBundle }) {
  const actions = b.observations.filter(o => o.rating !== 'strength')
  let n = 0
  return (
    <View break>
      <Text style={s.h1}>Appendix C — Action Plan</Text>
      {!actions.length && <Text style={s.body}>No corrective actions were identified.</Text>}
      {PRIORITY_ORDER.map(p => {
        const rows = actions.filter(o => o.priority === p)
        if (!rows.length) return null
        return (
          <View key={p}>
            <Text style={s.h2}>{p === 'immediate' ? 'Immediate (before next procedure day)' : `Within ${PRIORITY_LABEL[p]}`}</Text>
            <View style={s.thRow}>
              <Text style={[s.th, { width: 22 }]}>#</Text>
              <Text style={[s.th, { flex: 1 }]}>Action</Text>
              <Text style={[s.th, { width: 100 }]}>Area</Text>
              <Text style={[s.th, { width: 90 }]}>Owner</Text>
            </View>
            {rows.map(o => (
              <View key={o.id} style={s.tr} wrap={false}>
                <Text style={[s.td, { width: 22 }]}>{++n}</Text>
                <View style={{ flex: 1, paddingHorizontal: 4 }}>
                  <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>{o.title}</Text>
                  {o.recommendation ? <Text style={{ fontSize: 8.5, color: '#475569', marginTop: 1 }}>{o.recommendation}</Text> : null}
                </View>
                <Text style={[s.td, { width: 100 }]}>{areaName(o.area)}</Text>
                <Text style={[s.td, { width: 90 }]}>{o.ownerRole || '—'}</Text>
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}

export function ConsultReport({ bundle: b }: { bundle: ReportBundle }): ReactElement {
  const narrative = b.engagement.executiveSummary?.trim() || b.engagement.aiDraft?.trim() || ''
  const st = b.settings
  return (
    <Document title={`${b.client.name} — SPD Assessment`} author={st.consultantName || undefined}>
      <Cover b={b} />
      <Page size="LETTER" style={s.page}>
        {narrative
          ? <Markdown source={narrative} />
          : <Text style={s.body}>Narrative summary not yet written. See the appendices for scored results, observations, and the action plan.</Text>}

        <View break>
          <Scorecard b={b} />
        </View>
        <Findings b={b} />
        <ActionPlan b={b} />
        <AuditResults b={b} />
        {b.twin && <TwinAppendix t={b.twin} />}

        <View break>
          <Text style={s.h1}>Methodology & Limitations</Text>
          <Text style={[s.body, { marginBottom: 8 }]}>{st.methodology || DEFAULT_METHODOLOGY}</Text>
          <Text style={s.body}>{st.disclaimer || DEFAULT_DISCLAIMER}</Text>
          <View style={s.sigLine}>
            <Text style={{ fontSize: 10, fontFamily: 'Helvetica-Bold' }}>
              {st.consultantName || 'Consultant'}{st.credentials ? `, ${st.credentials}` : ''}
            </Text>
            {st.firmName ? <Text style={s.muted}>{st.firmName}</Text> : null}
          </View>
        </View>
        <Footer b={b} />
      </Page>
    </Document>
  )
}
