---
name: "SPD Vendor Loaner Management"
description: "Vendor and loaner instrumentation management skill for Sterile Processing. Covers intake, IFU acquisition, vendor rep access control, return accountability, and vendor performance tracking for all loaner sets. Use when: a vendor rep arrives with a loaner set, an IFU is missing at intake, a loaner tray needs to be entered in the tracking system, a vendor rep enters a restricted area, an IFU revision notification is received, a tray count at return doesn't match intake, instruments are damaged on return, a vendor hasn't responded to an escalation, credentialing needs verification, or any loaner-related documentation is required. IFU must be on file before processing begins — this is an FDA regulatory requirement, not a preference."
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

## Anti-Patterns

- Do NOT begin processing any loaner set without IFU on file — this is not optional
- Do NOT allow a vendor rep into decontamination for any reason
- Do NOT accept a vendor count sheet without verifying completeness against actual tray contents
- Do NOT release a loaner set to vendor if tray count at return is less than intake without a resolution plan
- Do NOT process using a deviation from IFU without documented Terry approval

## Wiring

**Called by:** spd-orchestrator (all vendor/loaner requests), spd-or-liaison-agent (when a loaner is needed for a case)
**Calls:** spd-catalog-agent (count sheet creation for loaner sets), spd-quality-docs (vendor breach documentation, deviation records), spd-leadership-comms (vendor accountability letters), spd-regulatory-research (IFU regulatory basis questions)
