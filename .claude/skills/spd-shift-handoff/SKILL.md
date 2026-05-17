---
name: "SPD Shift Handoff"
description: "Shift transition protocol for Sterile Processing. Encodes the Pete-to-Heather, Heather-to-Eve, and Eve-to-Pete handoff as structured, documented workflow. Use when: a shift is ending and the incoming supervisor needs a briefing, there is an open quality event that must be communicated across a shift, a sterilizer BI failure is unresolved at shift change, a critical missing instrument has not been located, a staff call-out affected coverage, a vendor/loaner item is outstanding, or any end-of-shift documentation is needed. The 30-minute Pete-to-Heather window is the highest-risk transition — anything unresolved from night shift that surfaces as a day-shift problem originates here."
---

# SPD Shift Handoff

## What This Skill Does

Produces a structured handoff report from outgoing to incoming supervisor. Ensures nothing falls through between shifts. Encodes the three MEMH handoff windows with their specific risk profiles and overlap constraints.

## MEMH Handoff Windows

| Transition | Window | Overlap | Risk Profile |
|---|---|---|---|
| Pete (night) → Heather (day) | 7:00–7:30a | 30 minutes | **HIGHEST RISK** — tightest window; night issues surface as day problems |
| Heather (day) → Eve (evening) | 11:00a–3:30p | Eve arrives 11a–12p | **BEST WINDOW** — most transfer capacity; use it fully |
| Eve (evening) → Pete (night) | 11:00–11:30p | 30 minutes | Standard overlap |

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

## Pete-to-Heather Specific Protocol (7:00–7:30a)

This window is 30 minutes with no flexibility. Every minute counts.

Night shift must complete by 7:00a:
- [ ] Handoff report fully written (not in progress at 7:00)
- [ ] All BI results that can be read before 7:00 are read and logged
- [ ] All loads that were run overnight are documented
- [ ] Any call-outs or coverage issues from night are noted

At 7:00 — verbal briefing only covers:
1. Anything new since the report was written
2. Items 1–3 above (quality events, missing instruments, sterilizer status) — verbal confirmation only
3. Top 3 priorities verbal review

Day shift does NOT wait for verbal briefing on everything — they read the report.

## Heather-to-Eve Protocol (11:00a–3:30p)

Eve arrives 11a–12p. Use the full overlap window.

During overlap:
- Eve reads written report while Heather finishes active tasks
- By noon: verbal review of all open items
- By 1:00p: Eve is running independently with Heather available for questions
- By 3:30p: Heather departure — formal handoff complete

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
