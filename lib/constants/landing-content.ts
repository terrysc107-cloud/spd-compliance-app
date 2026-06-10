/**
 * Marketing copy for the public landing page (app/page.tsx).
 *
 * Kept out of JSX so positioning copy is editable in one place. Icon fields are
 * string keys resolved to inline SVGs by the <Icon /> component on the page —
 * no emoji, no icon-library dependency.
 */

// Standards the product is built on — used in the hero trust pill and trust strip.
export const STANDARDS = ['AAMI ST79', 'ST91', 'ST108', 'Joint Commission', 'CMS'] as const

// Three-step "how it works" — mirrors the real onboarding → dashboard flow.
export const HOW_IT_WORKS = [
  {
    icon: 'clipboard',
    step: '01',
    title: 'Run your audit',
    desc: 'Work through ST79, ST91, and ST108 checklists — ~180 checkpoints across all 7 SPD domains. Every "No" becomes a tracked finding.',
  },
  {
    icon: 'gauge',
    step: '02',
    title: 'Get your readiness score',
    desc: 'Six weighted factors roll up into one live 0–100 score and a Survey Ready / At Risk / Not Ready band — so you know exactly where you stand.',
  },
  {
    icon: 'target',
    step: '03',
    title: 'Close the gaps',
    desc: 'Assign corrective actions with owners, due dates, and evidence. The AI advisor prioritizes what moves the score before survey day.',
  },
] as const

// Core product capabilities — the "Survey Readiness OS", not a one-off audit.
export const CAPABILITIES = [
  {
    icon: 'gauge',
    title: 'Real-time readiness score',
    desc: 'A single 0–100 score computed from six weighted factors — audit results, open critical/major findings, overdue actions, aging, coverage, and recency.',
  },
  {
    icon: 'list',
    title: 'Gap & CAPA tracking',
    desc: 'Findings flow into a corrective-action workspace: severity, owner, due date, and evidence upload — a defensible record from finding to closure.',
  },
  {
    icon: 'sparkles',
    title: 'AI Readiness Advisor',
    desc: 'Claude reads your actual audit data and returns prioritized, clinical next steps — each tied to AAMI ST79, CMS CoP, or Joint Commission standards.',
  },
  {
    icon: 'document',
    title: 'Survey-ready PDF & audit trail',
    desc: 'Export a leadership-ready readiness report and keep a timestamped, immutable trail — the documentation surveyors actually ask to see.',
  },
] as const

// The 7 SPD compliance domains (substance preserved from the original page, emoji removed).
export const COMPLIANCE_DOMAINS = [
  { icon: 'decon',    label: 'Decontamination',       standard: 'AAMI ST79 / AORN', desc: 'Physical separation, workflow, air pressure, cleaning protocols' },
  { icon: 'package',  label: 'Prep & Packaging',      standard: 'AAMI ST79',        desc: 'Inspection, assembly, wrapping, chemical indicators' },
  { icon: 'sterile',  label: 'Sterilization',         standard: 'AAMI ST79',        desc: 'Cycle selection, monitoring, biological indicators, maintenance' },
  { icon: 'storage',  label: 'Sterile Storage',       standard: 'AAMI ST79',        desc: 'Environmental controls, shelf placement, endoscope storage' },
  { icon: 'staff',    label: 'General & Staff',        standard: 'AAMI ST79 / CMS',  desc: 'Policies, competencies, PPE, documentation, hand hygiene' },
  { icon: 'water',    label: 'Water Quality',         standard: 'AAMI ST108',       desc: 'Utility vs critical water, testing, distribution system design' },
  { icon: 'scope',    label: 'HLD & Flexible Scopes', standard: 'AAMI ST91 / SGNA', desc: 'Pre-cleaning, leak testing, AER operation, storage protocols' },
] as const

// Who it's for.
export const USE_CASES = [
  { title: 'Pre-survey readiness',           desc: 'Walk into Joint Commission, DNV, or CMS surveys knowing your score — not guessing.' },
  { title: 'Corrective-action verification', desc: 'Prove findings were closed with owners, dates, and evidence after every survey or incident.' },
  { title: 'New-manager onboarding',         desc: 'Hand a new SPD leader an instant baseline and a clear, prioritized path forward.' },
] as const

// Readiness hero mock values (the JSX "screenshot" in the hero). 88 ⇒ green "Survey Ready" band.
export const HERO_MOCK = {
  score: 88,
  band: 'Survey Ready',
  org: 'Northland Medical Center',
  meta: ['42 days to survey', 'Confidence: High'],
  factors: [
    { label: 'Latest audit score',  weight: 35, score: 92 },
    { label: 'Open findings',       weight: 20, score: 84 },
    { label: 'Overdue actions',     weight: 15, score: 90 },
    { label: 'Audit recency',       weight: 8,  score: 88 },
  ],
} as const
