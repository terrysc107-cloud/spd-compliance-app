---
name: "SPD Client Onboarding"
description: "Scott Advisory Group client intake and baseline establishment skill. Use when: a new facility is engaging Scott Advisory Group, a client intake form needs to be completed, a baseline PRA assessment is needed for a new engagement, an engagement kickoff document is needed, a 30/60/90 day engagement plan is required, a client's SQ Track or tracking system export needs to be ingested for baseline scoring, or client data needs to be anonymized and profiled before any deliverable is produced. All client data is anonymized immediately on intake. Confidentiality footer required on all outputs. Engagement tiers: Brief / Retainer / Strategic."
---

# SPD Client Onboarding

## What This Skill Does

Runs the SAG client intake process from first contact through baseline establishment. Produces three outputs: a client profile summary, a baseline PRA brief, and a 30/60/90 day engagement plan. All client data is anonymized immediately — no facility names, no geographic identifiers, no staff names appear in any deliverable.

## Client Intake Form

### Section 1 — Facility Profile

```
CLIENT INTAKE — SCOTT ADVISORY GROUP
Date: [YYYY-MM-DD]
Engagement type: Brief / Retainer / Strategic
─────────────────────────────────────────────────────────────

FACILITY (anonymized at intake — do not store identifying info in deliverables)
Facility code: [assigned by SAG — e.g., SAG-2026-014]
Facility type: Community / Academic / Critical Access / Long-Term Acute
Bed count: [number]
Annual surgical case volume: [number]
Number of ORs: [number]
SPD FTE count (excluding travelers): [number]
Travelers on roster: [number]
Instrument tracking system: SQ Track / Censitrac / Censis / SPM / Manual / Other
Dedicated educator on staff: Y/N
Dedicated instrument coordinator on staff: Y/N
```

### Section 2 — Regulatory History

```
Last survey date: [YYYY-MM]
Survey body: TJC / CMS / State DOH / Other
Findings at last survey (categories only, no specifics): [list]
Corrective action status: Complete / In Progress / Outstanding
Any IJ (Immediate Jeopardy) in last 3 years: Y/N
```

### Section 3 — Current Pain Points

```
What brought you to Scott Advisory Group? (check all that apply)
□ Upcoming survey — need to close gaps fast
□ Quality event(s) — RCA, CAP, corrective action support
□ Data gap — can't measure what we need to manage
□ Staffing — can't justify headcount or find qualified staff
□ Instrument issues — naming chaos, count sheet problems, missing instruments
□ Education — no dedicated educator; training is falling behind
□ OR relationship — communication breakdown causing surgical delays
□ Leadership/consulting — need a thought partner for strategic decisions
□ Other: [describe]
```

### Section 4 — Data Availability

```
SQ Track exports available: Y/N — If Y, which modules: [list]
Domo / BI tool exports available: Y/N
Manual tracking data (Excel/paper): Y/N
Quality event log available: Y/N
Competency records available: Y/N
```

### Section 5 — Engagement Tier Selected

```
□ Brief — Single-engagement deliverable; no ongoing relationship
□ Retainer — Monthly deliverables; Terry available for monthly consultation
□ Strategic — Full SAG engagement; PRA tracking + deliverables + advisory access
```

## Baseline PRA Assessment

### If SQ Track Data Available

Route to spd-ingest-skill to process the export → compute baseline metrics → pass to scott-advisory-pra for PRA scoring.

### If No Data Available

Route client through spd-intel-questionnaire. Complete all 9 sections. Compute PRA Index from questionnaire scores. Route to scott-advisory-pra for PRA brief generation.

## Engagement Kickoff Document

```
SCOTT ADVISORY GROUP — CLIENT ENGAGEMENT KICKOFF
Client code: [SAG-YYYY-NNN]
Engagement tier: [Brief / Retainer / Strategic]
Kickoff date: [YYYY-MM-DD]
─────────────────────────────────────────────────────────────

CLIENT PROFILE SUMMARY
Facility type: [type]
Case volume: [volume]
ORs: [number]  FTE: [number]  Travelers: [number]
Tracking system: [system]
Primary pain points: [top 2–3 from intake]

BASELINE PRA ASSESSMENT
PRA Index: [score]
Tier: [Green/Yellow/Orange/Red]
Top 3 gaps: [sections with lowest scores]
Interpretation: [1–2 sentence summary]

30/60/90 DAY ENGAGEMENT PLAN
Days 1–30: [Focus area 1 — typically the highest-priority gap]
  Deliverables: [specific outputs]
Days 31–60: [Focus area 2]
  Deliverables: [specific outputs]
Days 61–90: [Focus area 3 + baseline vs. current comparison]
  Deliverables: [specific outputs]

DELIVERABLE SCHEDULE
[List of specific deliverables with due dates]

COMMUNICATION CADENCE
Check-in: [frequency — e.g., monthly call for Retainer]
Deliverable review: [how client receives and reviews deliverables]
Escalation: [how client reaches Terry for urgent questions]
─────────────────────────────────────────────────────────────
Confidentiality: All information in this document is confidential.
Prepared by Scott Advisory Group. Do not distribute without authorization.
```

## Anonymization Protocol

Apply immediately at intake — before any data is processed or stored:

1. Replace facility name with SAG client code (e.g., SAG-2026-014)
2. Remove all geographic identifiers (city, state, region, parent system name)
3. Remove all staff names — replace with roles (e.g., "Director" not "Terry Smith")
4. Remove any patient identifiers — these should never appear in SPD analytics
5. All deliverables use client code, not facility name, in headers

## Engagement Agreement Reference

All SAG engagements require a signed engagement agreement before deliverables are produced.
[NEEDS INPUT FROM TERRY: Confirm engagement agreement process and any specific terms to reference]

---

## Anti-Patterns

- Do NOT begin producing deliverables before anonymization is applied to all client data
- Do NOT store client facility names in any output document — use the SAG client code only
- Do NOT skip the baseline PRA assessment — it is the foundation of all engagement recommendations
- Do NOT propose engagement activities without first understanding the client's top pain points from the intake form

## Wiring

**Called by:** spd-orchestrator (Full Chain for any new SAG client intake)
**Calls:** spd-intel-questionnaire (baseline assessment when no data available), spd-ingest-skill (baseline assessment when SQ Track data available), scott-advisory-pra (PRA brief generation), spd-quality-gate (before any client-facing document is delivered)
