import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const metadata = { title: 'Subscription — SPD Intel' }

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  past_due: {
    title: 'Your subscription is past due',
    body: 'Your SPD Intel access is paused while your annual invoice is outstanding. Settle the invoice or reach out and we will restore access right away.',
  },
  canceled: {
    title: 'Your subscription is inactive',
    body: 'This account is not currently on an active SPD Intel plan. Contact us to reactivate and get straight back to your readiness dashboard.',
  },
  default: {
    title: 'Activate SPD Intel',
    body: 'Your account is not on an active plan yet. Get in touch to start your annual subscription and unlock continuous survey readiness.',
  },
}

export default async function SubscriptionPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: org } = await supabase
    .from('organizations')
    .select('name, subscription_status, subscription_renews_at')
    .limit(1)
    .maybeSingle()

  const status = org?.subscription_status ?? 'default'
  const copy = STATUS_COPY[status] ?? STATUS_COPY.default

  return (
    <div style={{ minHeight: '100vh', background: '#05091a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 460, width: '100%', background: '#0d1332', border: '1px solid #1e2a5a', borderRadius: 16, padding: '40px 32px' }}>
        <div style={{ fontSize: 28, marginBottom: 16 }}>⚕</div>
        <h1 style={{ color: '#e8eaf6', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>{copy.title}</h1>
        <p style={{ color: '#8899cc', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
          {org?.name ? <>For <strong style={{ color: '#e8eaf6' }}>{org.name}</strong>. </> : null}
          {copy.body}
        </p>

        <a
          href="mailto:terrysc107@gmail.com?subject=SPD%20Intel%20subscription"
          style={{ display: 'block', textAlign: 'center', background: '#3b82f6', color: '#fff', borderRadius: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
        >
          Contact us to activate
        </a>

        <div style={{ marginTop: 20, textAlign: 'center', display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/dashboard" style={{ color: '#8899cc', fontSize: 13 }}>Recheck access</Link>
          {user && (
            <Link href="/login" style={{ color: '#8899cc', fontSize: 13 }}>Switch account</Link>
          )}
        </div>
      </div>
    </div>
  )
}
