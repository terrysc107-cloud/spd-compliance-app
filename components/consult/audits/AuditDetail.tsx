'use client'

import { useMemo } from 'react'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getAuditTemplate } from '@/lib/consult/audits/templates'
import { summarize } from '@/lib/consult/audits/scoring'
import { auditSamplesCsv } from '@/lib/consult/audits/export'
import { deleteAudit, deleteSample, updateAudit } from '@/lib/consult/db/audits'
import { scoreColor } from '@/lib/consult/scoring'
import SampleEntry from './SampleEntry'
import { Pill, errMsg, fmtDay } from '../fields'
import type { Audit, AuditSample, Observation } from '@/lib/consult/types'

export function Delta({ value }: { value: number | null }) {
  if (value === null) return <span style={{ color: tokens.color.textDimmed }}>—</span>
  const color = value > 0 ? tokens.color.success : value < 0 ? tokens.color.danger : tokens.color.textMuted
  return <span style={{ color, fontWeight: 700 }}>{value > 0 ? '▲' : value < 0 ? '▼' : '■'} {Math.abs(value)} pts</span>
}

export default function AuditDetail({ audit, samples, linked, onBack, onChange, onSamples, onDeleted, onError }: {
  audit:     Audit
  samples:   AuditSample[]
  linked:    Observation | null
  onBack:    () => void
  onChange:  (a: Audit) => void
  onSamples: (fn: (s: AuditSample[]) => AuditSample[]) => void
  onDeleted: (id: string) => void
  onError:   (msg: string) => void
}) {
  const t = getAuditTemplate(audit.templateId)
  const sum = useMemo(() => summarize(audit, samples), [audit, samples])
  const recent = [...samples].sort((a, b) => b.sampledOn.localeCompare(a.sampledOn) || b.createdAt.localeCompare(a.createdAt))

  function csv() {
    const url = URL.createObjectURL(new Blob([auditSamplesCsv(audit, samples)], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url; a.download = `${audit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function toggleStatus() {
    const status = audit.status === 'active' ? 'closed' : 'active'
    try { await updateAudit(audit.id, { status }); onChange({ ...audit, status }) } catch (e) { onError(errMsg(e)) }
  }

  async function remove() {
    if (!confirm(`Delete “${audit.title}” and all ${samples.length} samples? This cannot be undone.`)) return
    try { await deleteAudit(audit.id); onDeleted(audit.id) } catch (e) { onError(errMsg(e)) }
  }

  const maxDay = Math.max(1, ...sum.series.map(d => d.samples))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: tokens.color.accentBlue, cursor: 'pointer', padding: 0, fontSize: 13 }}>← All audits</button>
          <h2 style={{ margin: '6px 0 0', fontSize: 19, color: tokens.color.textPrimary }}>
            {audit.title} {audit.status === 'closed' && <Pill color={tokens.color.textMuted}>Closed</Pill>}
          </h2>
          <div style={{ fontSize: 13, color: tokens.color.textMuted, marginTop: 4 }}>
            {t?.purpose} Started {fmtDay(audit.startedOn)} · target {audit.targetPerDay} {audit.sampleUnit}s/day
          </div>
          {linked && <div style={{ fontSize: 12.5, color: tokens.color.textDimmed, marginTop: 4 }}>Measures finding: “{linked.title}”</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a href={`/api/consult/audit-form?auditId=${audit.id}`} target="_blank" rel="noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', padding: '6px 12px', fontSize: 13, fontWeight: 500, textDecoration: 'none',
            borderRadius: tokens.radius.sm, color: tokens.color.textPrimary, background: tokens.color.surface, border: `1px solid ${tokens.color.border}`,
          }}>🖨 Paper form (PDF)</a>
          <Button size="sm" variant="secondary" disabled={!samples.length} onClick={csv}>⬇ CSV</Button>
          <Button size="sm" variant="ghost" onClick={toggleStatus}>{audit.status === 'active' ? 'Close audit' : 'Reopen'}</Button>
          <Button size="sm" variant="ghost" onClick={remove}>Delete</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <Stat label="Samples" value={`${sum.samples}`} sub={`${sum.days} day${sum.days === 1 ? '' : 's'} · ${sum.perDayAvg}/day`} />
        <Stat label="Overall compliance" value={sum.compliance === null ? '—' : `${sum.compliance}%`} color={scoreColor(sum.compliance)} />
        <Stat label={`Baseline (${sum.baselineLabel})`} value={sum.baseline === null ? '—' : `${sum.baseline}%`} color={scoreColor(sum.baseline)} />
        <Stat label={`Current (${sum.currentLabel})`} value={sum.current === null ? '—' : `${sum.current}%`} color={scoreColor(sum.current)} sub={<Delta value={sum.delta} />} />
        <Stat label="Critical misses" value={`${sum.criticalMisses}`} color={sum.criticalMisses ? tokens.color.danger : tokens.color.success}
          sub={sum.days >= 2 ? `${sum.currentCriticalMisses} in current period` : undefined} />
      </div>

      {sum.series.length > 0 && (
        <Card padding="lg">
          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.color.textMuted, marginBottom: 10 }}>Daily compliance</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto' }}>
            {sum.series.map(d => (
              <div key={d.date} title={`${fmtDay(d.date)}: ${d.compliance ?? '—'}% (${d.samples} samples)`}
                style={{ flex: '0 0 auto', width: Math.max(14, Math.min(40, 600 / sum.series.length)), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 10, color: scoreColor(d.compliance) }}>{d.compliance ?? ''}</span>
                <div style={{ width: '100%', height: `${(d.compliance ?? 0) * 0.8}px`, background: scoreColor(d.compliance), borderRadius: 3, opacity: 0.4 + 0.6 * (d.samples / maxDay) }} />
                <span style={{ fontSize: 9.5, color: tokens.color.textDimmed }}>{d.date.slice(5).replace('-', '/')}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: tokens.color.textDimmed, marginTop: 6 }}>Bar opacity shows sample volume that day.</div>
        </Card>
      )}

      {audit.status === 'active' && (
        <SampleEntry audit={audit} hint={t?.sampleHint ?? ''} onError={onError}
          onSaved={s => onSamples(list => [...list, s])} />
      )}

      {sum.samples > 0 && (
        <Card padding="lg">
          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.color.textMuted, marginBottom: 10 }}>Most-failed items</div>
          {sum.items.map(i => (
            <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: `1px solid ${tokens.color.border}` }}>
              <span style={{ flex: 1, fontSize: 13, color: tokens.color.textPrimary }}>
                {i.text}{i.critical && <span style={{ color: tokens.color.danger, fontSize: 11, fontWeight: 700 }}> CRITICAL</span>}
              </span>
              <span style={{ width: 90, fontSize: 12, color: tokens.color.textDimmed, textAlign: 'right' }}>{i.no} of {i.answered} No</span>
              <span style={{ width: 50, fontSize: 13, fontWeight: 700, textAlign: 'right', color: i.failRate ? tokens.color.danger : tokens.color.success }}>{i.failRate}%</span>
            </div>
          ))}
        </Card>
      )}

      {recent.length > 0 && (
        <Card padding="lg">
          <div style={{ fontSize: 13, fontWeight: 600, color: tokens.color.textMuted, marginBottom: 10 }}>Samples ({recent.length})</div>
          {recent.slice(0, 100).map(s => {
            const misses = audit.items.filter(i => s.answers[i.id] === 'no')
            return (
              <div key={s.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: `1px solid ${tokens.color.border}` }}>
                <span style={{ width: 92, fontSize: 12.5, color: tokens.color.textMuted, flexShrink: 0 }}>{fmtDay(s.sampledOn)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: tokens.color.textPrimary }}>
                    {s.sampleRef || `Unlabeled ${audit.sampleUnit}`}
                    <span style={{ fontSize: 11.5, color: tokens.color.textDimmed }}> · {s.source === 'paper' ? `paper${s.auditor ? `, ${s.auditor}` : ''}` : 'observed'}</span>
                  </div>
                  {misses.length > 0 && <div style={{ fontSize: 12, color: '#fca5a5', marginTop: 2 }}>No: {misses.map(m => m.text).join('; ')}</div>}
                  {s.note && <div style={{ fontSize: 12, color: tokens.color.textDimmed, marginTop: 2 }}>{s.note}</div>}
                </div>
                <button aria-label="Delete sample" onClick={async () => {
                  if (!confirm('Delete this sample?')) return
                  try { await deleteSample(s.id); onSamples(list => list.filter(x => x.id !== s.id)) } catch (e) { onError(errMsg(e)) }
                }} style={{ background: 'none', border: 'none', color: tokens.color.textDimmed, cursor: 'pointer', fontSize: 15 }}>×</button>
              </div>
            )
          })}
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: React.ReactNode }) {
  return (
    <Card padding="md">
      <div style={{ fontSize: 11, color: tokens.color.textDimmed, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? tokens.color.textPrimary, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: tokens.color.textMuted, marginTop: 2 }}>{sub}</div>}
    </Card>
  )
}
