# Patterns

## Phase Execution Pattern (Masterbuilder Standard)

For every phase, follow this sequence exactly:

```
1. Read memory/DECISIONS.md + memory/LEARNINGS.md (always, no exceptions)
2. Spawn lead agent (named, background: true)
3. Spawn support agents in same message (named, background: true)
4. STOP — wait for all agent completion notifications
5. Spawn Verifier agent — reviews outputs against phase Definition of Done
6. If Verifier PASSES: commit + push, update phase status in DECISIONS.md, start next phase
7. If Verifier FINDS GAPS: spawn fix agents, re-verify (max 2 retry loops)
8. Learning Steward writes to memory/LEARNINGS.md after every phase
```

## Agent Naming Convention

```
lead-phaseNN       e.g. lead-phase02
support-phaseNN-a  e.g. support-phase03-a
verifier-phaseNN   e.g. verifier-phase03
```

## Commit Pattern Per Phase

```bash
git add -A
git commit -m "feat(phaseNN): <description>\n\nhttps://claude.ai/code/session_01BzcD7Kbr9RdSJde89PsvGC"
git push -u origin claude/setup-compliance-app-ogzKb
```

Never commit .env files. Never commit node_modules.

## File Size Rule

No file may exceed 500 lines. If a file approaches 400 lines, split it before adding more.

## Tech Stack (confirmed, do not deviate)

- Next.js App Router (already installed)
- Supabase (auth + database + storage) — install in Phase 08
- Vercel AI SDK v6 (already installed, route at /api/generate-report)
- TypeScript strict mode (already configured)
- Recharts — install in Phase 03 for analytics
- pnpm as package manager

## Design System (do not change without Design Auditor approval)

```
Background:    #05091a
Accent blue:   #3b82f6
Accent indigo: #6366f1
Accent purple: #a78bfa
Text primary:  #ffffff
Text muted:    #94a3b8
Danger:        #ef4444
Warning:       #eab308
Success:       #22c55e
Border:        rgba(255,255,255,0.08)
Radius sm:     8px | md: 12px | lg: 16px | xl: 20px | pill: 99px
```

## Data Model (9 core entities — do not add without phase contract)

Org → User, Checklist, Audit, Report, ImportedDataset
Checklist → ChecklistItem, Audit
Audit → AuditResponse, Finding
Finding → corrective action fields (on Finding itself)

## Phase Status Tracking

After each phase completes, update DECISIONS.md "### Phase Status" section:
- IN PROGRESS → COMPLETE with date
- Add next phase as IN PROGRESS

---

## Phase 09 — Recharts Chart Patterns

**ResponsiveContainer is mandatory.**
Every chart must be wrapped in `<ResponsiveContainer width="100%" height={300}>`. Using fixed pixel
`width`/`height` directly on `LineChart` or `BarChart` prevents responsive layout.

**Horizontal bar chart axis config.**
`BarChart layout="vertical"` requires:
```tsx
<XAxis type="number" />
<YAxis type="category" dataKey="name" width={200} />
```
Swapping `layout` alone without adjusting axis types produces a blank chart.

**Recharts onClick type cast.**
Mouse event handlers on chart elements do not expose `activePayload` in TypeScript public types.
Cast to `any`:
```tsx
onClick={(data: any) => { if (data?.activePayload?.[0]) { ... } }}
```
Do not import internal Recharts types — they are not part of the public API.

**Empty state guard before charts.**
Always render a fallback component when the data array is empty:
```tsx
{trendData.length < 2 ? <EmptyState /> : <ResponsiveContainer>...</ResponsiveContainer>}
```

---

## Phase 09 — AI Insights Panel Pattern

**Reuse `/api/generate-report` via `checklistData.profile` injection.**
The legacy `checklistData.profile` field accepts a freeform string. Pass a fully structured prompt
there to get audit-aware AI output without creating a new endpoint.

**AbortController for regeneration.**
Store the controller in a `useRef`. Call `.abort()` before each new fetch:
```ts
const controllerRef = useRef<AbortController | null>(null)
if (controllerRef.current) controllerRef.current.abort()
controllerRef.current = new AbortController()
fetch('/api/generate-report', { signal: controllerRef.current.signal, ... })
```
This prevents stale responses from overwriting newer ones on rapid regeneration.

---

## Phase 09 — Staffing Calculator Formula

```
availableMinutesPerDay = (fteCount × hoursPerShift × 60 × shiftsPerWeek) / 5
coverageRatio = availableMinutesPerDay / (dailyProcedures × minutesPerProcedure)
```

Status thresholds (encoded as named constants in `lib/staffing/calculator.ts`):
- `coverageRatio >= 1.1` → adequate
- `0.9 <= coverageRatio < 1.1` → marginal
- `coverageRatio < 0.9` → understaffed

`fteGap = Math.ceil(requiredFte - fteCount)` where `requiredFte` is back-calculated from target ratio.

---

## Phase 09 — Analytics Data Inclusion Rule

`buildSectionHeatmap` excludes any audit that does not have `auditScore.sections` populated.
Only audits created under Phase 06+ carry this field (weighted scoring engine).
Pre-Phase-06 audits are silently excluded — including them with approximated scores would corrupt averages.

---

## Phase 10 — Auth Guard Pattern (Middleware)

`lib/supabase/middleware.ts` exports `updateSession(request)`. It:
1. Calls `supabase.auth.getUser()` to refresh the session cookie on every request.
2. Redirects unauthenticated users to `/login` for any path not in the public allowlist.
3. Redirects authenticated users away from `/login` and `/signup` to `/dashboard`.

The root `middleware.ts` delegates entirely to `updateSession`. The matcher excludes:
`_next/static`, `_next/image`, and `favicon.ico`.

**RLS helper functions pattern.**
Three `security definer` SQL functions resolve identity in all Supabase policies:
- `get_my_org_id()` — returns the caller's `organization_id` from `profiles`
- `get_my_role()` — returns the caller's `role` from `profiles`
- `get_my_dept_id()` — returns the caller's `department_id` from `profiles`

All RLS policies call these helpers; no policy has an inline `profiles` subquery.
Supervisor policies scope to `department_id = get_my_dept_id()`.
Manager / director / qa policies scope to `organization_id = get_my_org_id()`.

---

## Phase 10 — SSR Guard (Universal)

All localStorage modules check for server context before any read or write:
```ts
if (typeof window === 'undefined') return defaultValue
```
Copy this guard into every future storage utility. Next.js SSR will throw at build time without it.
Pattern is consistent across: `audit-storage.ts`, `checklist-storage.ts`, `threshold-storage.ts`,
`import-storage.ts`, `report-storage.ts`, `org-storage.ts`.
