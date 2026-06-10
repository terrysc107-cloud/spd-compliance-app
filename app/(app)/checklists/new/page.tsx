'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Button, Input } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { saveCustomChecklist } from '@/lib/db/checklists'
import type {
  ChecklistTemplate,
  ChecklistItemDef,
  ChecklistCategory,
  ResponseType,
  Severity,
  ChecklistStatus,
} from '@/lib/types/checklist'

function blankItem(order: number): ChecklistItemDef {
  return {
    id:           `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    question:     '',
    rationale:    '',
    responseType: 'pass-fail',
    severity:     'major',
    weight:       2,
    referenceUrl: '',
    order,
  }
}

const selectStyle: React.CSSProperties = {
  background:   tokens.color.surface,
  border:       `1px solid ${tokens.color.border}`,
  borderRadius: tokens.radius.md,
  color:        tokens.color.textPrimary,
  fontSize:     '13px',
  padding:      '8px 12px',
  outline:      'none',
  cursor:       'pointer',
  width:        '100%',
}

const labelStyle: React.CSSProperties = {
  display:      'block',
  color:        tokens.color.textMuted,
  fontSize:     '12px',
  fontWeight:   500,
  marginBottom: '5px',
}

const sectionLabel: React.CSSProperties = {
  fontSize:    '11px',
  fontWeight:  600,
  color:       tokens.color.textDimmed,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '6px',
}

export default function NewChecklistPage() {
  const router = useRouter()

  const [name,        setName]        = useState('')
  const [description, setDescription] = useState('')
  const [category,    setCategory]    = useState<ChecklistCategory>('custom')
  const [version,     setVersion]     = useState('v1')
  const [items,       setItems]       = useState<ChecklistItemDef[]>([blankItem(1)])
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  function addItem() {
    setItems(prev => [...prev, blankItem(prev.length + 1)])
  }

  function removeItem(id: string) {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      return next.map((item, idx) => ({ ...item, order: idx + 1 }))
    })
  }

  function updateItem(id: string, patch: Partial<ChecklistItemDef>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!name.trim())               errs.name = 'Name is required.'
    if (items.length === 0)         errs.items = 'Add at least one item.'
    items.forEach((item, idx) => {
      if (!item.question.trim())    errs[`q-${idx}`] = 'Question is required.'
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function buildTemplate(status: ChecklistStatus): ChecklistTemplate {
    const now = new Date().toISOString()
    return {
      id:          crypto.randomUUID(),
      name:        name.trim(),
      description: description.trim(),
      category,
      version:     version.trim() || 'v1',
      status,
      items,
      isBuiltIn:   false,
      createdAt:   now,
      updatedAt:   now,
    }
  }

  function handleSave(status: ChecklistStatus) {
    if (!validate()) return
    const template = buildTemplate(status)
    saveCustomChecklist(template).then(() => router.push('/checklists')).catch(() => {})
  }

  return (
    <PageShell
      title="Create Checklist"
      description="Build a custom compliance checklist with your own questions and scoring criteria."
      actions={
        <Button href="/checklists" size="sm" variant="ghost">
          Cancel
        </Button>
      }
    >
      <div style={{ maxWidth: 820 }}>

        <Section title="Checklist Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Name *"
                placeholder="e.g. NICU Instrument Reprocessing Audit"
                value={name}
                onChange={e => setName(e.target.value)}
                error={errors.name}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Input
                label="Description"
                placeholder="Brief description of scope and purpose"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as ChecklistCategory)}
                style={selectStyle}
              >
                <option value="custom">Custom</option>
                <option value="st79">ST79</option>
                <option value="st91">ST91</option>
                <option value="st108">ST108</option>
              </select>
            </div>
            <div>
              <Input
                label="Version"
                placeholder="v1"
                value={version}
                onChange={e => setVersion(e.target.value)}
              />
            </div>
          </div>
        </Section>

        <Section title={`Checklist Items (${items.length})`}>
          {errors.items && (
            <p style={{ color: tokens.color.danger, fontSize: '13px', marginBottom: 12 }}>
              {errors.items}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                index={idx}
                questionError={errors[`q-${idx}`]}
                onUpdate={patch => updateItem(item.id, patch)}
                onRemove={() => removeItem(item.id)}
                canRemove={items.length > 1}
              />
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <Button variant="secondary" size="sm" onClick={addItem}>
              + Add Item
            </Button>
          </div>
        </Section>

        <div style={{ display: 'flex', gap: 12, marginTop: 8, paddingTop: 24, borderTop: `1px solid ${tokens.color.border}` }}>
          <Button variant="primary" size="md" onClick={() => handleSave('active')}>
            Save &amp; Activate
          </Button>
          <Button variant="secondary" size="md" onClick={() => handleSave('draft')}>
            Save as Draft
          </Button>
        </div>

      </div>
    </PageShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background:   tokens.color.surface,
      border:       `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.lg,
      padding:      '24px',
      marginBottom: '20px',
    }}>
      <p style={sectionLabel}>{title}</p>
      {children}
    </div>
  )
}

function ItemRow({
  item,
  index,
  questionError,
  onUpdate,
  onRemove,
  canRemove,
}: {
  item:          ChecklistItemDef
  index:         number
  questionError?: string
  onUpdate:      (patch: Partial<ChecklistItemDef>) => void
  onRemove:      () => void
  canRemove:     boolean
}) {
  return (
    <div style={{
      background:   tokens.color.bg,
      border:       `1px solid ${tokens.color.border}`,
      borderRadius: tokens.radius.md,
      padding:      '16px',
    }}>
      {/* Item header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: '12px', color: tokens.color.textDimmed, fontWeight: 600 }}>
          Item {index + 1}
        </span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Drag indicator (visual only) */}
          <span title="Drag to reorder" style={{ cursor: 'grab', color: tokens.color.textDimmed, fontSize: '16px', lineHeight: 1 }}>
            &#8942;&#8942;
          </span>
          {canRemove && (
            <button
              onClick={onRemove}
              style={{
                background: 'transparent',
                border:     'none',
                color:      tokens.color.danger,
                cursor:     'pointer',
                fontSize:   '12px',
                fontWeight: 500,
                padding:    '2px 6px',
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <Input
          label="Question *"
          placeholder="e.g. Is the eyewash station accessible within 10 seconds?"
          value={item.question}
          onChange={e => onUpdate({ question: e.target.value })}
          error={questionError}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Input
          label="Rationale (optional)"
          placeholder="Why does this matter clinically or regulatorily?"
          value={item.rationale ?? ''}
          onChange={e => onUpdate({ rationale: e.target.value })}
        />
      </div>

      {/* Controls row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        {/* Response type */}
        <div>
          <label style={labelStyle}>Response Type</label>
          <select
            value={item.responseType}
            onChange={e => onUpdate({ responseType: e.target.value as ResponseType })}
            style={selectStyle}
          >
            <option value="pass-fail">Pass / Fail</option>
            <option value="yes-no">Yes / No</option>
            <option value="numeric">Numeric</option>
            <option value="text">Text</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Severity</label>
          <select value={item.severity} onChange={e => onUpdate({ severity: e.target.value as Severity })} style={selectStyle}>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Weight</label>
          <select value={item.weight} onChange={e => onUpdate({ weight: Number(e.target.value) as 1 | 2 | 3 })} style={selectStyle}>
            <option value={1}>1 — Low</option>
            <option value={2}>2 — Medium</option>
            <option value={3}>3 — High</option>
          </select>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <Input
          label="Reference URL (optional)"
          placeholder="https://www.aami.org/..."
          value={item.referenceUrl ?? ''}
          onChange={e => onUpdate({ referenceUrl: e.target.value })}
        />
      </div>
    </div>
  )
}
