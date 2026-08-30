# SPD Ready — Claude Code Execution Plan

**Drop this at the repo root as `PLAN.md`. Companion doc: `spd-ready-product-spec.md` (place at repo root as `SPEC.md`).**

**Objective of this plan:** Audit what exists, decide keep/kill honestly, reposition the repo toward a demo-ready prototype, then build it.

**Read this whole file before running anything. Do not skip to Stage 3.**

---

## Operating rules

1. **Stop at every STOP.** Report, wait for approval, then continue. Do not chain stages.
2. **Do not delete anything until Stage 1 is approved.** Audit first, judge second, cut third.
3. **Report what is actually there, not what the plan hopes is there.** If the repo is emptier or messier than expected, say so plainly. An inflated audit costs more than an ugly one.
4. **This is a demo prototype, not production.** Optimize for demo believability and iteration speed. Architecture purity is explicitly not the goal at this stage.
5. If any instruction here conflicts with `SPEC.md`, this file wins for the prototype. `SPEC.md` governs the production build later.

---

## Stage 0 — Orient

```
Read SPEC.md in full before touching code.

Then inventory the repo without changing anything:
- Full file tree, excluding node_modules and .next
- Dependency list from package.json with versions, and flag anything
  outdated or abandoned
- Framework and version actually in use
- Whether a Supabase project is wired up, and whether migrations exist
- Any auth implementation present
- Any database schema, in migrations or in code
- Any UI beyond default scaffolding
- Environment variables referenced anywhere in the codebase
- Git history: commit count, date of last commit, branches

Output a single inventory table: file/module | purpose | lines |
state (working / partial / dead / scaffold-default).

Do not modify, delete, or install anything. Report only.
STOP.
```

---

## Stage 1 — Audit and keep/kill

```
Using the Stage 0 inventory, assess each item against the target:
a Next.js + Supabase + Tailwind demo prototype for SPD Ready per SPEC.md.

Classify every file and dependency into exactly one bucket:
- KEEP AS-IS — usable, no changes needed
- KEEP AND REFACTOR — usable shape, wrong details (state what changes)
- KILL — dead, default scaffolding, or points the wrong direction
- MISSING — required by the prototype and does not exist yet

Then answer these directly:
1. Is it faster to reposition this repo or to start clean? Give a
   straight recommendation with reasoning. If starting clean is
   faster, say so — sunk cost is not an argument.
2. Does any existing schema conflict with the SPEC.md data model?
   Where specifically?
3. Are there security or config problems that must be fixed regardless
   of direction (exposed keys, committed .env, permissive defaults)?
4. What is the single largest obstacle to a working demo?

Output: the classification table, the four answers, and an estimate of
effort to reach a working demo from here.

Change nothing yet. STOP.
```

---

## Stage 2 — Reposition

Run only after Stage 1 is approved and a keep-vs-clean decision is made.

```
Execute the repositioning:
1. Remove everything marked KILL. List each deletion.
2. Fix any security or config issues identified in Stage 1, first.
3. Set the baseline: Next.js (App Router), TypeScript, Tailwind,
   Supabase client. Update or install dependencies as needed.
4. Establish the project structure:
   /app        — routes
   /components — UI
   /lib        — supabase client, utilities
   /supabase   — migrations, seed
   /types      — shared types
5. Create SPEC.md and PLAN.md at root if not already present.
6. Add .env.example with every required variable, and confirm .env
   is gitignored.
7. Commit as a single checkpoint: "reposition: prototype baseline"

Do not build features in this stage.
Report the resulting file tree and confirm the app builds and runs clean.
STOP.
```

---

## Stage 3 — Demo schema and seed

```
Build the prototype database. This is a DEMO schema — no RLS, no
multi-tenancy, single seeded organization.

Tables (simplified from SPEC.md section 4):
  users, roles, facilities
  sops, sop_versions
  ifus, ifu_versions
  competencies
  paths, assignments
  records
  expirations

Two constraints carry over from SPEC.md and are non-negotiable even
in the prototype, because the demo depends on them:
- assignments and records store item_version_id, not just item_id
- records is append-only in application logic (no update/delete paths)

SEED a believable department mid-cycle:
- 24 techs across 3 shifts, realistic names, mixed hire dates
- Roles: Tech I, Tech II, Tech III, Lead, Educator, Manager
- 3 travelers with active contracts, 1 recent new hire in onboarding
- 8 SOPs across Decontam, Assembly & Packaging, Sterilization,
  Sterile Storage & Distribution
- 6 IFUs, 2 with a pending version update
- 5 competencies with staggered expiry: some current, some expiring
  in 30 days, two already overdue
- Assignment and record history producing roughly 78% overall
  compliance

The seed must look like a real department: not all green, not all
broken. Compliance numbers should make a manager uncomfortable but
not incredulous.

All SOP, IFU, and competency content must be ORIGINAL. Do not
reproduce or paraphrase AAMI ST79, ST91, ST108, or HSPA material.
Reference standards by citation only.

Report the seed summary and the resulting dashboard numbers. STOP.
```

---

## Stage 4 — The two demo-critical mechanics

These are the pitch. Build them before any other screen.

```
MECHANIC 1 — IFU cascade

Publishing a new ifu_version must, in a single transaction:
  a. supersede the prior version (set superseded_at)
  b. mark every acknowledgment record pinned to the prior version stale
  c. generate assignments for every user in every role linked to that
     IFU, source='ifu_update', due date derived from effective_date
  d. flip the manager dashboard to a red compliance state showing
     count of non-acknowledged techs and days until effective date

Must complete and render in under 3 seconds. This runs live during a
sales demo — it cannot lag.

MECHANIC 2 — Survey export

Single button generates a downloadable PDF containing:
  - Roster: name, role, shift, hire date, current competency status
  - Per-tech acknowledgment record with IFU/SOP VERSION NUMBERS and
    timestamps
  - Competency validations with validator name and signature date
  - Certification status with expiry dates
  - Date range filter applied to all sections
  - Generated-on timestamp and facility name in the header

The version numbers are the entire point of this document. Make them
visually prominent.

Build both. Verify by publishing a seeded IFU update end-to-end and
generating a PDF for a 12-month range. STOP and report with the
generated PDF.
```

---

## Stage 5 — Demo screens

```
Five screens. Role switching via a header dropdown (Tech / Educator /
Manager) — no real auth.

1. MANAGER DASHBOARD (default landing)
   - Red IFU alert banner, prominent, above the fold
   - Overall compliance %, by area, by shift
   - Competencies expiring in 30/60/90
   - Time-to-competency for recent hires
   - Overdue assignments list

2. IFU LIBRARY
   - Device / manufacturer / current version / effective date /
     acknowledgment status
   - Publish-new-version flow (triggers Mechanic 1)
   - Version history per device

3. TECH VIEW (mobile width, ~390px)
   - My assignments with due dates
   - Read a SOP
   - Acknowledge an IFU, signature capture, record written

4. EDUCATOR COMPETENCY VALIDATION (tablet width, ~820px)
   - Checklist with pass/fail per line item
   - Dual signature: learner and validator
   - Writes record, sets next expiry

5. EXPORT
   - Date range, area, and individual filters
   - Generate button (triggers Mechanic 2)

Design direction: clinical and credible. Dense information, clear
hierarchy, no consumer-app whimsy. This is shown to hospital managers.
Red/amber/green compliance states must be legible at a glance and
must not rely on color alone.

Every screen must be presentable full-screen on a laptop during a
live demo.
STOP and report with screenshots of all five.
```

---

## Stage 6 — Demo hardening

```
1. Add a "Reset Demo" action that restores seed state in one click.
   The demo will be run repeatedly — it must be re-runnable in
   seconds without a redeploy.
2. Verify the full 6-step demo narrative runs end to end without
   errors:
   dashboard (red) -> drill in -> publish IFU v5 -> assignments fire
   -> tech acknowledges on mobile -> educator validates competency
   -> export PDF
3. Deploy to Vercel. Confirm the live URL runs the full narrative.
4. Time the run. Target under 6 minutes.
5. Write DEMO.md: the click-by-click script, plus known limitations
   to disclose honestly if a prospect asks what is real.

Report the live URL and the timed run. STOP.
```

---

## Out of scope for the prototype

Do not build, and do not suggest building: RLS, multi-tenancy, real
authentication, Stripe or billing, email or cron reminders, file
parsing or OCR of uploaded IFUs, a full quiz bank, corrective actions,
certification tracking, integrations of any kind.

All of that belongs to the production build in `SPEC.md` Phases 0–8,
after demand is validated.

---

## Definition of done

- Live Vercel URL running the full 6-minute narrative without error
- IFU cascade fires visibly in under 3 seconds
- Survey export produces a real PDF with visible version numbers
- Demo resets in one click
- `DEMO.md` written, including honest disclosure of what is simulated
- All seeded content original, no standards material reproduced
