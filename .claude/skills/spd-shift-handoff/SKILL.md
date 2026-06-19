---
name: "SPD Shift Handoff"
description: "Shift transition protocol for Sterile Processing. Produces a structured, documented handoff from outgoing to incoming supervisor across all three shift transitions. Use when: a shift is ending and the incoming supervisor needs a briefing, there is an open quality event that must be communicated across a shift, a sterilizer BI failure is unresolved at shift change, a critical missing instrument has not been located, a staff call-out affected coverage, a vendor/loaner item is outstanding, or any end-of-shift documentation is needed. The night-to-day handoff is the highest-risk transition — anything unresolved from night shift that surfaces as a day-shift problem originates here."
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

## Anti-Patterns

- Do NOT begin a verbal handoff without the written report being complete first — verbal-only handoffs lose information
- Do NOT mark a BI failure as "pending" in the handoff and leave without a resolution plan documented
- Do NOT use the handoff report to assign blame for errors — it is a status document, not an incident report
- Do NOT skip the incoming supervisor signature — both parties must acknowledge the handoff

## Wiring

**Called by:** spd-orchestrator (Fast Track for end-of-shift handoff requests)
**Calls:** spd-quality-docs (if a new quality event is identified at handoff), spd-leadership-comms (if escalation communication to Terry or administration is needed)
