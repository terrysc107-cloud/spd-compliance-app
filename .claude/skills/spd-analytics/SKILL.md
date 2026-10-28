---
name: "SPD Analytics"
description: "Weekly KPI packet generation and data analysis skill for Sterile Processing. Use when: generating the weekly KPI report for leadership, analyzing tray error rates by service line or shift, tracking missing instrument trends, calculating case cart accuracy, reviewing bioburden event frequency, comparing current period to prior period metrics, identifying statistical outliers in quality data, generating the monthly dashboard for IP joint reporting, pulling repair cycle cost data by instrument or service line, building the data appendix for a capital justification, or any request that requires aggregating SPD performance data into actionable analysis. Black spec separation required — OR and IP data never mixed into the SPD KPI packet. Integrates with lib/analytics/aggregator.ts and the Supabase audit_responses table."
---

# SPD Analytics

## What This Skill Does

Generates structured KPI analysis and reporting for SPD operations. Produces the weekly KPI packet, monthly dashboard, service line drill-downs, and on-demand data analysis for capital justification, corrective action support, and leadership reporting. Integrates with the existing codebase analytics layer.

## KPI Framework

### Quality Metrics

| Metric | Calculation | Target | Alert Threshold |
|---|---|---|---|
| Tray error rate | Errors / trays processed | < 2% | > 3% |
| Missing instrument rate | Missing instruments / total instruments processed | < 0.5% | > 1% |
| Case cart accuracy | Correct carts / total carts | > 98% | < 95% |
| Count sheet accuracy | Count sheets matching case / total | > 99% | < 97% |
| Assembly error rate | Assembly defects / trays inspected | < 1.5% | > 2.5% |

### Safety Metrics

| Metric | Calculation | Target | Alert Threshold |
|---|---|---|---|
| Positive BI rate | Positive BIs / total BI tests | 0% | Any positive |
| Bioburden events | Count of events | 0 | Any Class I or II event |
| IUSS rate | IUSS cycles / total sterilizer cycles | < 5% | > 8% |
| Cleaning verification failure rate | Failed tests / total tests | < 2% | > 3% |

### Productivity Metrics

| Metric | Calculation | Target |
|---|---|---|
| Instruments per tech-hour | Total instruments / total tech-hours | [NEEDS INPUT FROM TERRY — benchmark from SQ Track] |
| Trays per tech-shift | Total trays / total tech-shifts | [NEEDS INPUT FROM TERRY] |
| Case cart cycle time (tray-to-case) | Mean minutes from tray build to OR delivery | [NEEDS INPUT FROM TERRY] |
| Coverage ratio | Available tech-minutes / demand-minutes | ≥ 1.10 |

### Operational Metrics

| Metric | Calculation | Target |
|---|---|---|
| Overtime rate | OT hours / total hours | < 10% |
| Traveler hours / FTE hours | Traveler hours / FTE hours | < 15% |
| Open escalations at shift change | Count of unresolved escalations at handoff | 0 |
| Repair cost per instrument | Total repair spend / instruments repaired | Trending down |

## Weekly KPI Packet Structure

```
SPD WEEKLY KPI REPORT
Week of: [YYYY-MM-DD to YYYY-MM-DD]
Prepared by: [SPD Director role]
─────────────────────────────────────────────────────────────
QUALITY SUMMARY:
Tray error rate:        [current %] vs. [prior week %] → [▲ increase / ▼ decrease / — stable]
Missing instrument rate:[current %] vs. [prior week %] → [▲/▼/—]
Case cart accuracy:     [current %]
Bioburden events:       [N this week]
BI failures:            [N this week]
IUSS rate:              [current %] vs. [prior week %] → [▲/▼/—]

PRODUCTIVITY SUMMARY:
Instruments processed:  [N]
Average coverage ratio: [value]  Status: [adequate ≥1.10 / marginal / understaffed]
Overtime hours:         [N] ([%] of total)

QUALITY EVENTS REQUIRING ESCALATION:
[List events — tray name/date/finding, BI sterilizer/load, etc. Roles only, no names.]

OPEN ITEMS FROM PRIOR WEEK:
[Status of each unresolved item from last report]

TREND FLAGS:
[Any metric moving wrong direction 2+ consecutive weeks — flag with [TREND ALERT]]
─────────────────────────────────────────────────────────────
```

**Black spec separation:** KPI packet reports SPD data only. OR PPE compliance, IP rounding findings, and clinical staff performance are NOT included. Those belong in joint reports, not in the SPD operational KPI packet.

## Codebase Integration

| Module | Use |
|---|---|
| `lib/analytics/aggregator.ts` | Aggregation by time period and metric category |
| `lib/scoring/engine.ts` | Threshold evaluation and status color logic |
| `lib/reports/generator.ts` | Formatted report output |
| `lib/staffing/calculator.ts` | Coverage ratio computation |
| Supabase `audit_responses` | Compliance audit data source |
| Supabase `repair_cycles` | Repair cost aggregation for lifecycle analysis |

### KPI Packet Generation Sequence

1. Query Supabase `audit_responses` for the reporting period
2. Aggregate via `lib/analytics/aggregator.ts`
3. Apply thresholds via `lib/scoring/engine.ts`
4. Generate formatted output via `lib/reports/generator.ts`
5. Flag any alerts before delivery — route to spd-quality-gate

## Service Line Drill-Down

On request, or when tray error rate exceeds alert threshold:

```
SERVICE LINE QUALITY BREAKDOWN — [Period]
─────────────────────────────────────────────────────────────
Service Line     | Tray Errors | Missing Instr | Error Rate
Orthopedics      | [N]         | [N]           | [%]
Cardiovascular   | [N]         | [N]           | [%]
General Surgery  | [N]         | [N]           | [%]
Neurosurgery     | [N]         | [N]           | [%]
OB/GYN           | [N]         | [N]           | [%]
Endoscopy        | [N]         | [N]           | [%]
─────────────────────────────────────────────────────────────
Highest error rate: [service line] at [%]
Next step: route to spd-systems-connector for upstream cause analysis
```

## Shift-Level Breakdown

When error clustering by shift is needed (connects to spd-systems-connector staffing hypothesis):

```
SHIFT-LEVEL ERROR DISTRIBUTION — [Period]
─────────────────────────────────────────
Shift      | Lead   | Errors | Error Rate
Day        | [role] | [N]    | [%]
Evening    | [role] | [N]    | [%]
Night      | [role] | [N]    | [%]
─────────────────────────────────────────
Note: error rate by shift is a systems indicator, not a performance evaluation.
Route to spd-systems-connector if one shift is consistently above threshold.
```

## Trend Alert Protocol

When a metric moves in the wrong direction for 2+ consecutive periods:

1. Flag in KPI packet with `[TREND ALERT — [metric] rising for [N] consecutive weeks]`
2. Route to spd-systems-connector — do not propose a root cause in the analytics output
3. spd-systems-connector maps upstream causes
4. spd-quality-docs documents corrective action once cause is confirmed
5. spd-outcomes-tracker tracks whether the intervention worked

## Monthly Dashboard

Condensed for monthly leadership reporting (feeds spd-presentations):

```
SPD MONTHLY PERFORMANCE DASHBOARD — [Month YYYY]
─────────────────────────────────────────────────────────────
Quality: Tray error [%] | Missing instruments [%] | Case cart accuracy [%]
Safety:  BI failures [N] | Bioburden events [N] | IUSS rate [%]
Productivity: Coverage ratio avg [value] | OT rate [%]
Quality events this month: [N total — [N] Tier 1/2, [N] Tier 3/4]
CAPs open: [N] | CAPs closed this month: [N]
─────────────────────────────────────────────────────────────
Period-over-period: [improving / stable / declining] — [brief narrative]
```

---

## Anti-Patterns

- Do NOT mix OR or IP data into the SPD KPI packet — black spec separation is absolute
- Do NOT report a metric without comparing it to prior period — absolute numbers without trend are not actionable
- Do NOT propose root cause in the analytics output — data shows the symptom; spd-systems-connector finds the cause
- Do NOT wait for the next KPI cycle to flag a Class I safety event — positive BI or bioburden event triggers immediate escalation

## Wiring

**Called by:** spd-orchestrator (weekly KPI, monthly dashboard, capital justification data), spd-capital-justification (productivity and cost data), spd-staffing-model (coverage and overtime data)
**Calls:** spd-systems-connector (when trend alert is identified), spd-quality-docs (when safety metric breach requires event documentation), spd-quality-gate (before any KPI packet is delivered to leadership or IP)
