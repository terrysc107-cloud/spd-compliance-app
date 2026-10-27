// ─── PRINTABLE PAPER AUDIT FORM ─────────────────────────────────────────────
// Landscape grid the client's staff fill in by hand: one row per sample, one
// narrow column per item. The consultant keys completed sheets back in via
// "Paper form" entry, keeping the date the audit was actually performed.

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ReactElement } from 'react'
import type { AuditItem } from '@/lib/consult/types'

export interface AuditFormData {
  title:        string
  purpose:      string
  sampleUnit:   string
  sampleHint:   string
  targetPerDay: number
  refs:         string[]
  items:        AuditItem[]
  clientName:   string
  firmName:     string
  consultant:   string
  auditCode:    string     // short id so returned sheets match the right audit
}

const ROWS = 14

const s = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: 'Helvetica', color: '#0f172a' },
  head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: 15, fontFamily: 'Helvetica-Bold' },
  muted: { fontSize: 8.5, color: '#475569' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, marginBottom: 8, padding: 6, border: '1pt solid #cbd5e1', borderRadius: 3 },
  legendItem: { width: '50%', flexDirection: 'row', marginBottom: 2, paddingRight: 8 },
  num: { width: 14, fontFamily: 'Helvetica-Bold' },
  tr: { flexDirection: 'row', borderBottom: '0.75pt solid #94a3b8', minHeight: 24, alignItems: 'stretch' },
  th: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderBottom: '1pt solid #475569', borderTop: '1pt solid #475569' },
  cell: { borderRight: '0.75pt solid #94a3b8', paddingHorizontal: 3, justifyContent: 'center' },
  hcell: { fontFamily: 'Helvetica-Bold', fontSize: 8, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 18, left: 28, right: 28, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.5, color: '#64748b' },
})

export function AuditForm({ data: d }: { data: AuditFormData }): ReactElement {
  const itemW = Math.max(26, Math.min(44, 430 / Math.max(1, d.items.length)))
  const cols = { date: 56, ref: 120, init: 40, notes: 0 }
  return (
    <Document title={`${d.title} — audit form`}>
      <Page size="LETTER" orientation="landscape" style={s.page}>
        <View style={s.head}>
          <View>
            <Text style={s.title}>{d.title}</Text>
            <Text style={s.muted}>{d.clientName} · {d.purpose}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {d.firmName ? <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{d.firmName}</Text> : null}
            <Text style={s.muted}>Form {d.auditCode}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 9 }}>
          One row per {d.sampleUnit} ({d.sampleHint}). Target: {d.targetPerDay} per day. Mark each item
          <Text style={{ fontFamily: 'Helvetica-Bold' }}> Y</Text> (yes),
          <Text style={{ fontFamily: 'Helvetica-Bold' }}> N</Text> (no), or
          <Text style={{ fontFamily: 'Helvetica-Bold' }}> NA</Text>. Note what happened for every N. * = critical: report an N to your supervisor immediately.
        </Text>

        <View style={s.legend}>
          {d.items.map((it, i) => (
            <View key={it.id} style={s.legendItem}>
              <Text style={s.num}>{i + 1}.</Text>
              <Text style={{ flex: 1 }}>{it.critical ? '* ' : ''}{it.text}</Text>
            </View>
          ))}
        </View>

        <View style={s.th} fixed>
          <View style={[s.cell, { width: cols.date }]}><Text style={s.hcell}>Date</Text></View>
          <View style={[s.cell, { width: cols.ref }]}><Text style={s.hcell}>{d.sampleUnit[0].toUpperCase() + d.sampleUnit.slice(1)}</Text></View>
          <View style={[s.cell, { width: cols.init }]}><Text style={s.hcell}>Initials</Text></View>
          {d.items.map((it, i) => (
            <View key={it.id} style={[s.cell, { width: itemW }]}><Text style={s.hcell}>{i + 1}{it.critical ? '*' : ''}</Text></View>
          ))}
          <View style={[s.cell, { flex: 1, borderRight: 0 }]}><Text style={s.hcell}>Notes (required for any N)</Text></View>
        </View>
        {Array.from({ length: ROWS }, (_, r) => (
          <View key={r} style={s.tr} wrap={false}>
            <View style={[s.cell, { width: cols.date }]} />
            <View style={[s.cell, { width: cols.ref }]} />
            <View style={[s.cell, { width: cols.init }]} />
            {d.items.map(it => <View key={it.id} style={[s.cell, { width: itemW }]} />)}
            <View style={[s.cell, { flex: 1, borderRight: 0 }]} />
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text>Return completed forms to {d.consultant || 'your consultant'}. References: {d.refs.join('; ')}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
