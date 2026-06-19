---
name: "SPD Recall Management"
description: "Instrument and device recall response protocol for Sterile Processing. Use when: an FDA MedWatch alert is received, a manufacturer recall notification arrives, a distributor issues a safety notice, a lot or serial number match is needed against SPD inventory, patient notification threshold needs to be determined, affected instruments need to be quarantined, a recall scope assessment is required, a vendor return authorization needs to be initiated, or any recall-related documentation must be produced. Class I recalls (immediate patient safety risk) require Risk Management notification within the hour. This skill is explicitly required by instrument coordinator job postings at multiple large systems."
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

## Anti-Patterns

- Do NOT delay quarantine pending confirmation of patient risk — quarantine first, assess scope second
- Do NOT determine patient notification scope without Risk Management — SPD provides the data, RM makes the decision
- Do NOT rely on verbal confirmation from vendor rep for a recall — require written documentation
- Do NOT close a recall event until all affected instruments are accounted for: quarantined, returned, or confirmed not in inventory

## Wiring

**Called by:** spd-orchestrator (Full Chain — all recall events), spd-vendor-loaner-mgmt (if the recalled item is a loaner set)
**Calls:** spd-quality-docs (recall event documentation), spd-leadership-comms (OR and administration communications), spd-or-liaison-agent (instrument unavailability notification to OR), spd-quality-gate (before any patient-facing or regulatory recall document is delivered)
