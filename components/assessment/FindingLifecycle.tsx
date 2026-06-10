'use client'

import { useEffect, useState } from 'react'
import { updateFinding } from '@/lib/db/audits'
import { listOrgMembers, type OrgMember } from '@/lib/db/org'
import { listEvidence, uploadEvidence, getEvidenceUrl, deleteEvidence } from '@/lib/db/findings'
import type { FindingEvidence } from '@/lib/db/types'
import { tokens } from '@/lib/constants/design-tokens'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface FindingLifecycleProps {
  finding: {
    id?: string
    itemIndex: number
    question: string
    severity: 'critical' | 'major' | 'minor'
    status: 'open' | 'in-progress' | 'resolved'
    comment: string
    correctiveAction?: string
    resolvedAt?: string
    assignedTo?: string | null
    dueDate?: string | null
  }
  auditId: string
  onUpdate: () => void
}

const SEV_VARIANT: Record<string, 'danger' | 'warning' | 'info'> = {
  critical: 'danger',
  major: 'warning',
  minor: 'info',
}

const STATUS_VARIANT: Record<string, 'danger' | 'warning' | 'success'> = {
  open: 'danger',
  'in-progress': 'warning',
  resolved: 'success',
}

const STEPS = ['open', 'in-progress', 'resolved'] as const
type Step = typeof STEPS[number]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StepIndicator({ current }: { current: Step }) {
  const labels: Record<Step, string> = { open: 'Open', 'in-progress': 'In Progress', resolved: 'Resolved' }
  const currentIdx = STEPS.indexOf(current)
  const activeColor = tokens.color.accentBlue

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>
      {STEPS.map((step, i) => {
        const done    = i < currentIdx
        const active  = i === currentIdx
        const color   = done ? tokens.color.success : active ? activeColor : tokens.color.textDimmed
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              background: active ? activeColor : done ? tokens.color.success : tokens.color.bg,
              border: `2px solid ${color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {done && <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>✓</span>}
              {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <div style={{ fontSize: 11, color, fontWeight: active ? 700 : 500, marginLeft: 5, marginRight: 5, whiteSpace: 'nowrap' }}>
              {labels[step]}
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? tokens.color.success : tokens.color.border, minWidth: 16 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const capaLabel: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: tokens.color.textDimmed,
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5,
}
const capaField: React.CSSProperties = {
  width: '100%', background: tokens.color.bg, border: `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.sm, color: tokens.color.textPrimary, fontSize: 13,
  padding: '8px 10px', outline: 'none', boxSizing: 'border-box',
}

export default function FindingLifecycle({ finding, auditId, onUpdate }: FindingLifecycleProps) {
  const [status, setStatus]   = useState(finding.status)
  const [action, setAction]   = useState(finding.correctiveAction ?? '')
  const [resolvedAt, setResAt] = useState(finding.resolvedAt ?? '')
  const [owner, setOwner]     = useState(finding.assignedTo ?? '')
  const [due, setDue]         = useState(finding.dueDate ?? '')
  const [members, setMembers] = useState<OrgMember[]>([])
  const [evidence, setEvidence] = useState<FindingEvidence[]>([])
  const [uploading, setUploading] = useState(false)

  const loadEvidence = () => {
    if (finding.id) listEvidence(finding.id).then(setEvidence).catch(() => {})
  }

  useEffect(() => {
    listOrgMembers().then(setMembers).catch(() => {})
    loadEvidence()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finding.id])

  const apply = (updates: Partial<typeof finding>) => {
    updateFinding(auditId, finding.itemIndex, updates).then(onUpdate).catch(() => {})
  }

  const overdue = status !== 'resolved' && due ? new Date(due).getTime() < Date.now() : false

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !finding.id) return
    setUploading(true)
    await uploadEvidence(finding.id, file)
    setUploading(false)
    e.target.value = ''
    loadEvidence()
  }

  const openEvidence = async (ev: FindingEvidence) => {
    const url = await getEvidenceUrl(ev.filePath)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const removeEvidence = async (ev: FindingEvidence) => {
    await deleteEvidence(ev)
    loadEvidence()
  }

  const markInProgress = () => {
    setStatus('in-progress')
    apply({ status: 'in-progress' })
  }

  const markResolved = () => {
    const ts = new Date().toISOString()
    setStatus('resolved')
    setResAt(ts)
    apply({ status: 'resolved', resolvedAt: ts })
  }

  const reopen = () => {
    setStatus('open')
    setResAt('')
    apply({ status: 'open', resolvedAt: undefined })
  }

  const saveAction = () => {
    apply({ correctiveAction: action })
  }

  const truncated = finding.question.length > 100
    ? finding.question.slice(0, 97) + '…'
    : finding.question

  return (
    <div style={{ background: tokens.color.surface, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.md, padding: '16px' }}>
      {/* Question + badges */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, flex: 1, fontSize: 13, color: tokens.color.textPrimary, lineHeight: 1.5 }}>
          {truncated}
        </p>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <Badge variant={SEV_VARIANT[finding.severity]} size="sm">{finding.severity}</Badge>
          <Badge variant={STATUS_VARIANT[status]} size="sm">{status}</Badge>
          {overdue && <Badge variant="danger" size="sm">overdue</Badge>}
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator current={status} />

      {/* Corrective action */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: tokens.color.textDimmed, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>
          Corrective Action
        </label>
        <textarea rows={2} value={action} onChange={e => setAction(e.target.value)} onBlur={saveAction}
          placeholder="Describe corrective action…"
          style={{ width: '100%', background: tokens.color.bg, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.sm, color: tokens.color.textPrimary, fontSize: 13, padding: '8px 10px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5 }}
        />
      </div>

      {/* CAPA: owner + due date */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={capaLabel}>Owner</label>
          <select
            value={owner}
            onChange={e => { setOwner(e.target.value); apply({ assignedTo: e.target.value || null }) }}
            style={capaField}
          >
            <option value="">Unassigned</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={capaLabel}>Due date</label>
          <input
            type="date"
            value={due}
            onChange={e => { setDue(e.target.value); apply({ dueDate: e.target.value || null }) }}
            style={{ ...capaField, color: overdue ? tokens.color.danger : tokens.color.textPrimary }}
          />
        </div>
      </div>

      {/* CAPA: evidence */}
      <div style={{ marginBottom: 12 }}>
        <label style={capaLabel}>Evidence</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {evidence.map(ev => (
            <span key={ev.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: tokens.radius.sm, background: tokens.color.bg, border: `1px solid ${tokens.color.border}`, fontSize: 12 }}>
              <button onClick={() => openEvidence(ev)} style={{ background: 'none', border: 'none', color: tokens.color.accentBlue, cursor: 'pointer', fontSize: 12, padding: 0, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ev.fileName}
              </button>
              <button onClick={() => removeEvidence(ev)} title="Remove" style={{ background: 'none', border: 'none', color: tokens.color.textDimmed, cursor: 'pointer', fontSize: 13, padding: 0 }}>×</button>
            </span>
          ))}
          {finding.id ? (
            <label style={{ fontSize: 12, color: tokens.color.accentBlue, cursor: uploading ? 'wait' : 'pointer', padding: '4px 8px', border: `1px dashed ${tokens.color.border}`, borderRadius: tokens.radius.sm }}>
              {uploading ? 'Uploading…' : '+ Attach file'}
              <input type="file" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} accept="image/*,.pdf" />
            </label>
          ) : (
            <span style={{ fontSize: 11, color: tokens.color.textDimmed }}>Save the audit to attach evidence.</span>
          )}
        </div>
      </div>

      {/* Status action buttons */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {status === 'open' && (
          <Button variant="secondary" size="sm" onClick={markInProgress}>Mark In Progress</Button>
        )}
        {status === 'in-progress' && (
          <Button variant="primary" size="sm" onClick={markResolved}>Mark Resolved</Button>
        )}
        {status === 'resolved' && (
          <>
            {resolvedAt && (
              <span style={{ fontSize: 12, color: tokens.color.textMuted }}>
                Resolved {fmtDate(resolvedAt)}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={reopen}>Reopen</Button>
          </>
        )}
      </div>
    </div>
  )
}
