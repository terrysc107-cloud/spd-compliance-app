'use client'

import { useState, useEffect, useCallback } from 'react'
import PageShell from '@/components/layout/PageShell'
import { Button, Card, Badge, Input } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { BUILT_IN_TEMPLATES, getAllTemplates } from '@/lib/data/templates'
import {
  getAllCustomChecklists,
  cloneChecklist,
  saveCustomChecklist,
  deleteCustomChecklist,
} from '@/lib/db/checklists'
import type { ChecklistTemplate, ChecklistCategory } from '@/lib/types/checklist'

// ─── CATEGORY FILTER TABS ─────────────────────────────────────────────────────

type FilterTab = 'all' | ChecklistCategory

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',    label: 'All' },
  { key: 'st79',   label: 'ST79' },
  { key: 'st91',   label: 'ST91' },
  { key: 'st108',  label: 'ST108' },
  { key: 'custom', label: 'Custom' },
]

const CATEGORY_BADGE: Record<ChecklistCategory, { label: string; variant: 'info' | 'success' | 'warning' | 'default' }> = {
  st79:   { label: 'ST79',   variant: 'info' },
  st91:   { label: 'ST91',   variant: 'success' },
  st108:  { label: 'ST108',  variant: 'warning' },
  custom: { label: 'Custom', variant: 'default' },
}

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  active:   { label: 'Active',   variant: 'success' },
  draft:    { label: 'Draft',    variant: 'warning' },
  archived: { label: 'Archived', variant: 'default' },
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ChecklistsPage() {
  const [allTemplates, setAllTemplates] = useState<ChecklistTemplate[]>([])
  const [activeTab, setActiveTab]       = useState<FilterTab>('all')
  const [search, setSearch]             = useState('')

  const reload = useCallback(() => {
    getAllCustomChecklists()
      .then(custom => setAllTemplates(getAllTemplates(custom)))
      .catch(() => setAllTemplates(getAllTemplates([])))
  }, [])

  useEffect(() => { reload() }, [reload])

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filtered = allTemplates.filter(t => {
    const matchTab    = activeTab === 'all' || t.category === activeTab
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  // ── Actions ──────────────────────────────────────────────────────────────────
  function handleClone(template: ChecklistTemplate) {
    const newName = `${template.name} (Copy)`
    const cloned  = cloneChecklist(template, newName)
    saveCustomChecklist(cloned).then(reload).catch(() => {})
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this checklist? This cannot be undone.')) return
    deleteCustomChecklist(id).then(reload).catch(() => {})
  }

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <PageShell
      title="Checklist Library"
      description="Browse AAMI-aligned templates or build your own custom compliance checklists."
      actions={
        <Button href="/checklists/new" size="md">
          + Create New Checklist
        </Button>
      }
    >
      {/* Search */}
      <div style={{ maxWidth: 440, marginBottom: 20 }}>
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding:      '7px 18px',
              borderRadius: tokens.radius.pill,
              fontSize:     '13px',
              fontWeight:   500,
              cursor:       'pointer',
              border:       activeTab === tab.key
                ? 'none'
                : `1px solid ${tokens.color.border}`,
              background: activeTab === tab.key
                ? tokens.color.accentBlue
                : 'transparent',
              color: activeTab === tab.key
                ? tokens.color.textPrimary
                : tokens.color.textMuted,
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding:   '60px 24px',
          color:     tokens.color.textMuted,
          fontSize:  '14px',
        }}>
          {search ? `No templates matching "${search}".` : 'No templates in this category yet.'}
        </div>
      ) : (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap:                 20,
        }}>
          {filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onClone={() => handleClone(t)}
              onDelete={() => handleDelete(t.id)}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}

// ─── TEMPLATE CARD ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onClone,
  onDelete,
}: {
  template: ChecklistTemplate
  onClone:  () => void
  onDelete: () => void
}) {
  const catBadge    = CATEGORY_BADGE[template.category]
  const statusBadge = STATUS_BADGE[template.status] ?? STATUS_BADGE.draft

  return (
    <Card padding="lg">
      {/* Badges row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge variant={catBadge.variant} size="sm">{catBadge.label}</Badge>
        <Badge variant={statusBadge.variant} size="sm">{statusBadge.label}</Badge>
        {template.isBuiltIn && (
          <Badge variant="default" size="sm">Built-in</Badge>
        )}
      </div>

      {/* Title & version */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{
          margin:     0,
          fontSize:   '15px',
          fontWeight: 600,
          color:      tokens.color.textPrimary,
          lineHeight: 1.3,
        }}>
          {template.name}
        </h3>
        <span style={{
          fontSize: '12px',
          color:    tokens.color.textDimmed,
          marginTop: '3px',
          display:  'block',
        }}>
          {template.version} &middot; {template.items.length} items
        </span>
      </div>

      {/* Description */}
      <p style={{
        margin:     '0 0 16px',
        fontSize:   '13px',
        color:      tokens.color.textMuted,
        lineHeight: 1.6,
        display:    '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow:   'hidden',
      } as React.CSSProperties}>
        {template.description}
      </p>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button href="/checklist" size="sm" variant="primary">
          Start Audit
        </Button>
        <Button size="sm" variant="secondary" onClick={onClone}>
          Clone
        </Button>
        {!template.isBuiltIn && (
          <>
            <Button href={`/checklists/${template.id}/edit`} size="sm" variant="ghost">
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
