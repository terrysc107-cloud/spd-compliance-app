'use client'

import { useRef, useState } from 'react'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { PRIORITY_LABEL, RATING_COLOR, RATING_LABEL, areaName } from '@/lib/consult/framework'
import { deleteObservation, deletePhoto, updateObservation, uploadPhoto } from '@/lib/consult/db/observations'
import { createLibraryEntry } from '@/lib/consult/db/library'
import { libraryFromObservation } from '@/lib/consult/builders'
import ObservationEditor from './ObservationEditor'
import { Pill, errMsg } from './fields'
import type { Observation } from '@/lib/consult/types'

export default function ObservationItem({ obs, onChange, onDelete, onStartAudit, onError }: {
  obs:      Observation
  onChange: (o: Observation) => void
  onDelete: (id: string) => void
  onStartAudit?: (o: Observation) => void
  onError:  (msg: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savedToLib, setSavedToLib] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    try {
      const added = []
      for (const f of Array.from(files)) added.push(await uploadPhoto(obs, f))
      onChange({ ...obs, photos: [...(obs.photos ?? []), ...added] })
    } catch (e) { onError(errMsg(e)) } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function saveToLibrary() {
    try { await createLibraryEntry(libraryFromObservation(obs)); setSavedToLib(true) } catch (e) { onError(errMsg(e)) }
  }

  async function remove() {
    if (!confirm(`Delete “${obs.title}”${obs.photos?.length ? ' and its photos' : ''}?`)) return
    try { await deleteObservation(obs); onDelete(obs.id) } catch (e) { onError(errMsg(e)) }
  }

  if (editing) return (
    <Card padding="lg">
      <ObservationEditor initial={obs} submitLabel="Save" onCancel={() => setEditing(false)}
        onSubmit={async d => {
          try { await updateObservation(obs.id, { ...d, needsReview: false }); onChange({ ...obs, ...d, needsReview: false }); setEditing(false) } catch (e) { onError(errMsg(e)) }
        }} />
    </Card>
  )

  return (
    <Card padding="md">
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Pill color={RATING_COLOR[obs.rating]}>{RATING_LABEL[obs.rating]}</Pill>
        {obs.needsReview && <Pill color={tokens.color.warning}>🎙 Needs review</Pill>}
        <span style={{ fontSize: 15, fontWeight: 600, color: tokens.color.textPrimary, flex: 1, minWidth: 200 }}>{obs.title}</span>
        {obs.rating !== 'strength' && <span style={{ fontSize: 12, color: tokens.color.textMuted }}>{PRIORITY_LABEL[obs.priority]}</span>}
      </div>
      <div style={{ fontSize: 12, color: tokens.color.textDimmed, marginTop: 4 }}>
        {areaName(obs.area)}{obs.ownerRole ? ` · Owner: ${obs.ownerRole}` : ''}{obs.source === 'walkthrough' ? ' · from walkthrough' : obs.source === 'library' ? ' · from library' : obs.source === 'voice' ? ' · by voice' : ''}
      </div>
      {obs.detail && <Para label="Observed" text={obs.detail} />}
      {obs.recommendation && <Para label="Recommendation" text={obs.recommendation} />}
      {obs.standardRefs.length > 0 && <div style={{ fontSize: 12, color: tokens.color.textMuted, marginTop: 8 }}>{obs.standardRefs.join(' · ')}</div>}

      {!!obs.photos?.length && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {obs.photos.map(ph => (
            <div key={ph.id} style={{ position: 'relative' }}>
              {ph.url
                ? <a href={ph.url} target="_blank" rel="noreferrer"><img src={ph.url} alt={ph.caption ?? ph.fileName} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 6, border: `1px solid ${tokens.color.border}` }} /></a>
                : <div style={{ width: 120, height: 90, borderRadius: 6, background: tokens.color.bg, fontSize: 11, color: tokens.color.textDimmed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ph.fileName}</div>}
              <button aria-label="Remove photo" onClick={async () => {
                try { await deletePhoto(ph); onChange({ ...obs, photos: obs.photos!.filter(x => x.id !== ph.id) }) } catch (e) { onError(errMsg(e)) }
              }} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, border: 'none', background: 'rgba(0,0,0,0.65)', color: '#fff', cursor: 'pointer', fontSize: 13 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {obs.needsReview && (
          <Button size="sm" onClick={async () => {
            try { await updateObservation(obs.id, { needsReview: false }); onChange({ ...obs, needsReview: false }) } catch (e) { onError(errMsg(e)) }
          }}>✓ Reviewed</Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Edit</Button>
        <Button size="sm" variant="secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? 'Uploading…' : '📷 Add photo'}</Button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={e => onFiles(e.target.files)} />
        {onStartAudit && obs.rating !== 'strength' && (
          <Button size="sm" variant="secondary" onClick={() => onStartAudit(obs)}>📋 Start audit</Button>
        )}
        <Button size="sm" variant="ghost" disabled={savedToLib} onClick={saveToLibrary}>{savedToLib ? '✓ In library' : 'Save to my library'}</Button>
        <Button size="sm" variant="ghost" onClick={remove}>Delete</Button>
      </div>
    </Card>
  )
}

function Para({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: tokens.color.textDimmed, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label} </span>
      <span style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{text}</span>
    </div>
  )
}
