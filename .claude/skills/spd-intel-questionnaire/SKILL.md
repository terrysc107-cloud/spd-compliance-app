---
name: "SPD Intel Questionnaire"
description: "9-section IaS (Intelligence as a Service) questionnaire engine for the SPD Intel web app and Scott Advisory Group client assessments. Use when: running a client self-assessment, scoring a department's operational maturity, computing a baseline PRA Index from questionnaire data, generating a maturity report from 0-3 scale responses, onboarding a new SAG client who has no SQ Track data, evaluating an SPD across the 9 operational domains, producing a JSON scoring object for app rendering, or generating a PRA brief for human review. Each question scored 0 (non-existent) to 3 (optimized). Nine sections with weighted scoring. Output: Green (PRA 1-3) / Yellow (4-5) / Orange (6-7) / Red (8-10)."
---

# SPD Intel Questionnaire

## What This Skill Does

The complete 9-section IaS questionnaire engine. Administers the assessment, scores responses on a 0–3 maturity scale, applies weighted category scoring, computes the PRA Index, and outputs both a structured JSON object (for app rendering) and a PRA brief (for human review).

## Maturity Scale

| Score | Level | Definition |
|---|---|---|
| **0** | Non-existent | No process exists; completely ad hoc |
| **1** | Developing | Process exists but inconsistently applied; relies on individual knowledge |
| **2** | Defined | Process documented and consistently followed; staff trained |
| **3** | Optimized | Process measured, data-driven, continuously improved |

## 9-Section Question Bank

### Section 1 — Department Profile (10% weight)

Not scored — used for context and normalization.

- Facility type: Community / Academic / Critical Access / Long-Term Acute
- Bed count: [number]
- Annual surgical case volume (approximate): [number]
- Number of operating rooms: [number]
- SPD FTE count (excluding travelers): [number]
- Tracking system: SQ Track / Censitrac / Censis / SPM / Manual / Other
- Dedicated educator on staff: Y/N
- Dedicated instrument coordinator on staff: Y/N

### Section 2 — Instrument Integrity (15% weight)

| Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Missing instrument rate is tracked | Never tracked | Tracked occasionally | Tracked monthly | Tracked weekly; trending analyzed |
| Count sheet accuracy is audited | No audits | Ad hoc audits | Quarterly audits | Monthly audits with correction tracking |
| Instrument naming is standardized | No standard | Partial standard | Standard defined | Standard enforced with regular cleanup |
| Repair cycle data is captured | Not captured | Manual log only | System-tracked | System-tracked with lifecycle analysis |
| Count sheets match SQ Track entries | Major discrepancies | Some discrepancies | Minor discrepancies | Verified match; reconciled regularly |

### Section 3 — Decontamination and Cleaning (15% weight)

| Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| PPE compliance in decon is monitored | Never monitored | Supervisor observation only | Monthly audit | Monthly audit with trending and feedback |
| Manual cleaning follows written SOP | No SOP | SOP exists but not followed | SOP followed inconsistently | SOP followed; compliance audited |
| Washer IQ/OQ/PQ validation on file | No validation | Partial records | Most records on file | All records current and accessible |
| Chemistry products are used per IFU dilution | Not followed | Some compliance | Mostly compliant | Fully compliant; dilution verified at setup |
| Water temperature is verified and documented | Not verified | Occasionally checked | Checked and logged | Logged per frequency requirement; alerts set |

### Section 4 — Sterilization and Cycle Quality (15% weight)

| Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Biological indicator program is in place | No BI program | BI used but not per schedule | BI per AAMI frequency | BI per AAMI; log maintained; trending done |
| Chemical integrators used in every load | Never | Occasionally | Most loads | Every load; documented |
| IUSS (flash sterilization) rate is tracked | Not tracked | Tracked informally | Tracked monthly | Tracked weekly; justified uses documented |
| Load records are complete and retrievable | Not maintained | Partial records | Complete but disorganized | Complete; retrievable by lot number within 5 min |
| Sterilizer IQ/OQ/PQ and maintenance current | No records | Partial records | Most current | All current; preventive maintenance scheduled |

### Section 5 — Assembly and Packaging (10% weight)

| Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Tray audit rate is tracked | Not tracked | Ad hoc | Monthly | Weekly; error rate trended |
| Assembly error rate is measured | Not measured | Anecdotal | Measured monthly | Measured weekly; root cause analyzed |
| Black spec / debris documentation is in place | No process | Some staff aware | Process defined | Process defined; black spec separated from count |
| CI is placed in every package | Not done | Sometimes | Usually | Always; verified by supervisor |

### Section 6 — Audit and Compliance (10% weight)

| Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Internal audits are conducted | Never | Ad hoc | Quarterly | Monthly; findings tracked |
| Mock survey protocol exists | No | Informal walkthrough only | Structured checklist | Structured checklist with CAP generation |
| Regulatory finding history | Multiple TJC findings | One TJC finding in last cycle | No findings; minor OFIs only | No findings; proactive gap closure |
| SOPs are current (reviewed within 12 months) | Most expired | About half current | Most current | All current; annual review scheduled |

### Section 7 — Repair and Maintenance (10% weight)

| Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Instrument repair cycle data is tracked | Not tracked | Manual log | System-tracked | System-tracked with vendor accountability |
| Overdue repair rate is tracked | Not tracked | Anecdotal | Tracked monthly | Tracked weekly; vendor escalation documented |
| Repair vs. replace decisions are data-driven | Purely reactive | Some data used | Data used most of the time | Lifecycle cost model drives all decisions |
| Vendor accountability for damaged instruments | No process | Occasional documentation | Documented usually | Always documented; tracked per vendor |

### Section 8 — Staff Competency (10% weight)

| Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| CRCST/CSPDT certification rate by shift | No certifications | <25% certified | 25–50% certified | >50% certified; all pursuing |
| Donna Wright competency method is used | Not used | Used for some assessments | Used for most assessments | Fully implemented across all roles |
| New hire orientation is structured | No structured program | Informal pairing only | 30-day program | 30/60/90-day structured pathway |
| Annual competency reverification is done | Never | Selectively | Most staff | All staff; records maintained |
| Education records are maintained | No records | Partial records | Most records complete | Complete; retrievable for survey |

### Section 9 — Leadership and Governance (5% weight)

| Question | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Director/Manager reviews data weekly | Never | Monthly only | Weekly review | Weekly review with documented action items |
| IP relationship involves SPD | No relationship | Annual walkthrough only | Quarterly joint rounding | Monthly joint rounding with shared data review |
| Survey readiness is assessed proactively | Never | Only when survey window opens | Annual self-assessment | Quarterly self-assessment with CAP tracking |
| Budget/capital requests are data-driven | No data used | Some data used | Data used sometimes | Always data-driven with documented justification |

## Scoring Engine

### Section Weights

| Section | Weight |
|---|---|
| 2 — Instrument Integrity | 15% |
| 3 — Decon and Cleaning | 15% |
| 4 — Sterilization and Cycle Quality | 15% |
| 5 — Assembly and Packaging | 10% |
| 6 — Audit and Compliance | 10% |
| 7 — Repair and Maintenance | 10% |
| 8 — Staff Competency | 10% |
| 1 — Department Profile | 10% (context) |
| 9 — Leadership and Governance | 5% |

### PRA Index Computation

1. Score each question 0–3
2. Average section scores: section_score = sum(question_scores) / question_count
3. Weighted total: PRA_raw = sum(section_score × section_weight) for sections 2–9
4. PRA Index: PRA_raw scaled to 1–10 (raw 0 = PRA 10, raw 3 = PRA 1)
5. Formula: `PRA_index = 10 - ((PRA_raw / 3) × 9)`

### PRA Index Output Tiers

| PRA Score | Tier | Color | Interpretation |
|---|---|---|---|
| 1–3 | Optimized | Green | Department is performing at a high level; SAG role is optimization |
| 4–5 | Defined | Yellow | Core processes exist; focused improvement needed |
| 6–7 | Developing | Orange | Significant gaps; structured program needed |
| 8–10 | At Risk | Red | Systemic failures; urgent intervention required |

## Output Formats

### JSON Scoring Object (for app rendering)

```json
{
  "assessment_date": "YYYY-MM-DD",
  "facility_id": "[anonymized]",
  "section_scores": {
    "instrument_integrity": 1.8,
    "decon_cleaning": 2.1,
    "sterilization": 1.5,
    "assembly_packaging": 2.0,
    "audit_compliance": 1.2,
    "repair_maintenance": 1.6,
    "staff_competency": 1.9,
    "leadership": 1.0
  },
  "pra_raw": 1.71,
  "pra_index": 4.9,
  "pra_tier": "Yellow",
  "top_gaps": ["audit_compliance", "sterilization", "leadership"]
}
```

### PRA Brief (human review — routes to scott-advisory-pra)

Section-by-section narrative interpretation with top 3 priority gaps and recommended engagement focus areas.

---

## Anti-Patterns

- Do NOT average all questions equally — apply section weights
- Do NOT score Section 1 (Department Profile) in the PRA Index — it is context only
- Do NOT present PRA scores without the tier interpretation
- Do NOT use facility-identifying information in the JSON output — anonymize immediately

## Wiring

**Called by:** spd-orchestrator (Full Chain for IaS assessments), spd-client-onboarding (baseline assessment for new SAG clients)
**Calls:** scott-advisory-pra (for PRA brief generation from scores), spd-quality-gate (before any client-facing output is delivered)
