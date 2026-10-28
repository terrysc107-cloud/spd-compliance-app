---
name: "SPD Capital Justification"
description: "Business case and capital justification skill for Sterile Processing. Translates operational and quality data into financial and risk arguments that hospital administration approves. Use when: requesting a new washer or sterilizer, justifying an FTE addition, making the case for SQ Track Endo module activation, building an instrument replacement request, justifying a facility renovation or SPD expansion, computing the true cost of traveler dependency vs. FTE hire, framing a regulatory risk argument for a capital investment, or building a data-driven leadership presentation for any resource request. SPD professionals widely lack the analytics to justify staffing and capital — this skill closes that gap."
---

# SPD Capital Justification

## What This Skill Does

Builds data-driven business cases for capital equipment, FTE additions, facility renovations, and operational investments. Produces three outputs: a one-page executive summary for administrators, a full business case document, and a supporting data appendix.

## Business Case Template

### 1. Problem Statement

State the operational or quality data that demonstrates the gap. Be specific — numbers, not adjectives.

```
Problem Statement Template:
"[Metric] has [trended / averaged / occurred] at [value] over the past [timeframe].
This represents a [regulatory risk / patient safety risk / financial impact] because [specific consequence].
The current [equipment / staffing model / process] cannot address this gap within current parameters."
```

Example: "Sterilizer #2 has required emergency maintenance 7 times in the past 12 months at an average cost of $3,200 per event. Total unplanned maintenance spend: $22,400. The unit is 14 years old, past manufacturer end-of-life, and has a documented 6-hour downtime per event that delays OR throughput."

### 2. Financial Impact of Current State

Quantify what the problem is costing now:

| Cost Category | Annual Amount | Source |
|---|---|---|
| Unplanned repair cost | $[amount] | Maintenance records |
| OR delay cost per hour | $[amount] | Finance department |
| Estimated delay hours from equipment | [hours] | SPD records |
| Traveler premium above FTE rate | $[amount] | HR/staffing data |
| Re-sterilization cost per event | $[amount] | Internal estimate |
| SSI risk cost (benchmark: $20k–$100k per event) | $[amount] | Literature benchmark |

### 3. Proposed Solution

Specific. Named. Priced.

```
Proposed Solution: [specific equipment model, FTE role, or workflow change]
Vendor/source: [name]
Capital cost: $[amount]
Implementation cost: $[amount] (installation, training, validation)
Timeline: [implementation timeline]
```

### 4. ROI Projection

```
Investment: $[total cost]
Year 1 cost avoidance: $[maintenance savings + delay reduction + traveler reduction]
Payback period: [months]
5-year net benefit: $[cumulative savings - investment]
```

### 5. Risk Framing

Frame the regulatory and patient safety risk of NOT investing:

```
If this investment is not made:
- Regulatory risk: [TJC standard that could be cited, e.g., IC.02.02.01]
- Patient safety risk: [specific harm pathway]
- Operational risk: [throughput, quality, or staffing consequence]
- Financial risk: [what gets worse if left unaddressed]
```

### 6. Comparables

When available:
- Benchmark data from similar-sized facilities
- Industry standard replacement cycles for this equipment type
- Regional competitor data (if obtainable)

## Common Justification Scenarios

### New Washer or Sterilizer

Data to pull from spd-analytics / Supabase:
- Overdue maintenance rate (repair_cycles table)
- Downtime incidents and duration
- Throughput impact: cases delayed due to equipment
- Unit age vs. manufacturer recommended replacement cycle
- Water quality variance log

Frame: "Regulatory requirement for validated equipment per AAMI ST79 §11; current unit cannot consistently meet parametric release criteria."

### FTE Addition

Data to pull:
- Error rate clustering by shift and time window (quality_events table)
- Coverage gap windows (spd-staffing-model output)
- Traveler cost: agency rate + orientation time cost + quality risk premium
- Throughput per tech per hour — is volume exceeding safe capacity?

Frame: "Coverage gap during [specific window] correlates with [X]% of quality events. Traveler cost of $[annual] exceeds FTE cost of $[annual] by $[delta], with higher quality risk."

### SQ Track Endo Module Activation

Data frame:
- Current manual tracking risk: what can't be traced?
- Survey exposure: TJC requires traceability to patient for flexible endoscopes
- Reprocessing failure rate without system verification
- Cost of one SSI event ($20k–$100k) vs. module activation cost

### Instrument Replacement

Pull from spd-instrument-lifecycle:
- Repair cost history for this instrument/set
- Replacement cost quote
- Lifecycle cost comparison (repair trajectory vs. replace now)

### Facility Renovation / SPD Expansion

Regulatory frame:
- AAMI ST79 Section 4 (facility design): unidirectional flow requirement
- Regulatory risk if current layout is cited by TJC
- Functional flow analysis: where are the cross-contamination risks?

## Executive Summary Format (1 page)

```
[HEADER: [Facility Name] — Central Sterile Services]
[DATE]

CAPITAL REQUEST: [Title]
Requested by: Terry Scott, Director CSS

THE PROBLEM: [2 sentences — data-driven]
THE SOLUTION: [1 sentence — specific]
THE INVESTMENT: $[amount] capital / $[amount] implementation
THE RETURN: $[amount] first-year savings / [N]-month payback
THE RISK OF INACTION: [regulatory exposure or patient safety statement]

RECOMMENDATION: Approve [solution] for [timeline] implementation.
```

## Data Sources

| Source | What to Pull |
|---|---|
| Supabase repair_cycles | Annual repair cost by instrument; frequency by vendor |
| Supabase quality_events | Error clustering by shift, time, equipment |
| lib/staffing/calculator.ts | Coverage ratio, FTE gap, schedule model |
| External benchmark | SSI cost: $20k–$100k per event (APIC, SHEA data) |
| Finance department | OR delay cost per hour, traveler agency rate |
| HR | FTE fully-loaded cost for comparison |

---

## Anti-Patterns

- Do NOT present a capital request without data — "we need it" is not a business case
- Do NOT understate the risk framing — administrators respond to liability and regulatory exposure
- Do NOT use ranges when you have actual numbers — actual numbers are more credible
- Do NOT produce only the one-pager — the full case document is needed if administration asks for backup

## Wiring

**Called by:** spd-orchestrator (Full Chain for capital/budget requests), spd-staffing-model (FTE justification output feeds here), spd-instrument-lifecycle (replacement requests route here)
**Calls:** spd-analytics (data pull for trend-based justifications), spd-quality-gate (before any admin-facing document is delivered), spd-document-design (for branded executive summary formatting), spd-presentations (for leadership readout format)
