'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Button, Badge, Card } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { BUILT_IN_TEMPLATES } from '@/lib/data/templates'
import { getAllCustomChecklists, cloneChecklist, saveCustomChecklist } from '@/lib/storage/checklist-storage'
import type { ChecklistTemplate, ChecklistItemDef } from '@/lib/types/checklist'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function severityVariant(s: ChecklistItemDef['severity']): 'danger' | 'warning' | 'default' {
  if (s === 'critical') return 'danger'
  if (s === 'major')    return 'warning'
  return 'default'
}

function responseLabel(r: ChecklistItemDef['responseType']): string {
  const map: Record<ChecklistItemDef['responseType'], string> = {
    'pass-fail': 'Pass / Fail',
    'yes-no':    'Yes / No',
    'numeric':   'Numeric',
    'text':      'Text',
  }
  return map[r]
}

function categoryLabel(c: ChecklistTemplate['category']): string {
  const map: Record<ChecklistTemplate['category'], string> = {
    st79:   'AAMI ST79',
    st91:   'AAMI ST91',
    st108:  'AAMI ST108',
    custom: 'Custom',
  }
  return map[c]
}

function statusVariant(s: ChecklistTemplate['status']): 'success' | 'warning' | 'default' {
  if (s === 'active')   return 'success'
  if (s === 'draft')    return 'warning'
  return 'default'
}

// ─── ITEM ROW ─────────────────────────────────────────────────────────────────

function ItemRow({ item, index }: { item: ChecklistItemDef; index: number }) {
  const row: React.CSSProperties = {
    padding: '14px 16px',
    borderBottom: `1px solid ${tokens.color.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  }
  const meta: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  }
  return (
    <div style={row}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ color: tokens.color.textDimmed, fontSize: 12, minWidth: 24, paddingTop: 2 }}>
          {index + 1}.
        </span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 14, color: tokens.color.textPrimary, lineHeight: 1.5 }}>
            {item.question}
          </p>
          {item.rationale && (
            <p style={{ margin: '4px 0 0', fontSize: 12, color: tokens.color.textMuted, lineHeight: 1.5 }}>
              {item.rationale}
            </p>
          )}
          <div style={{ ...meta, marginTop: 8 }}>
            <Badge variant={severityVariant(item.severity)} size="sm">
              {item.severity}
            </Badge>
            <Badge variant="info" size="sm">
              {responseLabel(item.responseType)}
            </Badge>
            <span style={{ fontSize: 11, color: tokens.color.textDimmed }}>
              Weight: {item.weight}
            </span>
            {item.referenceUrl && (
              <a
                href={item.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, color: tokens.color.accentBlue, textDecoration: 'none' }}
              >
                Reference ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ChecklistViewPage() {
  const params = useParams()
  const router = useRouter()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id ?? '')

  const [template, setTemplate] = useState<ChecklistTemplate | null>(null)
  const [notFound, setNotFound]  = useState(false)

  useEffect(() => {
    const builtin = BUILT_IN_TEMPLATES.find(t => t.id === id)
    if (builtin) { setTemplate(builtin); return }
    const custom = getAllCustomChecklists().find(t => t.id === id)
    if (custom) { setTemplate(custom); return }
    setNotFound(true)
  }, [id])

  function handleClone() {
    if (!template) return
    const cloned = cloneChecklist(template, `${template.name} (Copy)`)
    saveCustomChecklist(cloned)
    router.push('/checklists')
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <PageShell title="Template Not Found">
        <Card>
          <p style={{ color: tokens.color.textMuted, margin: 0 }}>
            No checklist template with ID <code style={{ color: tokens.color.accentBlue }}>{id}</code> could be found.
          </p>
          <div style={{ marginTop: 16 }}>
            <Button variant="secondary" href="/checklists">Back to Library</Button>
          </div>
        </Card>
      </PageShell>
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!template) {
    return (
      <PageShell title="Loading…">
        <p style={{ color: tokens.color.textMuted }}>Loading template…</p>
      </PageShell>
    )
  }

  const actions = (
    <>
      <Button variant="primary" href="/checklist">Start Audit</Button>
      <Button variant="secondary" onClick={handleClone}>Clone</Button>
      {!template.isBuiltIn && (
        <Button variant="secondary" href={`/checklists/${id}/edit`}>Edit</Button>
      )}
    </>
  )

  return (
    <PageShell
      title={template.name}
      description={template.description}
      actions={actions}
    >
      {/* Meta row */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        <Badge variant="info">{categoryLabel(template.category)}</Badge>
        <Badge variant={statusVariant(template.status)}>{template.status}</Badge>
        <Badge variant="default">v{template.version.replace('v', '')}</Badge>
        <Badge variant="default">{template.items.length} items</Badge>
        {template.isBuiltIn && <Badge variant="info">Built-in</Badge>}
      </div>

      {/* Item list */}
      <Card padding="sm">
        <div style={{
          borderBottom: `1px solid ${tokens.color.border}`,
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.color.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Checklist Items
          </span>
          <span style={{ fontSize: 12, color: tokens.color.textDimmed }}>
            {template.items.length} total
          </span>
        </div>
        {template.items.map((item, i) => (
          <ItemRow key={item.id} item={item} index={i} />
        ))}
      </Card>
    </PageShell>
  )
}
