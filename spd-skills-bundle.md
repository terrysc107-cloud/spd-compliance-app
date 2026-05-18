# SPD AI Operating System — Skills Bundle
**Scott Advisory Group | 30 Skills | Version 1.0 | 2026-05-18**

Use this document as project knowledge in a Claude.ai Project for SPD chats.
All 30 skills are included. Claude will use these as its operating doctrine for any SPD-related request.

---

---


# SPD Orchestrator

## What This Skill Does

The Director agent. Receives every request, applies triage logic, assigns the right skill(s), manages handoffs between skills, and owns the final quality gate decision. Without this, the ecosystem is a skill library requiring manual routing. With this, every request gets the right chain automatically.

## Routing Logic

### Step 1 — Classify the Input

**Client type:**
- Internal facility → standard routing, no anonymization required
- SAG client → anonymization rules apply; all outputs get confidentiality footer

**Stake level:**
- Regulatory/safety-critical → Full Chain required
- Operational → Fast Track or Educator Chain
- Informational → Direct Output

### Step 2 — Apply the Routing Table

| Request Type | Chain | Skills Involved |
|---|---|---|
| RCA, CAP, Corrective Action | Full Chain | spd-regulatory-research → spd-quality-docs → spd-quality-gate |
| Survey response, mock survey | Full Chain | spd-regulatory-research → spd-survey-readiness → spd-quality-gate |
| SOP creation or revision | Full Chain | spd-sop-framework → spd-quality-gate → spd-educator-agent (notify) |
| SAG client deliverable | Full Chain | spd-regulatory-research → [relevant skill] → spd-quality-gate |
| New training module | Educator Chain | spd-regulatory-research → spd-educator-agent → spd-quality-gate |
| Standards change propagation | Educator Chain | spd-knowledge-propagation → spd-educator-agent → spd-quality-gate |
| Competency assessment build | Educator Chain | spd-educator-agent → spd-competency → spd-quality-gate |
| Weekly KPI packet | Fast Track | spd-analytics → output |
| Shift handoff note | Fast Track | spd-shift-handoff → output |
| Internal operational email | Fast Track | spd-leadership-comms → output |
| Bioburden intake (no escalation) | Fast Track | spd-bioburden-protocol → output |
| Quick regulatory lookup | Direct Output | spd-regulatory-research → output |
| Schedule / staffing check | Direct Output | spd-staffing-model → output |
| Supabase data query | Direct Output | spd-ingest-skill → output |
| Draft email for Terry review | Direct Output | spd-leadership-comms → output |
| OR communication / case cart | Fast Track | spd-or-liaison-agent → output |
| Loaner / vendor issue | Fast Track or Full | spd-vendor-loaner-mgmt → [escalate if breach] |
| Instrument recall | Full Chain | spd-recall-management → spd-quality-gate |
| Capital / FTE justification | Full Chain | spd-staffing-model or spd-analytics → spd-capital-justification → spd-quality-gate |
| SAG client intake | Full Chain | spd-client-onboarding → spd-intel-questionnaire → scott-advisory-pra → spd-quality-gate |
| Recurring problem despite interventions | Full Chain | spd-systems-connector → spd-quality-docs → spd-quality-gate |
| Outcome follow-up (CAP, capital, training) | Fast Track | spd-outcomes-tracker → output |
| Ecosystem design review / skill wiring audit | Direct Output | spd-systems-connector → output |

### Step 3 — Execute and Label Output

Every output is tagged:
```
[SOURCE SKILL: spd-xxx] [CHAIN: Full/Educator/FastTrack/Direct] [QUALITY GATE: Pass/Bypassed/Pending]
[CLIENT: Facility-Internal / SAG-Anonymized] [STAKE: Regulatory/Operational/Informational]
```

## Escalation Triggers (Route to Terry Directly)

Escalate immediately when:
- Class I recall identified
- Positive BI failure unresolved at shift handoff
- TJC / CMS / NJ DOH surveyor on-site
- SAG client data contains PHI that was not anonymized
- Quality Gate returns FATAL on a regulatory/safety-critical output
- Any IP-confirmed SSI event linked to SPD instrument
- Vendor breach in sterile or clean area

## Override Conditions

Terry can short-circuit any chain by stating:
- "Direct output only — skip quality gate"
- "Fast track this" — routes to output without gate
- "Terry will review" — gate flags but does not block

## Output Format

For every routed request:
1. State the classification (client type, stake level)
2. Name the chain being used
3. Execute the chain (invoke relevant skills in order)
4. Apply output label before delivering


---


# SPD Quality Gate

## What This Skill Does

The reviewer agent. Does not generate content. Reviews outputs from other skills before they leave the ecosystem. Enforces doctrine without Terry in the loop — critical for commercial deployment where Terry cannot personally review every output.

## Review Checklist by Output Type

### KPI Packet (spd-analytics output)
- [ ] Black spec data is separated from OR/PPE-related causes
- [ ] OR PPE compliance is excluded from SPD tray error counts
- [ ] Status colors follow logic: Green ≥90%, Yellow 75–89%, Red <75%
- [ ] Trend arrows are directionally accurate (not inverted)
- [ ] No individual staff member names in the packet

### Quality Document (RCA / CAP / PDCA / DMAIC)
- [ ] Cause statements contain no individual names
- [ ] Root cause is a system/process failure, not a person failure
- [ ] CAP has at minimum: corrective action, responsible party (role not name), due date
- [ ] Citations present if standard was referenced
- [ ] PDCA or DMAIC structure is complete — no partial frameworks

### Competency Assessment
- [ ] Every criterion is observable and verifiable (not "understands" or "knows")
- [ ] Verification method matches the skill type (return demo for psychomotor, written for cognitive)
- [ ] Donna Wright method notation present if applicable
- [ ] Assessor signature line included
- [ ] No checkbox symbols (use Y/N or Pass/Fail instead)

### Training Material
- [ ] Learning objectives use approved action verbs: Demonstrate, Identify, Explain, Perform, Apply, State, List, Describe
- [ ] Learning objectives do NOT use: Understand, Know, Appreciate, Be aware of
- [ ] Competency verification plan attached or referenced
- [ ] Content cites the standard it is based on
- [ ] Shift coverage addressed (not just day shift)

### Communication (Email / Memo / Letter)
- [ ] Escalation tier matched to audience (staff vs. supervisor vs. director vs. administration)
- [ ] Tone is audience-appropriate (operational vs. formal)
- [ ] No checkbox symbols (common error — use bullet points or numbered lists)
- [ ] No passive blame language in regulatory/quality communications
- [ ] SAG client letters: confidentiality footer present

### Regulatory Document
- [ ] Standard number present (e.g., AAMI ST79)
- [ ] Section number present (e.g., Section 10.5.2)
- [ ] Edition/year present (e.g., 2017/2020 reaffirmation)
- [ ] Edition is not older than 18 months from today's date
- [ ] Claim is traceable to the cited standard (not paraphrased beyond recognition)

### SAG Deliverable (PRA brief, engagement plan, questionnaire output)
- [ ] All facility-identifying information is anonymized (no facility names, no geographic identifiers, no names)
- [ ] PRA Index score computed and present
- [ ] Confidentiality footer on every page: "Prepared by Scott Advisory Group. Confidential."
- [ ] Engagement tier identified
- [ ] No facility-specific practice presented as universal standard without qualification

## Severity Levels

| Level | Definition | Action |
|---|---|---|
| **FATAL** | Blocks release — output cannot be delivered as-is | Return for revision before any delivery |
| **WARNING** | Output can be delivered but Terry should review | Flag clearly; note specific item |
| **ADVISORY** | Minor issue; informational only | Note in audit trail; no hold required |

## Fatal Triggers (Always Block)

- Individual name in a cause statement in a quality document
- Regulatory citation with edition older than 18 months
- SAG deliverable with facility name not anonymized
- CAP with no corrective action or no due date
- Competency with no observable criteria
- Class I recall response missing Risk Management notification

## Output Format

```
QUALITY GATE REVIEW
Output type: [type]
Review timestamp: [datetime]
Reviewer: spd-quality-gate

RESULT: [PASS / FAIL / RETURN-FOR-REVISION]

FINDINGS:
[FATAL] Item 1: [specific description of the problem and location in document]
[WARNING] Item 2: [specific description]
[ADVISORY] Item 3: [specific description]

PASS CONDITIONS: [what must change before this can be released, if FAIL]
```

## Audit Trail

Every gate review is logged with:
- Timestamp
- Output type reviewed
- Source skill
- Result (Pass/Fail/Return)
- Items flagged with severity


---


# SPD Regulatory Research

## What This Skill Does

Validates and sources regulatory citations before they appear in any SPD document. Prevents misquotation, outdated citations, and guessed standards from reaching a survey finding response, corrective action plan, or leadership report. All citations produced by this skill include edition, section, and currency confirmation.

## Governing Bodies and Standards Map

| Governing Body | Standard | Scope |
|---|---|---|
| AAMI | ST79 | Comprehensive guide to steam sterilization |
| AAMI | TIR34 | Water quality for reprocessing medical devices |
| AAMI | ST77 | Containment devices for reusable medical devices |
| AAMI | ST91 | Flexible and semi-rigid endoscope reprocessing |
| AAMI | ST58 | Chemical sterilization |
| AAMI | ST41 | EO sterilization |
| AAMI | ST8 | Hospital steam sterilizers |
| AAMI | TIR30 | Framework for decontamination of medical devices |
| TJC | EC.02.06.01 | Environment of care — maintenance and physical environment |
| TJC | IC.02.02.01 | Infection control — reducing transmission risk |
| TJC | LD.04.01.01 | Leadership — culture of safety |
| TJC | HR.01.06.01 | Competency — staff qualification verification |
| CMS | §482.42 | Infection control Condition of Participation |
| CMS | §482.13 | Patient rights — standards |
| OSHA | 29 CFR 1910.1030 | Bloodborne pathogens standard |
| CDC | Guidelines for Disinfection and Sterilization | Current edition |
| AORN | Guidelines for Perioperative Practice | Annual edition |
| IAHCSMM | Central Service Technical Manual | Current edition |
| NJ DOH | N.J.A.C. 8:43G | Hospital licensing standards |
| FDA | 21 CFR Part 820 | Quality System Regulation (medical devices) |

[NEEDS INPUT FROM TERRY: Which sections of N.J.A.C. 8:43G are most commonly cited in NJ hospital SPD surveys — request from NJ DOH or from a recent inspection report]

## Citation Format Standard

Every regulatory citation must include standard, section, and edition:

```
[STANDARD] [SECTION] ([EDITION/YEAR])
```

Examples:
- `AAMI ST79:2017/(R)2020, Section 10.4.1`
- `TJC IC.02.02.01, EP 6 (2025 Comprehensive Accreditation Manual)`
- `CMS §482.42(a)(1) (2024 Hospital Conditions of Participation)`
- `OSHA 29 CFR 1910.1030(d)(4)(iii)`
- `AORN Guidelines for Perioperative Practice, 2025 ed., "Instrument Cleaning" guideline`

**Currency rule:** Any citation older than 18 months must be verified. Flag with `[VERIFY EDITION — may be superseded]`.

## Standard Lookup Protocol

### Step 1 — Identify the Governing Body

| Question | Primary Standard |
|---|---|
| Instrument reprocessing technique? | AAMI ST79 |
| Endoscope reprocessing? | AAMI ST91 |
| What would a TJC surveyor cite? | TJC standard + AAMI (surveyors cite TJC; TJC references AAMI) |
| OR perioperative practice? | AORN |
| Employee blood/fluid exposure? | OSHA 29 CFR 1910.1030 |
| NJ state hospital licensing? | NJ DOH N.J.A.C. 8:43G |
| Medical device quality system? | FDA 21 CFR Part 820 |

### Step 2 — Confirm the Standard Exists

Do not fabricate or paraphrase. If the exact section number is unknown:

```
[CITATION INCOMPLETE — standard identified (AAMI ST79) but section not confirmed.
Research required before use in any regulatory document.]
```

### Step 3 — Confirm Currency

State the edition year. If unsure whether a newer edition has been released, flag it for verification before use.

### Step 4 — Produce the Citation Record

```
REGULATORY CITATION RECORD
Standard: [full designation]
Section: [section number]
Edition/Year: [YYYY or YYYY/RYYY if reaffirmed]
Summary of requirement: [1–2 sentences — what it actually requires]
SPD relevance: [why this applies to the document being drafted]
Currency status: [verified current as of YYYY-MM / flagged for verification]
```

## Common SPD Survey Citations

### What TJC Surveyors Cite Most in SPD

| Finding Type | TJC Standard | AAMI Reference |
|---|---|---|
| Instruments improperly stored | EC.02.06.01 | ST79 Section 14 |
| No documented BI program | IC.02.02.01 | ST79 Section 10 |
| Staff competency not documented | HR.01.06.01 | — |
| Loaner instruments processed without IFU | IC.02.02.01 | ST79 Section 7.5 |
| IUSS documentation incomplete | IC.02.02.01 | ST79 Section 9 |
| PPE noncompliance in decon | EC.02.06.01 | OSHA 29 CFR 1910.1030 |
| Missing instrument on packaged tray | IC.02.02.01 | ST79 Section 8 |
| Count sheet not matching case cart | LD.04.01.01 | — |
| No cleaning verification documentation | IC.02.02.01 | ST79 Section 7 |
| Cardboard in sterile storage | EC.02.06.01 | ST79 Section 14.1 |

## Research Request Format

```
REGULATORY RESEARCH REQUEST
Topic: [specific question or standard area]
Context: [document type and intended use — CAP, SOP, survey response, etc.]
Urgency: [routine / pre-survey / active survey / post-finding]
─────────────────────────────────────────────────────────────
OUTPUT NEEDED:
□ Citation only (standard + section + edition)
□ Summary of requirement in plain language
□ Full citation record with SPD relevance
□ Survey finding response with regulatory basis
□ Comparison: what two standards say about the same topic
```

## Standards Relationships

AAMI, TJC, CMS, and AORN do not conflict — they layer:
- **AAMI** sets the technical standard (what must be done and how)
- **TJC** sets the accreditation requirement (that it must be done, citing AAMI as the technical reference)
- **CMS** sets the regulatory requirement (CoP — legal floor)
- **AORN** sets the perioperative practice standard (OR-side complement to SPD's AAMI)

When a document needs both a survey citation and a technical standard, cite both:
`TJC IC.02.02.01, EP 6 (2025), per AAMI ST79:2017/(R)2020, Section 10.4.1`


---


# SPD Analytics

## What This Skill Does

Generates structured KPI analysis and reporting for SPD operations. Produces the weekly KPI packet, monthly dashboard, service line drill-downs, and on-demand data analysis for capital justification, corrective action support, and leadership reporting. Integrates with the existing codebase analytics layer.

## KPI Framework

### Quality Metrics

| Metric | Calculation | Target | Alert Threshold |
|---|---|---|---|
| Tray error rate | Errors / trays processed | < 2% | > 3% |
| Missing instrument rate | Missing instruments / total instruments processed | < 0.5% | > 1% |
| Case cart accuracy | Correct carts / total carts | > 98% | < 95% |
| Count sheet accuracy | Count sheets matching case / total | > 99% | < 97% |
| Assembly error rate | Assembly defects / trays inspected | < 1.5% | > 2.5% |

### Safety Metrics

| Metric | Calculation | Target | Alert Threshold |
|---|---|---|---|
| Positive BI rate | Positive BIs / total BI tests | 0% | Any positive |
| Bioburden events | Count of events | 0 | Any Class I or II event |
| IUSS rate | IUSS cycles / total sterilizer cycles | < 5% | > 8% |
| Cleaning verification failure rate | Failed tests / total tests | < 2% | > 3% |

### Productivity Metrics

| Metric | Calculation | Target |
|---|---|---|
| Instruments per tech-hour | Total instruments / total tech-hours | [NEEDS INPUT FROM TERRY — benchmark from SQ Track] |
| Trays per tech-shift | Total trays / total tech-shifts | [NEEDS INPUT FROM TERRY] |
| Case cart cycle time (tray-to-case) | Mean minutes from tray build to OR delivery | [NEEDS INPUT FROM TERRY] |
| Coverage ratio | Available tech-minutes / demand-minutes | ≥ 1.10 |

### Operational Metrics

| Metric | Calculation | Target |
|---|---|---|
| Overtime rate | OT hours / total hours | < 10% |
| Traveler hours / FTE hours | Traveler hours / FTE hours | < 15% |
| Open escalations at shift change | Count of unresolved escalations at handoff | 0 |
| Repair cost per instrument | Total repair spend / instruments repaired | Trending down |

## Weekly KPI Packet Structure

```
SPD WEEKLY KPI REPORT
Week of: [YYYY-MM-DD to YYYY-MM-DD]
Prepared by: [SPD Director role]
─────────────────────────────────────────────────────────────
QUALITY SUMMARY:
Tray error rate:        [current %] vs. [prior week %] → [▲ increase / ▼ decrease / — stable]
Missing instrument rate:[current %] vs. [prior week %] → [▲/▼/—]
Case cart accuracy:     [current %]
Bioburden events:       [N this week]
BI failures:            [N this week]
IUSS rate:              [current %] vs. [prior week %] → [▲/▼/—]

PRODUCTIVITY SUMMARY:
Instruments processed:  [N]
Average coverage ratio: [value]  Status: [adequate ≥1.10 / marginal / understaffed]
Overtime hours:         [N] ([%] of total)

QUALITY EVENTS REQUIRING ESCALATION:
[List events — tray name/date/finding, BI sterilizer/load, etc. Roles only, no names.]

OPEN ITEMS FROM PRIOR WEEK:
[Status of each unresolved item from last report]

TREND FLAGS:
[Any metric moving wrong direction 2+ consecutive weeks — flag with [TREND ALERT]]
─────────────────────────────────────────────────────────────
```

**Black spec separation:** KPI packet reports SPD data only. OR PPE compliance, IP rounding findings, and clinical staff performance are NOT included. Those belong in joint reports, not in the SPD operational KPI packet.

## Codebase Integration

| Module | Use |
|---|---|
| `lib/analytics/aggregator.ts` | Aggregation by time period and metric category |
| `lib/scoring/engine.ts` | Threshold evaluation and status color logic |
| `lib/reports/generator.ts` | Formatted report output |
| `lib/staffing/calculator.ts` | Coverage ratio computation |
| Supabase `audit_responses` | Compliance audit data source |
| Supabase `repair_cycles` | Repair cost aggregation for lifecycle analysis |

### KPI Packet Generation Sequence

1. Query Supabase `audit_responses` for the reporting period
2. Aggregate via `lib/analytics/aggregator.ts`
3. Apply thresholds via `lib/scoring/engine.ts`
4. Generate formatted output via `lib/reports/generator.ts`
5. Flag any alerts before delivery — route to spd-quality-gate

## Service Line Drill-Down

On request, or when tray error rate exceeds alert threshold:

```
SERVICE LINE QUALITY BREAKDOWN — [Period]
─────────────────────────────────────────────────────────────
Service Line     | Tray Errors | Missing Instr | Error Rate
Orthopedics      | [N]         | [N]           | [%]
Cardiovascular   | [N]         | [N]           | [%]
General Surgery  | [N]         | [N]           | [%]
Neurosurgery     | [N]         | [N]           | [%]
OB/GYN           | [N]         | [N]           | [%]
Endoscopy        | [N]         | [N]           | [%]
─────────────────────────────────────────────────────────────
Highest error rate: [service line] at [%]
Next step: route to spd-systems-connector for upstream cause analysis
```

## Shift-Level Breakdown

When error clustering by shift is needed (connects to spd-systems-connector staffing hypothesis):

```
SHIFT-LEVEL ERROR DISTRIBUTION — [Period]
─────────────────────────────────────────
Shift      | Lead   | Errors | Error Rate
Day        | [role] | [N]    | [%]
Evening    | [role] | [N]    | [%]
Night      | [role] | [N]    | [%]
─────────────────────────────────────────
Note: error rate by shift is a systems indicator, not a performance evaluation.
Route to spd-systems-connector if one shift is consistently above threshold.
```

## Trend Alert Protocol

When a metric moves in the wrong direction for 2+ consecutive periods:

1. Flag in KPI packet with `[TREND ALERT — [metric] rising for [N] consecutive weeks]`
2. Route to spd-systems-connector — do not propose a root cause in the analytics output
3. spd-systems-connector maps upstream causes
4. spd-quality-docs documents corrective action once cause is confirmed
5. spd-outcomes-tracker tracks whether the intervention worked

## Monthly Dashboard

Condensed for monthly leadership reporting (feeds spd-presentations):

```
SPD MONTHLY PERFORMANCE DASHBOARD — [Month YYYY]
─────────────────────────────────────────────────────────────
Quality: Tray error [%] | Missing instruments [%] | Case cart accuracy [%]
Safety:  BI failures [N] | Bioburden events [N] | IUSS rate [%]
Productivity: Coverage ratio avg [value] | OT rate [%]
Quality events this month: [N total — [N] Tier 1/2, [N] Tier 3/4]
CAPs open: [N] | CAPs closed this month: [N]
─────────────────────────────────────────────────────────────
Period-over-period: [improving / stable / declining] — [brief narrative]
```


---


# SPD Quality Docs

## What This Skill Does

The documentation layer for all SPD quality events and corrective actions. Produces event reports, root cause analyses, corrective action plans, and improvement cycle documentation. Ensures every quality event has a defensible, citation-backed document trail from intake through closure.

## Event Classification

### Severity Tiers

| Tier | Definition | Examples | Response Window |
|---|---|---|---|
| **Tier 1 — Critical** | Actual or probable patient exposure | Contaminated tray used in case, undetected soil on sterile instrument, Class I recall exposure | Immediate — Risk Management within 1 hour |
| **Tier 2 — Significant** | Process failure without confirmed exposure | Positive BI without load recall, IUSS undocumented, loaner processed without IFU | Same day — Terry notification, corrective action initiated |
| **Tier 3 — Quality** | Defect caught before patient exposure | Assembly error at inspection, missing instrument at case cart, count sheet mismatch at assembly | Within 72 hours — standard CAP process |
| **Tier 4 — Near Miss** | Weakness identified before a defect occurs | Count sheet not updated after preference card change (no error yet), instrument at repair threshold | Weekly quality review cycle |

## Event Report Template

```
SPD QUALITY EVENT REPORT
Event date: [YYYY-MM-DD]   Time: [HH:MM]
Reported by: [role — no individual names]
Event tier: [1 / 2 / 3 / 4]
─────────────────────────────────────────────────────────────
EVENT DESCRIPTION:
[What happened — factual, objective, no cause assigned yet.
 What was found, where, when, under what circumstances.]

INSTRUMENTS/TRAYS INVOLVED:
[Tray name, catalog ID, sterilizer load#, expiration date if applicable]

IMMEDIATE ACTIONS TAKEN:
[Quarantine, OR notification, instrument pull, etc. — with times]

PATIENT IMPACT ASSESSMENT:
[Was the instrument used in a case?]
[Patient identifier — Risk Management handles; SPD provides the scope data]
─────────────────────────────────────────────────────────────
Notifications required:
  Risk Management:  Y / N   Time notified: [HH:MM]
  Infection Prevention: Y / N   Time notified: [HH:MM]
  Terry: Y / N   Time notified: [HH:MM]
```

## Root Cause Analysis — 5-Why Framework

Use for Tier 3 and Tier 4 events:

```
5-WHY ROOT CAUSE ANALYSIS
Event: [Brief description]
Date: [YYYY-MM-DD]
─────────────────────────────────────────────────────────────
Why 1: [Why did the event occur?]
  Answer: [specific observation]

Why 2: [Why did that happen?]
  Answer: [specific]

Why 3: [Why did that happen?]
  Answer: [specific]

Why 4: [Why did that happen?]
  Answer: [specific]

Why 5: [Why did that happen?]
  Answer: [this is typically the root cause]
─────────────────────────────────────────────────────────────
Root cause: [state it clearly in one sentence]

Root cause category:
  □ Human factors (training, competency, distraction, staffing coverage)
  □ Process (SOP gap, process not followed, handoff failure, count sheet error)
  □ Equipment (instrument failure, sterilizer performance)
  □ Environmental (storage conditions, traffic pattern, workspace)
  □ Systems/External (count sheet, preference card, vendor, supply chain, procurement)
```

**Naming rule:** No individual staff names in root cause statements. Write "A technician in the assembly area" not "Sarah in assembly." Write "the night shift team" not a supervisor's name.

## Full RCA — Tier 1 and Tier 2 Events

```
SPD ROOT CAUSE ANALYSIS (FULL)
Event: [Brief description]
RCA lead: [SPD Director role]
RCA team: [roles, not names]
Initiated: [YYYY-MM-DD]   Completion target: [YYYY-MM-DD + 5 business days]
─────────────────────────────────────────────────────────────
TIMELINE (chronological from first point of failure):
[Date/Time] → [Event step]
[Date/Time] → [Event step]
[Date/Time] → [Discovery]

CAUSAL FACTOR ANALYSIS:
Immediate cause: [what directly caused the event]
Contributing causes: [conditions that enabled the immediate cause]
Root cause(s): [the fundamental system or process failure]

SYSTEM GAPS IDENTIFIED:
[Each gap = a structural weakness — a handoff that no one owns, a check that doesn't exist]
[Route to spd-systems-connector for cross-system gap analysis if upstream cause is unclear]

REGULATORY STANDARD:
[Applicable citation per spd-regulatory-research — standard + section + edition]
─────────────────────────────────────────────────────────────
```

## Corrective Action Plan (CAP)

```
CORRECTIVE ACTION PLAN
CAP reference: [YYYY-SPD-NNN]
Related event: [Event report reference or survey finding reference]
CAP owner: [role]   Target completion: [YYYY-MM-DD]
─────────────────────────────────────────────────────────────
ROOT CAUSE ADDRESSED:
[From RCA — one sentence]

CORRECTIVE ACTIONS:
Action 1: [Specific, measurable action]
  Owner: [role]   Due: [date]   Status: [open / in progress / complete]

Action 2: [Specific, measurable action]
  Owner: [role]   Due: [date]   Status: [open / in progress / complete]

PREVENTIVE ACTION (systemic fix):
[What structural change prevents recurrence — not a one-time fix, a process change]

EFFECTIVENESS MEASUREMENT:
Metric: [what will be measured to confirm the corrective action worked]
Baseline (before): [metric value]
Target (after): [metric value that signals success]
Measurement window: 90 days
Measurement date: [YYYY-MM-DD]
Track outcome via: spd-outcomes-tracker

REGULATORY CITATION:
[Standard + section supporting the corrective action — from spd-regulatory-research]
─────────────────────────────────────────────────────────────
```

## PDCA Cycle

```
PLAN:
Problem statement: [specific and measurable]
Root cause: [from RCA or 5-Why]
Proposed change: [specific intervention]
Measure of success: [metric that will confirm improvement]

DO:
Pilot scope: [where and when the change will be tested]
Implementation date: [YYYY-MM-DD]
Responsible: [role]

CHECK:
Measurement window: [dates]
Metric before: [value]
Metric after: [value]
Success: Y / N / Partial

ACT:
Decision: [Adopt / Adapt / Abandon]
If adopted: [how it becomes permanent SOP — route to spd-sop-framework]
If adapted: [what changes before re-piloting]
If abandoned: [what alternative approach will be tried]
```

## Survey Finding Response

```
SURVEY FINDING RESPONSE
Finding reference: [Surveyor's finding number]
Standard cited by surveyor: [TJC/CMS standard + EP or paragraph]
AAMI/supporting standard: [from spd-regulatory-research]
Classification: [Requirement for Improvement / Condition / Deficiency]
─────────────────────────────────────────────────────────────
FINDING DESCRIPTION:
[Exact surveyor language — do not paraphrase]

SPD RESPONSE:
Immediate actions completed: [list with dates]
Root cause: [from RCA — one sentence]
Corrective action plan: [CAP reference or summary of actions]
Systemic prevention: [structural change that prevents recurrence]
Evidence of completion: [documentation that will demonstrate correction]

Completion date: [YYYY-MM-DD]
Submitted by: [SPD Director role]
─────────────────────────────────────────────────────────────
```


---


# SPD Bioburden Protocol

## What This Skill Does

Manages bioburden event intake, classification, investigation, and escalation. A bioburden event is any instance where residual organic material is present at a point in the reprocessing chain where it should have been eliminated. The earlier it is caught, the lower the risk — this skill's protocols ensure every event is captured, classified, and responded to before it exits the processing chain.

## Bioburden Event Classification

| Class | Definition | Examples | Response |
|---|---|---|---|
| **Class I — Post-Sterilization** | Visible soil found after sterilization in a patient-ready instrument or tray | Soil in a packaged tray, residue found when opening for a case | Immediate — IP and Risk Management notified within 15 minutes if patient-ready |
| **Class II — Process Failure** | Cleaning verification failure or BI failure indicating reprocessing breakdown | Failed ATP test at packaging, positive BI result, failed visual inspection post-decon | Same day — quarantine load, notify Terry, full investigation |
| **Class III — POU Deficit** | Inadequate OR pre-treatment returns instruments to SPD with excessive bioburden | Dried blood on returned instruments, no foam applied, inadequate soaking | Document; route to spd-or-liaison-agent for POU compliance follow-up |
| **Class IV — Near Miss** | Bioburden risk identified and contained before progressing | Visible soil caught at decon inspection before assembly | Document as near miss; no escalation unless pattern emerges |

## Event Intake Checklist

```
BIOBURDEN EVENT INTAKE
Event class: [I / II / III / IV]
Date/time discovered: [YYYY-MM-DD HH:MM]
Discovered by: [role, area — no individual name]
Location in chain: [Decon / Assembly / Post-Pack Inspection / Sterile Storage / OR]
─────────────────────────────────────────────────────────────
INSTRUMENT DETAILS:
Instrument: [per spd-catalog-agent naming standard]
Tray/set: [name]
SQ Track ID: [if applicable]
Sterilizer load#: [if post-sterilization]
Lot/batch: [if applicable]
─────────────────────────────────────────────────────────────
BIOBURDEN TYPE (check all that apply):
□ Visible soil (blood, tissue, protein debris)
□ Failed ATP test — reading: [value] (threshold: [value])
□ Failed visual inspection under magnification
□ Failed cleaning verification chemical test
□ Positive BI: Sterilizer [ID] | Load [#] | Spore type [manufacturer]
□ Residual cleaning chemical
□ Rust or mineral deposit
─────────────────────────────────────────────────────────────
IMMEDIATE ACTIONS:
□ Instrument/tray quarantined
□ OR notified (if instrument was OR-ready or in transit)
□ Terry notified — time: [HH:MM]
□ IP notified — time: [HH:MM] (Class I required)
□ Risk Management notified — time: [HH:MM] (Class I if patient-ready)
```

## Class I Response Protocol

**Within 15 minutes:**
1. Quarantine the tray/instrument — do not return to service for any reason
2. Notify Terry immediately
3. Determine: was this instrument used in a case?
   - **YES:** Notify Risk Management immediately + IP — patient exposure window open
   - **NO (caught before use):** Notify IP per protocol below; no patient notification expected

**Within 1 hour:**
4. Notify IP in writing (email is the record)
5. Begin spd-quality-docs Tier 1 event report
6. Identify the sterilizer load — assess all instruments from the load
7. If the load is suspect: initiate load recall per AAMI ST79 recall protocol

### Class I IP Notification (Email)

```
To: [IP role]
From: [SPD Director role]
Subject: SPD Bioburden Event — Class I — [YYYY-MM-DD]

A Class I bioburden event was identified today at [HH:MM] in [area].

Instrument: [name per catalog standard]
Finding: [description — factual, no cause assignment]
Tray/load: [identifier]
Patient impact: [used in case / caught before use — no patient identifier in this email]

Immediate actions completed:
- Instrument quarantined
- Terry notified at [HH:MM]

Root cause investigation is underway. Preliminary finding within 24 hours.
```

## BI Failure Protocol

A positive biological indicator is a sterilization failure until investigation proves otherwise. Do not release any load, and do not assume it is a false positive before completing the investigation.

### Immediate Response (same hour)

1. Hold all loads from the affected sterilizer pending investigation
2. Notify Terry
3. Pull all loads run since the last confirmed negative BI (AAMI ST79 recall protocol)
4. Quarantine all potentially affected instruments
5. Notify OR charge nurse: sterilizer offline, timeline TBD
6. Contact sterilizer service for emergency inspection if mechanical cause is possible

### BI False Positive Checklist

Before concluding a positive BI is a false positive, rule out each item:

```
BI FAILURE INVESTIGATION
Sterilizer: [ID]   Load: [#]   Date: [YYYY-MM-DD]
BI type: [spore type, manufacturer, lot#]
─────────────────────────────────────────────────────────────
RULE OUT (check each — must be documented):
□ BI placement error — was BI in the correct challenge location?
□ Incubation error — correct temperature and duration per manufacturer IFU?
□ Expired BI lot — lot expiration date: [date]
□ Control strip result — run control per manufacturer IFU: [result]
□ Cycle parameters out of range — review sterilizer printout: [Y/N in range]
□ Sterilizer mechanical issue — review maintenance log: [any open issues?]
□ Load packing error — was load configured per AAMI ST79 guidelines?
□ Chemical indicator failure on same load — [Y/N]
─────────────────────────────────────────────────────────────
CONCLUSION:
□ False positive confirmed — control strip negative; all other parameters normal
   → Document; no recall required; maintain BI program frequency
□ True failure — unable to confirm false positive; investigation inconclusive
   → Formal load recall; sterilizer removed from service until repaired and requalified
```

## Cleaning Verification Program

### Routine Verification Checks

| Check | Frequency | Threshold | Action on Failure |
|---|---|---|---|
| Visual inspection at packaging | Every tray, every cycle | Zero visible soil | Hold for reprocessing; document as Class II or IV |
| Chemical indicator (CI) in pack | Every processed set | Color change per manufacturer IFU | Quarantine; re-sterilize; document |
| Biological indicator (BI) | Per AAMI ST79 schedule (min weekly, every implant load) | Negative | BI failure protocol above |
| ATP bioluminescence (if available) | Per facility program | < 200 RLU (or facility threshold) | Re-clean; document; trend data |

### Trending

Track monthly, share with IP:
- Visual inspection failure rate
- ATP failure rate (if used)
- BI failure count
- Trend direction: improving / stable / deteriorating

Share via spd-infection-prevention-interface monthly data sharing protocol.

## Post-Event Routing

| Class | Routes To |
|---|---|
| Class I | spd-quality-docs Tier 1 event report + spd-infection-prevention-interface |
| Class II | spd-quality-docs Tier 2 event report |
| Class III | spd-or-liaison-agent (POU compliance follow-up) + spd-quality-docs Class III record |
| Class IV | spd-quality-docs near-miss record only |

All Class I and II events route through spd-quality-gate before any documentation is shared externally.


---


# SPD Shift Handoff

## What This Skill Does

Produces a structured handoff report from outgoing to incoming supervisor. Ensures nothing falls through between shifts. Encodes the three standard SPD handoff windows with their risk profiles and overlap constraints.

## Shift Handoff Windows

| Transition | Typical Window | Overlap | Risk Profile |
|---|---|---|---|
| Night → Day | 7:00–7:30a | 30 minutes | **HIGHEST RISK** — tightest window; night issues surface as day problems |
| Day → Evening | Varies by schedule | 30 min – 4.5 hrs | **BEST WINDOW** — most transfer capacity; use it fully |
| Evening → Night | 11:00–11:30p | 30 minutes | Standard overlap |

## Handoff Report Template

```
SPD SHIFT HANDOFF REPORT
Date: [YYYY-MM-DD]
Outgoing: [Name/Role] — [Shift]
Incoming: [Name/Role] — [Shift]
Report completed: [HH:MM]
────────────────────────────────────────────────────

1. OPEN QUALITY EVENTS
   [List each open event: type, time of occurrence, current investigation status]
   If none: "None open at end of shift"

2. MISSING CRITICAL INSTRUMENTS
   [Instrument name | Tray | Status | Escalation?]
   If none: "No critical missing instruments"

3. STERILIZER / WASHER STATUS
   Sterilizer 1: [last load #, BI status, any failures, loads pending retrieval]
   Sterilizer 2: [same]
   Washer 1: [operational / down / maintenance pending]
   Washer 2: [same]
   If all clear: "All sterilizers/washers operational, BI pending in [location]"

4. INCOMPLETE TRAYS
   [Tray name | Reason incomplete | Expected resolution | Who owns it]
   If none: "No incomplete trays at end of shift"

5. STAFFING
   [Call-outs this shift: name/role, coverage arrangement made]
   [Early departures: name/role, reason, who covered]
   If none: "Full staffing — no anomalies"

6. OR COMMUNICATION ITEMS
   [Any pending callback from OR, case changes notified, add-on cases received]
   If none: "No pending OR communications"

7. VENDOR / LOANER STATUS
   [Any outstanding loaner at shift end: vendor, set name, case date, status]
   If none: "No open loaner items"

8. TOP 3 PRIORITIES FOR INCOMING SHIFT
   1. [Highest priority item with enough context to act immediately]
   2. [Second priority]
   3. [Third priority]
────────────────────────────────────────────────────
Outgoing supervisor signature: _________________
Incoming supervisor signature: _________________
```

## Escalation Triggers at Handoff

These conditions require escalation to Terry **before the outgoing supervisor leaves**:

| Condition | Required Action |
|---|---|
| Critical missing instrument unresolved | Call Terry; document in handoff that escalation occurred |
| Sterilizer BI failure not resolved | Do NOT hand off without a documented resolution plan; call Terry |
| Contaminated tray investigation not closed | Status note required in handoff; notify Terry if patient risk is possible |
| Staff coverage below minimum safe level for incoming shift | Notify Terry before transition |

## Night-to-Day Specific Protocol (30-Minute Window)

This window is 30 minutes with no flexibility. Every minute counts.

Night shift must complete before window opens:
- [ ] Handoff report fully written (not in progress at start of window)
- [ ] All BI results that can be read are read and logged
- [ ] All loads run overnight are documented
- [ ] Any call-outs or coverage issues from night are noted

At handoff start — verbal briefing only covers:
1. Anything new since the report was written
2. Items 1–3 from the report (quality events, missing instruments, sterilizer status) — verbal confirmation only
3. Top 3 priorities verbal review

Day shift does NOT wait for verbal briefing on everything — they read the report.

## Day-to-Evening Protocol (Best Window)

When the day-to-evening overlap is longer (up to 4.5 hours), use it fully.

During overlap:
- Evening supervisor reads written report while day supervisor finishes active tasks
- At midpoint: verbal review of all open items
- Before 2 hours remain: evening is running independently with day available for questions
- At departure time: formal handoff complete

## Documentation Filing

Completed handoff reports filed in:
- **Primary:** SQ Track (if handoff module is active)
- **Alternate:** Notion — CSS Operations workspace (Terry to confirm page location)
- **Never:** Left as a paper copy with no electronic backup

## Handoff Quality Metric

Track monthly:
- Late handoffs (report not ready at start of window)
- Unresolved escalations handed off without Terry notification
- Items discovered by incoming shift that were not in the handoff report


---


# SPD Vendor Loaner Management

## What This Skill Does

Manages all vendor and loaner instrumentation workflows. Covers intake, IFU acquisition, tracking system entry, vendor rep access control, return accountability, and vendor performance tracking.

## Loaner Intake Checklist

Run this checklist every time a loaner set arrives.

### Pre-Arrival Requirements
- [ ] Minimum advance notice received: **72 hours for complex sets; 24 hours minimum for all sets**
- [ ] Case scheduled and confirmed in OR system
- [ ] Vendor contact name and credentials on file

### At Arrival

- [ ] **IFU packet received from vendor rep at time of delivery** (STOP if not present — set cannot be processed without IFU)
- [ ] Tray count verified: items received vs. delivery manifest
- [ ] Packaging integrity inspected (no tears, moisture, visible contamination)
- [ ] SQ Track entry created: set type = LOANER, vendor, arrival date, case date
- [ ] Count sheet created (use spd-catalog-agent) OR vendor count sheet verified for completeness
- [ ] Cleaning verification documentation started (who will process, which washer/method)

### IFU Hold Protocol

If IFU is not present at intake:
1. Set is quarantined — do not begin processing
2. Contact vendor rep immediately: "IFU required before processing can begin per FDA and AAMI ST79"
3. Document the hold: time, set, vendor, reason
4. If IFU not received within 2 hours: notify OR charge nurse and Terry
5. Generate vendor accountability letter via spd-leadership-comms

## Vendor Rep Access Protocol

| Area | Authorized Access | Restrictions |
|---|---|---|
| Sterile Storage | No vendor access without Terry or lead escort | Cannot touch sterile items |
| Clean/Assembly | Escort required for instrument identification only | Cannot handle assembled trays |
| Decontamination | No vendor access — ever | Regulatory requirement |
| OR | Per OR policy — not SPD jurisdiction | |

### Credentialing Verification

Before any vendor rep enters SPD-controlled space:
1. Check rep's hospital credentialing badge (Reptrax, Vendormate, or equivalent system in use at the facility)
2. If not credentialed: rep does not enter; set is received at the dock only
3. Log every access with rep name, company, time in, time out, escort name

### Vendor Breach Documentation

If a vendor rep enters a restricted area without authorization or handles restricted items:
- Document immediately: rep name, company, area entered, time, what was handled
- Route to spd-quality-docs for vendor breach corrective action
- Issue vendor accountability letter via spd-leadership-comms
- Report to Terry same shift

## IFU File Management

### Maintaining the IFU Library

- Every instrument or set processed must have an IFU on file before first processing
- File format: digital preferred (PDF); physical copy acceptable if digital unavailable
- IFU file naming: `[VENDOR]-[SET NAME]-[VERSION DATE].pdf`

### IFU Revision Tracking

- Vendors must notify SPD of IFU revisions when they occur
- When revision received: compare old vs. new for any changes to cleaning method, sterilization parameters, or materials
- If changes affect current process: generate SOP update request via spd-sop-framework
- Log: old version archived, new version effective date noted

### Deviation Documentation

If facility equipment or constraints prevent following the IFU exactly:
- Document the deviation: what the IFU requires vs. what was done and why
- Route to Terry for approval
- Route to spd-quality-docs for formal deviation record
- Never process using a deviation without documentation

## Return and Accountability

### At Return

- [ ] Tray count verified: items returned vs. original intake count
- [ ] Instruments inspected for damage
- [ ] Contamination level documented (cleaned vs. uncleaned from OR)
- [ ] SQ Track entry updated: return date, condition notes

### Damage Documentation

If instruments are returned damaged:
1. Photograph damage before returning to vendor
2. Document: item name, catalog number, damage description, suspected cause (processing vs. OR use vs. manufacturing)
3. Route to vendor with damage documentation attached
4. Track vendor response in vendor accountability log

### Missing Instruments at Return

- If count at return < count at intake: hold full payment authorization
- Notify vendor immediately with specific missing item list
- Set vendor response deadline: 48 hours for replacement or resolution
- If unresolved at 48 hours: escalate to Terry, route to spd-quality-docs

## Vendor Performance Tracking

### Active Open Issues

Use this table to track open vendor issues. Update as issues open and close.

| Vendor | Open Issue | Status |
|---|---|---|
| [Vendor name] | [Issue description] | Open / Resolved |

### Vendor Accountability Metrics (track per vendor)

- IFU compliance rate: % of deliveries where IFU was present at intake
- Advance notice compliance: % of deliveries meeting minimum lead time
- Return damage rate: damaged items / total items returned
- Response time to escalations: days from issue raised to resolution
- Breach history: unauthorized access events


---


# SPD OR Liaison Agent

## What This Skill Does

Manages the SPD-OR relationship proactively. Covers daily case readiness review, turnaround coordination, POU compliance tracking, case cart accuracy, and the SPD-OR satisfaction framework. SPD gets blamed for OR problems that originate in OR behavior — this skill creates the documentation and communication structure that makes accountability visible on both sides.

## Daily Case Readiness Review

Run the prior evening (or first thing AM) for the next day's OR schedule.

### Case Readiness Checklist

```
DAILY CASE READINESS REVIEW
Date: [Review date] — Cases for: [Case date]
Reviewer: [Role]
─────────────────────────────────────────────────────────────
For each scheduled case:
□ Case / Surgeon / Procedure / OR Room / Scheduled time
□ Required trays identified (from preference card or SQ Track)
□ Trays confirmed: processed and in sterile storage
□ Count: trays needed [X] / trays available [Y]
□ Exceptions: [list any tray not ready, with reason and priority]
─────────────────────────────────────────────────────────────
EXCEPTION COMMUNICATION sent to OR lead by: [time]
Exceptions:
1. [Tray name] — [Reason] — [Expected completion / Resolution]
2. [Tray name] — [Reason] — [Expected completion / Resolution]
─────────────────────────────────────────────────────────────
```

**Communication deadline:** OR charge nurse notified of all exceptions by **2:00 PM the prior day** for scheduled cases. For next-morning add-ons: notify within 30 minutes of receiving the add-on.

## Turnaround Coordination

### Priority Turnaround Request Intake

When OR requests priority turnaround:

```
TURNAROUND REQUEST
Received: [HH:MM]
Tray / Instrument: [Name]
Procedure: [Procedure name]
Surgeon: [Surgeon name]
Case time needed by: [HH:MM]
Current status of instrument: [In use / In decon / Missing]
─────────────────────────────────────────────────────────────
SPD RESPONSE:
Estimated processing completion: [HH:MM]
Feasible by requested time: Yes / No
If No — alternate plan: [loan set / substitute tray / rescheduling recommendation]
Communicated to OR charge nurse at: [HH:MM]
```

### Turnaround Timeline Communication

When turnaround is feasible:
- Communicate estimated completion time with a buffer (underpromise)
- Provide one status update at midpoint
- Communicate completion when instrument is sterile and ready

When turnaround is NOT feasible:
- Communicate immediately — do not wait
- Provide the reason (not enough time, equipment constraint, etc.)
- Offer alternatives (loaner set, postpone, substitute)
- Document the communication

## POU Treatment Compliance Tracking

Point-of-use treatment is the OR's responsibility. SPD's responsibility is to track compliance and escalate when it fails.

### POU Audit Protocol

Monthly direct observation audit in OR instrument return area (coordinate with OR charge nurse):

```
POU COMPLIANCE AUDIT
Date: [date]   Auditor: [role]
Observation period: [start time] – [end time]
Procedures observed: [N]
─────────────────────────────────────────────────────────────
Compliance items observed per return:
□ Gross soil removal at point of use before transport
□ Instruments kept moist during transport (moist towel or enzymatic spray)
□ No soaking in standing water
□ Container closed during transport to SPD
□ Sharps secure in transport container
─────────────────────────────────────────────────────────────
Compliance rate: [X of N returns fully compliant] = [%]
Gaps observed: [describe any non-compliant returns]
─────────────────────────────────────────────────────────────
```

### Communication When POU Gaps Are Identified

Single incident — verbal communication to OR charge nurse same shift.
Recurring pattern (3+ events in 30 days) — written communication via spd-leadership-comms to OR Nurse Manager, copy to Terry.
Persistent issue — joint IP communication via spd-infection-prevention-interface.

## OR Satisfaction Framework

### Monthly / Quarterly SPD-OR Touchpoint Meeting

**Agenda template:**
1. Case readiness metrics from prior period (% trays ready on time)
2. Turnaround performance (avg time, exceptions)
3. POU compliance rate
4. Open items from last meeting
5. Upcoming changes (new trays, new vendors, schedule changes)
6. OR feedback collection

**Satisfaction data collect (ask OR lead):**
- Tray completeness: how often are trays missing instruments?
- Turnaround time: meeting or missing expectations?
- Communication quality: are exceptions communicated early enough?
- Overall satisfaction: 1–5 scale

### Escalation When OR Behavior Drives SPD Quality Events

When OR actions (improper POU, late returns, unauthorized handling) are causing SPD quality events:
1. Document the pattern with dates and event types
2. Generate communication via spd-leadership-comms to OR Nurse Manager
3. Involve IP via spd-infection-prevention-interface if POU compliance is the root cause
4. Route to Terry for leadership-level escalation if pattern continues

## Case Cart Accuracy Workflow

### Pre-Build Checklist (by service line)

Before building each case cart:
- [ ] Preference card reviewed for current surgeon preferences
- [ ] Count sheet verified for this tray
- [ ] Any surgeon-specific substitutions documented
- [ ] Cart labeled with: patient MRN (if used), procedure, surgeon, OR room, date

### Discrepancy Documentation

If OR reports a missing item or incorrect item on the case cart:
```
CASE CART DISCREPANCY
Date/Case: [details]
Item reported missing/incorrect: [item]
Reported by: [role] at [time]
SPD response: [what was done]
Root cause: [wrong count sheet / missing instrument / assembly error]
Prevention: [action taken]
```

Route to spd-quality-docs if this is a recurring item or the missing instrument reached the sterile field.

## Instrument Availability Communication

### Missing Instrument Notification to OR

When a critical instrument cannot be located before a scheduled case:

```
To: OR Charge Nurse [or designated contact]
From: SPD Supervisor [role]
Re: Instrument Availability — [Case date/time]

[Instrument name] for [Procedure / Surgeon] is currently unavailable.

Status: [In repair / Not returned from prior case / Cannot be located]
Alternative available: [Y/N — if Y, describe alternative]
Expected resolution: [ETA or "escalated to Director"]

SPD contact for updates: [supervisor name/role and phone]
```


---


# SPD Instrument Lifecycle

## What This Skill Does

The repair-replace-retire decision framework. Fills the gap between repair cycle tracking in analytics and the actual management decision. Produces documented decisions, vendor accountability records, and lifecycle cost data that feeds capital justification.

## Repair vs. Replace Decision Matrix

### Primary Decision Criteria

| Criterion | Repair | Replace |
|---|---|---|
| **Cost threshold** | Repair cost < 40% of replacement cost | Repair cost ≥ 40% of replacement cost |
| **Repair frequency** | ≤ 2 repairs in rolling 12 months | > 3 repairs in rolling 12 months |
| **Functional status** | Instrument meets IFU performance specs after repair | Instrument cannot meet IFU specs — functional failure |
| **Manufacturer status** | Still in active production | Manufacturer EOL notice received |
| **Parts availability** | Replacement parts available | Parts no longer manufactured |

**If 2+ criteria point to Replace: recommend replacement.**

### Functional Failure Criteria

An instrument has functionally failed when it cannot meet its IFU performance requirements:
- Scissors that will not cut cleanly (tested per AAMI criteria)
- Forceps with jaw misalignment that cannot be corrected by repair
- Needle holder with ratchet that does not hold under load
- Scope with persistent image distortion after servicing
- Any instrument where the repair does not restore the instrument to IFU specifications

## Retire Criteria

Retire an instrument when ALL three conditions are met:
1. Instrument is no longer on active case schedule (OR preference card review confirms)
2. A replacement has been received, stocked, and entered in SQ Track
3. One of the following: repair cost exceeds replacement cost OR manufacturer has ceased production

**Never retire without a confirmed replacement in service.** Retiring without replacement creates a count sheet shortage.

## Damage Cause Documentation

Before sending any instrument for repair, document the probable cause:

| Cause Category | Description | Accountability |
|---|---|---|
| **Processing damage** | Damage consistent with mechanical washing, chemical exposure, or instrument-to-instrument contact in tray | SPD accountability; SOP review if pattern emerges |
| **OR use damage** | Damage consistent with misuse, wrong instrument for technique, dropped on floor | OR accountability; communicate via spd-or-liaison-agent |
| **Manufacturing defect** | Damage inconsistent with use or processing; appears at first or early use | Vendor warranty; submit claim |
| **Normal wear** | Expected degradation at expected lifecycle endpoint | Planned replacement |

Photograph every instrument before sending for repair. Document cause category.

## Vendor Warranty and Replacement Claims

### Claim Workflow

1. Document damage with photos and cause classification
2. Identify warranty status (check purchase date and vendor warranty terms)
3. Submit claim to vendor with:
   - Instrument name and catalog number
   - Purchase date and invoice reference
   - Damage description and photos
   - Cause classification
4. Track vendor response (target: 10 business days)
5. If claim denied: document denial reason; escalate to Terry if dispute warranted
6. Log claim outcome in vendor accountability record

## Lifecycle Cost Model

### Per-Instrument Lifecycle Record

```
INSTRUMENT LIFECYCLE RECORD
Instrument: [Full primary name per spd-catalog-agent]
Catalog No: [MFR CODE-PART#]
SQ Track ID: [ID]
Purchase date: [YYYY-MM-DD]   Purchase cost: $[amount]
─────────────────────────────────────────────────────────────
REPAIR HISTORY:
Date | Vendor | Issue | Cost | Cause Category
[date] | [vendor] | [description] | $[cost] | [category]
[date] | [vendor] | [description] | $[cost] | [category]
─────────────────────────────────────────────────────────────
Total repair cost to date: $[sum]
Replacement cost (current quote): $[amount]
Repair-to-replacement ratio: [total_repair / replacement_cost]
Decision threshold reached: Y/N
─────────────────────────────────────────────────────────────
DECISION: [Repair / Replace / Retire]
Decision date: [date]
Approved by: Terry Scott
Next review: [date or "replacement ordered"]
```

### Annual Cost by Service Line

Pull from Supabase repair_cycles table:
- Sum annual repair costs by tray/service line
- Identify top 10 most-repaired instruments
- Compare to replacement cost for each
- Flag all instruments where cumulative repair > 40% of replacement

Route high-cost items to spd-capital-justification for instrument replacement business case.

## SQ Track Integration

### Retiring an Instrument
1. Mark status as INACTIVE in SQ Track
2. Remove from active count sheet (update revision via spd-sop-framework)
3. Add notation: `[RETIRED: YYYY-MM-DD — replaced by: catalog#]`
4. Do NOT delete the SQ Track record — archived records support audit trails

### Adding a New Instrument
1. Intake the instrument: verify IFU on file before any processing
2. Create SQ Track entry with full catalog information per spd-catalog-agent standard
3. Update count sheet to include new instrument (revised count sheet triggers training notification)
4. Document in lifecycle record: purchase date, cost, warranty period


---


# SPD Recall Management

## What This Skill Does

The instrument and device recall response protocol. Manages intake, scope assessment, quarantine, patient notification coordination, vendor return, and regulatory documentation for all recall events. Class I recalls are safety emergencies — this skill provides the framework to respond in minutes, not days.

## Recall Intake

### Recall Source Identification

| Source | Action |
|---|---|
| FDA MedWatch alert | Log immediately; classify by class |
| Manufacturer notification (letter or email) | Log immediately; request lot/serial details if not provided |
| Distributor safety notice | Log; verify against manufacturer record |
| Verbal notification from vendor rep | Log; require written confirmation within 24 hours |

### Recall Classification

| Class | FDA Definition | SPD Response |
|---|---|---|
| **Class I** | Reasonable probability of causing serious adverse health consequences or death | Immediate — all actions within hours |
| **Class II** | May cause temporary adverse health consequences; probability of serious consequences low | Urgent — quarantine within 24 hours; scope assessment within 48 hours |
| **Class III** | Not likely to cause adverse health consequences | Controlled — quarantine and assess within 5 business days |

## Scope Assessment

### Step 1 — Identify Affected Inventory

```
RECALL SCOPE ASSESSMENT
Recall class: [I / II / III]
Product: [Name]
Manufacturer: [Name]
Recalled lot(s)/serial(s): [list]
Recall reason: [brief description]
─────────────────────────────────────────────────────────────
SQ TRACK QUERY:
Search inventory for: [product name, catalog number, lot/serial]
Matches found: [N] items
Matches quarantined: [N] items
─────────────────────────────────────────────────────────────
```

Query the SQ Track inventory for matching catalog numbers and lot/serial numbers. Every matching item is immediately quarantined — no exceptions for "probably fine."

### Step 2 — Identify Affected Cases

For Class I (and Class II if patient risk possible):
- Pull all cases where the recalled instrument was used
- Date range: from earliest recalled lot date to quarantine date
- Source: SQ Track case records, OR schedule, sterilizer load logs
- Output: list of cases, dates, procedures, and locations

**Patient notification threshold** is determined jointly with:
- Risk Management (primary decision-maker)
- Infection Prevention
- Medical Staff Office (if physician notification required)

SPD provides the scope data. Risk Management and clinical leadership determine notification scope.

## Quarantine and Disposition Protocol

### Immediate Quarantine (Class I — within 1 hour)

1. Pull all matching instruments from service — sterile storage, assembly, decon, OR holding
2. Place in quarantine area with clearly labeled barrier: `DO NOT USE — RECALL [date] — [product name]`
3. Update SQ Track status: mark affected items as QUARANTINE
4. Notify OR charge nurse that affected instruments are unavailable (use spd-or-liaison-agent)
5. Begin sourcing replacement or alternative instruments

### Vendor Return Authorization

1. Contact manufacturer/distributor for Return Authorization (RA) number
2. Document: RA number, return address, shipping instructions
3. Package per recall instructions (manufacturer usually provides)
4. Ship with complete lot/serial documentation
5. Confirm receipt with vendor in writing
6. Track: instruments returned [N], RA number, ship date, confirmation date

### Replacement Sourcing

- Request replacement instruments from vendor on recall timeline
- If not available: assess whether loaner or alternate instrument can substitute (route through spd-vendor-loaner-mgmt)
- Communicate instrument availability impact to OR (spd-or-liaison-agent)

## Patient and Clinical Notification

### Class I Recall Notification Protocol

**Within 1 hour of Class I recall identification:**
1. Notify Terry (if not already notified)
2. Notify Risk Management — provide: product, lots, affected case list (if ready), quarantine status
3. Risk Management contacts hospital administration and legal

**Within 4 hours:**
- Provide Risk Management with complete scope assessment (case list, dates, patient identifiers)
- Risk Management determines patient notification scope

**Communication templates (via spd-leadership-comms):**
- OR leadership notice: instruments unavailable, reason, timeline
- Administration notice: recall event, SPD response, Risk Management lead

### Class II / III Notification

- Risk Management notification: within 24 hours for Class II, within 5 days for Class III
- No patient notification typically required for Class III
- Clinical team notified per Risk Management guidance for Class II

## Regulatory Documentation

### Recall Event Log

```
RECALL EVENT LOG
Recall class: [I / II / III]
Product: [Name]   Manufacturer: [Name]
Recall notice received: [date and source]
Recall date (FDA or manufacturer): [date]
Lot/serial numbers recalled: [list]
─────────────────────────────────────────────────────────────
RESPONSE ACTIONS:
[Date/Time] | Action | By whom
[Date/Time] | Inventory search complete — [N] items found | [role]
[Date/Time] | All items quarantined | [role]
[Date/Time] | Risk Management notified | [role]
[Date/Time] | OR charge nurse notified | [role]
[Date/Time] | Vendor RA received: [RA#] | [role]
[Date/Time] | Instruments returned to vendor | [role]
[Date/Time] | Replacement received | [role]
[Date/Time] | SQ Track updated | [role]
─────────────────────────────────────────────────────────────
Affected case scope: [N cases, date range]
Patient notification decision: [Not required / Risk Mgmt decision]
Recall event closed: [date]
```

Keep all recall documentation for minimum 10 years (or per facility policy if longer).


---


# SPD Infection Prevention Interface

## What This Skill Does

Coordinates the SPD-IP partnership. Designs the joint rounding protocol, data sharing interface, joint corrective action process, and communication templates. SPD and IP are natural partners — instrument reprocessing failures are a direct infection prevention issue, and IP credibility with OR leadership can advance POU compliance in ways SPD cannot achieve alone.

## Joint Rounding Protocol

### Monthly IP Walkthrough — Agenda Template

**Format:** Collaborative, scheduled, not a surprise inspection. IP is briefed in advance on what to observe and why it matters.

```
SPD-IP JOINT ROUNDING AGENDA
Date: [YYYY-MM-DD]
Participants: [IP name/role], [SPD supervisor/lead role]
Duration: 45–60 minutes
─────────────────────────────────────────────────────────────

PRE-ROUNDING BRIEF (5 minutes)
- Open quality events from the prior 30 days that IP should be aware of
- Current focus areas from SPD perspective
- Any regulatory changes affecting standards

ROUNDING OBSERVATIONS (30–40 minutes)
Area 1 — Decontamination
  What to look for: PPE compliance at entry, clean/dirty traffic flow,
  manual cleaning technique, sharps handling
  How it maps to IP outcomes: inadequate cleaning = bioburden reaching patient

Area 2 — Packaging / Assembly
  What to look for: CI placement, instrument inspection for visible soil,
  work surface conditions, air flow (positive pressure in clean areas)
  How it maps to IP outcomes: visible soil in packaged instruments = processing failure

Area 3 — Sterilization
  What to look for: BI program adherence, load documentation,
  IUSS log, parametric release documentation
  How it maps to IP outcomes: sterilization failure pathways; IUSS overuse

Area 4 — Sterile Storage
  What to look for: storage conditions, event-related dating,
  no cardboard, temp/humidity log
  How it maps to IP outcomes: compromise to sterile field integrity

POST-ROUNDING DEBRIEF (10 minutes)
- IP observations and questions
- SPD context for any observed items
- Joint priority identification
- Next steps and follow-up items
─────────────────────────────────────────────────────────────
```

### IP Observer Briefing

Before every joint rounding, brief the IP on:
1. What each area does and why it matters for infection prevention
2. What AAMI ST79 requires in each area (give them the standard reference)
3. What SPD's current audit data shows (self-awareness before the walk)
4. What questions SPD has that IP expertise can help answer

This positions IP as a partner who understands the science, not an auditor checking boxes.

## Data Sharing Interface

### SPD Data Relevant to IP (share monthly)

| Data Point | Why IP Cares |
|---|---|
| Bioburden events (type, instrument, tray) | Direct infection prevention exposure |
| Positive BI failures (sterilizer, load, resolution) | Sterilization failure = patient risk |
| Cleaning verification failure rate | Inadequate cleaning = inadequate sterilization |
| IUSS rate and trend | Overuse = regulatory risk + reduced safety margin |
| Missing instrument rate | Instrument substitution can compromise sterile field |

### IP Data Relevant to SPD (request quarterly)

| Data Point | Why SPD Cares |
|---|---|
| SSI rates by service line | Identifies whether SPD processing correlates with SSI clusters |
| Environmental culture results from SPD areas | Validates sterile storage conditions |
| IP rounding findings from OR areas | POU compliance intelligence |
| Infection clusters with potential SPD link | Early warning for SPD process review |

### Quarterly Joint Data Review Format

```
QUARTERLY SPD-IP DATA REVIEW
Period: [Q1/Q2/Q3/Q4] [YYYY]
Participants: [IP lead, SPD director roles]
─────────────────────────────────────────────────────────────
SPD DATA SUMMARY:
- Bioburden events: [N] — [trend]
- BI failures: [N] — [resolution status]
- Cleaning verification failures: [rate]
- IUSS rate: [%] — [trend]

IP DATA SUMMARY:
- SSI rate by service line: [data]
- Environmental cultures: [results]
- IP findings from OR: [summary]

JOINT ANALYSIS:
- Any correlation between SPD events and SSI patterns? [Y/N — if Y, describe]
- Any IP finding that requires SPD process review? [Y/N — if Y, describe]
- Joint priorities for next quarter: [list]
─────────────────────────────────────────────────────────────
```

## Joint Corrective Action

### When IP Identifies a Concern

1. IP submits observation to SPD in writing (email is sufficient)
2. SPD routes to spd-quality-docs for formal corrective action framework
3. SPD responds within 5 business days with: acknowledgment, root cause assessment, corrective action plan
4. IP invited to verify completion if concern was in a clinical area

### IP Involvement in SPD RCAs

Invite IP to participate when:
- A contaminated or potentially contaminated tray reached the sterile field
- An SSI investigation identifies a possible SPD processing link
- A bioburden event involves a tray used in a case within 24 hours of the event

IP does not lead the RCA — SPD leads. IP provides infection prevention expertise as a subject matter expert.

## POU Treatment Reinforcement

IP can advance POU compliance in ways SPD cannot — they have authority in the OR that SPD does not.

### Joint Communication on POU Gaps

When spd-or-liaison-agent documents a recurring POU compliance gap:
1. SPD provides the audit data (from spd-or-liaison-agent POU tracking)
2. IP reviews and validates the concern
3. Joint letter goes from IP + SPD to OR Nurse Manager (stronger than SPD alone)
4. IP includes POU compliance in IP rounding of the OR

### Joint Communication Template (POU)

```
To: OR Nurse Manager [role]
From: [IP role] and [SPD Director role]
Re: Point-of-Use Instrument Treatment Compliance

[Joint data from SPD POU audit and IP OR rounding]

The following POU gaps have been documented over the past [period]:
[List gaps with dates and descriptions — no individual names]

POU treatment at instrument return is required per AAMI ST79 Section 7 and AORN
Guidelines for Perioperative Practice. Inconsistent POU treatment increases bioburden
loading, extends processing time, and creates risk of processing failure.

We request: [specific corrective action — e.g., staff re-briefing, observation of
correct technique, incorporation into OR staff competency]

We are available to support with in-service content and process guidance.

[IP signature block]   [SPD Director signature block]
```

## Monthly Shared Leadership Report

Brief summary to shared leadership (CNO, CMO, or applicable governance):

```
SPD-IP MONTHLY SUMMARY — [Month YYYY]
Prepared by: [IP role] and [SPD Director role]

KEY METRICS:
SPD processing quality: [overall trend — improving/stable/declining]
Bioburden events: [N] | BI failures: [N] | IUSS rate: [%]
SSI rate trend: [current vs. prior period]

JOINT ACTIVITIES:
Joint rounding: [completed/scheduled for date]
Joint data review: [completed/pending]

OPEN ITEMS:
[List any unresolved joint concerns with status]

NEXT STEPS: [1–3 items]
```


---


# SPD Educator Agent

## What This Skill Does

Builds, delivers, and maintains all education content for the Sterile Processing Department. Owns onboarding, certification readiness, competency-based education, and knowledge propagation. Always validates content against spd-regulatory-research before publishing. Always ends with a verification plan.

## New Hire Orientation Matrix

### Role-Based Pathways

| Milestone | Decon Tech | Prep & Pack | Sterilizer Op | Lead/Supervisor | Endo Tech |
|---|---|---|---|---|---|
| **Day 1** | PPE donning/doffing, decon flow, sharps safety | Gown/glove, tray inspection basics | Safety orientation, steam cycle basics | Role expectations, shift structure, team intro | PPE, scope handling precautions |
| **Week 1** | Manual cleaning SOP, sink flow, chemistry safety | Assembly reference guide, instrument ID | Load config basics, BI program | Communication protocols, handoff structure | HLD chemical safety, scope transport |
| **30 Days** | Pass: manual cleaning competency assessment | Pass: 5 tray assembly assessments with ≤2 errors | Pass: steam and low-temp cycle competency | Pass: shift handoff competency | Pass: flexible scope inspection competency |
| **60 Days** | CRCST Domain 1–3 study initiated | CRCST Domain 4–5 study initiated | CRCST Domain 6–7 study initiated | CRCST Domain 8–9 initiated or CIS pathway | AAMI ST91 module complete |
| **90 Days** | Full independent assignment; CRCST study plan active | Full independent assignment; peer check eligible | Full sterilizer assignment; water quality log ownership | Full independent shift lead; preceptor candidate assessment | ST91 reprocessing competency passed |

### Preceptor Assignment

Every new hire is assigned a preceptor for Weeks 1–4. Preceptor criteria:
- CRCST or CSPDT certified (or actively pursuing with >50% study complete)
- Minimum 18 months in role
- Passed preceptor development module (see resources/preceptor-guide.md)

## Certification Readiness Pathways

### CRCST (IAHCSMM) — 9 Domain Structure

| Domain | Topic | Weeks to Study |
|---|---|---|
| 1 | Microbiology and Infection Control | 2 |
| 2 | Decontamination | 2 |
| 3 | Preparation and Packaging | 2 |
| 4 | Sterilization | 2 |
| 5 | High-Level Disinfection | 1 |
| 6 | Sterile Storage and Distribution | 1 |
| 7 | Point of Use, Transportation, Receiving | 1 |
| 8 | Documentation and Information Systems | 1 |
| 9 | Management and Supervision | 1 |

**Study resources:** IAHCSMM Central Service Technical Manual (current edition), HSPA study guide, facility-specific SOPs
**Exam eligibility:** 400 hours documented work experience in CS/SPD
**Target timeline:** Eligible staff should sit within 12 months of hire

### CSPDT (CBSPD) — Equivalent Pathway

- CBSPD Study Guide (current edition)
- Competency verification via direct observation
- Written knowledge assessment at 60 days
- Exam target: 12 months from hire

### CIS (Certified Instrument Specialist) — Advanced

- Prerequisites: Active CRCST or CSPDT
- Focus: Complex instrumentation, loaner management, count sheet accuracy
- Target: Lead technicians and instrument coordinators

## Annual Educational Needs Assessment

Run every January. Data sources:
1. Quality events from prior year (spd-analytics output)
2. Audit findings from compliance app
3. Survey findings or mock survey results (spd-survey-readiness)
4. New equipment introduced
5. Standard revisions (spd-knowledge-propagation alerts)
6. Certification rates by shift

Output: Prioritized training calendar for the year, by role and shift.

## In-Service Calendar Template

| Month | Topic | Delivery Method | Target Audience | Competency Verification |
|---|---|---|---|---|
| Jan | [From needs assessment] | Huddle handout + demo | All shifts | Observation checklist |
| Feb | [From needs assessment] | Return demonstration | Decon staff | Return demo |
| ... | ... | ... | ... | ... |

**Shift coverage rule:** Every in-service must reach all three shifts within 30 days of initial delivery. Document attendance per shift.

## Competency Gap → Training Response

When spd-analytics KPI packet shows:
- Tray error rate increasing → assign targeted assembly competency reverification
- Bioburden events clustering → assign manual cleaning technique in-service
- Sterilizer parameter failures → assign load configuration return demonstration
- Missing instrument rate increasing → assign count sheet accuracy module

## Standards Integration

Before publishing any new or revised education content:
1. Route draft to spd-regulatory-research for citation validation
2. Confirm all referenced standards are current edition
3. Update content if standard has been revised within 18 months

## Knowledge Propagation Interface

When spd-knowledge-propagation identifies a downstream training update:
1. Receive the change brief (standard/equipment/SOP that changed)
2. Identify affected training modules and competency assessments
3. Update content within the timeline set by propagation agent
4. Route updated content through spd-quality-gate
5. Deploy to all shifts per in-service calendar
6. Document completion in the facility's education tracking system (SQ Track, Notion, or equivalent)

## Education Record Format

Per record:
- Staff name and role
- Training topic and content version
- Delivery date and method
- Shift attended
- Competency verification result (Pass / Fail / Needs Remediation)
- Assessor signature / initials
- Next review date

Records filed: facility education tracking system (SQ Track, LMS, or equivalent — confirm with education coordinator)


---


# SPD Competency

## What This Skill Does

Designs, documents, and validates staff competency using the Donna Wright framework. Produces initial competency assessments for new hires, ongoing competency verifications for annual or triggered reassessment, and competency documentation that satisfies TJC HR.01.06.01 requirements. All criteria must be observable and measurable — never subjective.

## Donna Wright Competency Framework

Competency has two components:
1. **Knowledge** — what the person knows (can be tested with written or verbal assessment)
2. **Performance** — what the person does (must be observed directly or via simulation)

Both must be verified. A written test alone is not sufficient for skills-based competencies. A demonstration without documented criteria is not sufficient for regulatory purposes.

## Competency Verification Methods

Select the method that matches the skill type:

| Method | Best For | Regulatory Weight |
|---|---|---|
| **Direct observation** | Hands-on tasks with safety implications | Highest — TJC preferred |
| **Return demonstration** | Skills taught in training, assessed after practice | High |
| **Simulation** | High-risk or low-frequency tasks (BI failure response) | High |
| **Written test** | Knowledge components, regulatory requirements, policies | Moderate |
| **Verbal interview** | Comprehension, decision-making, priority-setting | Moderate |
| **Case study review** | Problem-solving, application of knowledge | Moderate |
| **Skills checklist / self-assessment** | Supplemental — never standalone for direct patient safety tasks | Low |

## Competency Areas by Role

### Decontamination Technician

| Competency | Verification Method | Frequency |
|---|---|---|
| PPE donning/doffing sequence and completeness | Direct observation | Annual + event-triggered |
| Manual cleaning technique — hand instruments | Return demonstration | Annual + event-triggered |
| Manual cleaning technique — lumened instruments | Return demonstration | Annual |
| Ultrasonic cleaner operation | Direct observation | Annual |
| Washer-disinfector loading per manufacturer IFU | Direct observation | Annual |
| Sharps handling protocol | Direct observation | Annual |
| Decon area traffic flow (clean vs. dirty) | Direct observation | Annual |
| Point-of-care pre-treatment assessment | Case study or verbal | Annual |

### Packaging and Assembly Technician

| Competency | Verification Method | Frequency |
|---|---|---|
| Instrument inspection criteria (visual, functional) | Return demonstration | Annual |
| Count sheet use and accuracy verification | Direct observation | Annual |
| Wrapping technique (sequential wrap, pouch) | Return demonstration | Annual |
| CI placement and documentation | Direct observation | Annual |
| Instrument assembly to manufacturer IFU | Return demonstration | Annual |
| Tray weight compliance | Direct observation | Annual |

### Sterilization Technician

| Competency | Verification Method | Frequency |
|---|---|---|
| Sterilizer loading per manufacturer IFU | Direct observation | Annual |
| BI program administration — placement, incubation, documentation | Return demonstration | Annual |
| Parametric release documentation | Direct observation | Annual |
| IUSS documentation requirements | Written test + direct observation | Annual |
| Load recall protocol — positive BI | Simulation | Annual |
| Sterilizer printout interpretation | Case study | Annual |

### Endoscope Reprocessing Technician

| Competency | Verification Method | Frequency |
|---|---|---|
| Leak testing procedure | Return demonstration | Annual |
| Manual cleaning technique — per scope manufacturer IFU | Return demonstration | Annual |
| AER (automated endoscope reprocessor) operation | Direct observation | Annual |
| Drying and storage requirements | Direct observation | Annual |
| Endoscope transport protocol | Direct observation | Annual |

## Competency Assessment Template

```
COMPETENCY ASSESSMENT RECORD
Staff member: [role and employee ID — no name in the document body]
Role: [Decon Tech / P&P Tech / Sterilization Tech / Lead / Endo Tech]
Assessment type: [Initial / Annual / Event-Triggered]
Competency area: [from role table above]
Date: [YYYY-MM-DD]
Assessor: [role of assessor]
─────────────────────────────────────────────────────────────
CRITERIA (all must be observable — no personality traits):

Criterion 1: [specific, observable behavior]
  Method: [direct observation / return demonstration / etc.]
  Standard: [what "meets standard" looks like]
  Result: [Met standard / Did not meet standard / Partial]
  Notes: [factual observation — no subjective commentary]

Criterion 2: [specific, observable behavior]
  Method: [method]
  Standard: [standard]
  Result: [result]
  Notes: [notes]

[Continue for all criteria in the competency area]
─────────────────────────────────────────────────────────────
OVERALL RESULT:
□ Competent — all criteria met
□ Not yet competent — see remediation plan
□ Competent with condition — competent in [areas], remediation required for [areas]

REMEDIATION PLAN (if applicable):
Area requiring remediation: [specific criterion]
Remediation method: [additional training, re-demonstration, review of IFU]
Remediation target date: [YYYY-MM-DD]
Re-assessment date: [YYYY-MM-DD]
─────────────────────────────────────────────────────────────
Assessor signature block: [role]   Date: [YYYY-MM-DD]
Entered in education tracking system: Y / N   Entry date: [YYYY-MM-DD]
```

## Event-Triggered Competency

Competency reassessment is triggered (not scheduled) when:

| Trigger | Scope of Reassessment |
|---|---|
| Quality event — assembly error | Assembly competency for the tech involved (role, not name) |
| Quality event — cleaning failure | Decon cleaning technique competency |
| Survey finding — competency not documented | All staff in the cited area |
| New equipment or IFU change | Equipment-specific competency for all who operate it |
| Return from extended leave (> 30 days) | Relevant area competency |
| Traveler orientation | All SPD competency areas for the specific role |

## Documentation Requirements (TJC HR.01.06.01)

For every staff member in a safety-sensitive role:
1. Initial competency on hire — documented before independent work assignment
2. Annual competency — documented within the calendar year
3. Event-triggered — documented within 30 days of the triggering event
4. Remediation — documented with outcome when remediation is complete

**Survey exposure risk:** A competent staff member whose documentation is missing has the same survey finding as an incompetent one. Documentation discipline is as important as the assessment itself.

## Competency Gap → Training Pipeline

When a competency gap is identified:

1. Document the gap using the competency assessment template
2. Route to spd-training-materials to build the remediation content
3. Deliver remediation (spd-educator-agent manages the scheduling and content delivery)
4. Re-assess and document the outcome
5. Route to spd-outcomes-tracker to track whether the training closed the gap


---


# SPD Training Materials

## What This Skill Does

Designs and builds educational content for SPD staff, supervisors, and leadership. Produces in-services, onboarding curricula, skills day content, and supervisor development sessions. Every output includes a competency verification plan — if a training does not have a way to confirm that learning occurred, it is not a training; it is a meeting.

## Learning Objective Design

All learning objectives must use observable, measurable action verbs.

### Approved Verbs (observable, measurable)

**Knowledge level:** identify, list, describe, define, recall, name, state
**Comprehension level:** explain, summarize, classify, compare, distinguish
**Application level:** demonstrate, perform, apply, calculate, use, operate
**Analysis level:** analyze, differentiate, examine, select, assess

### Prohibited Verbs (not observable)

- understand (not observable — how do you measure "understanding"?)
- know (not observable)
- appreciate (not observable)
- be aware of (not observable)
- learn (the goal, not a criterion)
- be familiar with (not observable)

### Learning Objective Format

`Upon completion of this training, the staff member will be able to [verb] [specific behavior] [standard or condition].`

Examples:
- "Demonstrate proper PPE donning sequence including gloves, gown, face shield, and shoe covers before entering the decontamination area."
- "Identify the three conditions that require IUSS documentation beyond the sterilizer log."
- "Describe the AAMI ST79 requirement for biological indicator frequency in flash sterilization cycles."

## In-Service Design Template

Standard SPD in-service: 30–45 minutes. Longer sessions lose engagement; shorter sessions cannot cover technical content adequately.

```
IN-SERVICE DESIGN DOCUMENT
Topic: [specific skill or knowledge area]
Target audience: [Decon Techs / P&P Techs / All SPD / Leads / Travelers]
Trigger: [Quality event / Annual / Standards change / New equipment / Post-survey]
Duration: [30 / 45 / 60 minutes]
Date: [YYYY-MM-DD]   Facilitator: [role]
─────────────────────────────────────────────────────────────
LEARNING OBJECTIVES (2–4 per session):
1. [verb + behavior + standard]
2. [verb + behavior + standard]
3. [verb + behavior + standard]

SESSION OUTLINE:
Opening (5 min):
  - Connect to why this matters — patient safety, regulatory, quality data
  - Brief statement of what will be covered

Content block 1 (10–15 min):
  - Topic
  - Key points (3 max — more than 3 and nothing is retained)
  - Demonstrate or show (visual/hands-on preferred over lecture)

Content block 2 (10–15 min):
  - Topic
  - Key points
  - Practice component if applicable

Application/Practice (5–10 min):
  - Return demonstration, case scenario, or skills station

Closing (5 min):
  - Recap key points
  - Q&A
  - Documentation sign-in and competency verification instructions

MATERIALS NEEDED:
□ [Instrument, equipment, or supplies for demonstration]
□ [Reference document — SOP number, IFU]
□ [Sign-in sheet]
□ [Competency verification form — from spd-competency]

COMPETENCY VERIFICATION PLAN:
Method: [direct observation / return demonstration / written check]
Criteria: [specific observable behaviors from spd-competency]
Timing: [at end of session / within 5 business days / within 30 days]
─────────────────────────────────────────────────────────────
```

## Content by Trigger Type

### Post-Quality Event In-Service

**Do not:** reference the specific event or any individual involved
**Do:** use the event's root cause to build the content (teach the gap, not the incident)

Opening: "We've been seeing an increase in [metric]. Today we're reviewing [skill] to make sure everyone is aligned on current standards."

Build content around:
- What the standard requires (cite AAMI / TJC)
- What correct technique looks like (demonstrate)
- What failure looks like (contrast example)
- Practice component (return demonstration or case)

### Standards Update In-Service

When AAMI, TJC, or CMS releases a change:
1. spd-knowledge-propagation identifies the impacted area
2. This skill builds the training content for the updated requirement
3. spd-educator-agent schedules and delivers across all shifts
4. spd-competency validates the new knowledge
5. spd-sop-framework updates the SOP to reflect the change

Content structure for a standards update:
- What changed (before vs. after)
- Why it changed (brief rationale — "AAMI revised this because...")
- What you need to do differently (specific behavior change)
- Where to find the new SOP (CSS-[AREA]-[SEQ])

### New Equipment In-Service

Every new piece of equipment requires:
1. IFU review before training is designed — training must match the IFU
2. Hands-on demonstration with the actual equipment
3. Return demonstration by each staff member who will operate it
4. Documentation in SQ Track before independent operation is permitted

### Traveler Orientation Content

Travelers are oriented to facility-specific SOPs — not general SPD technique. They already know the technique. The training gap is facility-specific systems, count sheets, and protocols.

Traveler orientation priority list:
1. Tracking system navigation and documentation requirements (SQ Track or equivalent)
2. Facility SOP locations and numbering (CSS-[AREA]-[SEQ])
3. Case cart process and case readiness deadlines
4. Shift handoff expectations
5. Who to call for what (escalation contacts by role)
6. Loaner protocol (spd-vendor-loaner-mgmt summary)

## Supervisor Development

Supervisor competencies are different from technician competencies. Build supervisor sessions around:

| Topic | Method | Duration |
|---|---|---|
| Quality event investigation and documentation | Case study + role play | 60 min |
| Staff feedback conversations (performance vs. discipline) | Role play scenarios | 45 min |
| Shift handoff completeness | Simulation using handoff template | 30 min |
| Regulatory standard literacy | Discussion + reference review | 45 min |
| OR relationship management | Scenario + communication practice | 30 min |

## Documentation Requirements

Every in-service must produce:
1. Sign-in sheet with name, role, and date — kept on file per facility policy
2. Completed competency verification forms (where applicable)
3. Record entered in education tracking system within 5 business days

**Record retention:** Per JCAHO and facility policy. Minimum 3 years for training records; longer if competency records (7 years typical).


---


# SPD Leadership Comms

## What This Skill Does

Drafts audience-calibrated professional communications for SPD operational needs, leadership reporting, vendor accountability, and cross-departmental coordination. Selects tone, escalation tier, and format based on audience and purpose. Ensures every communication is appropriate for the relationship and advances the operational or regulatory goal.

## Escalation Tier Logic

Before drafting any communication, confirm the tier:

| Tier | Audience | Trigger | Tone |
|---|---|---|---|
| **Tier 1 — Informational** | Peer leads, department colleagues | Routine update, scheduling change, process notification | Collegial, direct |
| **Tier 2 — Advisory** | OR Nurse Manager, Supply Chain, IP, peer directors | Issue identified that affects their department; no urgency | Professional, collaborative |
| **Tier 3 — Escalation** | CNO, CMO, VP Operations, Risk Management | Safety concern, recurring unresolved issue, regulatory risk | Formal, factual, solution-forward |
| **Tier 4 — Formal Notice** | Vendor, legal, external | Non-compliance, contract issue, recall, breach of protocol | Formal, documented, specific |

**Rule:** Match the tier to the actual urgency. Escalating a Tier 1 issue to a Tier 3 audience damages credibility. Under-escalating a Tier 3 issue to a Tier 1 audience creates liability.

## Communication Templates

### Tier 1 — Peer Operational Update

```
To: [OR Charge Nurse / Shift Lead / Dept Colleague]
From: [SPD Director or Lead role]
Subject: [brief, specific subject line]
Date: [YYYY-MM-DD]

[Opening: state the update in one sentence]

[Body: 2–3 sentences of relevant detail — what changed, what it affects, what action is needed from the recipient if any]

[Closing: next step or contact if questions]

[Name]
[Role]
[Contact]
```

### Tier 2 — Advisory to Department Leadership

```
To: [OR Nurse Manager / IP Director / Supply Chain Director]
From: [SPD Director role]
Subject: [specific subject — avoid vague subjects like "Update" or "Issue"]
Date: [YYYY-MM-DD]

[Opening paragraph: what you are communicating and why it matters to them]

[Data paragraph: what the data shows — specific, no opinion, no blame]

[Request paragraph: what you are asking for — one specific request]

[Closing: offer to discuss; timeline for follow-up]

[Name]
[Role, SPD Director]
[Contact]
```

### Tier 3 — Formal Escalation to Administration

```
To: [CNO / CMO / VP Operations role]
From: [SPD Director role]
Date: [YYYY-MM-DD]
Re: [specific subject — regulatory risk / patient safety / operational impact]

Issue:
[One paragraph — what the problem is, when it began, and what the impact has been. Factual. No opinion. No blame.]

Actions taken to date:
[Bullet list — what SPD has done to address the issue and the result]

Current status:
[Where things stand today — what is unresolved and why]

Request:
[One specific request — decision needed, resource needed, intervention needed]

Supporting data:
[Reference to attached data or offer to provide]

[Name]
[Role]
[Contact]
```

### Tier 4 — Formal Vendor Notice

```
To: [Vendor Representative Name / Account Manager]
From: [SPD Director role]
Date: [YYYY-MM-DD]
Subject: Formal Notice — [specific issue: Loaner Documentation Failure / Recall Response Delay / IFU Non-Compliance]

This letter documents [specific compliance breach or protocol failure].

Event details:
[Date, time, instrument/product, specific failure — factual, specific, no editorial]

Protocol requirement:
[What the vendor's obligation is under the loaner/vendor agreement, recall protocol, or contractual terms]

Impact:
[What the failure caused — case delay, patient risk, regulatory exposure — factual]

Required action:
[Specific corrective action required from vendor, with deadline]

Failure to respond by [date] will require escalation to [supply chain / vendor management / legal as applicable].

[Name]
[Title]
[Contact]
[Date]
```

## Common Communication Scenarios

### OR Case Delay — SPD Notification

Use: Tier 1 or 2 depending on whether OR Charge Nurse or OR Manager is the recipient

Key elements:
- What instrument/tray is delayed
- Why (factual — do not speculate or assign blame in the communication)
- Estimated availability or alternative plan
- Who in SPD to contact for status

**Do not:** apologize in a way that implies fault before cause is established. "We are working to resolve this" is appropriate. "We are sorry we dropped the ball" is not.

### Missing Instrument — OR Notification

Use: Tier 1 to OR Charge Nurse

Key elements: instrument name, tray/set, case name and time, what SPD is doing, alternative instrument status (if any)

### Vendor Loaner Non-Compliance

Use: Tier 4 — generate formal notice via spd-vendor-loaner-mgmt breach protocol

### IP Joint Communication (POU Compliance)

Use: spd-infection-prevention-interface template — joint letter from IP + SPD Director

### Staff Policy Communication

Audience: SPD staff (not a leadership communication — adapted format)

```
TO: SPD Staff — All Shifts
FROM: [SPD Director role]
DATE: [YYYY-MM-DD]
RE: [Policy or SOP title and CSS number]

Effective [date], [specific change in one sentence].

What this means for your work:
• [Bullet 1 — specific behavior change]
• [Bullet 2 — if applicable]

The updated SOP ([CSS-AREA-SEQ]) is located [location].

Questions: contact [role] before your next shift.
```

**No checkbox symbols** in any communication. Use bullet points or numbered lists only.

## Communication Quality Checks

Before sending any Tier 3 or Tier 4 communication:
- [ ] Does every factual claim have data to support it?
- [ ] Is every request specific and actionable?
- [ ] Is the tone professional and solution-oriented (not accusatory)?
- [ ] Has the communication been reviewed per spd-quality-gate?
- [ ] Is the correct escalation tier matched to the audience?
- [ ] Are individual staff names absent (roles only, unless naming a vendor contact)?

## SAG Client Communications

All communications produced for SAG client engagements:
- Use SAG letterhead reference [NEEDS INPUT FROM TERRY: SAG brand standards for email and letter format]
- Include confidentiality footer: "This communication is prepared for [SAG client code]. Confidential — not for distribution."
- No facility-identifying information in the communication body if anonymization is required


---


# SPD Document Design

## What This Skill Does

Produces physically usable SPD documents — designed to function on the floor, not just in a folder. Every document type has specific layout rules. Photo placeholders mark exactly where Terry provides images. Output in Markdown (for version control), HTML (for Notion), or PDF-ready format.

## Document Type Library

### Visual SOP

Step-by-step with photo at every step. Printed and laminated.

```
VISUAL SOP
Document No: CSS-[AREA]-[SEQ]        Version: X.X
Title: [Title]                        Effective: [YYYY-MM-DD]
Approved by: Terry Scott, Dir CSS     Review Date: [YYYY-MM-DD]
─────────────────────────────────────────────────────────────────

STEP 1: [Action verb + specific instruction]
[PHOTO: What correct action looks like — e.g., "PPE fully donned, gown tied, gloves double-cuffed"]
Caption: Correct PPE configuration before entering decon

STEP 2: [Action verb + specific instruction]
[PHOTO: ...]
Caption: ...

REFERENCES: [AAMI standard, section, edition]
```

### Work Guide (Complex Instrument)

Multi-page reference for complex tray processing. Includes disassembly, cleaning, inspection, reassembly, packaging, cycle parameters.

```
WORK GUIDE
Instrument: [Full primary name per spd-catalog-agent standard]
Catalog No: [MFR CODE]-[PART#]
SQ Track ID: [ID]
Version: X.X   Effective: [YYYY-MM-DD]
─────────────────────────────────────────────────────────────────

SECTION 1 — DISASSEMBLY
[PHOTO: Instrument assembled]
Step 1: [instruction]
Step 2: [instruction]
[PHOTO: Instrument disassembled with parts labeled]

SECTION 2 — CLEANING METHOD
Cleaning method: [Manual / Automated / Both]
Detergent: [product name, dilution per IFU]
Brush required: [size, type]
[PHOTO: Correct brush technique on the critical surface]

SECTION 3 — INSPECTION CRITERIA
- [Specific observable criterion 1]
- [Specific observable criterion 2]
[PHOTO: Acceptable vs. unacceptable condition side-by-side if possible]

SECTION 4 — REASSEMBLY
Step 1: [instruction]
[PHOTO: Reassembled instrument]

SECTION 5 — PACKAGING
Pouch type: [size, single/double wrap]
Placement: [orientation]
CI: [internal CI required Y/N, placement location]

SECTION 6 — STERILIZATION PARAMETERS
Method: [Steam / ETO / Peracetic / Low-Temp]
Cycle: [gravity/prevac, temp, time, drying time]
Per IFU: [IFU file reference]

IFU on file: Y  Last verified: [date]
```

### Quick Reference Card

Single page. High contrast. Key steps only. For lamination and posting.

```
[LARGE HEADER: TOPIC]
[Facility Name] — CSS Department      Version X.X | [YYYY-MM-DD]
─────────────────────────────────────────────────────────────────
1. [Step — 16pt minimum font equivalent in markdown: **bold**]
2. [Step]
3. [Step]
[PHOTO: Most critical visual]
[RED BOX: NEVER ___]
[GREEN BOX: ALWAYS ___]
Reference: [CSS-XXX-001 SOP]
─────────────────────────────────────────────────────────────────
```

### Onboarding Packet

Printable booklet. Day 1 through 90-day. See spd-educator-agent for content matrix.

Structure:
- Cover page: employee name, hire date, role, preceptor name, orientation end date
- Day 1 checklist
- Week 1 checklist
- 30-Day competency signature page
- 60-Day study plan
- 90-Day independence certification page
- CRCST/CSPDT study roadmap

### Competency Checklist

Hand-completion format. Filed as regulatory evidence.

```
COMPETENCY ASSESSMENT
Staff Name: _________________  Role: _________________
Date: ________________  Assessor: ________________

CRITERIA (check each as observed/verified):
□ [Observable criterion 1]      Method: Direct observation
□ [Observable criterion 2]      Method: Return demonstration
□ [Criterion 3 — knowledge]     Method: Verbal Q&A

RESULT:  □ PASS   □ FAIL — Remediation Required
Comments: _______________________________________________
Assessor Signature: _________________  Date: ____________
Next Verification Due: _______________
```

### Count Sheet

Per spd-catalog-agent layout standard, with image column.

See spd-catalog-agent for header and column specification.

### Training Handout

Single page. One topic. For huddle distribution.

- Topic header (large)
- 3–5 key points (bullet, not paragraph)
- One visual or diagram if applicable
- "Questions? See your supervisor or [contact]"
- Document number and version in footer

### Branded Leadership Report (Facility)

Header: Facility logo placement + primary brand color accent bar `[NEEDS INPUT: facility brand colors]`
Footer: Document number | Version | Effective date | "Central Sterile Services — [Facility Name]"

### SAG Client Deliverable

Header: Scott Advisory Group branding `[NEEDS INPUT FROM TERRY: SAG brand colors and logo]`
Footer: "Prepared by Scott Advisory Group. Confidential. Do not distribute without authorization." | Page X of Y

## Design Principles

| Rule | Application |
|---|---|
| Minimum 12pt body | All floor-use documents |
| Minimum 16pt for numbered steps | Visual SOPs, quick reference cards |
| Photos at point of use | Next to the step they illustrate, not at end of document |
| Color coding | Green = safe/compliant, Red = stop/non-compliant, Yellow = caution |
| No decorative elements | Every visual element must earn its place |
| Consistent header/footer | Document number, version, effective date on every page |

## Photo Integration

When Terry provides a photo:
- Insert at the correct step, not at the end
- Caption: describe what the CORRECT action looks like (not what the photo is called)
- Format: `[PHOTO: filename.jpg]` → replaced with actual image on final formatting

When Terry has not yet provided a photo:
- Insert: `[PHOTO NEEDED: description of what should be shown here]`
- Do not omit the placeholder — it is a production task item

## Output Formats

| Format | Use Case |
|---|---|
| Markdown | Version control, source of truth |
| HTML | Notion embedding, web display |
| PDF-ready | Print, lamination, formal distribution (via browser print or bash) |

Every output includes version tag and effective date in the document footer.


---


# SPD SOP Framework

## What This Skill Does

Defines and manages the architecture of the CSS SOP library: numbering, templates, version control, approval workflow, and change control. Every CAP references this skill for the "update the SOP" action item. Every revised SOP triggers the Educator agent for training rollout.

## SOP Numbering Convention

Format: `CSS-[AREA CODE]-[SEQUENCE]`

### Area Codes

| Code | Area |
|---|---|
| DCN | Decontamination |
| PAK | Preparation and Packaging |
| STR | Sterilization |
| END | Endoscopy / HLD |
| STO | Sterile Storage and Distribution |
| QAL | Quality Assurance |
| ADM | Administrative |

**Examples:**
- `CSS-DCN-001` — First Decon SOP (e.g., PPE Donning and Doffing)
- `CSS-STR-003` — Third Sterilization SOP (e.g., Steam Sterilizer Biological Indicator Program)
- `CSS-QAL-001` — First Quality SOP (e.g., Corrective Action Process)

## SOP Template Structure

```
───────────────────────────────────────────────────────────────
CSS STANDARD OPERATING PROCEDURE
Number: CSS-[AREA]-[SEQ]          Title: [Title]
Version: [X.X]                    Effective Date: [YYYY-MM-DD]
Review Date: [YYYY-MM-DD]         Author: [Role, not name]
Approved by: Terry Scott, Director CSS
───────────────────────────────────────────────────────────────

1. PURPOSE
[One paragraph. Patient safety rationale. Why does this SOP exist and
what harm does it prevent?]

2. SCOPE
[Who this applies to: roles, shifts, areas. What equipment or processes
are covered.]

3. DEFINITIONS
[Key terms used in this SOP — especially technical terms staff may not know.]

4. EQUIPMENT AND MATERIALS REQUIRED
- [Item 1]
- [Item 2]

5. PROCEDURE
[Numbered steps. Each step begins with a verb. Each step is specific and
observable — not "clean the instrument" but "scrub with a soft-bristle
brush under running water for a minimum of 60 seconds on each surface."]

5.1 [Sub-step if needed]
5.2 [Sub-step if needed]

6. REFERENCES
- AAMI [Standard] [Section] ([Edition/Year])
- AORN Guidelines [section] ([Year])
- Manufacturer IFU: [name, version]
- Related SOPs: [CSS-XXX-00X — Title]

7. QUALITY MONITORING
[How compliance with this SOP is measured. Audit frequency. Who audits.
What the audit tool is (e.g., SPD compliance checklist in the compliance app).]

8. REVISION HISTORY
| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | [date] | [role] | Initial release |
| 1.1 | [date] | [role] | [what changed] |
───────────────────────────────────────────────────────────────
```

## Version Control Rules

| Change Type | Version Increment | Training Required |
|---|---|---|
| **Minor revision** | 0.x (1.0 → 1.1) | Notification only — Educator posts update |
| **Major revision** | x.0 (1.1 → 2.0) | Full competency reverification required |

### What constitutes a Major revision:
- Any change to the procedure steps
- Any change to required equipment or materials
- Any change driven by a regulatory update or quality event
- Any change that changes what staff must DO (not just how it's described)

### What constitutes a Minor revision:
- Correcting a typo or formatting error
- Adding a definition that was missing
- Updating a reference number without changing the procedure

## Approval Workflow

```
Request → Draft → Quality Gate Review → Terry Approval → Activation → Training Notification
```

1. **Request:** Comes from CAP, new equipment, regulatory change, or survey finding
2. **Draft:** SOP is written using the template above
3. **Quality Gate:** Route to spd-quality-gate for citation check, format check, scope check
4. **Terry Approval:** Terry reviews and approves — no SOP is active without this step
5. **Activation:** Document number assigned, effective date set, published to SOP library
6. **Training Notification:** spd-educator-agent notified with change brief — Educator owns rollout

**Old versions:** Archive with effective date range. Never delete. Store in same system as active SOPs, tagged as ARCHIVED.

## SOP Library Architecture

### Master List (maintain this)

| SOP Number | Title | Version | Effective Date | Review Date | Owner (Role) | Standard Reference |
|---|---|---|---|---|---|---|
| CSS-DCN-001 | [Title] | 1.0 | [date] | [date] | Supervisor | AAMI ST79 §10 |
| CSS-STR-001 | [Title] | 2.1 | [date] | [date] | Lead Tech | AAMI ST79 §12 |

### Annual Review Schedule

- All SOPs reviewed at least annually
- Review date = 12 months from effective date
- Review trigger events (also review outside annual schedule):
  - Regulatory standard revision
  - Quality event finding
  - New equipment introduction
  - Survey finding
  - CAP action item

## Change Control Log

Every change to the SOP library is logged:

```
Change Event Log
Date: [YYYY-MM-DD]
Trigger: [Standard revision / Quality event / New equipment / Survey finding / CAP]
SOPs Affected: [List CSS numbers]
Change type: Major / Minor
Approval: Terry Scott
Activation date: [date]
Training notification sent to Educator: Y/N
```


---


# SPD Presentations

## What This Skill Does

Designs structured slide-based presentations for staff meetings, leadership briefings, capital requests, and external SAG deliverables. Produces slide outlines with narrative structure, data visualization guidance, and speaker notes. Ensures data is contextualized — numbers alone do not move decisions or change behavior.

## Core Design Principle

Every presentation has three layers:
1. **What** — the data (what the numbers say)
2. **So what** — the interpretation (what the numbers mean)
3. **Now what** — the action (what needs to happen because of the numbers)

A deck that contains only "What" is a data dump, not a presentation.

## Presentation Types and Templates

### Monthly Staff Meeting Deck

**Audience:** SPD staff (Decon, P&P, Sterilization — shift-specific if different issues apply)
**Duration:** 15–20 minutes + Q&A
**Format:** 8–10 slides maximum

```
STAFF MEETING DECK OUTLINE — [Month YYYY] — [Shift: Day / Evening / Night]

Slide 1 — Title
  "[Month] SPD Team Meeting"
  [Date]   [Facilitator role]

Slide 2 — Win of the Month
  [One specific achievement — metric improved, event handled well, survey prep milestone]
  [Why it matters — connect to patient safety or team performance]
  Purpose: Start with something positive. Teams that never hear wins disengage.

Slide 3 — Quality Metrics This Month
  Tray error rate: [%] vs. target [%] — [trend indicator]
  Missing instrument rate: [%] vs. target [%]
  Case cart accuracy: [%]
  [Simple bar or line chart — 3 months of trend]
  Speaker note: "We are [above/at/below] target. Here is what that means..."

Slide 4 — Safety Highlights
  BI results this month: [all negative / N failures with resolution status]
  Bioburden events: [N — note if zero]
  IUSS rate: [%]

Slide 5 — Focus Topic (required — one per meeting)
  [Topic connected to current quality data, CAP, or upcoming survey]
  [Key message in one sentence]
  [2–3 supporting points — no more]
  Speaker note: "This is what we are focusing on because..."

Slide 6 — Process or Policy Update (if applicable)
  [New or revised SOP — CSS number]
  [What changed, effective date]
  [Where to find it]

Slide 7 — Open Questions and Announcements
  [Open floor]
  [Schedule items — upcoming events, coverage changes, visitors]

Slide 8 — Closing
  "What we are working toward together:"
  [One sentence connecting team performance to patient safety]
```

### Leadership KPI Dashboard

**Audience:** CNO, CMO, VP Operations, or shared governance committee
**Duration:** 5 minutes (briefing format) or embedded in committee agenda
**Format:** 1–2 slides maximum per reporting period

```
KPI DASHBOARD SLIDE — [Month/Quarter YYYY]
[Produced from spd-analytics data]

LEFT COLUMN — Quality:
  Tray error rate:     [%] [▲▼—] vs. [prior period]
  Missing instruments: [%] [▲▼—]
  Case cart accuracy:  [%]

CENTER COLUMN — Safety:
  BI failures: [N]  Trend: [improving/stable/concern]
  Bioburden events: [N]
  IUSS rate: [%]

RIGHT COLUMN — Operational:
  Coverage ratio: [value]  Status: [adequate/marginal/understaffed]
  Overtime rate: [%]
  Open CAPs: [N]

FOOTER:
  Period: [dates]   Prepared by: [SPD Director role]
  [Status indicator: All metrics within target / One metric requires attention / Action needed]
```

### Capital Investment Briefing

**Audience:** Administration, CFO, CNO
**Duration:** 10–15 minutes
**Format:** 6–8 slides

```
CAPITAL INVESTMENT DECK — [Equipment Name / FTE Request]

Slide 1 — What We Are Requesting
  [Equipment name, quantity, cost] or [FTE count and role]
  [One sentence: why now]

Slide 2 — The Problem
  [Current state — data-driven]
  [What it is costing: financial, quality, patient safety]
  [Do NOT editorialize — let the data speak]

Slide 3 — What We Have Already Tried
  [Actions taken, outcomes, why they are insufficient]
  Purpose: demonstrates we are not skipping a cheaper solution

Slide 4 — The Solution
  [Proposed equipment or staffing]
  [How it addresses the problem — specific]

Slide 5 — Financial Case
  [Cost of investment vs. cost of current state]
  [Break-even point]
  [Source: lib/staffing/calculator.ts for FTE; repair cost data for equipment]

Slide 6 — Risk of Not Acting
  [What happens if this request is denied]
  [Regulatory exposure, quality risk, cost trajectory]
  This slide is the closer — administration responds to risk framing

Slide 7 — Request
  [Specific ask: dollar amount, position approval, timeline]
  [What decision is needed from this audience, by what date]
```

### Survey Readiness Staff Briefing

**Audience:** SPD staff
**Purpose:** Prepare staff for TJC/CMS/NJ DOH survey without creating panic
**Duration:** 10 minutes

```
Slide 1 — What a Survey Is
  [Brief: who surveys, why, what they look for]
  "They are here to verify we are doing what we say we are doing."

Slide 2 — Our Current Readiness
  [Self-assessment score from spd-survey-readiness]
  [Areas of strength / areas we are tightening]

Slide 3 — What to Do If a Surveyor Comes to You
  • Keep working — do not stop what you are doing
  • Answer what you know — it is OK to say "I would check the SOP for that"
  • If unsure, direct them to [role]
  • Do not go looking for a supervisor in a way that looks evasive

Slide 4 — Our Focus Areas Before Survey
  [Top 2–3 items from survey readiness checklist]
  [Specific actions each staff member should know]

Slide 5 — Questions
  [Open floor]
```

## SAG Client Presentation Format

For Scott Advisory Group client deliverables in slide format:
- Use SAG brand colors [NEEDS INPUT FROM TERRY: SAG brand palette]
- Include client code (not facility name) on every slide footer
- Confidentiality footer: "Confidential — Prepared for [client code] by Scott Advisory Group"
- PRA score visualization: use the four-tier color scheme from scott-advisory-pra

## Slide Design Rules

1. **One idea per slide** — if a slide requires more than 3 bullet points, split it
2. **No paragraphs on slides** — bullets only; the narrative belongs in speaker notes
3. **Every data point has a comparison** — current vs. target, or current vs. prior period
4. **No checkbox symbols** — bullet points only
5. **Trend indicators** — use ▲ (increasing), ▼ (decreasing), — (stable) consistently
6. **Status colors:** Green = on target, Yellow = watch, Red = action needed — consistent throughout


---


# SPD Capital Justification

## What This Skill Does

Builds data-driven business cases for capital equipment, FTE additions, facility renovations, and operational investments. Produces three outputs: a one-page executive summary for administrators, a full business case document, and a supporting data appendix.

## Business Case Template

### 1. Problem Statement

State the operational or quality data that demonstrates the gap. Be specific — numbers, not adjectives.

```
Problem Statement Template:
"[Metric] has [trended / averaged / occurred] at [value] over the past [timeframe].
This represents a [regulatory risk / patient safety risk / financial impact] because [specific consequence].
The current [equipment / staffing model / process] cannot address this gap within current parameters."
```

Example: "Sterilizer #2 has required emergency maintenance 7 times in the past 12 months at an average cost of $3,200 per event. Total unplanned maintenance spend: $22,400. The unit is 14 years old, past manufacturer end-of-life, and has a documented 6-hour downtime per event that delays OR throughput."

### 2. Financial Impact of Current State

Quantify what the problem is costing now:

| Cost Category | Annual Amount | Source |
|---|---|---|
| Unplanned repair cost | $[amount] | Maintenance records |
| OR delay cost per hour | $[amount] | Finance department |
| Estimated delay hours from equipment | [hours] | SPD records |
| Traveler premium above FTE rate | $[amount] | HR/staffing data |
| Re-sterilization cost per event | $[amount] | Internal estimate |
| SSI risk cost (benchmark: $20k–$100k per event) | $[amount] | Literature benchmark |

### 3. Proposed Solution

Specific. Named. Priced.

```
Proposed Solution: [specific equipment model, FTE role, or workflow change]
Vendor/source: [name]
Capital cost: $[amount]
Implementation cost: $[amount] (installation, training, validation)
Timeline: [implementation timeline]
```

### 4. ROI Projection

```
Investment: $[total cost]
Year 1 cost avoidance: $[maintenance savings + delay reduction + traveler reduction]
Payback period: [months]
5-year net benefit: $[cumulative savings - investment]
```

### 5. Risk Framing

Frame the regulatory and patient safety risk of NOT investing:

```
If this investment is not made:
- Regulatory risk: [TJC standard that could be cited, e.g., IC.02.02.01]
- Patient safety risk: [specific harm pathway]
- Operational risk: [throughput, quality, or staffing consequence]
- Financial risk: [what gets worse if left unaddressed]
```

### 6. Comparables

When available:
- Benchmark data from similar-sized facilities
- Industry standard replacement cycles for this equipment type
- Regional competitor data (if obtainable)

## Common Justification Scenarios

### New Washer or Sterilizer

Data to pull from spd-analytics / Supabase:
- Overdue maintenance rate (repair_cycles table)
- Downtime incidents and duration
- Throughput impact: cases delayed due to equipment
- Unit age vs. manufacturer recommended replacement cycle
- Water quality variance log

Frame: "Regulatory requirement for validated equipment per AAMI ST79 §11; current unit cannot consistently meet parametric release criteria."

### FTE Addition

Data to pull:
- Error rate clustering by shift and time window (quality_events table)
- Coverage gap windows (spd-staffing-model output)
- Traveler cost: agency rate + orientation time cost + quality risk premium
- Throughput per tech per hour — is volume exceeding safe capacity?

Frame: "Coverage gap during [specific window] correlates with [X]% of quality events. Traveler cost of $[annual] exceeds FTE cost of $[annual] by $[delta], with higher quality risk."

### SQ Track Endo Module Activation

Data frame:
- Current manual tracking risk: what can't be traced?
- Survey exposure: TJC requires traceability to patient for flexible endoscopes
- Reprocessing failure rate without system verification
- Cost of one SSI event ($20k–$100k) vs. module activation cost

### Instrument Replacement

Pull from spd-instrument-lifecycle:
- Repair cost history for this instrument/set
- Replacement cost quote
- Lifecycle cost comparison (repair trajectory vs. replace now)

### Facility Renovation / SPD Expansion

Regulatory frame:
- AAMI ST79 Section 4 (facility design): unidirectional flow requirement
- Regulatory risk if current layout is cited by TJC
- Functional flow analysis: where are the cross-contamination risks?

## Executive Summary Format (1 page)

```
[HEADER: [Facility Name] — Central Sterile Services]
[DATE]

CAPITAL REQUEST: [Title]
Requested by: Terry Scott, Director CSS

THE PROBLEM: [2 sentences — data-driven]
THE SOLUTION: [1 sentence — specific]
THE INVESTMENT: $[amount] capital / $[amount] implementation
THE RETURN: $[amount] first-year savings / [N]-month payback
THE RISK OF INACTION: [regulatory exposure or patient safety statement]

RECOMMENDATION: Approve [solution] for [timeline] implementation.
```

## Data Sources

| Source | What to Pull |
|---|---|
| Supabase repair_cycles | Annual repair cost by instrument; frequency by vendor |
| Supabase quality_events | Error clustering by shift, time, equipment |
| lib/staffing/calculator.ts | Coverage ratio, FTE gap, schedule model |
| External benchmark | SSI cost: $20k–$100k per event (APIC, SHEA data) |
| Finance department | OR delay cost per hour, traveler agency rate |
| HR | FTE fully-loaded cost for comparison |


---


# SPD Survey Readiness

## What This Skill Does

Proactively audits SPD against TJC, CMS, and NJ DOH standards. Simulates a surveyor walkthrough to identify gaps before they become findings. Generates classified findings with CAPs. Coaches staff on how to respond on the floor when surveyors are present.

## Mock Survey Protocol

### Trigger Conditions

Run a mock survey when:
- Quarterly self-assessment (minimum schedule)
- Any quality event cluster (3+ events of same type in 30 days)
- New equipment introduced (survey exposure until SOP and training complete)
- Recent external survey at a peer facility identified issues in your areas
- TJC window is open (surveys typically occur within 36 months of last survey)

### Surveyor Simulation Walkthrough

Conduct this walkthrough as if you are the surveyor. Review each area:

#### Decontamination

- [ ] PPE availability and donning compliance — full PPE visible and accessible at point of entry?
- [ ] Unidirectional traffic flow — is there a physical or procedural barrier between dirty and clean?
- [ ] Manual cleaning stations — brushes clean and not frayed, chemistry labeled with dilution ratio and date opened?
- [ ] Sharps disposal — puncture-resistant containers accessible and not overfilled?
- [ ] Personal items — no food, drink, or personal items in decon?
- [ ] Sink setup — dedicated instrument sink vs. handwash sink clearly differentiated?

#### Preparation and Packaging

- [ ] Count sheets present at assembly stations and current (revision date within 12 months)?
- [ ] Chemical indicators in every package?
- [ ] Instruments inspected before packaging — any visibly damaged instruments in workflow?
- [ ] Tray labels include contents, lot number, expiration/event-related dating?
- [ ] Work surfaces clean, no pooled water, organized workflow?

#### Sterilization

- [ ] Biological indicator program: frequency per AAMI ST79, results logged, spore log accessible?
- [ ] Chemical integrator/indicator use documented per load?
- [ ] Load records: complete, retrievable, signed?
- [ ] Immediate Use Steam Sterilization (IUSS): documented justification, flash log, no routine use?
- [ ] Parametric release criteria met for every load?
- [ ] Sterilizer maintenance logs current?
- [ ] Water quality records: conductivity/TDS tested and documented per frequency requirement?

#### Sterile Storage

- [ ] 8-18 inches off floor, 18 inches from ceiling, 2 inches from outside wall?
- [ ] Solid-bottom shelving or wrapped items not stored on wire shelving directly?
- [ ] No expired items in circulation? (event-related dating: any compromised packaging removed)
- [ ] No cardboard boxes in sterile storage?
- [ ] Temperature and humidity logged per facility policy?

#### Personnel

- [ ] Competency records for all active staff — current and on file?
- [ ] New hire orientation documentation complete?
- [ ] CRCST/CSPDT certifications current (no expired certs for staff claiming certification)?
- [ ] Annual competency reverification done for all staff?

#### Equipment

- [ ] Sterilizer validation (installation qualification, operational qualification, performance qualification) on file?
- [ ] Washer validation and maintenance schedule current?
- [ ] IFUs on file for all items processed?

#### Vendors

- [ ] Vendor credentialing current for all active reps?
- [ ] IFUs on file for all loaner sets processed in the last 12 months?
- [ ] Loaner intake documentation on file?

## Finding Classification

| Level | TJC Equivalent | Definition | Required Action |
|---|---|---|---|
| **Critical** | Immediate Jeopardy | Patient safety risk requires correction today | Correct before survey ends; notify Terry immediately |
| **Major** | Requirement for Improvement | Process or documentation gap requiring CAP | CAP within 30 days; document completion |
| **Minor** | Opportunity for Improvement | Improvement possible but not urgent | Track; no mandatory deadline |

## Pre-Survey Corrective Action

For every Major or Critical finding:
1. Generate a CAP using spd-quality-docs
2. Assign responsible party (role, not name)
3. Set due date (Critical: same day; Major: 30 days)
4. Verify completion before the actual survey date
5. Keep completion documentation accessible for surveyors

## Document Pull List (When Surveyor Asks)

Pull immediately when requested:

| Document | Location |
|---|---|
| Sterilizer load logs | [NEEDS INPUT FROM TERRY: SQ Track module or paper log location] |
| Biological indicator log | [NEEDS INPUT FROM TERRY] |
| Water quality records | [NEEDS INPUT FROM TERRY] |
| Competency records | facility education tracking system (SQ Track, LMS, or equivalent) |
| IFU library | [NEEDS INPUT FROM TERRY: file location] |
| Loaner intake records | SQ Track or paper log |
| IUSS (flash sterilization) log | [NEEDS INPUT FROM TERRY] |
| Equipment maintenance records | [NEEDS INPUT FROM TERRY] |
| SOPs | CSS SOP library (per spd-sop-framework numbering) |

## Staff Interview Coaching

Surveyors will ask staff directly. Train staff to answer these:

**"What do you do if an instrument fails inspection?"**
Expected answer: "I remove it from the tray, document it as a missing instrument, and notify my supervisor."

**"Walk me through what you do when a BI comes back positive."**
Expected answer: "I notify my supervisor immediately, recall all loads from that sterilizer back to the last negative BI, document the event, and do not release loads until the cause is investigated and the sterilizer is re-qualified."

**"What PPE do you wear in decontamination?"**
Expected answer: "Surgical gown, shoe covers, eye protection or face shield, and two pairs of gloves — utility gloves under cut-resistant gloves [or as specified in the facility PPE SOP]."

**"How do you know what cleaning method to use for an instrument?"**
Expected answer: "I follow the IFU — the manufacturer's written instructions for use. If I don't have the IFU, I can't process the instrument."

## On-Site Survey Response Protocol (Surveyor Is Here Now)

1. Notify Terry immediately — do not wait until they find you
2. Accompany surveyors to the area — never leave them unescorted
3. Answer questions factually and directly — do not volunteer additional information
4. If you don't know: "I don't have that in front of me right now. Let me get that for you." (then get Terry)
5. If a finding is cited in real time: acknowledge, do not argue, document
6. Pull documents promptly when asked — delays create an impression of disorganization


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


# SPD Ingest Skill

## What This Skill Does

Manages the intake, normalization, validation, and storage of raw SPD data from external systems (SQ Track CSV exports, OR scheduling data, repair logs, sterilizer load records). Bridges the gap between raw operational data and the clean Supabase schema that drives analytics, reporting, and decision support. All data is validated against schema and naming standards before any write to production tables.

## Data Sources and Target Tables

| Source | Format | Target Table | Normalization Required |
|---|---|---|---|
| SQ Track instrument export | CSV | `audit_responses` / instrument inventory | Naming standard (spd-catalog-agent) |
| SQ Track repair log | CSV | `repair_cycles` | Instrument name normalization, cost parsing |
| Sterilizer load log | CSV / manual | `sterilization_records` (if exists) | BI result parsing, cycle parameter validation |
| OR case schedule | CSV | `case_schedule` (if exists) | Instrument name, service line mapping |
| Count sheet data | CSV / manual | `checklists` | Tray name, instrument list, revision tracking |
| Competency records | CSV | `staff_competency` (if exists) | Role normalization, date formatting |

[NEEDS INPUT FROM TERRY: Confirm actual Supabase table names and field names from the production schema — the names above are based on the codebase exploration but need validation against the live schema]

## Ingestion Pipeline

### Step 1 — Receive and Inspect the File

```
INGEST REQUEST
File name: [filename]
Source: [SQ Track export / OR scheduling / repair log / other]
Format: [CSV / Excel / manual entry]
Row count: [N]
Date range covered: [YYYY-MM-DD to YYYY-MM-DD]
Target table: [Supabase table name]
─────────────────────────────────────────────────────────────
Pre-ingest checks:
□ File encoding is UTF-8 or ASCII (not binary)
□ Headers match expected column names
□ No empty required fields in header row
□ Date fields are parseable (YYYY-MM-DD preferred)
□ No PII fields that should not enter the system
```

### Step 2 — Normalize Instrument Names

All instrument names must conform to the spd-catalog-agent naming standard before any database write:

**Format:** `[Category] [Manufacturer?] [Descriptor] [Size] [Orientation/Type]`

Normalization rules (apply via `lib/csv/parser.ts`):
- Abbreviations → expanded: "SC" → "Scissors", "FR" → "Forceps Ring", "NH" → "Needle Holder"
- Fractions → decimal: "5-1/2\"" → "5.5in"
- All-caps → title case: "MAYO SCISSORS" → "Scissors Mayo"
- Trailing descriptors → standard position: "Straight Mayo 5.5" → "Scissors Mayo Straight 5.5in"
- Manufacturer codes → verified against catalog: "KS" → confirm Karl Storz or other MFR

Flag any instrument name that cannot be normalized automatically:

```
NORMALIZATION FLAG
Row: [row number]
Original name: [as it appears in source file]
Attempted normalization: [what the parser produced]
Reason for flag: [abbreviation unknown / manufacturer ambiguous / size format unrecognized]
Action required: Manual review before ingest — route to spd-catalog-agent
```

### Step 3 — Schema Validation

Validate every row against the target table schema before write:

```
SCHEMA VALIDATION CHECK
Table: [target table name]
─────────────────────────────────────────────────────────────
Required fields present: Y / N  [list any missing]
Field types match: Y / N  [list any type mismatches]
Foreign key references valid: Y / N  [list any broken references]
Duplicate detection: [N duplicates found — list if > 0]
Date range plausible: Y / N  [flag dates outside expected range]
─────────────────────────────────────────────────────────────
Validation result: PASS / FAIL / PASS WITH FLAGS
```

Do not write to production tables if validation result is FAIL.

### Step 4 — Dry Run

Before committing to production:
1. Run insert as a transaction with rollback
2. Confirm row count matches expectation
3. Spot-check 5 random rows for data integrity
4. Confirm no constraint violations

### Step 5 — Commit and Log

```
INGEST COMPLETION LOG
Date: [YYYY-MM-DD HH:MM]
File: [filename]
Source: [origin]
Target table: [table name]
Rows processed: [N]
Rows committed: [N]
Rows flagged/excluded: [N]   Reason: [if any]
Normalization flags resolved: [N]
Normalization flags pending manual review: [N]
─────────────────────────────────────────────────────────────
Committed by: [role]
Rollback available until: [timestamp + 24 hours]
```

## SQ Track Export Handling

SQ Track CSV exports may contain:
- Instrument catalog data (name, catalog number, SQ Track ID, tray assignment)
- Repair cycle records (instrument, date, vendor, issue, cost)
- Processing records (tray, date, sterilizer, load, tech, cycle parameters)

### SQ Track Catalog Import Workflow

1. Export from SQ Track: [NEEDS INPUT FROM TERRY: actual SQ Track export menu path and field names]
2. Run through normalization (Step 2)
3. Compare against existing Supabase instrument records — identify new, changed, and retired instruments
4. Route new instruments to spd-catalog-agent for formal catalog entry before committing
5. Route retired instruments to spd-instrument-lifecycle for retirement documentation before removing from active records
6. Commit normalized, validated records

### SQ Track Repair Log Import

Pull for spd-analytics and spd-capital-justification:
- Map to `repair_cycles` table: instrument_id, date, vendor, issue_description, cost, cause_category
- Compute running totals per instrument for lifecycle analysis
- Flag instruments where cumulative repair cost ≥ 40% of replacement cost

## Codebase Integration

| Module | Function |
|---|---|
| `lib/csv/parser.ts` | CSV parsing, field extraction, type coercion |
| `lib/supabase/client.ts` | Supabase connection and write operations |
| `import-storage.ts` (if present) | Staging area for pre-validation data |
| `lib/analytics/aggregator.ts` | Post-ingest aggregation confirmation |

Query pattern for validation check:
```typescript
// Confirm row count post-commit
const { count } = await supabase
  .from('target_table')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', ingestTimestamp)
```

## SAG Client Data Ingestion

When ingesting data for a SAG client engagement:
1. Apply anonymization before any data enters the system — use the spd-client-onboarding anonymization protocol
2. Assign the client code (SAG-YYYY-NNN) to all records
3. Store in a client-specific schema or with a client_id foreign key
4. Confirm no facility-identifying fields are stored in plain text


---


# SPD Staffing Model

## What This Skill Does

Analyzes staffing levels, coverage gaps, traveler dependency, and productivity to produce data-driven scheduling recommendations and FTE justification. Wires directly into spd-capital-justification for admin-level budget requests.

## Productivity Model

### Tray-Per-Tech-Per-Hour Benchmarks (adjust to facility's actual data)

| Area | Conservative | Target | Surge |
|---|---|---|---|
| Decontamination | 3 trays/tech/hr | 5 trays/tech/hr | 7 trays/tech/hr |
| Preparation & Packaging | 4 trays/tech/hr | 6 trays/tech/hr | 8 trays/tech/hr |
| Sterilization (load management) | 2 loads/tech/hr | 3 loads/tech/hr | 4 loads/tech/hr |

[NEEDS INPUT: Confirm facility-specific benchmarks from tracking system throughput data]

### Daily Demand Calculation

```
daily_demand_minutes = (case_volume × avg_processing_time_per_case) + baseline_daily_overhead
```

Where baseline_daily_overhead includes: washer load/unload, sterilizer monitoring, storage, documentation.

[NEEDS INPUT: Average processing time per case and baseline overhead for this facility]

### Coverage Ratio

```
coverage_ratio = available_tech_minutes_per_shift / demand_minutes_per_shift

adequate:     coverage_ratio ≥ 1.10 (10% buffer)
marginal:     coverage_ratio 0.90–1.09
understaffed: coverage_ratio < 0.90
```

This matches the formula in `lib/staffing/calculator.ts` in the compliance app codebase.

### Minimum Staffing Floor by Shift

| Shift | Minimum Safe Staffing | Rationale |
|---|---|---|
| Day (7a–3:30p) | 4 techs + 1 lead | Peak OR volume; case cart builds |
| Evening (3p–11:30p) | 3 techs + 1 lead | Turnover from day cases; OR add-ons |
| Night (11p–7:30a) | 2 techs + 1 lead | Lower volume; BI monitoring; no solo coverage |

[NEEDS INPUT: Confirm facility minimums and actual staffing roster per shift]

## Coverage Gap Analysis

### Known High-Risk Windows

| Window | Risk | Current Coverage |
|---|---|---|
| Night → Day (30-minute overlap) | **Highest** — night issues surface as day problems | [NEEDS INPUT: current staffing] |
| Early morning add-ons (before first hour of day shift) | High — day shift not yet fully staffed | [NEEDS INPUT: current staffing] |
| Evening → Night (30-minute overlap) | Standard overlap; manageable if no open events | [NEEDS INPUT: current staffing] |

### Staff Departure — Coverage Gap Assessment

Use this framework when a staff member gives notice or departs:

Impact assessment:
1. What role/shift did the departing staff cover?
2. What % of shift throughput depended on that staff member? (pull from tracking system productivity data)
3. After departure: which shifts fall below minimum staffing floor?
4. What is the crossover with existing traveler dependencies?
5. How many days until a replacement FTE could be trained to independent assignment? (minimum 90 days from hire date)

**Gap window:** From last day to replacement FTE reaching independence (estimate: departure date + 90 days minimum)
**Mitigation options:**
- Option A: Agency traveler to cover gap window — cost: $[rate × hours × gap days]
- Option B: Redistribute existing staff with overtime — cost: $[OT premium × hours × gap days]
- Option C: Hire replacement FTE before departure to overlap for training — cost: $[FTE rate × overlap period]
- Recommendation: depends on roster, budget, and departure timeline

## Traveler / Contractor Analysis

### True Cost of Traveler vs. FTE

| Cost Component | Traveler | FTE |
|---|---|---|
| Hourly rate (base) | $[agency rate] | $[FTE hourly] |
| Agency fee markup (typical: 25–35%) | Included in rate | N/A |
| Benefits | None (agency covers) | ~30–35% of base salary |
| Orientation cost (2–3 weeks lost productivity) | Per contract | One-time cost |
| Quality risk premium | Higher (unfamiliar systems) | Lower (trained on facility SOPs) |
| Departure risk | Every 13 weeks | Tenure-based retention |

**True annual cost of one traveler FTE:** $[hourly × 2080] + orientation cost + quality risk cost
**True annual cost of one permanent FTE:** $[salary] × 1.32 (benefits multiplier)

[NEEDS INPUT: Current agency rate and FTE wage range for this facility]

### Roster Dependency Metric

```
traveler_dependency = traveler_hours / total_hours_worked_in_period
```

If traveler_dependency > 25%: flag as high-risk; department function depends on external contract renewals.

## Schedule Optimization

### Coverage Gap by Day of Week

Build a 7-day coverage matrix:

| Day | Day Shift Coverage Ratio | Evening Coverage Ratio | Night Coverage Ratio | Risk Level |
|---|---|---|---|---|
| Mon | [ratio] | [ratio] | [ratio] | [adequate/marginal/understaffed] |
| Tue | [ratio] | [ratio] | [ratio] | |
| ... | ... | ... | ... | |

Populate from actual schedule data. Highlight any day/shift combination below 0.90.

This mirrors the `analyzeSchedule` function in `lib/staffing/calculator.ts`.

### Call-Out Impact Modeling

When one tech calls out from a shift:

```
call_out_impact = (shift_coverage_ratio - (1_tech_minutes / total_shift_demand_minutes))
```

If call_out_impact < 0.90: shift is now understaffed — supervisor must act.

Actions available:
1. Mandate overtime from off-going shift (within policy limits)
2. Call in a part-time or per-diem staff member
3. Restrict OR schedule support (notify OR charge nurse)
4. Escalate to Terry if below minimum safe staffing floor

### Cross-Training Matrix

Track who is certified for which areas:

| Staff Member (Role) | Decon | P&P | Sterilization | Endo | Lead |
|---|---|---|---|---|---|
| [Role 1] | Y | Y | Y | N | N |
| [Role 2] | Y | Y | N | N | N |
| [Role 3] | Y | N | N | Y | N |

[NEEDS INPUT: Populate with actual roster by role, not by name — roles only for privacy]

Use cross-training matrix to identify:
- Single points of failure (only one person certified in an area on a shift)
- Training investment priority (which staff would benefit most from cross-training)

## FTE Justification Output

When analysis supports an FTE request, produce:
1. Coverage gap analysis showing the understaffed windows
2. Quality event clustering in those windows (from Supabase data)
3. Traveler cost vs. FTE cost comparison
4. Any recent or upcoming departure impact if relevant
5. Route to spd-capital-justification for full business case formatting


---


# SPD Knowledge Propagation

## What This Skill Does

The standards change agent. When upstream information changes — a new AAMI edition, a new piece of equipment, a quality event-driven process change, a regulatory finding — this agent identifies every downstream skill, SOP, training module, and competency affected and generates a prioritized update plan with routing instructions.

## Change Trigger Types

| Trigger Type | Examples | Urgency |
|---|---|---|
| **Standard revision** | AAMI ST79 new edition, AORN guideline update, TJC standard change | High — regulatory exposure |
| **New equipment introduction** | New washer model, new sterilizer, new endoscope line | High — training before use |
| **SOP change** | Process change driven by quality event, CAP action item | Medium — training within 30 days |
| **Quality event-driven change** | RCA finding requires systemic process update | Medium-High — depends on scope |
| **Regulatory finding** | TJC or CMS survey finding requires corrective action | High — timeline is defined by finding |
| **Vendor IFU revision** | Manufacturer updates cleaning or sterilization parameters | High — processing must pause until updated |

## Downstream Impact Mapping

### Standard Revision → What Gets Affected

When a regulatory standard is revised:

```
Standard Revision Impact Checklist:
□ SOPs that cite the standard (use spd-sop-framework master list)
□ Training materials that reference the standard (spd-training-materials inventory)
□ Competency assessments based on the standard (spd-competency records)
□ In-service calendar — is there a scheduled in-service on this topic?
□ Quality Gate checklist — does the gate reference the old edition?
□ Survey Readiness self-assessment — does it reference the old standard?
□ Capital Justification — does any pending business case cite the old standard?
```

### New Equipment Introduction → What Gets Affected

```
New Equipment Impact Checklist:
□ IFU on file before any processing begins (stop process if not)
□ SOP required: create via spd-sop-framework
□ Training required: in-service for all shifts via spd-educator-agent
□ Competency assessment required: return demonstration before independent use
□ Count sheet update: add to SQ Track catalog via spd-catalog-agent
□ Vendor credentialing: if vendor-specific training required, document completion
□ Procurement record: catalog number and cost in asset register
```

### Quality Event-Driven Change → What Gets Affected

```
Quality Event Impact Checklist:
□ Immediate corrective action (spd-quality-docs)
□ SOP update if process change required (spd-sop-framework)
□ Training notification to all shifts (spd-educator-agent)
□ Competency reverification if Major SOP revision results (spd-competency)
□ Quality Gate update if a new review criterion is identified
□ Survey Readiness update if this represents a new regulatory exposure
```

## Propagation Workflow

1. **Receive change trigger** — identify the specific change (standard, equipment, event)
2. **Run impact checklist** — identify all affected downstream artifacts
3. **Classify by regulatory exposure:**
   - High (standard or IFU): update within 7 days; training within 30 days
   - Medium (SOP change): training within 30 days
   - Low (informational update): no mandatory deadline; track in change log
4. **Generate update tasks** with owners and due dates
5. **Route to Educator** — training updates always go through spd-educator-agent
6. **Route to Quality Gate** — any updated document must pass the gate before activation
7. **Log the change event** in the propagation record

## Change Impact Report Template

```
KNOWLEDGE PROPAGATION REPORT
Change trigger: [Standard revision / New equipment / SOP change / QE-driven / Survey finding]
Trigger description: [Specific change — standard name + edition, or equipment name]
Date detected: [YYYY-MM-DD]
Regulatory exposure level: High / Medium / Low
─────────────────────────────────────────────────────────────

AFFECTED ARTIFACTS:
□ SOP: CSS-[AREA]-[SEQ] — [Title] — Update by: [date] — Owner: [role]
□ SOP: CSS-[AREA]-[SEQ] — [Title] — Update by: [date] — Owner: [role]
□ Training: [Module name] — In-service by: [date] — Educator to deploy
□ Competency: [Assessment name] — Reverification by: [date] if Major revision
□ Quality Gate: [Checklist item to update] — Update before next gate review
□ Survey Readiness: [Self-assessment item to update]

ROUTING INSTRUCTIONS:
→ Educator: Deploy in-service for [affected topic] to all shifts by [date]
→ Quality Gate: Updated SOPs must pass gate before activation
→ Terry: Approve all Major SOP revisions before activation

ESCALATION CONDITION:
If High-exposure items are not updated within 7 days, escalate to Terry.
─────────────────────────────────────────────────────────────
```

## Escalation Protocol

If high-regulatory-exposure artifacts are not updated within 7 days of the change trigger:
1. Flag to Terry with specific outstanding items
2. Identify which SOPs or training modules are still referencing outdated information
3. Quantify the exposure: what would a surveyor find if they reviewed today?

## Change Log

Every propagation event is logged:

```
| Date | Trigger | Affected Artifacts | Exposure Level | Update Deadline | Status |
|---|---|---|---|---|---|
| [date] | AAMI ST79 2025 | CSS-STR-001, CSS-STR-002, Sterilizer Competency | High | [date] | In progress |
```


---


# SPD Outcomes Tracker

## What This Skill Does

Closes the feedback loop. Tracks the real-world result of every significant output produced by the SPD AI ecosystem. Did the CAP work? Did the recommendation get approved? Did the metric move? Uses those answers to improve workflows, skill prompts, and decision-making. This is the skill that makes the ecosystem get smarter over time.

## What Gets Tracked

### Category 1 — Decision Outcomes

Track what happened after a decision was made or recommended:

| Intervention | Outcome Tracked | Success Criteria |
|---|---|---|
| Capital request submitted to administration | Approved / Denied / Pending | Approval within 60 days |
| FTE request submitted | Approved / Denied / Modified | Position filled within 90 days of approval |
| Instrument replacement recommended | Ordered / Deferred / Denied | Order placed within 30 days |
| Vendor escalation sent | Resolved / Unresolved / Escalated | Vendor response within 10 days |
| Survey finding corrective action submitted | Accepted / Rejected / Revised | Accepted on first submission |

### Category 2 — Quality Intervention Outcomes

Track whether interventions actually changed the metric:

| Intervention | Metric to Track | Measurement Window |
|---|---|---|
| In-service training delivered | Error rate for that skill area | 30/60/90 days post in-service |
| CAP implemented for quality event | Recurrence of same event type | 90 days post-implementation |
| New SOP activated | Audit compliance rate for that process | 60 days post-activation |
| Handoff protocol implemented | Unresolved escalations at shift change | 30 days post-implementation |
| POU compliance communication sent to OR | POU compliance audit rate | 30 days post-communication |

### Category 3 — Presentation and Report Outcomes

Track whether leadership communications achieved their goal:

| Output | Outcome Tracked |
|---|---|
| Staff meeting deck delivered | Key message retained? (quick verbal check at next meeting) |
| KPI packet submitted | Any questions from leadership? Any actions taken? |
| SAG client deliverable submitted | Client response: satisfied / questions / revision requested |
| Mock survey findings report submitted | CAPs completed before actual survey? |
| IP joint rounding report shared | IP follow-up actions taken? Joint priorities addressed? |

## Outcome Capture Format

```
OUTCOME RECORD
Output reference: [Skill used, date, brief description of the output]
Intervention type: Decision / Quality / Presentation
Submitted/delivered: [date]
─────────────────────────────────────────────────────────────
FOLLOW-UP CHECK (complete at scheduled interval):
Check date: [date]
Outcome: [What actually happened]
Metric before: [baseline value if applicable]
Metric after: [current value]
Success criteria met: Y/N / Partial
─────────────────────────────────────────────────────────────
LEARNING:
What worked: [specific]
What didn't work: [specific]
Skill/workflow improvement suggested: [Y/N — if Y, describe]
Improvement applied: [Y/N — date if Y]
```

## Skill Improvement Loop

When an outcome reveals a skill produced poor results:

### Step 1 — Identify the Failure Mode

| Failure Mode | Likely Root Cause | Fix Direction |
|---|---|---|
| Capital request denied despite strong data | Framing not matched to decision-maker priorities | Revise spd-capital-justification executive summary format |
| CAP didn't reduce the error | Root cause was wrong | Improve spd-quality-docs root cause framework |
| Training didn't change behavior | Verification method didn't confirm competency | Improve spd-educator-agent verification plan requirement |
| Presentation didn't land | Data presented without narrative | Improve spd-presentations story structure template |
| Survey finding not caught in mock survey | Self-assessment checklist was incomplete | Add new item to spd-survey-readiness checklist |

### Step 2 — Propose the Improvement

```
SKILL IMPROVEMENT PROPOSAL
Skill: [spd-skill-name]
Failure event: [brief description]
Failure mode: [category from table above]
Proposed change: [specific change to the skill's content or checklist]
Expected improvement: [what outcome should be different after the change]
```

### Step 3 — Route to Terry for Approval

All skill improvements are flagged to Terry before being applied. Terry decides which improvements go into the live skill.

### Step 4 — Log the Change

Once approved, the improvement is applied to the skill and logged:
```
SKILL UPDATE LOG
Skill: [name]
Change date: [YYYY-MM-DD]
Change description: [what changed]
Triggered by: [outcome event]
```

## Scheduled Follow-Up Cadence

| Intervention Type | Follow-Up Check |
|---|---|
| Capital request | 30 days, then 60 days if pending |
| FTE request | 30 days, then 60 days if pending |
| CAP for quality event | 30 days, then 90 days (recurrence window) |
| In-service training | 30 days, then 60 days |
| New SOP | 60 days |
| OR/IP communication | 30 days |
| SAG client deliverable | 14 days |

## Ecosystem Performance Metrics

Track quarterly across the whole ecosystem:

| Metric | Definition |
|---|---|
| Capital approval rate | Approved requests / total submitted |
| CAP effectiveness rate | No recurrence within 90 days / total CAPs |
| Training behavior change rate | Post-training error rate < pre-training rate |
| Quality Gate catch rate | Fatal findings caught before delivery / total outputs reviewed |
| Orchestrator routing accuracy | Correct chain used / total requests |
| First-submission acceptance rate | Outputs accepted without revision / total outputs |


---


# SPD Catalog Agent

## What This Skill Does

The instrument naming and count sheet standardization agent. Normalizes instrument names, standardizes count sheet structure, manages catalog numbers, and ensures SQ Track data integrity. Analytics reliability depends entirely on naming consistency — this skill is the foundation layer for all downstream data work.

## Naming Convention Standard

### Primary Name Format

```
[Category] [Manufacturer if applicable] [Descriptor] [Size] [Orientation/Type]
```

**Examples:**
- `Scissors Mayo Straight 5.5in` ← correct
- `Mayo Scissors 5.5` ← reject (category wrong order)
- `Mayo Scissor 5-1/2` ← reject (non-standard size format)
- `Scissors Mayo Str. 5.5"` ← reject (abbreviation in primary name)

### Category Terms (use exactly these)

| Category | Use For |
|---|---|
| Scissors | All scissors |
| Forceps | Thumb forceps, tissue forceps |
| Clamp | Hemostatic clamps, intestinal clamps |
| Retractor | Hand-held and self-retaining retractors |
| Needle Holder | Needle holders and drivers |
| Elevator | Periosteal elevators |
| Curette | Bone and tissue curettes |
| Probe | Probes and dilators |
| Cannula | Insufflation and irrigation cannulas |
| Trocar | Laparoscopic trocars |
| Scope | Rigid scopes (laparoscopes, arthroscopes) |
| Camera | Camera heads and couplers |
| Driver | Screwdrivers and power instruments |
| Chisel | Chisels and osteotomes |
| Mallet | Surgical mallets |

### Size Format Rules

- Always inches for US instruments: `5.5in`, `9in`
- Always cm for metric instruments: `20cm`
- **Never mix units within a tray**
- **Never use fractions** (5-1/2 → 5.5in)
- **Never use symbols** (5.5" → 5.5in)

### Manufacturer Field

- Include only when manufacturer is clinically significant (e.g., Synthes implant instruments)
- Format: `[Category] [MFR] [Descriptor]` — e.g., `Screwdriver Synthes Hex 3.5mm`
- Do NOT include for generic instruments unless there is a specific reason

### Short Name Field (SQ Track)

Abbreviations permitted in the short name field only. Examples:
- Primary: `Scissors Mayo Straight 5.5in`
- Short: `Mayo Str 5.5`

## Count Sheet Layout Standard

### Header Block (required)

```
Tray Name: [full name as in SQ Track]
SQ Track ID: [alphanumeric ID]
Specialty: [e.g., General Surgery / Orthopedics / ENT]
Last Revised: [YYYY-MM-DD]
Revision Number: [v1, v2, ...]
Total Instrument Count: [number]
```

### Column Order

| Column | Content |
|---|---|
| # | Sequential item number |
| Instrument Name | Full primary name per convention above |
| Catalog Number | [MFR CODE]-[PART#] format |
| Qty | Integer quantity |
| Image Ref | Photo filename or `[PHOTO NEEDED]` |
| Notes | CI flag, fragile, loaner-specific, etc. |

### Position Order Within Tray

1. Heaviest instruments first (retractors, mallets, large clamps)
2. Medium instruments (scissors, needle holders, standard forceps)
3. Delicate instruments (fine forceps, micro instruments)
4. Camera equipment and scopes (always last — most fragile)
5. Synthes/implant-specific instruments (separate section, always included — no exclusion)
6. Container instruments (e.g., medicine cups, basins) — bottom of sheet

### CI (Chemical Indicator) Notation

Flag instruments that require internal CI placement with: `[CI REQUIRED]` in the Notes column.

## Catalog Number Standard

Format: `[MFR CODE]-[PART#]`

Examples:
- `KS-28160XX` (Karl Storz)
- `STR-7206483` (Stryker)
- `ART-AR-8400-0001` (Arthrex)
- `ZB-1010-2030` (ZimmerBiomet)

### Alt Part Number Field

Used for:
- Cross-reference between SQ Track catalog number and vendor invoice number
- Replacement catalog numbers when original is discontinued

### Discontinued Flag

When an instrument is EOL:
- Mark: `[DISCONTINUED — replaced by: [new catalog number]]`
- Do NOT delete the record — archive with the discontinued notation

## Tray Rightsizing Logic

When quantity seems wrong, cross-reference:
1. Most recent OR procedure card for that service line
2. OR schedule data — does this tray support a bilateral case?
3. Historical missing instrument reports — what's flagged most frequently?
4. If quantity is ambiguous: flag for Terry review with `[NEEDS CONFIRMATION: qty set at X, verify against OR card]`

## Vendor Set Classification

| Type | Rule |
|---|---|
| **Loaner** | Intake documentation required each visit; IFU required; count sheet created per visit |
| **Consignment** | Permanent SQ Track entry; IFU on file; count sheet maintained in library |
| **Trial** | Temporary SQ Track entry flagged TRIAL; IFU required; return tracking mandatory |

Synthes rule: All Synthes implant trays must be included in count sheet requirements with no exception. Do not mark Synthes trays as optional.

## Conflict Resolution

When SQ Track name ≠ count sheet name:
1. Flag with: `[NAMING CONFLICT: SQ Track shows "[SQ name]", count sheet shows "[CS name]"]`
2. Apply naming convention standard to determine correct form
3. Present recommendation to Terry before updating either system
4. Do NOT silently correct — log every change

## Batch Rename Workflow

For service line-wide normalization:
1. Export current SQ Track names for the service line
2. Apply naming convention to each record
3. Generate a before/after table for Terry review
4. After Terry approval: update count sheets first, then SQ Track
5. Log the batch change event in memory/DECISIONS.md


---


# SPD Systems Connector

## What This Skill Does

The dot-connector and causal architect. Identifies non-obvious relationships between events, policies, and metrics across the SPD operating system and its external dependencies (OR, IP, Supply Chain, HR, Administration, Vendors). Reveals the upstream causes of downstream problems that skill-level interventions keep failing to fix. Maps input/output linkages across the ecosystem and identifies policy misalignments that nobody notices until something breaks.

## The SPD System Map

### Internal Flows (SPD owns both ends)

```
UPSTREAM → DOWNSTREAM

Decon quality → Assembly error rate
  If manual cleaning is inconsistent, assembly techs see soil → tray failures
  Most departments address this at the assembly level (wrong intervention)

Assembly error rate → Missing instrument rate
  Trays built wrong → missing instruments flagged at OR → case delays
  Most departments address this as an "instrument problem" (wrong framing)

Count sheet accuracy → Assembly error rate → Missing instrument rate
  Bad count sheets cause correct assembly of wrong things
  The cause is the catalog, not the tech

Staffing coverage → Error clustering
  Errors don't occur randomly — they cluster in low-coverage windows
  Connecting staffing data to error timestamps reveals the real root cause

Education frequency → Competency drift
  Skills decay without reinforcement; departments with annual-only training
  have steeper competency curves than monthly in-service departments
```

### External Flows (SPD is downstream of others)

```
OR BEHAVIOR → SPD OUTCOMES

OR scheduling changes → SPD throughput stress
  Add-on cases added at 11pm cause overnight throughput spikes
  If the night shift isn't staffed for surges, tray quality suffers

OR preference card accuracy → SPD count sheet accuracy
  If preference cards don't match count sheets, SPD builds wrong trays
  The fix is in the OR record system, not in SPD

OR POU treatment → Bioburden load on decon
  If OR doesn't pre-treat, decon receives higher bioburden
  Manual cleaning time per instrument increases; throughput drops

SUPPLY CHAIN → SPD OPERATIONS

Instrument procurement delays → Missing instrument rate
  A new instrument ordered doesn't exist in SQ Track yet
  SPD processes a replacement that's not on the count sheet → wrong instrument flagged
  Root cause: procurement-to-catalog pipeline broken

Vendor credentialing delays → Loaner bottlenecks
  If credentialing system (Reptrax, etc.) is slow, vendor reps can't enter
  Loaners sit at the dock; cases get delayed; OR blames SPD

HUMAN RESOURCES → SPD OPERATIONS

HR posting delays → Coverage gaps
  Every day a position sits unfilled past 30 days = compounding risk
  Traveler cost accumulates; training burden increases; quality risk rises

Compensation benchmarking → Retention → Training investment decay
  If SPD wages are below market, turnover is high
  High turnover means constant re-training; education investment is lost

ADMINISTRATION → SPD OUTCOMES

Budget cycle timing → Capital decision delays
  Equipment purchased in Q4 arrives in Q2 of next year
  Capital requests that miss the budget window are deferred 12 months
  File requests 4–6 months before budget closes, not when equipment fails

JCAHO / CMS survey windows → Behavior change timing
  Departments clean up for surveys then drift back
  Sustainable compliance requires systems, not survey pressure

INFECTION PREVENTION → SPD OUTCOMES

SSI data lag → SPD response delay
  SSI data is typically 30–90 days behind
  By the time IP flags an SSI cluster, SPD has processed thousands more trays
  Real-time bioburden data (SPD owns this) is the earlier signal
```

## Causal Mapping Protocol

Use when a problem keeps recurring despite interventions:

### Step 1 — Map the symptom

State the observable problem: "Tray error rate in Orthopedics is rising despite weekly in-services."

### Step 2 — Trace one level upstream

What must be true for this symptom to occur?
- Assembly tech made an error → Why? Missing count sheet? Wrong count sheet? Distraction? Unfamiliar tray?
- Count sheet is wrong → Why? Not updated after preference card change? New instrument added but count sheet not revised?

### Step 3 — Trace another level upstream

What caused the upstream condition?
- Preference card changed → Who updated it? Was SPD notified? Is there a notification protocol?
- New instrument added → Was it entered in SQ Track per spd-catalog-agent protocol? Was a count sheet revision triggered?

### Step 4 — Identify the structural gap

Most recurring problems reveal a structural gap — a handoff that nobody owns:
- Procurement buys new instruments, nobody tells SPD
- OR updates preference cards, nobody tells SPD
- IP finds POU compliance gaps, nobody connects it to bioburden data
- HR posts a position, nobody tracks SPD's minimum staffing floor

### Step 5 — Design the fix at the structural level

Structural fixes:
- Add SPD to the notification list when preference cards are updated
- Create a procurement-to-catalog pipeline: any new instrument in the system triggers a catalog entry workflow
- Establish a monthly data-sharing touchpoint between SPD, OR, and IP
- Set an HR alert when SPD FTE count drops below the minimum staffing floor

## Policy Alignment Audit

### Policies That Must Align (Most Won't Notice Until They Don't)

| Policy Domain | Policy | SPD Impact If Misaligned |
|---|---|---|
| HR / Compensation | SPD wage band vs. market | High turnover → constant retraining → quality risk |
| HR / Posting | Maximum days to post an open position | Every 30 days of vacancy = accumulating coverage gap |
| Supply Chain / Procurement | Notification protocol when new surgical instruments are ordered | New instruments arrive with no count sheet, no SQ Track entry, no IFU |
| OR / Scheduling | Cutoff time for add-on case notification | Late add-ons = overnight surge with insufficient staffing |
| OR / Preference Cards | Who is responsible for notifying SPD of preference card updates | Count sheet-preference card mismatch → wrong tray → case cart error |
| IP / Rounding | Joint rounding frequency and who sets the agenda | If IP sets agenda without SPD input, rounding is a checklist exercise |
| Risk Management / Recalls | Who receives FDA MedWatch alerts and what the notification protocol to SPD is | Recall notification delay = patient exposure window extends |
| Administration / Budget | Budget submission deadline | Capital requests filed after deadline are deferred 12 months |
| Credentialing / Vendor Access | Credentialing system turnaround time | Slow credentialing = loaner delays = OR case delays |
| Legal / Engagement | SAG engagement agreement terms | Client data used before agreement = liability exposure |

## Input/Output Design Review

Use this to audit a skill's wiring — confirm it receives the right inputs and produces the right outputs:

```
SKILL WIRING AUDIT
Skill: [name]
─────────────────────────────────────────────────────────────
INPUTS REQUIRED:
□ [Input 1] — Source: [where it comes from] — Available: Y/N
□ [Input 2] — Source: [where it comes from] — Available: Y/N

OUTPUTS PRODUCED:
□ [Output 1] — Consumer: [which skill or person uses it] — Consumed: Y/N
□ [Output 2] — Consumer: [which skill or person uses it] — Consumed: Y/N

GAPS IDENTIFIED:
□ Input gap: [skill expects X but X is not consistently produced]
□ Output gap: [skill produces Y but Y is not being consumed by anyone]
□ Handoff gap: [skill hands off to Z but Z has no intake protocol for it]
─────────────────────────────────────────────────────────────
```

## Unlikely Cause-Effect Patterns (Non-Obvious Connections Most Departments Miss)

1. **OR schedule compression → night shift quality decline** — When OR schedules are heavy and late cases run long, instruments return to SPD at the start of the night shift with a smaller team. Night throughput pressure increases; tray quality risk rises.

2. **Vendor credentialing lag → IUSS rate increase** — When vendor reps can't enter to deliver loaners on time, SPD can't process. OR requests flash sterilization to avoid delay. IUSS rate rises. Nobody connects it to the credentialing system.

3. **Education records gap → survey vulnerability** — Competencies completed but not documented create a survey finding. The staff member is competent; the record doesn't prove it. The fix is documentation discipline, not education quality.

4. **Budget approval timing → equipment failure risk** — The sterilizer that fails in March was the subject of a capital request the prior September that was deferred. The real risk was taken 6 months before the failure.

5. **Traveler orientation gaps → error clustering** — Travelers who are not oriented to facility-specific SOPs produce errors that cluster in the first 2 weeks of each contract. Tracking errors by employee type reveals this pattern.


