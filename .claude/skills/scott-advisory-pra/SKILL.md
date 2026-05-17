---
name: "Scott Advisory PRA"
description: "Performance Risk Assessment methodology skill for Scott Advisory Group engagements. Use when: computing a baseline PRA score for a new SAG client, interpreting a completed SPD Intelligence Questionnaire into a PRA Index value, generating the PRA brief that summarizes findings by section, producing a risk tier classification (Green 1-3, Yellow 4-5, Orange 6-7, Red 8-10), comparing a client's PRA score to the SAG benchmark database, tracking PRA score improvement over a retainer engagement, generating the anonymized PRA report for a client deliverable, determining which domains require priority corrective action, or any analytical output requiring the PRA scoring engine. All client data is anonymized before PRA output is produced. Confidentiality footer required on all PRA deliverables."
---

# Scott Advisory PRA

## What This Skill Does

Computes, interprets, and communicates the Performance Risk Assessment (PRA) Index for SPD engagements. The PRA is Scott Advisory Group's core diagnostic tool — it converts the SPD Intelligence Questionnaire response set into a scored risk index that drives engagement prioritization, corrective action sequencing, and client progress tracking.

## PRA Index Architecture

### Section Weights

| Section | Weight | What It Assesses |
|---|---|---|
| 1. Department Profile | 10% | Size, structure, staffing baseline |
| 2. Instrument Integrity | 15% | Repair rates, lifecycle management, catalog quality |
| 3. Decontamination | 15% | Manual cleaning, PPE, traffic flow, verification |
| 4. Sterilization | 15% | BI program, IUSS rate, documentation, parametric release |
| 5. Assembly and Packaging | 10% | Count sheet accuracy, inspection criteria, CI use |
| 6. Audit and Survey Readiness | 10% | Self-assessment, mock survey history, finding response |
| 7. Repair and Lifecycle | 10% | Repair cost tracking, replace/retire decisions |
| 8. Competency and Education | 10% | Initial and ongoing competency, training frequency |
| 9. Leadership and Systems | 5% | SPD-OR-IP relationship quality, data use, escalation |

### Scoring Scale (per question)

| Score | Definition |
|---|---|
| **3** | Fully compliant — meets standard, documented, consistently practiced |
| **2** | Partially compliant — meets standard most of the time, or documentation incomplete |
| **1** | Minimally compliant — standard is known but inconsistently practiced; significant gaps |
| **0** | Non-compliant — standard not met; no documentation; practice does not exist |

### PRA Formula

```
PRA_raw = weighted average of all section scores (0–3 scale)
         = Σ (section_raw_score × section_weight)

PRA_index = 10 - ((PRA_raw / 3) × 9)
```

This inverts the scale so that:
- A department scoring 3.0 (perfect) → PRA Index = 1 (Green — lowest risk)
- A department scoring 0.0 (complete non-compliance) → PRA Index = 10 (Red — highest risk)

### Risk Tiers

| PRA Index | Tier | Meaning | SAG Engagement Posture |
|---|---|---|---|
| 1.0 – 3.0 | **Green** | Low risk — strong fundamentals | Advisory / maintenance engagement |
| 4.0 – 5.0 | **Yellow** | Moderate risk — gaps exist but core systems function | Targeted improvement |
| 6.0 – 7.0 | **Orange** | High risk — systemic gaps, survey exposure probable | Active remediation engagement |
| 8.0 – 10.0 | **Red** | Critical risk — foundational failures, patient safety exposure | Intensive engagement; escalation to hospital leadership may be warranted |

## PRA Computation Workflow

### Step 1 — Receive Questionnaire Responses

Input: completed spd-intel-questionnaire response set (all 9 sections, all questions scored 0–3).

### Step 2 — Compute Section Raw Scores

For each section, average the question scores:

```
Section raw score = Σ(question scores) / N questions in section
```

### Step 3 — Apply Section Weights

```
Weighted section score = section raw score × section weight
```

### Step 4 — Compute PRA_raw

```
PRA_raw = Σ(all weighted section scores)
```

### Step 5 — Compute PRA Index

```
PRA_index = 10 - ((PRA_raw / 3) × 9)
Round to one decimal place.
```

### Step 6 — Classify Tier

Map PRA_index to Green / Yellow / Orange / Red per tier table.

## PRA Brief Output Format

```
PERFORMANCE RISK ASSESSMENT BRIEF
Client: [SAG-YYYY-NNN]   Date: [YYYY-MM-DD]
Engagement type: [Brief / Retainer / Strategic]
─────────────────────────────────────────────────────────────
PRA INDEX: [value]   TIER: [Green / Yellow / Orange / Red]
─────────────────────────────────────────────────────────────
SECTION SCORES:
Section 1 — Department Profile (10%):       [raw score] → [weighted]
Section 2 — Instrument Integrity (15%):     [raw score] → [weighted]
Section 3 — Decontamination (15%):          [raw score] → [weighted]
Section 4 — Sterilization (15%):            [raw score] → [weighted]
Section 5 — Assembly and Packaging (10%):   [raw score] → [weighted]
Section 6 — Audit and Survey Readiness(10%):[raw score] → [weighted]
Section 7 — Repair and Lifecycle (10%):     [raw score] → [weighted]
Section 8 — Competency and Education (10%): [raw score] → [weighted]
Section 9 — Leadership and Systems (5%):    [raw score] → [weighted]
─────────────────────────────────────────────────────────────
PRA_raw: [value]   PRA_index: [value]   Tier: [tier]
─────────────────────────────────────────────────────────────
PRIORITY DOMAINS (lowest-scoring sections):
1. [Section name] — score [value] — [one sentence summary of gap]
2. [Section name] — score [value] — [one sentence summary of gap]
3. [Section name] — score [value] — [one sentence summary of gap]

STRENGTHS (highest-scoring sections):
[Section name] — score [value]
[Section name] — score [value]

ENGAGEMENT RECOMMENDATION:
[One paragraph — what the PRA findings suggest as the engagement focus, sequenced by risk priority]
─────────────────────────────────────────────────────────────
Confidential — Prepared for [SAG-YYYY-NNN] by Scott Advisory Group
```

## Progress Tracking

For retainer clients, track PRA Index at baseline and at each engagement milestone:

```
PRA PROGRESS RECORD
Client: [SAG-YYYY-NNN]
─────────────────────────────────────────────────────────────
Baseline PRA:         [value]   [Tier]   [Date]
30-day reassessment:  [value]   [Tier]   [Date]
60-day reassessment:  [value]   [Tier]   [Date]
90-day reassessment:  [value]   [Tier]   [Date]
─────────────────────────────────────────────────────────────
Change from baseline: [+ or - value]   Direction: [improving / stable / declining]
Sections with greatest improvement: [list]
Sections requiring continued focus: [list]
```

Route outcomes to spd-outcomes-tracker for engagement effectiveness tracking.

## Benchmark Comparison

[NEEDS INPUT FROM TERRY: SAG benchmark database — average PRA index by facility type (community hospital, academic medical center, critical access hospital, specialty hospital) for benchmark comparison in client deliverables]

When benchmark data is available, include in PRA brief:
`Your PRA Index of [X] compares to SAG benchmark average of [Y] for [facility type] facilities.`

## Anonymization Rules

All PRA outputs must use the client code, never the facility name:
- Facility name → replaced with SAG-YYYY-NNN
- Geographic identifiers → removed (no city, state, region)
- Facility-specific details that would identify the client → generalized
- Individual names → replaced with roles only

These rules apply even in internal SAG analysis. The anonymization is permanent — it is not a redaction that gets undone for a different audience.

---

## Anti-Patterns

- Do NOT produce a PRA brief that identifies the client facility by name or location
- Do NOT round PRA Index to a whole number — one decimal place is required for tier precision
- Do NOT interpret a single low-scoring section as the whole picture — report all sections; context matters
- Do NOT use the PRA score to evaluate individual staff — it assesses department systems, not people
- Do NOT compare two clients' PRA scores in any document — client data is never cross-referenced in deliverables

## Wiring

**Called by:** spd-orchestrator (PRA scoring request), spd-client-onboarding (baseline PRA for new engagements), spd-intel-questionnaire (produces the input that this skill scores)
**Calls:** spd-quality-gate (before any PRA deliverable is sent to a client), spd-outcomes-tracker (PRA progress tracking for retainer engagements)
