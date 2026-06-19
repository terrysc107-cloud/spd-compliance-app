---
name: "SPD OR Liaison Agent"
description: "OR relationship management and communication interface for Sterile Processing. Replicates the OR Liaison role employed at Atrium Health, Houston Methodist, NCH, and Advocate Health. Use when: reviewing the next-day OR schedule for instrument availability, a case cart has a discrepancy, OR is requesting a priority turnaround, an add-on case arrives, POU treatment compliance in the OR needs to be audited or communicated, a monthly SPD-OR touchpoint meeting needs an agenda, OR behavior is driving SPD quality events, a missing instrument needs to be communicated to the OR team, a vendor loaner status needs to be communicated, case cart accuracy needs to be audited, or the SPD-OR relationship needs a structured satisfaction review. SPD should be a partner, not a reactive service."
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

## Anti-Patterns

- Do NOT wait for OR to call SPD about a missing instrument — proactive case review prevents the call
- Do NOT document POU compliance failures only in verbal form — write it down; patterns are invisible without documentation
- Do NOT allow OR to direct SPD's internal priorities without formal communication through the liaison channel
- Do NOT assign blame for turnaround delays without first checking whether all required instruments were returned from the prior case

## Wiring

**Called by:** spd-orchestrator (Fast Track for OR communication requests, case cart issues, turnaround requests)
**Calls:** spd-catalog-agent (instrument identification for case cart discrepancies), spd-vendor-loaner-mgmt (loaner status communication to OR), spd-quality-docs (when OR behavior drives a documented quality event), spd-leadership-comms (for formal OR communications), spd-infection-prevention-interface (POU compliance escalation)
