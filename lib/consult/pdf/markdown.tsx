// ─── MINIMAL MARKDOWN → REACT-PDF ───────────────────────────────────────────
// Renders the consultant's narrative (AI draft, then hand-edited). Supports the
// subset the drafter emits: ##/### headings, paragraphs, - / 1. lists, pipe
// tables, and **bold** inline. Anything else degrades to plain paragraphs.

import { Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ReactElement } from 'react'

const s = StyleSheet.create({
  h2: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#0f172a', marginTop: 14, marginBottom: 6 },
  h3: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginTop: 10, marginBottom: 4 },
  p: { fontSize: 10, lineHeight: 1.5, color: '#1e293b', marginBottom: 6 },
  li: { flexDirection: 'row', marginBottom: 3, paddingLeft: 6 },
  bullet: { width: 14, fontSize: 10, color: '#475569' },
  liText: { flex: 1, fontSize: 10, lineHeight: 1.45, color: '#1e293b' },
  table: { marginVertical: 6, border: '1pt solid #e2e8f0' },
  tr: { flexDirection: 'row', borderBottom: '1pt solid #e2e8f0' },
  th: { flex: 1, padding: 4, fontSize: 8.5, fontFamily: 'Helvetica-Bold', backgroundColor: '#f1f5f9' },
  td: { flex: 1, padding: 4, fontSize: 8.5 },
  bold: { fontFamily: 'Helvetica-Bold' },
})

function inline(text: string): (string | ReactElement)[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <Text key={i} style={s.bold}>{part.slice(2, -2)}</Text>
      : part.replace(/(^|\s)\*([^*]+)\*/g, '$1$2').replace(/`/g, ''),
  )
}

function cells(row: string): string[] {
  return row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
}

export function Markdown({ source }: { source: string }): ReactElement {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out: ReactElement[] = []
  let para: string[] = []
  let k = 0

  const flush = () => {
    if (para.length) out.push(<Text key={k++} style={s.p}>{inline(para.join(' '))}</Text>)
    para = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const t = line.trim()
    if (!t) { flush(); continue }

    if (t.startsWith('### ')) { flush(); out.push(<Text key={k++} style={s.h3}>{t.slice(4)}</Text>); continue }
    if (t.startsWith('## ') || t.startsWith('# ')) {
      flush(); out.push(<Text key={k++} style={s.h2}>{t.replace(/^#+\s/, '')}</Text>); continue
    }

    if (t.startsWith('|')) {
      flush()
      const rows: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++].trim())
      i--
      const body = rows.filter(r => !/^\|[\s:|-]+\|?$/.test(r))
      const [head, ...rest] = body
      if (head) out.push(
        <View key={k++} style={s.table} wrap={false}>
          <View style={s.tr}>{cells(head).map((c, j) => <Text key={j} style={s.th}>{c}</Text>)}</View>
          {rest.map((r, ri) => (
            <View key={ri} style={s.tr}>{cells(r).map((c, j) => <Text key={j} style={s.td}>{inline(c)}</Text>)}</View>
          ))}
        </View>,
      )
      continue
    }

    const bullet = t.match(/^[-*•]\s+(.*)$/)
    const numbered = t.match(/^(\d+)[.)]\s+(.*)$/)
    if (bullet || numbered) {
      flush()
      out.push(
        <View key={k++} style={s.li}>
          <Text style={s.bullet}>{bullet ? '•' : `${numbered![1]}.`}</Text>
          <Text style={s.liText}>{inline(bullet ? bullet[1] : numbered![2])}</Text>
        </View>,
      )
      continue
    }

    para.push(t)
  }
  flush()
  return <View>{out}</View>
}
