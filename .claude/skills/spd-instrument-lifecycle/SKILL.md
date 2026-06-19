---
name: "SPD Instrument Lifecycle"
description: "Repair-replace-retire decision framework for Sterile Processing instrumentation. Use when: deciding whether to repair or replace an instrument, an instrument has been repaired more than twice in 12 months, a manufacturer end-of-life notice is received, an instrument no longer meets IFU performance specifications, building a lifecycle cost model for a service line, documenting instrument damage cause for vendor accountability, processing a warranty or replacement claim, retiring an instrument from active service, removing retired instruments from SQ Track, or generating data to support a capital replacement request. Default threshold: repair if cost is less than 40% of replacement cost. More than 3 repairs in 12 months triggers automatic replacement candidate review."
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

## Anti-Patterns

- Do NOT retire an instrument until a verified replacement is in service and on the count sheet
- Do NOT repair an instrument that has functionally failed — document it and replace
- Do NOT send an instrument for repair without photographing and documenting the damage cause first
- Do NOT remove a retired instrument from SQ Track — mark as INACTIVE and archive

## Wiring

**Called by:** spd-orchestrator (for repair/replace/retire decisions), spd-analytics (when repair cycle data triggers lifecycle review)
**Calls:** spd-capital-justification (replacement requests), spd-catalog-agent (count sheet updates for retirements and new instruments), spd-quality-docs (if damage pattern requires corrective action)
