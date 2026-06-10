import { createClient } from '@/lib/supabase/client'
import { getMyOrg } from '@/lib/db/org'

export interface ThresholdConfig {
  passThreshold:     number
  marginalThreshold: number
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  passThreshold:     90,
  marginalThreshold: 70,
}

/** Thresholds now live on the org (migration 004). */
export async function getThresholds(): Promise<ThresholdConfig> {
  const org = await getMyOrg()
  if (!org) return DEFAULT_THRESHOLDS
  return { passThreshold: org.passThreshold, marginalThreshold: org.marginalThreshold }
}

export async function saveThresholds(config: ThresholdConfig): Promise<void> {
  const org = await getMyOrg()
  if (!org) return
  const supabase = createClient()
  await supabase
    .from('organizations')
    .update({ pass_threshold: config.passThreshold, marginal_threshold: config.marginalThreshold })
    .eq('id', org.id)
}
