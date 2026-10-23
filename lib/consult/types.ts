// ─── CONSULT WORKSPACE TYPES ────────────────────────────────────────────────
// Shapes the consultant UI consumes. lib/consult/db/* maps spd.consult_* rows
// (migration 007) into these.

export type AreaId =
  | 'leadership' | 'staffing' | 'pou' | 'decon' | 'iap' | 'steril'
  | 'storage' | 'endo' | 'water' | 'environment' | 'quality' | 'equipment' | 'or'

export type Answer      = 'met' | 'partial' | 'not-met' | 'na'
export type Rating      = 'strength' | 'opportunity' | 'deficiency' | 'critical'
export type Priority    = 'immediate' | '30-day' | '60-day' | '90-day'
export type ItemRisk    = 'critical' | 'major' | 'minor'
export type FacilityType = 'hospital' | 'asc' | 'clinic' | 'idn' | 'other'
export type EngagementType = 'baseline' | 'mock-survey' | 'follow-up' | 'focused' | 'remediation'
export type EngagementStatus = 'planned' | 'on-site' | 'drafting' | 'delivered'

export interface FrameworkItem {
  id:        string
  area:      AreaId
  text:      string          // what the consultant verifies
  risk:      ItemRisk        // drives scoring weight + default rating
  refs:      string[]        // standard citations
  lookFor?:  string          // field tip: what evidence to ask for / observe
  fix?:      string          // default recommendation if not met
}

export interface FrameworkArea {
  id:          AreaId
  name:        string
  description: string
  items:       FrameworkItem[]
}

export interface Client {
  id:                  string
  name:                string
  facilityType:        FacilityType
  city:                string | null
  state:               string | null
  bedCount:            number | null
  annualSurgicalCases: number | null
  contactName:         string | null
  contactTitle:        string | null
  contactEmail:        string | null
  contactPhone:        string | null
  notes:               string | null
  createdAt:           string
}

/** Free-form facts about the department captured on the Overview tab. */
export interface DepartmentProfile {
  departmentName?:   string
  leaderName?:       string
  reportsTo?:        string
  fteBudgeted?:      number
  fteActual?:        number
  certifiedPct?:     number
  shifts?:           string
  hoursOfOperation?: string
  steamSterilizers?: number
  lowTempSterilizers?: number
  washers?:          number
  trayVolumeDaily?:  number
  flexScopesInventory?: number
  trackingSystem?:   string
  lastSurvey?:       string
  keyConcerns?:      string
}

export interface Engagement {
  id:                string
  clientId:          string
  clientName?:       string
  title:             string
  type:              EngagementType
  status:            EngagementStatus
  visitStart:        string | null
  visitEnd:          string | null
  scopeAreas:        AreaId[]
  profile:           DepartmentProfile
  executiveSummary:  string | null
  aiDraft:           string | null
  deliveredAt:       string | null
  createdAt:         string
  updatedAt:         string
}

export interface ResponseEntry {
  answer: Answer
  note:   string
}
export type ResponseMap = Record<string, ResponseEntry>

export interface Observation {
  id:             string
  engagementId:   string
  area:           AreaId
  title:          string
  detail:         string
  rating:         Rating
  standardRefs:   string[]
  recommendation: string
  priority:       Priority
  ownerRole:      string
  itemId:         string | null
  source:         'walkthrough' | 'field' | 'library' | 'voice'
  needsReview?:   boolean          // voice-captured and not yet reviewed
  createdAt:      string
  photos?:        Photo[]
}

export interface Photo {
  id:            string
  observationId: string
  filePath:      string
  fileName:      string
  caption:       string | null
  url?:          string   // signed URL, populated on read
}

export interface LibraryEntry {
  id:             string
  area:           AreaId
  title:          string
  findingText:    string
  recommendation: string
  standardRefs:   string[]
  rating:         Rating
  priority:       Priority
  tags:           string[]
  useCount:       number
  builtIn:        boolean   // starter library entries ship in code, not the DB
}

export interface ConsultSettings {
  firmName:       string
  consultantName: string
  credentials:    string
  methodology:    string
  disclaimer:     string
  voiceNotes:     string
}

// ── Instant audits (migration 008) ──
export type AuditAnswer = 'yes' | 'no' | 'na'

export interface AuditItem { id: string; text: string; critical?: boolean }

export interface Audit {
  id:            string
  engagementId:  string
  observationId: string | null
  templateId:    string
  title:         string
  items:         AuditItem[]      // frozen copy of the template items
  sampleUnit:    string
  targetPerDay:  number
  status:        'active' | 'closed'
  startedOn:     string
  createdAt:     string
}

export interface AuditSample {
  id:         string
  auditId:    string
  sampledOn:  string               // YYYY-MM-DD the audit was performed
  sampleRef:  string
  source:     'observed' | 'paper'
  auditor:    string
  answers:    Record<string, AuditAnswer>
  note:       string
  createdAt:  string
}
