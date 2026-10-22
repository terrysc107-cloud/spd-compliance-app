'use client'

import { useEffect, useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import { Card, Button } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { EMPTY_SETTINGS, getConsultSettings, saveConsultSettings } from '@/lib/consult/db/library'
import { ErrorNote, Field, TextArea, TextInput, errMsg, grid } from '@/components/consult/fields'
import type { ConsultSettings } from '@/lib/consult/types'

export default function ConsultSettingsPage() {
  const [s, setS] = useState<ConsultSettings>(EMPTY_SETTINGS)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof ConsultSettings>(k: K, v: string) => setS(p => ({ ...p, [k]: v }))

  useEffect(() => {
    getConsultSettings().then(v => { setS(v); setLoaded(true) }).catch(e => { setError(errMsg(e)); setLoaded(true) })
  }, [])

  async function save() {
    setSaving(true); setError(null)
    try { await saveConsultSettings(s); setSaved(true); setTimeout(() => setSaved(false), 2000) } catch (e) { setError(errMsg(e)) } finally { setSaving(false) }
  }

  if (!loaded) return <PageShell title="Consultant Profile"><div style={{ color: tokens.color.textMuted }}>Loading…</div></PageShell>

  return (
    <PageShell title="Consultant Profile" description="How you appear on reports, and how the AI drafter should write for you.">
      <ErrorNote message={error} onDismiss={() => setError(null)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
        <Card padding="lg">
          <h3 style={h3}>Report branding</h3>
          <div style={grid(240)}>
            <Field label="Your name"><TextInput value={s.consultantName} onChange={e => set('consultantName', e.target.value)} /></Field>
            <Field label="Credentials" hint="e.g. CRCST, CHL, CIS, CER"><TextInput value={s.credentials} onChange={e => set('credentials', e.target.value)} /></Field>
            <Field label="Firm name"><TextInput value={s.firmName} onChange={e => set('firmName', e.target.value)} /></Field>
          </div>
        </Card>

        <Card padding="lg">
          <h3 style={h3}>Your voice</h3>
          <Field label="Writing guidance for the AI drafter"
            hint="Tone, words you use or avoid, how blunt to be, how you frame recommendations. Your library entries are also used as examples.">
            <TextArea rows={5} value={s.voiceNotes} onChange={e => set('voiceNotes', e.target.value)}
              placeholder={'e.g. Direct and plain-spoken. Lead with patient risk. Never say "best practice" — cite the standard. Frame findings as opportunities unless there is immediate patient risk. Keep the executive summary under 200 words.'} />
          </Field>
        </Card>

        <Card padding="lg">
          <h3 style={h3}>Report boilerplate</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Methodology" hint="Printed in every report. Leave blank to use the default statement.">
              <TextArea rows={4} value={s.methodology} onChange={e => set('methodology', e.target.value)} />
            </Field>
            <Field label="Disclaimer / limitations" hint="Leave blank to use the default.">
              <TextArea rows={3} value={s.disclaimer} onChange={e => set('disclaimer', e.target.value)} />
            </Field>
          </div>
        </Card>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</Button>
          {saved && <span style={{ fontSize: 13, color: tokens.color.success }}>Saved</span>}
        </div>
      </div>
    </PageShell>
  )
}

const h3: React.CSSProperties = { margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: tokens.color.textPrimary }
