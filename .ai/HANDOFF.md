# SPD Intel — Handoff

## ✅ Latest checkpoint — ALL 3 SPRINTS COMPLETE (Survey Readiness OS build)

**Status:** The $100K-ARR build plan is implemented end-to-end. `npx tsc --noEmit` clean; `pnpm build` clean (25 routes). DB foundation verified with a live signup test.

### Sprint 2 — Defensibility loop (done)
- `lib/readiness/engine.ts` — pure facility readiness score (0–100) over 6 weighted factors (latest compliance .35, open crit/major findings .20, overdue CAPAs .15, aging .10, coverage .12, recency .08); bands ready≥85 / at-risk 65–84 / not-ready; graceful degradation + confidence; open `factors[]` for future layers.
- `lib/db/readiness.ts` — `getSnapshots`/`recordSnapshot`/`snapshotNow`/`getCurrentReadiness`. Snapshot written on audit completion (`app/checklist` handleComplete).
- **CAPA:** `FindingLifecycle` extended with owner picker (`lib/db/org.listOrgMembers`), due date, overdue badge, and evidence upload to `spd-evidence` via `lib/db/findings.ts` (signed-URL view/delete). `/findings` is now a CAPA workspace (overdue filter + due/overdue indicators).
- **Executive dashboard** (`app/(app)/dashboard`): `ReadinessHero` + `FactorBars` + recharts readiness trend + priority/overdue CAPA list + AI advisor.

### Sprint 3 — Sell-ready (done)
- **AI Readiness Advisor:** `app/api/generate-report` model swapped to `anthropic/claude-opus-4-8` (2500 tok) + new `buildReadinessPrompt` (4 `##` sections, JC/CMS/AAMI framing). `AIInsightsPanel` runs in advisor mode on the dashboard.
- **Survey PDF:** `@react-pdf/renderer` + `lib/pdf/SurveyReport.tsx` + `app/api/reports/survey-pdf/route.ts` (nodejs runtime, gathers data under RLS, streams PDF: score, factor breakdown, CAPA plan with owner/due/status, evidence index). "Download survey report" button on the dashboard.
- **Onboarding:** `app/(app)/onboarding` 3-step wizard (facility + survey date → first audit → readiness) + one-click **demo seed** (`lib/db/demo.ts`: 2 audits, an overdue critical + overdue major + resolved minor, ~45d survey date, backdated snapshots). First-run CTA on the dashboard.
- **Nav redesign:** `Sidebar` reordered (Dashboard, Audits, Checklists, Corrective Actions, Analytics, Reports), Import Data hidden, staffing/scheduler/thresholds/settings under a "Tools" group, real profile name+role badge, owner-only Admin link.

### Remaining / deferred
- `settings/page.tsx` org/department/user management still on localStorage (`org-storage`) — not yet DB-backed (invites out of MVP scope).
- Report history (`report-storage`) + CSV import (`import/page.tsx`, now hidden in nav) still localStorage.
- **Owner action:** add `ANTHROPIC_API_KEY` to `.env.local` before testing the advisor / AI reports.
- Aging-findings factor approximates age via due date (StoredFinding has no created_at surfaced); refine if needed.
- Not yet committed to git; stale `CLAUDE.md`/`BOOTSTRAP.md` Ruflo docs still present (slated for cleanup).

---

## Earlier checkpoint — Sprint 1 complete (Survey Readiness OS build)

**Active task:** Rebuilding SPD Intel as a "Survey Readiness Operating System" per the approved $100K-ARR plan (`~/.claude/plans/i-d-give-claude-code-lively-hippo.md`). Sprint 1 (Supabase foundation + localStorage→DB cutover + access gating) is DONE and verified.

**Goal:** Real Supabase persistence, multi-tenant via RLS, manual billing gate, on the path to the Survey Defensibility Loop (audit → finding → CAPA → evidence → readiness → reporting).

### What changed (Sprint 1)
- **DB home:** Supabase project `supabase-crimson-ladder` (ref `acouuzccqkcpyrckrgwg`), isolated in a dedicated **`spd` Postgres schema** (project is shared with other apps that own `public`/`students`).
- **Migrations applied** (also saved in `supabase/migrations/`, rewritten schema-qualified):
  - `001` schema + 10 tables · `002` RLS + `spd.get_my_org_id/role/dept_id` helpers · `003` `spd.handle_new_user()` signup trigger (guarded by `org_name` metadata so it never touches other apps' signups) · `004` readiness/CAPA/billing columns + `finding_evidence` + `readiness_snapshots` + `spd-evidence` private storage bucket & path-scoped policies · `005` platform-admin RLS override for owner email.
- **API exposure:** `alter role authenticator set pgrst.db_schemas = 'public, graphql_public, spd'` (PostgREST now serves `spd`). Verified reachable.
- **Supabase clients** pinned to `{ db: { schema: 'spd' } }` (`lib/supabase/client.ts`, `server.ts`).
- **Data-access layer `lib/db/*`** (audits, findings types, org, checklists, thresholds, types) — async, returns the same shapes the UI used. All pages + components cut OFF localStorage onto it: checklist (write), dashboard, audits, audits/[id]/results, findings, analytics, reports, all 4 checklists pages, FindingLifecycle, TrendComparison, settings/thresholds, aggregator.
- **Signup** now collects facility name → `org_name` metadata.
- **Access gating:** `(app)/layout.tsx` is now a server component that redirects orgs whose `subscription_status` ∉ {trial,active} to `/subscription` (new page, outside the gated group). New **`/admin`** page (owner-only via RLS) toggles each org's status/plan/renewal.

### Tests / checks run
- `npx tsc --noEmit` → clean.
- `pnpm build` → clean (23 routes compiled).
- **End-to-end signup test** via GoTrue API → trigger created org + dept (Central Sterile/CS) + profile (role=manager) + subscription_status=trial. Test data deleted afterward (orgs=0, profiles=0).

### Decisions
- Stay on crimson-ladder (free) over a new $10/mo project → forced the `spd` schema isolation.
- Evidence = CAPA-attached only (no standalone library in MVP).
- Billing = manual flag; no Stripe/Square.

### Known gaps / next steps (Sprint 2 + 3 not started)
- **Sprint 2:** CAPA workspace (owner/due/status + evidence upload to `spd-evidence`), `lib/readiness/engine.ts` (6 weighted factors incl. overdue-CAPA) + snapshot-on-complete, readiness dashboard Server Component (ReadinessHero/FactorBars/trend/coverage).
- **Sprint 3:** survey PDF (`@react-pdf/renderer`), AI Readiness Advisor redesign + model swap to `claude-opus-4-8`, onboarding wizard + demo-seed, nav redesign (demote staffing/scheduler, hide CSV import, real user/role badge).
- **Deferred (still on localStorage, intentional):** `settings/page.tsx` org/department/user management; report history (`report-storage`); CSV import (`import/page.tsx` — to be hidden in nav).
- **Owner action:** put `ANTHROPIC_API_KEY` in `.env.local` before testing the AI advisor. (Schema exposure was done at the role level; optionally mirror `spd` in Supabase Dashboard → Settings → API → Exposed schemas for durability.)
- Stale repo `CLAUDE.md`/`BOOTSTRAP.md` describe an unrelated "Ruflo/Masterbuilder" system — ignore; slated for deletion in cleanup.

### Git
- Branch `main`. Last commit `141114e`. Changes are **uncommitted** (no commit requested yet).

---
_(Older auto-generated checkpoints below were empty TODO stubs and have been superseded.)_

---
## Handoff — 2026-06-09 22:40:03 EDT

- Repo: /Users/terry/code/spd-compliance-app
- Branch: main
- Last commit: 141114e fix: guard middleware against missing Supabase env vars (500 on cold deploy)
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M app/(app)/analytics/page.tsx
 M app/(app)/audits/[id]/results/page.tsx
 M app/(app)/audits/page.tsx
 M app/(app)/checklists/[id]/edit/page.tsx
 M app/(app)/checklists/[id]/page.tsx
 M app/(app)/checklists/new/page.tsx
 M app/(app)/checklists/page.tsx
 M app/(app)/dashboard/page.tsx
 M app/(app)/findings/page.tsx
 M app/(app)/layout.tsx
 M app/(app)/reports/page.tsx
 M app/(app)/settings/thresholds/page.tsx
 M app/(auth)/signup/page.tsx
 M app/api/generate-report/route.ts
 M app/checklist/page.tsx
 M components/assessment/FindingLifecycle.tsx
 M components/assessment/TrendComparison.tsx
 M components/insights/AIInsightsPanel.tsx
 M components/layout/Sidebar.tsx
 M lib/analytics/aggregator.ts
 M lib/storage/audit-storage.ts
 M lib/supabase/client.ts
 M lib/supabase/middleware.ts
 M lib/supabase/server.ts
 M package.json
 M pnpm-lock.yaml
 M supabase/migrations/001_initial_schema.sql
 M supabase/migrations/002_rls_policies.sql
?? .ai/
?? app/(app)/admin/
?? app/(app)/onboarding/
?? app/api/reports/
?? app/subscription/
?? components/readiness/
?? lib/db/
?? lib/pdf/
?? lib/readiness/
?? supabase/migrations/003_profile_on_signup.sql
?? supabase/migrations/004_readiness_capa_billing.sql
?? supabase/migrations/005_platform_admin.sql
```

### Summary
- TODO: What changed?

### Decisions / assumptions
- TODO: Key choices Claude made.

### Next steps
- TODO: The next human/Hermes/Claude action.

### Blockers / warnings
- TODO: Anything unresolved, failing, risky, or needing the user.

---
## Handoff — 2026-06-10 06:48:41 EDT

- Repo: /Users/terry/code/spd-compliance-app
- Branch: main
- Last commit: 141114e fix: guard middleware against missing Supabase env vars (500 on cold deploy)
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M app/(app)/analytics/page.tsx
 M app/(app)/audits/[id]/results/page.tsx
 M app/(app)/audits/page.tsx
 M app/(app)/checklists/[id]/edit/page.tsx
 M app/(app)/checklists/[id]/page.tsx
 M app/(app)/checklists/new/page.tsx
 M app/(app)/checklists/page.tsx
 M app/(app)/dashboard/page.tsx
 M app/(app)/findings/page.tsx
 M app/(app)/layout.tsx
 M app/(app)/reports/page.tsx
 M app/(app)/settings/thresholds/page.tsx
 M app/(auth)/signup/page.tsx
 M app/api/generate-report/route.ts
 M app/checklist/page.tsx
 M components/assessment/FindingLifecycle.tsx
 M components/assessment/TrendComparison.tsx
 M components/insights/AIInsightsPanel.tsx
 M components/layout/Sidebar.tsx
 M lib/analytics/aggregator.ts
 M lib/storage/audit-storage.ts
 M lib/supabase/client.ts
 M lib/supabase/middleware.ts
 M lib/supabase/server.ts
 M next-env.d.ts
 M package.json
 M pnpm-lock.yaml
 M supabase/migrations/001_initial_schema.sql
 M supabase/migrations/002_rls_policies.sql
?? .ai/
?? app/(app)/admin/
?? app/(app)/onboarding/
?? app/api/reports/
?? app/subscription/
?? components/readiness/
?? lib/db/
?? lib/pdf/
?? lib/readiness/
?? supabase/migrations/003_profile_on_signup.sql
?? supabase/migrations/004_readiness_capa_billing.sql
?? supabase/migrations/005_platform_admin.sql
```

### Summary
- TODO: What changed?

### Decisions / assumptions
- TODO: Key choices Claude made.

### Next steps
- TODO: The next human/Hermes/Claude action.

### Blockers / warnings
- TODO: Anything unresolved, failing, risky, or needing the user.

---
## Handoff — 2026-06-10 06:53:26 EDT

- Repo: /Users/terry/code/spd-compliance-app
- Branch: main
- Last commit: 141114e fix: guard middleware against missing Supabase env vars (500 on cold deploy)
- Note: Claude Code stopped/finished a response. Fill in summary, decisions, next steps, and blockers.

### Git status
```
 M app/(app)/analytics/page.tsx
 M app/(app)/audits/[id]/results/page.tsx
 M app/(app)/audits/page.tsx
 M app/(app)/checklists/[id]/edit/page.tsx
 M app/(app)/checklists/[id]/page.tsx
 M app/(app)/checklists/new/page.tsx
 M app/(app)/checklists/page.tsx
 M app/(app)/dashboard/page.tsx
 M app/(app)/findings/page.tsx
 M app/(app)/layout.tsx
 M app/(app)/reports/page.tsx
 M app/(app)/settings/thresholds/page.tsx
 M app/(auth)/signup/page.tsx
 M app/api/generate-report/route.ts
 M app/checklist/page.tsx
 M components/assessment/FindingLifecycle.tsx
 M components/assessment/TrendComparison.tsx
 M components/insights/AIInsightsPanel.tsx
 M components/layout/Sidebar.tsx
 M lib/analytics/aggregator.ts
 M lib/storage/audit-storage.ts
 M lib/supabase/client.ts
 M lib/supabase/middleware.ts
 M lib/supabase/server.ts
 M next-env.d.ts
 M package.json
 M pnpm-lock.yaml
 M supabase/migrations/001_initial_schema.sql
 M supabase/migrations/002_rls_policies.sql
?? .ai/
?? app/(app)/admin/
?? app/(app)/onboarding/
?? app/api/reports/
?? app/subscription/
?? components/readiness/
?? lib/db/
?? lib/pdf/
?? lib/readiness/
?? supabase/migrations/003_profile_on_signup.sql
?? supabase/migrations/004_readiness_capa_billing.sql
?? supabase/migrations/005_platform_admin.sql
```

### Summary
- TODO: What changed?

### Decisions / assumptions
- TODO: Key choices Claude made.

### Next steps
- TODO: The next human/Hermes/Claude action.

### Blockers / warnings
- TODO: Anything unresolved, failing, risky, or needing the user.
