// CSV export of an audit's samples: one row per sample, one column per item.
import type { Audit, AuditSample } from '@/lib/consult/types'

const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
const LABEL = { yes: 'Y', no: 'N', na: 'NA' } as const

export function auditSamplesCsv(audit: Audit, samples: AuditSample[]): string {
  const head = ['Date', 'Sample', 'Source', 'Audited by', ...audit.items.map((it, i) => `${i + 1}. ${it.text}`), 'Compliance %', 'Note']
  const rows = [...samples]
    .sort((a, b) => a.sampledOn.localeCompare(b.sampledOn) || a.createdAt.localeCompare(b.createdAt))
    .map(s => {
      const vals = Object.values(s.answers)
      const yes = vals.filter(a => a === 'yes').length, no = vals.filter(a => a === 'no').length
      return [
        s.sampledOn, s.sampleRef, s.source === 'paper' ? 'Paper form' : 'Observed', s.auditor,
        ...audit.items.map(it => (s.answers[it.id] ? LABEL[s.answers[it.id]] : '')),
        yes + no ? String(Math.round((yes / (yes + no)) * 100)) : '', s.note,
      ]
    })
  return [head, ...rows].map(r => r.map(esc).join(',')).join('\n')
}
