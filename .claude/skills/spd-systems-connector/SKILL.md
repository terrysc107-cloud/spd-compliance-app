---
name: "SPD Systems Connector"
description: "Causal mapping and cross-system design skill for the SPD AI Operating System. Connects non-obvious dots between inputs, outputs, and unlikely cause-and-effect loops that most people in the department miss. Use when: a quality problem keeps recurring despite corrective actions (the real cause is upstream), a metric is moving in the wrong direction and the obvious explanation is wrong, a policy change in one department is creating problems in SPD that nobody has connected yet, you need to map all the inputs and outputs of a workflow to find where it breaks, a structural misalignment between HR, OR, IP, supply chain, and SPD is causing persistent friction, or the ecosystem needs a design review to ensure skills are wired correctly. This skill sees the system, not just the symptoms."
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
  If Pete's shift isn't staffed for surges, tray quality suffers

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

## Unlikely Cause-Effect Patterns (Known at MEMH)

These are the non-obvious connections most departments miss:

1. **OR schedule compression → night shift quality decline** — When OR schedules are heavy and late cases run long, instruments return to SPD after Pete starts his shift with a smaller team. Night throughput pressure increases; tray quality risk rises.

2. **Vendor credentialing lag → IUSS rate increase** — When vendor reps can't enter to deliver loaners on time, SPD can't process. OR requests flash sterilization to avoid delay. IUSS rate rises. Nobody connects it to the credentialing system.

3. **Education records gap → survey vulnerability** — Competencies completed but not documented create a survey finding. The staff member is competent; the record doesn't prove it. The fix is documentation discipline, not education quality.

4. **Budget approval timing → equipment failure risk** — The sterilizer that fails in March was the subject of a capital request the prior September that was deferred. The real risk was taken 6 months before the failure.

5. **Traveler orientation gaps → error clustering** — Travelers who are not oriented to MEMH-specific SOPs produce errors that cluster in the first 2 weeks of each contract. Tracking errors by employee type reveals this pattern.

---

## Anti-Patterns

- Do NOT treat symptoms as root causes — trace at least 3 levels upstream before proposing a fix
- Do NOT audit policy alignment in isolation — always cross-reference against the operational impact on SPD
- Do NOT design a structural fix without identifying who owns it — unowned fixes are not fixes
- Do NOT assume the obvious cause is the real cause — the Systems Connector exists because the obvious cause is usually wrong

## Wiring

**Called by:** spd-orchestrator (when a problem recurs despite interventions, or when ecosystem design review is requested), spd-outcomes-tracker (when outcomes reveal a systemic gap)
**Calls:** spd-knowledge-propagation (when a structural gap is identified that affects multiple downstream artifacts), spd-quality-docs (when a structural finding requires formal corrective action), any skill whose wiring is identified as misaligned
