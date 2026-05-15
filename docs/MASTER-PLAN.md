# Master Plan — SPD Compliance App

**Product:** Sterile Processing Department quality analytics platform
**Repo:** terrysc107-cloud/spd-compliance-app
**Branch:** claude/setup-compliance-app-ogzKb
**Stack:** Next.js App Router + Supabase + Vercel AI SDK + TypeScript
**Deploy:** Vercel (preview live, production on Phase 11)

---

## Operating Principle

One phase active at a time. Each phase fully complete before the next begins.
Verifier must sign off before advancing. No exceptions.

---

## Phase Map

| # | Phase | Lead Agent | Status |
|---|-------|-----------|--------|
| 01 | Product Clarity | Product Architect | ✅ COMPLETE |
| 02 | Core User Flow | Flow Architect | ⬜ NEXT |
| 03 | Frontend Foundation | Frontend Builder | ⬜ |
| 04 | Core Experience Completion | Frontend Builder | ⬜ |
| 05 | Content & Resource System | Content Systems Builder | ⬜ |
| 06 | Assessment & Feedback Layer | Assessment Builder | ⬜ |
| 07 | Offer & Monetization | Offer Strategist | ⬜ |
| 08 | Backend & Data Reality | Backend Builder | ⬜ |
| 09 | Intelligence & Personalization | Systems Architect | ⬜ |
| 10 | Production Hardening | Verifier | ⬜ |
| 11 | Launch Readiness | Chief Builder | ⬜ |

---

## Phase Contracts

### Phase 02 — Core User Flow
**Goal:** App has a real navigation shell and all routes exist (even if empty).
**Scope:**
- Sidebar nav component with all 8 sections: Dashboard, Checklists, Audits, Findings, Analytics, Import, Reports, Settings
- Routes: `/dashboard`, `/checklists`, `/audits`, `/findings`, `/analytics`, `/import`, `/reports`, `/settings`
- Role-aware nav visibility (Supervisor=own data, Manager=team, Director=org, QA=all+settings)
- First-time onboarding prompt (if no audits exist, show "Create your first checklist" CTA)
- `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx`
- Breadcrumb component for nested routes
**Out of scope:** Supabase, auth, real data, charts
**Definition of Done:**
- [ ] All 8 routes return valid pages (not 404)
- [ ] Nav renders on every page, highlights active route
- [ ] Error and loading states present
- [ ] No console errors on any route
- [ ] Committed and pushed

### Phase 03 — Frontend Foundation
**Goal:** Codebase has a real component library and design system. No duplicate inline styles.
**Scope:**
- `pnpm install` verified, dev server starts
- `components/ui/`: Button, Card, Badge, ProgressBar, Input, Textarea, Select
- `components/layout/`: Nav, PageShell, Breadcrumb, Sidebar
- `lib/constants/design-tokens.ts` — single source of truth for all colors/spacing/radius
- `globals.css` with CSS custom properties
- Split `checklist/page.tsx` (785 lines) into: AuditModeSelector, SectionPicker, ChecklistItem, GapReport, AuditReport
- Move checklist data to `lib/data/checklist-sections.ts` and `lib/data/severity-map.ts`
- Install `recharts` (needed for Phase 09 analytics)
- `.env.example` documenting all required env vars
**Out of scope:** Supabase, new features, auth
**Definition of Done:**
- [ ] Dev server starts without errors (`pnpm dev`)
- [ ] No file exceeds 500 lines
- [ ] All UI primitives in `components/ui/`
- [ ] Zero duplicate inline style objects for colors
- [ ] Checklist app still works identically (no regression)
- [ ] Committed and pushed

### Phase 04 — Core Experience Completion
**Goal:** Every interaction in the audit flow is complete and polished.
**Scope:**
- Audit session: progress persistence in localStorage (survives refresh)
- Audit results page `/audits/[id]/results`: score card, gap analysis table, findings list
- Findings list page `/findings`: filterable by severity, status, date
- Finding detail: corrective action text field, status toggle (Open/In Progress/Resolved)
- Dashboard page: score summary cards, recent audits list, open findings count
- Section scoring: weighted compliance %, color-coded thresholds
- Print stylesheet for audit report
**Out of scope:** Real database persistence (still localStorage), auth, charts
**Definition of Done:**
- [ ] Audit survives browser refresh (localStorage)
- [ ] Gap analysis auto-generates from failed items
- [ ] Findings can be updated with corrective action and status
- [ ] Dashboard shows real counts from localStorage data
- [ ] Print view renders cleanly
- [ ] Committed and pushed

### Phase 05 — Content & Resource System
**Goal:** Checklist system is dynamic and extensible, not hardcoded.
**Scope:**
- Checklist template library page `/checklists`: list all templates with category filter
- Checklist builder UI `/checklists/new`: create custom checklists, add/remove/reorder items
- Clone existing checklist, save as new template
- Version field on checklists (v1, v2, etc.)
- Response type support: pass-fail, yes-no, numeric (0-100), text
- Item weight field (affects scoring calculation)
- AAMI standard reference link per item (external URL, opens in new tab)
- Pre-loaded templates: AAMI ST79, ST91, ST108, and one custom example
**Out of scope:** Database persistence (still in-memory/localStorage), auth
**Definition of Done:**
- [ ] User can create a custom checklist from scratch
- [ ] User can clone and modify an existing template
- [ ] All 4 pre-loaded templates are selectable
- [ ] Item weights affect section scores
- [ ] Committed and pushed

### Phase 06 — Assessment & Feedback Layer
**Goal:** Quality loop is closed — scoring, thresholds, findings lifecycle, and trend comparison all work.
**Scope:**
- Configurable scoring thresholds per org (default: <70% = fail, 70-89% = marginal, 90%+ = pass)
- Settings page `/settings/thresholds`: org can set their own pass/fail cutoffs
- Auto-severity from section + response (Critical for sterilization failures, Major for decon, Minor for documentation)
- Finding lifecycle state machine: Open → In Progress → Resolved (with timestamp at each transition)
- Corrective action accountability: who resolved it + when
- Trend comparison widget: current audit score vs. previous audit vs. 90-day rolling average
- Audit history table on `/audits` with sort/filter (by date, section, score, auditor)
**Out of scope:** Database persistence, auth, full analytics charts
**Definition of Done:**
- [ ] Threshold config is stored and applied to scoring
- [ ] Auto-severity correctly assigns Critical/Major/Minor from section context
- [ ] Finding status transitions are logged with timestamps
- [ ] Trend comparison shows delta from previous audit
- [ ] Committed and pushed

### Phase 07 — Offer & Monetization
**Goal:** Org/account structure defined; free vs. paid tiers gated if applicable.
**Scope:** Evaluate with user — if internal tool, this phase focuses on multi-department org structure instead of billing.
- Org settings page: department/unit configuration, user invitation flow (UI only, no real email in this phase)
- Role assignment UI for managers: set a user's role within the org
- Department-level data scoping (Supervisor sees only their department's audits)
**Out of scope:** Real payment processing, Stripe, billing
**Definition of Done:**
- [ ] Org structure and department scoping defined in data model
- [ ] Role assignment UI exists
- [ ] Department filter applies to all list views
- [ ] Committed and pushed

### Phase 08 — Backend & Data Reality
**Goal:** Everything persists. Real auth, real database, real file storage.
**Scope:**
- Supabase project connected (`@supabase/supabase-js` installed)
- Schema migration for all 9 entities (Org, User, Checklist, ChecklistItem, Audit, AuditResponse, Finding, ImportedDataset, Report)
- Row-Level Security policies: Supervisors see own department, Directors see org-wide, QA sees all
- Supabase Auth: email/password sign-up and login, session management
- `middleware.ts`: protect all `/dashboard*`, `/audits*`, `/reports*`, `/checklists*`, `/findings*`, `/analytics*`, `/import*` routes
- Replace all localStorage with Supabase reads/writes
- CSV import: upload → column mapper UI → insert to `imported_datasets` table
- Report export: generate PDF via API route, store in Supabase Storage, return download URL
- API route hardening: zod input validation, auth checks, error handling
**Out of scope:** AI insights upgrade, staffing calculator
**Definition of Done:**
- [ ] Login/logout works
- [ ] All audit data persists across sessions and devices
- [ ] RLS tested: Supervisor cannot see another department's data
- [ ] CSV import ingests and displays data
- [ ] Report PDF downloads successfully
- [ ] No unprotected routes
- [ ] Committed and pushed

### Phase 09 — Intelligence & Personalization
**Goal:** Data becomes insight. Charts, trends, staffing tools, and AI-powered recommendations.
**Scope:**
- Analytics page `/analytics`: compliance trend line chart (Recharts), top failing items bar chart, section heatmap, auditor breakdown table
- Drill-down from chart point → individual audit
- Staffing Calculator `/settings/staffing`: FTE input, shift hours, case volume → coverage ratio → risk flag (understaffed/marginal/adequate)
- Smart Scheduler: map case volume peaks against staffing → surface overload risk days
- AI Insights Engine upgrade: structured prompt using real Supabase audit data → prioritized action items with specific evidence
- Director org-wide dashboard: roll-up compliance score across all departments, open findings by severity
**Out of scope:** External API integrations
**Definition of Done:**
- [ ] Trend chart renders from real Supabase data
- [ ] Staffing calculator returns a coverage ratio and risk level
- [ ] AI insights reference actual audit findings (not generic text)
- [ ] Director view shows org-wide roll-up
- [ ] Committed and pushed

### Phase 10 — Production Hardening
**Goal:** App is ready for real users. Secure, fast, tested, monitored.
**Scope:**
- E2E smoke test scripts for: login → run audit → generate report → export PDF
- Regression test: existing checklist app still works
- Lighthouse audit: Performance ≥ 80, Accessibility ≥ 90
- Bundle size check: no unnecessary large dependencies
- Security review: no API keys in client bundle, RLS covers all tables, input sanitization on all forms
- Error monitoring: Vercel error logs configured
- All env vars documented in `.env.example`
- HTTPS enforced on all routes
**Definition of Done:**
- [ ] Smoke tests pass
- [ ] Lighthouse scores met
- [ ] No exposed secrets in client bundle
- [ ] All 24 Phase 01 DoD items green
- [ ] Committed and pushed

### Phase 11 — Launch Readiness
**Goal:** Ship it.
**Scope:**
- Final Chief Builder review of all phase outputs
- README updated with: what it is, how to deploy, env var reference
- Vercel production deployment triggered
- DNS / custom domain configured (if applicable)
- Memory files archived: DECISIONS.md, LEARNINGS.md, PATTERNS.md all current
- PR merged to main
**Definition of Done:**
- [ ] Production URL returns 200 on all core routes
- [ ] Login works on production
- [ ] No console errors on production
- [ ] PR merged
- [ ] Done

---

## Standard Phase Workflow (every phase)

1. Read `memory/DECISIONS.md` + `memory/LEARNINGS.md`
2. Spawn lead agent + support agents in one message (all `run_in_background: true`, all named)
3. Wait for all completion notifications — do not poll
4. Spawn Verifier agent — checks against this phase's Definition of Done
5. If pass: commit, push, update phase status, start next phase
6. If gaps found: spawn fix agents, re-verify (max 2 retry loops before escalating)
7. Learning Steward writes to `memory/LEARNINGS.md`

## Handoff Format (every agent uses this)

```
Context: Phase active, what I was asked to do.
Work Completed: What I found or changed (file paths + line counts).
Risks: What could still go wrong.
Decision Needed: What next agent or Chief Builder must decide.
Recommended Next Step: Single best move.
```
