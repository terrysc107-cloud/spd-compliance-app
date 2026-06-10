// ─── SHARED DATA SHAPES ─────────────────────────────────────────────────────
// These are the shapes the UI consumes. They originated in lib/storage/* (the
// old localStorage layer) and are now served by lib/db/* off Supabase (`spd`
// schema). Keeping the shapes identical keeps page churn minimal.

import type { AuditScore } from '@/lib/scoring/engine'
export type { AuditScore }

export type Severity = 'critical' | 'major' | 'minor'
export type FindingStatus = 'open' | 'in-progress' | 'resolved'

export interface StoredFinding {
  /** DB findings.id — present once persisted (needed for CAPA). */
  id?:               string
  itemIndex:         number
  sectionName:       string
  question:          string
  severity:          Severity
  comment:           string
  status:            FindingStatus
  correctiveAction?: string
  resolvedAt?:       string
  // ── CAPA fields (migration 004) ──
  assignedTo?:       string | null   // profiles.id
  assignedToName?:   string | null   // joined display name
  dueDate?:          string | null   // ISO date
  resolvedBy?:       string | null   // profiles.id
  /** Number of evidence files attached (lib/db/findings populates this). */
  evidenceCount?:    number
}

export interface StoredAudit {
  id:            string
  checklistName: string
  mode:          'full' | 'focus'
  startedAt:     string
  completedAt?:  string
  status:        'in-progress' | 'completed'
  responses:     Record<number, { answer: 'yes' | 'no' | 'na'; comment: string }>
  sectionIndex?: number
  score?:        number
  auditScore?:   AuditScore
  findings:      StoredFinding[]
  departmentId?: string
  conductedBy?:  string
}

// ── Org / profile ──
export type UserRole = 'supervisor' | 'manager' | 'director' | 'qa'

export interface MyProfile {
  id:           string
  orgId:        string | null
  departmentId: string | null
  name:         string | null
  role:         UserRole
}

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled'

export interface OrgInfo {
  id:                   string
  name:                 string
  passThreshold:        number
  marginalThreshold:    number
  nextSurveyDate:       string | null
  subscriptionStatus:   SubscriptionStatus
  plan:                 string | null
  subscriptionRenewsAt: string | null
}

// ── Evidence ──
export interface FindingEvidence {
  id:         string
  findingId:  string
  filePath:   string
  fileName:   string
  fileType:   string | null
  uploadedAt: string
}
