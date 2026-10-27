'use client'

import { useEffect, useMemo, useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { createLibraryEntry, deleteLibraryEntry, listLibrary, updateLibraryEntry } from '@/lib/consult/db/library'
import { STARTER_LIBRARY } from '@/lib/consult/starter-library'
import { FRAMEWORK, PRIORITY_LABEL, RATING_COLOR, RATING_LABEL, areaName } from '@/lib/consult/framework'
import ObservationEditor, { BLANK_DRAFT, type ObservationDraft } from '@/components/consult/ObservationEditor'
import { Empty, ErrorNote, Pill, Select, TextInput, errMsg } from '@/components/consult/fields'
import type { AreaId, LibraryEntry } from '@/lib/consult/types'

type Source = 'mine' | 'starter'

function toInput(d: ObservationDraft) {
  return {
    area: d.area, title: d.title, findingText: d.detail, recommendation: d.recommendation,
    standardRefs: d.standardRefs, rating: d.rating, priority: d.priority, tags: [] as string[],
  }
}

function toDraft(e: LibraryEntry): ObservationDraft {
  return {
    area: e.area, title: e.title, detail: e.findingText, rating: e.rating, priority: e.priority,
    recommendation: e.recommendation, standardRefs: e.standardRefs, ownerRole: '',
  }
}

export default function LibraryPage() {
  const [mine, setMine] = useState<LibraryEntry[] | null>(null)
  const [source, setSource] = useState<Source>('mine')
  const [q, setQ] = useState('')
  const [area, setArea] = useState<AreaId | 'all'>('all')
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { listLibrary().then(setMine).catch(e => { setError(errMsg(e)); setMine([]) }) }, [])

  const copiedTitles = useMemo(() => new Set((mine ?? []).map(m => m.title)), [mine])
  const entries = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return (source === 'mine' ? mine ?? [] : STARTER_LIBRARY).filter(e =>
      (area === 'all' || e.area === area) &&
      (!needle || [e.title, e.findingText, e.recommendation].some(v => v.toLowerCase().includes(needle))))
  }, [mine, source, q, area])

  async function copy(e: LibraryEntry) {
    try {
      const created = await createLibraryEntry({ ...e })
      setMine(list => [created, ...(list ?? [])])
    } catch (err) { setError(errMsg(err)) }
  }

  async function remove(e: LibraryEntry) {
    if (!confirm(`Delete “${e.title}” from your library?`)) return
    try { await deleteLibraryEntry(e.id); setMine(list => (list ?? []).filter(x => x.id !== e.id)) } catch (err) { setError(errMsg(err)) }
  }

  return (
    <PageShell
      title="Knowledge Library"
      description="Your reusable findings and recommendations — written once, dropped into any engagement, and used by the AI drafter to match your voice."
      actions={<Button onClick={() => { setSource('mine'); setEditingId('new') }}>+ New entry</Button>}
    >
      <ErrorNote message={error} onDismiss={() => setError(null)} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        {(['mine', 'starter'] as Source[]).map(s => (
          <Button key={s} size="sm" variant={source === s ? 'primary' : 'secondary'} onClick={() => setSource(s)}>
            {s === 'mine' ? `My library (${mine?.length ?? 0})` : `Starter set (${STARTER_LIBRARY.length})`}
          </Button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ width: 260 }}><TextInput placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <div style={{ width: 220 }}>
          <Select<AreaId | 'all'> value={area} onChange={setArea}
            options={[{ value: 'all', label: 'All areas' }, ...FRAMEWORK.map(a => ({ value: a.id, label: a.name }))]} />
        </div>
      </div>

      {editingId === 'new' && (
        <div style={{ marginBottom: 16 }}>
          <Card padding="lg">
            <ObservationEditor hideOwner initial={{ ...BLANK_DRAFT, area: area === 'all' ? BLANK_DRAFT.area : area }}
              submitLabel="Add to library" onCancel={() => setEditingId(null)}
              onSubmit={async d => {
                try { const e = await createLibraryEntry(toInput(d)); setMine(l => [e, ...(l ?? [])]); setEditingId(null) } catch (err) { setError(errMsg(err)) }
              }} />
          </Card>
        </div>
      )}

      {mine === null ? (
        <div style={{ color: tokens.color.textMuted }}>Loading…</div>
      ) : !entries.length ? (
        <Card><Empty
          title={source === 'mine' ? 'Your library is empty' : 'No matches'}
          body={source === 'mine' ? 'Save observations from any engagement, copy from the starter set, or write entries from scratch.' : undefined}
          action={source === 'mine' ? <Button variant="secondary" onClick={() => setSource('starter')}>Browse the starter set</Button> : undefined}
        /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {entries.map(e => editingId === e.id ? (
            <Card key={e.id} padding="lg">
              <ObservationEditor hideOwner initial={toDraft(e)} submitLabel="Save" onCancel={() => setEditingId(null)}
                onSubmit={async d => {
                  try {
                    await updateLibraryEntry(e.id, toInput(d))
                    setMine(l => (l ?? []).map(x => (x.id === e.id ? { ...x, ...toInput(d) } : x)))
                    setEditingId(null)
                  } catch (err) { setError(errMsg(err)) }
                }} />
            </Card>
          ) : (
            <Card key={e.id} padding="md">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <Pill color={RATING_COLOR[e.rating]}>{RATING_LABEL[e.rating]}</Pill>
                <span style={{ fontSize: 15, fontWeight: 600, color: tokens.color.textPrimary, flex: 1 }}>{e.title}</span>
                <span style={{ fontSize: 12, color: tokens.color.textDimmed }}>
                  {areaName(e.area)}{e.rating !== 'strength' ? ` · ${PRIORITY_LABEL[e.priority]}` : ''}{e.builtIn ? '' : ` · used ${e.useCount}×`}
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.5, margin: '8px 0 0' }}>{e.findingText}</p>
              {e.recommendation && <p style={{ fontSize: 13, color: tokens.color.textMuted, lineHeight: 1.5, margin: '6px 0 0' }}><b>Recommend:</b> {e.recommendation}</p>}
              {e.standardRefs.length > 0 && <div style={{ fontSize: 12, color: tokens.color.textDimmed, marginTop: 6 }}>{e.standardRefs.join(' · ')}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {e.builtIn ? (
                  <Button size="sm" variant="secondary" disabled={copiedTitles.has(e.title)} onClick={() => copy(e)}>
                    {copiedTitles.has(e.title) ? '✓ In my library' : 'Copy to my library'}
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(e.id)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(e)}>Delete</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}
