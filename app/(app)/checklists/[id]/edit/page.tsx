'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Button, Badge, Card, Input } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getAllCustomChecklists, updateCustomChecklist } from '@/lib/storage/checklist-storage'
import type {
  ChecklistTemplate,
  ChecklistItemDef,
  ResponseType,
  Severity,
  ChecklistCategory,
} from '@/lib/types/checklist'

// ─── CONSTANTS ─────────────────────────────────────────────────────────────────

const RESPONSE_TYPES: ResponseType[] = ['pass-fail', 'yes-no', 'numeric', 'text']
const SEVERITIES: Severity[]         = ['critical', 'major', 'minor']
const CATEGORIES: ChecklistCategory[] = ['st79', 'st91', 'st108', 'custom']

function makeItem(order: number): ChecklistItemDef {
  return {
    id:           `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    question:     '',
    rationale:    '',
    responseType: 'pass-fail',
    severity:     'minor',
    weight:       1,
    referenceUrl: '',
    order,
  }
}

// ─── ITEM EDITOR ROW ───────────────────────────────────────────────────────────

interface ItemEditorProps {
  item:     ChecklistItemDef
  index:    number
  onChange: (updated: ChecklistItemDef) => void
  onRemove: () => void
}

function ItemEditor({ item, index, onChange, onRemove }: ItemEditorProps) {
  const row: React.CSSProperties = {
    padding: '16px',
    borderBottom: `1px solid ${tokens.color.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  }
  const fieldRow: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 10,
  }
  const selectStyle: React.CSSProperties = {
    width: '100%',
    background: tokens.color.surface,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: 13,
    padding: '9px 12px',
    outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: tokens.color.textMuted,
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 5,
  }

  const set = <K extends keyof ChecklistItemDef>(key: K, val: ChecklistItemDef[K]) =>
    onChange({ ...item, [key]: val })

  const severityWeight: Record<Severity, 1 | 2 | 3> = { critical: 3, major: 2, minor: 1 }

  return (
    <div style={row}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: tokens.color.textDimmed, fontWeight: 600 }}>
          Item {index + 1}
        </span>
        <button
          onClick={onRemove}
          style={{
            background: 'transparent',
            border: 'none',
            color: tokens.color.danger,
            fontSize: 12,
            cursor: 'pointer',
            padding: '2px 6px',
          }}
        >
          Remove
        </button>
      </div>

      <Input
        label="Question *"
        value={item.question}
        onChange={e => set('question', e.target.value)}
        placeholder="Enter compliance question…"
      />
      <Input
        label="Rationale"
        value={item.rationale ?? ''}
        onChange={e => set('rationale', e.target.value)}
        placeholder="Why does this item matter?"
      />

      <div style={fieldRow}>
        <div>
          <label style={labelStyle}>Response Type</label>
          <select
            style={selectStyle}
            value={item.responseType}
            onChange={e => set('responseType', e.target.value as ResponseType)}
          >
            {RESPONSE_TYPES.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Severity</label>
          <select
            style={selectStyle}
            value={item.severity}
            onChange={e => {
              const sev = e.target.value as Severity
              onChange({ ...item, severity: sev, weight: severityWeight[sev] })
            }}
          >
            {SEVERITIES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Reference URL</label>
          <input
            style={{ ...selectStyle, fontSize: 13 }}
            value={item.referenceUrl ?? ''}
            onChange={e => set('referenceUrl', e.target.value)}
            placeholder="https://…"
          />
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ──────────────────────────────────────────────────────────────────────

export default function ChecklistEditPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '')

  const [template, setTemplate] = useState<ChecklistTemplate | null>(null)
  const [notEditable, setNotEditable] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [name, setName]         = useState('')
  const [desc, setDesc]         = useState('')
  const [category, setCategory] = useState<ChecklistCategory>('custom')
  const [version, setVersion]   = useState('v1')
  const [items, setItems]       = useState<ChecklistItemDef[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const custom = getAllCustomChecklists().find(t => t.id === id)
    if (!custom || custom.isBuiltIn) { setNotEditable(true); return }
    setTemplate(custom)
    setName(custom.name)
    setDesc(custom.description)
    setCategory(custom.category)
    setVersion(custom.version)
    setItems(custom.items)
  }, [id])

  const updateItem = useCallback((index: number, updated: ChecklistItemDef) => {
    setItems(prev => prev.map((it, i) => (i === index ? updated : it)))
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index).map((it, i) => ({ ...it, order: i + 1 })))
  }, [])

  const addItem = useCallback(() => {
    setItems(prev => [...prev, makeItem(prev.length + 1)])
  }, [])

  function handleSave() {
    if (!template || saving) return
    setSaving(true)
    updateCustomChecklist(id, {
      name,
      description: desc,
      category,
      version,
      items: items.map((it, i) => ({ ...it, order: i + 1 })),
    })
    router.push('/checklists')
  }

  function handleArchive() {
    if (!template) return
    updateCustomChecklist(id, { status: 'archived' })
    router.push('/checklists')
  }

  // ── Blocked: built-in or not found ─────────────────────────────────────────
  if (notEditable) {
    return (
      <PageShell title="Cannot Edit Template">
        <Card>
          <p style={{ color: tokens.color.textMuted, margin: 0 }}>
            This template cannot be edited. Built-in AAMI templates are read-only.
            Clone the template to create a customisable copy.
          </p>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <Button variant="secondary" href="/checklists">Back to Library</Button>
          </div>
        </Card>
      </PageShell>
    )
  }

  if (!template) {
    return (
      <PageShell title="Loading…">
        <p style={{ color: tokens.color.textMuted }}>Loading template…</p>
      </PageShell>
    )
  }

  const selectStyle: React.CSSProperties = {
    width: '100%',
    background: tokens.color.surface,
    border: `1px solid ${tokens.color.border}`,
    borderRadius: tokens.radius.md,
    color: tokens.color.textPrimary,
    fontSize: 14,
    padding: '10px 14px',
    outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: tokens.color.textMuted,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
  }
  const fieldRow: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  }

  const actions = (
    <>
      <Button variant="danger" onClick={handleArchive}>Archive</Button>
      <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim()}>
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>
    </>
  )

  return (
    <PageShell
      title={`Edit: ${template.name}`}
      description="Modify the checklist name, description, and items. Built-in templates cannot be edited."
      actions={actions}
    >
      {/* Template meta fields */}
      <Card padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Template Name *"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Custom Water Quality Audit"
          />
          <Input
            label="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Brief description of this checklist's scope and purpose"
          />
          <div style={fieldRow}>
            <div>
              <label style={labelStyle}>Category</label>
              <select
                style={selectStyle}
                value={category}
                onChange={e => setCategory(e.target.value as ChecklistCategory)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Input
                label="Version"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="v1"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Items */}
      <div style={{ marginTop: 24 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: tokens.color.textPrimary }}>
            Checklist Items
            <Badge variant="default" size="sm" >{' '}{items.length}</Badge>
          </h2>
          <Button variant="secondary" size="sm" onClick={addItem}>+ Add Item</Button>
        </div>

        <Card padding="sm">
          {items.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: tokens.color.textMuted }}>
              No items yet. Click "+ Add Item" to get started.
            </div>
          ) : (
            items.map((item, i) => (
              <ItemEditor
                key={item.id}
                item={item}
                index={i}
                onChange={updated => updateItem(i, updated)}
                onRemove={() => removeItem(i)}
              />
            ))
          )}
        </Card>
      </div>

      {/* Bottom action bar */}
      <div style={{
        marginTop: 24,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
      }}>
        <Button variant="ghost" href="/checklists">Cancel</Button>
        <Button variant="danger" onClick={handleArchive}>Archive</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </PageShell>
  )
}
