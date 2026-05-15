// ─── THRESHOLD STORAGE ────────────────────────────────────────────────────────
// Org-level pass/marginal threshold configuration persisted to localStorage.

const STORAGE_KEY = 'spd_thresholds'

export interface ThresholdConfig {
  passThreshold:     number  // default 90
  marginalThreshold: number  // default 70
  updatedAt:         string  // ISO timestamp
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  passThreshold:     90,
  marginalThreshold: 70,
  updatedAt:         new Date().toISOString(),
}

export function getThresholds(): ThresholdConfig {
  if (typeof window === 'undefined') return DEFAULT_THRESHOLDS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_THRESHOLDS
    const parsed = JSON.parse(raw) as ThresholdConfig
    // Validate numeric fields; fall back to defaults if malformed
    if (
      typeof parsed.passThreshold     !== 'number' ||
      typeof parsed.marginalThreshold !== 'number'
    ) return DEFAULT_THRESHOLDS
    return parsed
  } catch {
    return DEFAULT_THRESHOLDS
  }
}

export function saveThresholds(config: ThresholdConfig): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // localStorage quota exceeded — fail silently
  }
}
