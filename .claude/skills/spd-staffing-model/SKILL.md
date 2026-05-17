---
name: "SPD Staffing Model"
description: "Staffing analysis and schedule optimization skill for Sterile Processing. Referenced in 80%+ of SPD Director and Manager job descriptions. Use when: analyzing coverage gaps by shift, computing the true cost of traveler dependency vs. FTE hire, assessing the impact of a staff departure on coverage, modeling overlap risk between shift transitions, identifying which quality events cluster in understaffed windows, building a cross-training matrix, optimizing the weekly schedule, computing productivity benchmarks (trays per tech per hour), modeling call-out impact, or generating a data-driven FTE request for administration. Coverage ratio: available tech-minutes per shift divided by demand minutes."
---

# SPD Staffing Model

## What This Skill Does

Analyzes staffing levels, coverage gaps, traveler dependency, and productivity to produce data-driven scheduling recommendations and FTE justification. Wires directly into spd-capital-justification for admin-level budget requests.

## Productivity Model

### Tray-Per-Tech-Per-Hour Benchmarks (adjust to facility's actual data)

| Area | Conservative | Target | Surge |
|---|---|---|---|
| Decontamination | 3 trays/tech/hr | 5 trays/tech/hr | 7 trays/tech/hr |
| Preparation & Packaging | 4 trays/tech/hr | 6 trays/tech/hr | 8 trays/tech/hr |
| Sterilization (load management) | 2 loads/tech/hr | 3 loads/tech/hr | 4 loads/tech/hr |

[NEEDS INPUT: Confirm facility-specific benchmarks from tracking system throughput data]

### Daily Demand Calculation

```
daily_demand_minutes = (case_volume × avg_processing_time_per_case) + baseline_daily_overhead
```

Where baseline_daily_overhead includes: washer load/unload, sterilizer monitoring, storage, documentation.

[NEEDS INPUT: Average processing time per case and baseline overhead for this facility]

### Coverage Ratio

```
coverage_ratio = available_tech_minutes_per_shift / demand_minutes_per_shift

adequate:     coverage_ratio ≥ 1.10 (10% buffer)
marginal:     coverage_ratio 0.90–1.09
understaffed: coverage_ratio < 0.90
```

This matches the formula in `lib/staffing/calculator.ts` in the compliance app codebase.

### Minimum Staffing Floor by Shift

| Shift | Minimum Safe Staffing | Rationale |
|---|---|---|
| Day (7a–3:30p) | 4 techs + 1 lead | Peak OR volume; case cart builds |
| Evening (3p–11:30p) | 3 techs + 1 lead | Turnover from day cases; OR add-ons |
| Night (11p–7:30a) | 2 techs + 1 lead | Lower volume; BI monitoring; no solo coverage |

[NEEDS INPUT: Confirm facility minimums and actual staffing roster per shift]

## Coverage Gap Analysis

### Known High-Risk Windows

| Window | Risk | Current Coverage |
|---|---|---|
| Night → Day (30-minute overlap) | **Highest** — night issues surface as day problems | [NEEDS INPUT: current staffing] |
| Early morning add-ons (before first hour of day shift) | High — day shift not yet fully staffed | [NEEDS INPUT: current staffing] |
| Evening → Night (30-minute overlap) | Standard overlap; manageable if no open events | [NEEDS INPUT: current staffing] |

### Staff Departure — Coverage Gap Assessment

Use this framework when a staff member gives notice or departs:

Impact assessment:
1. What role/shift did the departing staff cover?
2. What % of shift throughput depended on that staff member? (pull from tracking system productivity data)
3. After departure: which shifts fall below minimum staffing floor?
4. What is the crossover with existing traveler dependencies?
5. How many days until a replacement FTE could be trained to independent assignment? (minimum 90 days from hire date)

**Gap window:** From last day to replacement FTE reaching independence (estimate: departure date + 90 days minimum)
**Mitigation options:**
- Option A: Agency traveler to cover gap window — cost: $[rate × hours × gap days]
- Option B: Redistribute existing staff with overtime — cost: $[OT premium × hours × gap days]
- Option C: Hire replacement FTE before departure to overlap for training — cost: $[FTE rate × overlap period]
- Recommendation: depends on roster, budget, and departure timeline

## Traveler / Contractor Analysis

### True Cost of Traveler vs. FTE

| Cost Component | Traveler | FTE |
|---|---|---|
| Hourly rate (base) | $[agency rate] | $[FTE hourly] |
| Agency fee markup (typical: 25–35%) | Included in rate | N/A |
| Benefits | None (agency covers) | ~30–35% of base salary |
| Orientation cost (2–3 weeks lost productivity) | Per contract | One-time cost |
| Quality risk premium | Higher (unfamiliar systems) | Lower (trained on facility SOPs) |
| Departure risk | Every 13 weeks | Tenure-based retention |

**True annual cost of one traveler FTE:** $[hourly × 2080] + orientation cost + quality risk cost
**True annual cost of one permanent FTE:** $[salary] × 1.32 (benefits multiplier)

[NEEDS INPUT: Current agency rate and FTE wage range for this facility]

### Roster Dependency Metric

```
traveler_dependency = traveler_hours / total_hours_worked_in_period
```

If traveler_dependency > 25%: flag as high-risk; department function depends on external contract renewals.

## Schedule Optimization

### Coverage Gap by Day of Week

Build a 7-day coverage matrix:

| Day | Day Shift Coverage Ratio | Evening Coverage Ratio | Night Coverage Ratio | Risk Level |
|---|---|---|---|---|
| Mon | [ratio] | [ratio] | [ratio] | [adequate/marginal/understaffed] |
| Tue | [ratio] | [ratio] | [ratio] | |
| ... | ... | ... | ... | |

Populate from actual schedule data. Highlight any day/shift combination below 0.90.

This mirrors the `analyzeSchedule` function in `lib/staffing/calculator.ts`.

### Call-Out Impact Modeling

When one tech calls out from a shift:

```
call_out_impact = (shift_coverage_ratio - (1_tech_minutes / total_shift_demand_minutes))
```

If call_out_impact < 0.90: shift is now understaffed — supervisor must act.

Actions available:
1. Mandate overtime from off-going shift (within policy limits)
2. Call in a part-time or per-diem staff member
3. Restrict OR schedule support (notify OR charge nurse)
4. Escalate to Terry if below minimum safe staffing floor

### Cross-Training Matrix

Track who is certified for which areas:

| Staff Member (Role) | Decon | P&P | Sterilization | Endo | Lead |
|---|---|---|---|---|---|
| [Role 1] | Y | Y | Y | N | N |
| [Role 2] | Y | Y | N | N | N |
| [Role 3] | Y | N | N | Y | N |

[NEEDS INPUT: Populate with actual roster by role, not by name — roles only for privacy]

Use cross-training matrix to identify:
- Single points of failure (only one person certified in an area on a shift)
- Training investment priority (which staff would benefit most from cross-training)

## FTE Justification Output

When analysis supports an FTE request, produce:
1. Coverage gap analysis showing the understaffed windows
2. Quality event clustering in those windows (from Supabase data)
3. Traveler cost vs. FTE cost comparison
4. Any recent or upcoming departure impact if relevant
5. Route to spd-capital-justification for full business case formatting

---

## Anti-Patterns

- Do NOT recommend overtime as a permanent staffing solution — it is a bridge, not a strategy
- Do NOT populate the cross-training matrix with individual names — use roles for privacy
- Do NOT model staffing based on scheduled hours — use actual hours worked when the data exists
- Do NOT present coverage ratios without context — always include the demand calculation inputs

## Wiring

**Called by:** spd-orchestrator (for staffing analysis requests), spd-capital-justification (FTE justification data)
**Calls:** spd-capital-justification (when analysis supports an FTE request), spd-analytics (for quality event clustering data), spd-quality-gate (before admin-facing staffing reports are delivered)
