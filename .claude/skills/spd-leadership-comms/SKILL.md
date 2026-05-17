---
name: "SPD Leadership Comms"
description: "Leadership communication drafting skill for Sterile Processing and Scott Advisory Group. Use when: drafting an email to OR leadership about a case delay or instrument issue, sending a memo to administration about a capital request or staffing gap, escalating a vendor non-compliance to supply chain, writing a staff communication about a new policy or SOP, drafting a letter to a vendor about a loaner documentation failure, communicating a quality event outcome to Risk Management, preparing a formal escalation to CNO or CMO, writing a joint IP-SPD communication to OR Nurse Manager, or any written communication requiring professional tone calibration, audience-matched language, and correct escalation tier. No checkbox symbols in any communication. Tone is always professional and solution-oriented."
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

## Anti-Patterns

- Do NOT use checkbox symbols (☐, ✓) in any professional communication — use bullet points
- Do NOT over-escalate routine issues to administration-level recipients — it desensitizes leadership to real escalations
- Do NOT include individual staff names in any communication about quality events or performance
- Do NOT apologize for a problem before the cause is established — acknowledge, document, and act
- Do NOT send a Tier 3 or Tier 4 communication without spd-quality-gate review

## Wiring

**Called by:** spd-orchestrator (all communication requests), spd-vendor-loaner-mgmt (vendor breach notices), spd-infection-prevention-interface (joint POU communications), spd-recall-management (OR and administration notices), spd-shift-handoff (escalation notifications), spd-capital-justification (administration request letters)
**Calls:** spd-quality-gate (Tier 3 and Tier 4 communications before sending)
