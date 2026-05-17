---
name: "SPD Quality Docs"
description: "Quality event documentation and corrective action skill for Sterile Processing. Use when: a quality event requires documentation (tray error, missing instrument, BI failure, bioburden event, contaminated tray, wrong count sheet, loaner processing failure), a corrective action plan (CAP) is needed after a survey finding or recurring quality event, a root cause analysis (RCA) needs to be structured and completed, a 5-Why or fishbone analysis is needed, a PDCA or DMAIC improvement cycle needs to be documented, an event report must be generated for Risk Management, a quality event needs to be classified by severity, or any SPD quality event needs to be formally documented from intake through closure. No individual staff names in cause statements. All quality docs through spd-quality-gate before delivery."
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

**Naming rule:** No individual staff names in root cause statements. Write "A technician in the assembly area" not "Sarah in assembly." Write "the night shift" not "Pete's team."

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

## Anti-Patterns

- Do NOT name individual staff in root cause statements — role, shift, and area only
- Do NOT submit a CAP that addresses only the immediate cause — preventive action (systemic fix) is required
- Do NOT use vague corrective actions ("staff will be reminded") — every action must be specific, measurable, owned
- Do NOT route a Tier 1 or Tier 2 event through the standard quality cycle — escalate to Risk Management immediately
- Do NOT close a CAP before the effectiveness measurement window has elapsed

## Wiring

**Called by:** spd-orchestrator (all quality event and corrective action requests), spd-bioburden-protocol (bioburden event documentation), spd-survey-readiness (survey finding response), spd-recall-management (recall event documentation), spd-infection-prevention-interface (IP-identified concerns), spd-shift-handoff (escalated events)
**Calls:** spd-regulatory-research (citation validation), spd-systems-connector (when root cause is systemic or unclear), spd-quality-gate (before delivery), spd-outcomes-tracker (CAP effectiveness tracking), spd-knowledge-propagation (when event reveals standards gap)
