---
name: "SPD Bioburden Protocol"
description: "Bioburden event intake, investigation, and response skill for Sterile Processing. Use when: visible soil or bioburden is found on an instrument after sterilization, a cleaning verification test fails, a biological indicator (BI) returns a positive result, a flash sterilization (IUSS) event is being investigated for contamination risk, an instrument returned from OR appears inadequately treated at point-of-use, a batch recall is triggered by a BI failure, Infection Prevention requests SPD data following an SSI investigation, or any event involving inadequate cleaning or residual organic material on a processed instrument. Class I bioburden events (post-sterilization soil in patient-ready tray) require immediate Infection Prevention notification. This skill owns the intake, investigation, and documentation chain — not just the data collection."
---

# SPD Bioburden Protocol

## What This Skill Does

Manages bioburden event intake, classification, investigation, and escalation. A bioburden event is any instance where residual organic material is present at a point in the reprocessing chain where it should have been eliminated. The earlier it is caught, the lower the risk — this skill's protocols ensure every event is captured, classified, and responded to before it exits the processing chain.

## Bioburden Event Classification

| Class | Definition | Examples | Response |
|---|---|---|---|
| **Class I — Post-Sterilization** | Visible soil found after sterilization in a patient-ready instrument or tray | Soil in a packaged tray, residue found when opening for a case | Immediate — IP and Risk Management notified within 15 minutes if patient-ready |
| **Class II — Process Failure** | Cleaning verification failure or BI failure indicating reprocessing breakdown | Failed ATP test at packaging, positive BI result, failed visual inspection post-decon | Same day — quarantine load, notify Terry, full investigation |
| **Class III — POU Deficit** | Inadequate OR pre-treatment returns instruments to SPD with excessive bioburden | Dried blood on returned instruments, no foam applied, inadequate soaking | Document; route to spd-or-liaison-agent for POU compliance follow-up |
| **Class IV — Near Miss** | Bioburden risk identified and contained before progressing | Visible soil caught at decon inspection before assembly | Document as near miss; no escalation unless pattern emerges |

## Event Intake Checklist

```
BIOBURDEN EVENT INTAKE
Event class: [I / II / III / IV]
Date/time discovered: [YYYY-MM-DD HH:MM]
Discovered by: [role, area — no individual name]
Location in chain: [Decon / Assembly / Post-Pack Inspection / Sterile Storage / OR]
─────────────────────────────────────────────────────────────
INSTRUMENT DETAILS:
Instrument: [per spd-catalog-agent naming standard]
Tray/set: [name]
SQ Track ID: [if applicable]
Sterilizer load#: [if post-sterilization]
Lot/batch: [if applicable]
─────────────────────────────────────────────────────────────
BIOBURDEN TYPE (check all that apply):
□ Visible soil (blood, tissue, protein debris)
□ Failed ATP test — reading: [value] (threshold: [value])
□ Failed visual inspection under magnification
□ Failed cleaning verification chemical test
□ Positive BI: Sterilizer [ID] | Load [#] | Spore type [manufacturer]
□ Residual cleaning chemical
□ Rust or mineral deposit
─────────────────────────────────────────────────────────────
IMMEDIATE ACTIONS:
□ Instrument/tray quarantined
□ OR notified (if instrument was OR-ready or in transit)
□ Terry notified — time: [HH:MM]
□ IP notified — time: [HH:MM] (Class I required)
□ Risk Management notified — time: [HH:MM] (Class I if patient-ready)
```

## Class I Response Protocol

**Within 15 minutes:**
1. Quarantine the tray/instrument — do not return to service for any reason
2. Notify Terry immediately
3. Determine: was this instrument used in a case?
   - **YES:** Notify Risk Management immediately + IP — patient exposure window open
   - **NO (caught before use):** Notify IP per protocol below; no patient notification expected

**Within 1 hour:**
4. Notify IP in writing (email is the record)
5. Begin spd-quality-docs Tier 1 event report
6. Identify the sterilizer load — assess all instruments from the load
7. If the load is suspect: initiate load recall per AAMI ST79 recall protocol

### Class I IP Notification (Email)

```
To: [IP role]
From: [SPD Director role]
Subject: SPD Bioburden Event — Class I — [YYYY-MM-DD]

A Class I bioburden event was identified today at [HH:MM] in [area].

Instrument: [name per catalog standard]
Finding: [description — factual, no cause assignment]
Tray/load: [identifier]
Patient impact: [used in case / caught before use — no patient identifier in this email]

Immediate actions completed:
- Instrument quarantined
- Terry notified at [HH:MM]

Root cause investigation is underway. Preliminary finding within 24 hours.
```

## BI Failure Protocol

A positive biological indicator is a sterilization failure until investigation proves otherwise. Do not release any load, and do not assume it is a false positive before completing the investigation.

### Immediate Response (same hour)

1. Hold all loads from the affected sterilizer pending investigation
2. Notify Terry
3. Pull all loads run since the last confirmed negative BI (AAMI ST79 recall protocol)
4. Quarantine all potentially affected instruments
5. Notify OR charge nurse: sterilizer offline, timeline TBD
6. Contact sterilizer service for emergency inspection if mechanical cause is possible

### BI False Positive Checklist

Before concluding a positive BI is a false positive, rule out each item:

```
BI FAILURE INVESTIGATION
Sterilizer: [ID]   Load: [#]   Date: [YYYY-MM-DD]
BI type: [spore type, manufacturer, lot#]
─────────────────────────────────────────────────────────────
RULE OUT (check each — must be documented):
□ BI placement error — was BI in the correct challenge location?
□ Incubation error — correct temperature and duration per manufacturer IFU?
□ Expired BI lot — lot expiration date: [date]
□ Control strip result — run control per manufacturer IFU: [result]
□ Cycle parameters out of range — review sterilizer printout: [Y/N in range]
□ Sterilizer mechanical issue — review maintenance log: [any open issues?]
□ Load packing error — was load configured per AAMI ST79 guidelines?
□ Chemical indicator failure on same load — [Y/N]
─────────────────────────────────────────────────────────────
CONCLUSION:
□ False positive confirmed — control strip negative; all other parameters normal
   → Document; no recall required; maintain BI program frequency
□ True failure — unable to confirm false positive; investigation inconclusive
   → Formal load recall; sterilizer removed from service until repaired and requalified
```

## Cleaning Verification Program

### Routine Verification Checks

| Check | Frequency | Threshold | Action on Failure |
|---|---|---|---|
| Visual inspection at packaging | Every tray, every cycle | Zero visible soil | Hold for reprocessing; document as Class II or IV |
| Chemical indicator (CI) in pack | Every processed set | Color change per manufacturer IFU | Quarantine; re-sterilize; document |
| Biological indicator (BI) | Per AAMI ST79 schedule (min weekly, every implant load) | Negative | BI failure protocol above |
| ATP bioluminescence (if available) | Per facility program | < 200 RLU (or facility threshold) | Re-clean; document; trend data |

### Trending

Track monthly, share with IP:
- Visual inspection failure rate
- ATP failure rate (if used)
- BI failure count
- Trend direction: improving / stable / deteriorating

Share via spd-infection-prevention-interface monthly data sharing protocol.

## Post-Event Routing

| Class | Routes To |
|---|---|
| Class I | spd-quality-docs Tier 1 event report + spd-infection-prevention-interface |
| Class II | spd-quality-docs Tier 2 event report |
| Class III | spd-or-liaison-agent (POU compliance follow-up) + spd-quality-docs Class III record |
| Class IV | spd-quality-docs near-miss record only |

All Class I and II events route through spd-quality-gate before any documentation is shared externally.

---

## Anti-Patterns

- Do NOT hold a Class I event for investigation before notifying Terry and IP — notify first, investigate second
- Do NOT assume a positive BI is a false positive without running the manufacturer-specified control
- Do NOT clear a load recall without confirming every potentially affected instrument is accounted for
- Do NOT name individual staff in event documentation — role, shift, and area only
- Do NOT use this skill to assign blame to OR POU compliance without documented audit data

## Wiring

**Called by:** spd-orchestrator (all bioburden events), spd-shift-handoff (bioburden events at handoff), spd-infection-prevention-interface (IP-triggered investigations)
**Calls:** spd-quality-docs (event documentation and RCA), spd-or-liaison-agent (Class III POU deficit events), spd-infection-prevention-interface (Class I notification), spd-quality-gate (before any report is shared with IP or Risk Management)
