'use client'

import { useMemo, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { FRAMEWORK, RATING_LABEL, RATING_ORDER } from '@/lib/consult/framework'
import { createObservation } from '@/lib/consult/db/observations'
import { bumpLibraryUse } from '@/lib/consult/db/library'
import { observationFromGap, observationFromLibrary, unconvertedGaps } from '@/lib/consult/builders'
import ObservationEditor, { BLANK_DRAFT } from './ObservationEditor'
import ObservationItem from './ObservationItem'
import LibraryPicker from './LibraryPicker'
import { Empty, Select, errMsg } from './fields'
import type { AreaId, Engagement, FrameworkArea, LibraryEntry, Observation, Rating, ResponseMap } from '@/lib/consult/types'

export default function ObservationsTab({ engagement, areas, responses, observations, setObservations, onStartAudit, onError }: {
  engagement:      Engagement
  areas:           FrameworkArea[]
  responses:       ResponseMap
  observations:    Observation[]
  setObservations: React.Dispatch<React.SetStateAction<Observation[]>>
  onStartAudit:    (o: Observation) => void
  onError:         (msg: string) => void
}) {
  const [adding, setAdding] = useState(false)
  const [picking, setPicking] = useState(false)
  const [converting, setConverting] = useState(false)
  const [areaFilter, setAreaFilter] = useState<AreaId | 'all'>('all')
  const [ratingFilter, setRatingFilter] = useState<Rating | 'all'>('all')

  const scopeItemIds = useMemo(() => new Set(areas.flatMap(a => a.items.map(i => i.id))), [areas])
  const gaps = unconvertedGaps(responses, observations, scopeItemIds)

  const shown = useMemo(() => observations
    .filter(o => (areaFilter === 'all' || o.area === areaFilter) && (ratingFilter === 'all' || o.rating === ratingFilter))
    .sort((a, b) => RATING_ORDER.indexOf(a.rating) - RATING_ORDER.indexOf(b.rating)),
  [observations, areaFilter, ratingFilter])

  async function convertGaps() {
    setConverting(true)
    try {
      const created: Observation[] = []
      for (const id of gaps) {
        const input = observationFromGap(engagement.id, id, responses)
        if (input) created.push(await createObservation(input))
      }
      setObservations(list => [...list, ...created])
    } catch (e) { onError(errMsg(e)) } finally { setConverting(false) }
  }

  async function insertFromLibrary(entry: LibraryEntry) {
    setPicking(false)
    try {
      const obs = await createObservation(observationFromLibrary(engagement.id, entry))
      setObservations(list => [...list, obs])
      bumpLibraryUse(entry).catch(() => {})
    } catch (e) { onError(errMsg(e)) }
  }

  const update = (o: Observation) => setObservations(list => list.map(x => (x.id === o.id ? o : x)))
  const remove = (id: string) => setObservations(list => list.filter(x => x.id !== id))

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <Button onClick={() => setAdding(true)} disabled={adding}>+ Field observation</Button>
        <Button variant="secondary" onClick={() => setPicking(true)}>Insert from library</Button>
        {gaps.length > 0 && (
          <Button variant="secondary" disabled={converting} onClick={convertGaps}>
            {converting ? 'Creating…' : `Create findings from ${gaps.length} walkthrough gap${gaps.length === 1 ? '' : 's'}`}
          </Button>
        )}
        <div style={{ flex: 1 }} />
        <div style={{ width: 200 }}>
          <Select<AreaId | 'all'> value={areaFilter} onChange={setAreaFilter}
            options={[{ value: 'all', label: 'All areas' }, ...FRAMEWORK.map(a => ({ value: a.id, label: a.name }))]} />
        </div>
        <div style={{ width: 160 }}>
          <Select<Rating | 'all'> value={ratingFilter} onChange={setRatingFilter}
            options={[{ value: 'all', label: 'All ratings' }, ...RATING_ORDER.map(r => ({ value: r, label: RATING_LABEL[r] }))]} />
        </div>
      </div>

      {adding && (
        <div style={{ marginBottom: 16 }}>
          <Card padding="lg">
            <h3 style={{ margin: '0 0 14px', fontSize: 15, color: tokens.color.textPrimary }}>New observation</h3>
            <ObservationEditor
              initial={{ ...BLANK_DRAFT, area: areaFilter !== 'all' ? areaFilter : (areas[0]?.id ?? BLANK_DRAFT.area) }}
              submitLabel="Add observation" onCancel={() => setAdding(false)}
              onSubmit={async d => {
                try {
                  const obs = await createObservation({ ...d, engagementId: engagement.id, itemId: null, source: 'field' })
                  setObservations(list => [...list, obs]); setAdding(false)
                } catch (e) { onError(errMsg(e)) }
              }} />
          </Card>
        </div>
      )}

      {!observations.length && !adding ? (
        <Card><Empty
          title="No observations yet"
          body="Record what you see on the floor, convert walkthrough gaps, or drop in findings from your library. Strengths count too."
        /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {shown.map(o => <ObservationItem key={o.id} obs={o} onChange={update} onDelete={remove} onStartAudit={onStartAudit} onError={onError} />)}
          {!shown.length && <div style={{ fontSize: 13, color: tokens.color.textMuted }}>No observations match these filters.</div>}
        </div>
      )}

      {picking && (
        <LibraryPicker defaultArea={areaFilter !== 'all' ? areaFilter : undefined}
          onPick={insertFromLibrary} onClose={() => setPicking(false)} />
      )}
    </div>
  )
}
