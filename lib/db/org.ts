import { createClient } from '@/lib/supabase/client'
import type { MyProfile, OrgInfo, UserRole } from '@/lib/db/types'

// ─── PROFILE ────────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, org_id, department_id, name, role')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return {
    id:           data.id,
    orgId:        data.org_id,
    departmentId: data.department_id,
    name:         data.name,
    role:         data.role as UserRole,
  }
}

export interface OrgMember {
  id:   string
  name: string
  role: UserRole
}

/** Profiles in the current user's org — used for the CAPA owner picker. */
export async function listOrgMembers(): Promise<OrgMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role')
    .order('name', { ascending: true })

  if (error || !data) return []
  return data.map(p => ({ id: p.id, name: p.name ?? 'Unnamed', role: p.role as UserRole }))
}

// ─── ORG ──────────────────────────────────────────────────────────────────────

export async function getMyOrg(): Promise<OrgInfo | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, pass_threshold, marginal_threshold, next_survey_date, subscription_status, plan, subscription_renews_at')
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return mapOrg(data)
}

export async function updateOrg(
  orgId: string,
  patch: Partial<{
    name: string
    next_survey_date: string | null
    pass_threshold: number
    marginal_threshold: number
  }>,
): Promise<void> {
  const supabase = createClient()
  await supabase.from('organizations').update(patch).eq('id', orgId)
}

function mapOrg(d: {
  id: string; name: string; pass_threshold: number; marginal_threshold: number
  next_survey_date: string | null; subscription_status: string; plan: string | null
  subscription_renews_at: string | null
}): OrgInfo {
  return {
    id:                   d.id,
    name:                 d.name,
    passThreshold:        d.pass_threshold,
    marginalThreshold:    d.marginal_threshold,
    nextSurveyDate:       d.next_survey_date,
    subscriptionStatus:   d.subscription_status as OrgInfo['subscriptionStatus'],
    plan:                 d.plan,
    subscriptionRenewsAt: d.subscription_renews_at,
  }
}

export function canViewAllDepartments(role: UserRole): boolean {
  return role === 'manager' || role === 'director' || role === 'qa'
}

// ─── PLATFORM ADMIN (owner email only; enforced by RLS migration 005) ─────────

const ORG_SELECT =
  'id, name, pass_threshold, marginal_threshold, next_survey_date, subscription_status, plan, subscription_renews_at'

export async function getMyEmail(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email ?? null
}

/** Owner sees every org (admin RLS policy); everyone else sees only their own. */
export async function listAllOrgs(): Promise<OrgInfo[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('organizations').select(ORG_SELECT).order('name')
  if (error || !data) return []
  return data.map(mapOrg)
}

export async function updateSubscription(
  orgId: string,
  patch: Partial<{ subscription_status: string; plan: string | null; subscription_renews_at: string | null }>,
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.from('organizations').update(patch).eq('id', orgId)
  return { error: error?.message ?? null }
}
