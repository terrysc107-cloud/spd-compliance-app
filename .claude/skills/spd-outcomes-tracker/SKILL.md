---
name: "SPD Outcomes Tracker"
description: "Feedback loop and continuous improvement skill for the SPD AI Operating System. Tracks what actually happened after reports were delivered, presentations were made, decisions were implemented, and corrective actions were executed. Use when: following up on a capital request (was it approved?), checking whether a CAP reduced the error rate, reviewing whether an in-service changed behavior, assessing whether a shift handoff protocol reduced unresolved escalations, comparing pre/post metrics after any intervention, learning from what worked and what didn't, improving a skill's prompts or workflow based on real outcomes, or reviewing the effectiveness of any SPD AI ecosystem output. The ecosystem that never learns from outcomes is just a document factory."
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

## Anti-Patterns

- Do NOT track outputs — track outcomes. A delivered report is not a success; an approved budget is.
- Do NOT wait 90 days to start tracking — capture the intervention at delivery, schedule the follow-up check immediately
- Do NOT apply skill improvements without Terry's review — the ecosystem reflects Terry's doctrine
- Do NOT treat every missed outcome as a skill failure — some outcomes depend on factors outside the ecosystem (administration politics, budget cycles, staff resistance)

## Wiring

**Called by:** spd-orchestrator (scheduled follow-up checks), any skill that produced a high-stakes output
**Calls:** spd-knowledge-propagation (when a skill improvement is identified, propagate to downstream users of that skill), spd-quality-gate (updated gate criteria when outcome analysis identifies a pattern the gate missed)
