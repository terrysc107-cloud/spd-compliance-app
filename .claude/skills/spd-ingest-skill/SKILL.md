---
name: "SPD Ingest Skill"
description: "Data ingestion and normalization pipeline skill for SPD system data. Use when: importing a SQ Track CSV export into the Supabase audit_responses or related tables, parsing an instrument repair log for lifecycle cost analysis, ingesting a sterilizer load log for BI tracking, normalizing inconsistent instrument names from a vendor export to the spd-catalog-agent naming standard, importing case cart data from OR scheduling systems, processing a batch instrument count sheet update, validating imported data against the Supabase schema before committing, or any workflow requiring raw SPD data from external systems to be cleaned, normalized, and stored. Integrates with lib/csv/parser.ts, lib/supabase/client.ts, and the spd-catalog-agent naming standard. Validate before commit — never ingest dirty data into production tables."
---

# SPD Ingest Skill

## What This Skill Does

Manages the intake, normalization, validation, and storage of raw SPD data from external systems (SQ Track CSV exports, OR scheduling data, repair logs, sterilizer load records). Bridges the gap between raw operational data and the clean Supabase schema that drives analytics, reporting, and decision support. All data is validated against schema and naming standards before any write to production tables.

## Data Sources and Target Tables

| Source | Format | Target Table | Normalization Required |
|---|---|---|---|
| SQ Track instrument export | CSV | `audit_responses` / instrument inventory | Naming standard (spd-catalog-agent) |
| SQ Track repair log | CSV | `repair_cycles` | Instrument name normalization, cost parsing |
| Sterilizer load log | CSV / manual | `sterilization_records` (if exists) | BI result parsing, cycle parameter validation |
| OR case schedule | CSV | `case_schedule` (if exists) | Instrument name, service line mapping |
| Count sheet data | CSV / manual | `checklists` | Tray name, instrument list, revision tracking |
| Competency records | CSV | `staff_competency` (if exists) | Role normalization, date formatting |

[NEEDS INPUT FROM TERRY: Confirm actual Supabase table names and field names from the production schema — the names above are based on the codebase exploration but need validation against the live schema]

## Ingestion Pipeline

### Step 1 — Receive and Inspect the File

```
INGEST REQUEST
File name: [filename]
Source: [SQ Track export / OR scheduling / repair log / other]
Format: [CSV / Excel / manual entry]
Row count: [N]
Date range covered: [YYYY-MM-DD to YYYY-MM-DD]
Target table: [Supabase table name]
─────────────────────────────────────────────────────────────
Pre-ingest checks:
□ File encoding is UTF-8 or ASCII (not binary)
□ Headers match expected column names
□ No empty required fields in header row
□ Date fields are parseable (YYYY-MM-DD preferred)
□ No PII fields that should not enter the system
```

### Step 2 — Normalize Instrument Names

All instrument names must conform to the spd-catalog-agent naming standard before any database write:

**Format:** `[Category] [Manufacturer?] [Descriptor] [Size] [Orientation/Type]`

Normalization rules (apply via `lib/csv/parser.ts`):
- Abbreviations → expanded: "SC" → "Scissors", "FR" → "Forceps Ring", "NH" → "Needle Holder"
- Fractions → decimal: "5-1/2\"" → "5.5in"
- All-caps → title case: "MAYO SCISSORS" → "Scissors Mayo"
- Trailing descriptors → standard position: "Straight Mayo 5.5" → "Scissors Mayo Straight 5.5in"
- Manufacturer codes → verified against catalog: "KS" → confirm Karl Storz or other MFR

Flag any instrument name that cannot be normalized automatically:

```
NORMALIZATION FLAG
Row: [row number]
Original name: [as it appears in source file]
Attempted normalization: [what the parser produced]
Reason for flag: [abbreviation unknown / manufacturer ambiguous / size format unrecognized]
Action required: Manual review before ingest — route to spd-catalog-agent
```

### Step 3 — Schema Validation

Validate every row against the target table schema before write:

```
SCHEMA VALIDATION CHECK
Table: [target table name]
─────────────────────────────────────────────────────────────
Required fields present: Y / N  [list any missing]
Field types match: Y / N  [list any type mismatches]
Foreign key references valid: Y / N  [list any broken references]
Duplicate detection: [N duplicates found — list if > 0]
Date range plausible: Y / N  [flag dates outside expected range]
─────────────────────────────────────────────────────────────
Validation result: PASS / FAIL / PASS WITH FLAGS
```

Do not write to production tables if validation result is FAIL.

### Step 4 — Dry Run

Before committing to production:
1. Run insert as a transaction with rollback
2. Confirm row count matches expectation
3. Spot-check 5 random rows for data integrity
4. Confirm no constraint violations

### Step 5 — Commit and Log

```
INGEST COMPLETION LOG
Date: [YYYY-MM-DD HH:MM]
File: [filename]
Source: [origin]
Target table: [table name]
Rows processed: [N]
Rows committed: [N]
Rows flagged/excluded: [N]   Reason: [if any]
Normalization flags resolved: [N]
Normalization flags pending manual review: [N]
─────────────────────────────────────────────────────────────
Committed by: [role]
Rollback available until: [timestamp + 24 hours]
```

## SQ Track Export Handling

SQ Track CSV exports may contain:
- Instrument catalog data (name, catalog number, SQ Track ID, tray assignment)
- Repair cycle records (instrument, date, vendor, issue, cost)
- Processing records (tray, date, sterilizer, load, tech, cycle parameters)

### SQ Track Catalog Import Workflow

1. Export from SQ Track: [NEEDS INPUT FROM TERRY: actual SQ Track export menu path and field names]
2. Run through normalization (Step 2)
3. Compare against existing Supabase instrument records — identify new, changed, and retired instruments
4. Route new instruments to spd-catalog-agent for formal catalog entry before committing
5. Route retired instruments to spd-instrument-lifecycle for retirement documentation before removing from active records
6. Commit normalized, validated records

### SQ Track Repair Log Import

Pull for spd-analytics and spd-capital-justification:
- Map to `repair_cycles` table: instrument_id, date, vendor, issue_description, cost, cause_category
- Compute running totals per instrument for lifecycle analysis
- Flag instruments where cumulative repair cost ≥ 40% of replacement cost

## Codebase Integration

| Module | Function |
|---|---|
| `lib/csv/parser.ts` | CSV parsing, field extraction, type coercion |
| `lib/supabase/client.ts` | Supabase connection and write operations |
| `import-storage.ts` (if present) | Staging area for pre-validation data |
| `lib/analytics/aggregator.ts` | Post-ingest aggregation confirmation |

Query pattern for validation check:
```typescript
// Confirm row count post-commit
const { count } = await supabase
  .from('target_table')
  .select('*', { count: 'exact', head: true })
  .gte('created_at', ingestTimestamp)
```

## SAG Client Data Ingestion

When ingesting data for a SAG client engagement:
1. Apply anonymization before any data enters the system — use the spd-client-onboarding anonymization protocol
2. Assign the client code (SAG-YYYY-NNN) to all records
3. Store in a client-specific schema or with a client_id foreign key
4. Confirm no facility-identifying fields are stored in plain text

---

## Anti-Patterns

- Do NOT write to production tables before completing schema validation — validate, then commit
- Do NOT ingest instrument names that have not been normalized to the spd-catalog-agent standard
- Do NOT process SAG client data without applying anonymization first
- Do NOT skip the dry run step — a bad ingest that commits 10,000 rows is harder to fix than one that did not commit
- Do NOT resolve normalization flags by guessing — route to spd-catalog-agent for any ambiguous instrument name

## Wiring

**Called by:** spd-orchestrator (data import requests), spd-client-onboarding (client SQ Track data for baseline PRA), spd-analytics (data sourcing for KPI generation)
**Calls:** spd-catalog-agent (instrument name normalization and new instrument entry), spd-instrument-lifecycle (retirement documentation for instruments flagged in import), spd-quality-gate (before any client data import is confirmed complete)
