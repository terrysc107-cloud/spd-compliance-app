import { createClient } from '@/lib/supabase/client'
import { getMyProfile } from '@/lib/db/org'

export type FeedbackCategory = 'idea' | 'bug' | 'other'

export async function submitFeedback(input: {
  message: string
  category: FeedbackCategory
  page?: string
}): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = await getMyProfile()

  const { error } = await supabase.from('feedback').insert({
    org_id:   profile?.orgId ?? null,
    user_id:  user?.id ?? null,
    email:    user?.email ?? null,
    message:  input.message,
    category: input.category,
    page:     input.page ?? null,
  })
  return { error: error?.message ?? null }
}
