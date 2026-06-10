'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell from '@/components/layout/PageShell'
import { Card, Button, Input } from '@/components/ui'
import { tokens } from '@/lib/constants/design-tokens'
import { getMyOrg, updateOrg } from '@/lib/db/org'
import { seedDemoData } from '@/lib/db/demo'

export default function OnboardingPage() {
  const router = useRouter()
  const [orgId, setOrgId]     = useState<string | null>(null)
  const [name, setName]       = useState('')
  const [survey, setSurvey]   = useState('')
  const [saved, setSaved]     = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    getMyOrg().then(org => {
      if (!org) return
      setOrgId(org.id)
      setName(org.name)
      setSurvey(org.nextSurveyDate ?? '')
    }).catch(() => {})
  }, [])

  async function saveBasics() {
    if (!orgId) return
    await updateOrg(orgId, { name: name.trim() || 'My Facility', next_survey_date: survey || null })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function loadDemo() {
    setSeeding(true)
    await saveBasics()
    await seedDemoData()
    setSeeding(false)
    router.push('/dashboard')
  }

  const step: React.CSSProperties = { display: 'flex', gap: 14, alignItems: 'flex-start' }
  const num: React.CSSProperties = {
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: tokens.color.accentBlue,
    color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  return (
    <PageShell title="Get survey-ready in 30 minutes" description="Three steps to your first readiness score.">
      <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 16 }}>

        <Card padding="lg">
          <div style={step}>
            <div style={num}>1</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: tokens.color.textPrimary }}>Confirm your facility & survey date</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <Input label="Facility / department name" value={name} onChange={e => setName(e.target.value)} />
                <div>
                  <label style={{ display: 'block', color: tokens.color.textMuted, fontSize: 12, fontWeight: 500, marginBottom: 6 }}>
                    Next survey date (best estimate)
                  </label>
                  <input type="date" value={survey} onChange={e => setSurvey(e.target.value)}
                    style={{ background: tokens.color.bg, border: `1px solid ${tokens.color.border}`, borderRadius: tokens.radius.sm, color: tokens.color.textPrimary, fontSize: 14, padding: '9px 12px', outline: 'none' }} />
                </div>
                <div>
                  <Button variant="secondary" size="sm" onClick={saveBasics}>{saved ? 'Saved' : 'Save'}</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div style={step}>
            <div style={num}>2</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.color.textPrimary }}>Run your first audit</h3>
              <p style={{ margin: '0 0 14px', fontSize: 14, color: tokens.color.textMuted, lineHeight: 1.6 }}>
                Walk an ST79/ST91/ST108-aligned checklist. Every gap becomes a tracked corrective action automatically.
              </p>
              <Button href="/checklist" size="md">Start first audit</Button>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div style={step}>
            <div style={num}>3</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: tokens.color.textPrimary }}>See your readiness score</h3>
              <p style={{ margin: '0 0 14px', fontSize: 14, color: tokens.color.textMuted, lineHeight: 1.6 }}>
                Your dashboard shows a 0–100 readiness score, the factors driving it, overdue corrective actions, and an AI briefing.
                Want to preview it now? Load demo data.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Button href="/dashboard" variant="secondary" size="md">Go to dashboard</Button>
                <Button onClick={loadDemo} variant="ghost" size="md" disabled={seeding}>
                  {seeding ? 'Loading demo…' : 'Load demo data'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
