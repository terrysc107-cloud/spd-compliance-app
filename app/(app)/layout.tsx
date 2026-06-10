import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import FeedbackWidget from '@/components/feedback/FeedbackWidget'

// Server-side access gate (manual / sales-led billing). An org is allowed in
// while `subscription_status` is 'trial' or 'active'; otherwise we bounce to the
// /subscription page (which lives outside this route group, so no redirect loop).
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('subscription_status')
    .limit(1)
    .maybeSingle()

  const status = org?.subscription_status
  if (status && status !== 'trial' && status !== 'active') {
    redirect('/subscription')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#05091a' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>
      <FeedbackWidget />
    </div>
  )
}
