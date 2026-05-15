# SPD Compliance App

Quality analytics platform for Sterile Processing Department supervisors, managers, and directors.

---

## What It Does

- **Audit Checklists and Questionnaires** — create custom checklists or use built-in AAMI ST79/ST91/ST108 templates; run audits, save results, and repeat on any schedule.
- **Audit Gap Analysis** — auto-generate findings from failed checklist items; severity-weighted (critical / major / minor) with corrective action tracking.
- **Compliance Trend Analytics** — Recharts line chart of compliance over time, top failing items bar chart with severity color coding, section heatmap, auditor breakdown table.
- **AI Quality Insights** — Claude-powered recommendations generated from your real audit data; regenerate anytime via the Insights panel on the Analytics page.
- **Staffing Calculator** — enter FTE count, hours per shift, shifts per week, and daily procedure volume; get coverage ratio, FTE gap, and status (adequate / marginal / understaffed).
- **Smart Scheduler** — 7-day risk grid showing required vs. scheduled staff, variance, and risk level per day.
- **CSV Data Import** — drag-and-drop CSV upload with a guided column mapper; import history tracked per session.
- **Report Generation** — AI-generated Audit Summary, Gap Analysis, and Trend reports exported as .txt or printed to PDF via browser print.

---

## Who Uses It

| Role | Primary Use |
|------|-------------|
| Supervisor | Run audits, view own findings, generate single-audit reports |
| Manager | Team-level audit history, department analytics, trend review |
| Director | Org-wide dashboard, all audits and findings, export reports |
| QA Staff | Checklist design, threshold configuration, compliance oversight |

---

## Tech Stack

- **Next.js 15 App Router** with TypeScript strict mode, pnpm
- **Supabase** — Auth, PostgreSQL, Row-Level Security, Storage
- **Vercel AI SDK v6** + Anthropic Claude (via AI gateway)
- **Recharts** — compliance trend line chart, top failures bar chart, section heatmap

---

## Local Development

```bash
git clone <repo-url>
cd spd-compliance-app
pnpm install
cp .env.example .env.local
# fill in the variables listed below
pnpm dev
```

App runs at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (from Project Settings > API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (from Project Settings > API) |
| `AI_GATEWAY_URL` | Yes | Vercel AI gateway endpoint for Anthropic Claude access |

All variables are consumed at runtime; none are baked into the static build. The `NEXT_PUBLIC_` prefix exposes the Supabase variables to the browser — they are safe to include because Supabase RLS policies enforce access control.

---

## Database Setup

A Supabase project is required. Run the two migration files in order from the Supabase SQL editor or Supabase CLI.

**Migration order:**

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
```

`001_initial_schema.sql` creates ten tables:

- `organizations`, `departments`, `profiles` (extends auth.users)
- `checklists`, `checklist_items`
- `audits`, `audit_responses`, `findings`
- `imported_datasets`, `reports`

`002_rls_policies.sql` enables Row-Level Security on all ten tables and installs three security-definer helper functions (`get_my_org_id`, `get_my_role`, `get_my_dept_id`) that all policies use to resolve the current user's org and department without inline subqueries.

**Run with Supabase CLI:**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

---

## Deploy to Vercel

1. Connect the repository to a Vercel project.
2. In the Vercel dashboard under Settings > Environment Variables, add each variable from the table above.
3. Push to the branch — Vercel deploys automatically. Preview deployments are created for every push.

```bash
# Deploy from CLI
vercel --prod
```

---

## Role-Based Access

Access is enforced at three layers: the middleware redirect (unauthenticated users cannot reach `/dashboard` or any `/(app)/` route), client-side nav visibility, and Supabase RLS policies on every table.

| Section | Supervisor | Manager | Director | QA |
|---------|-----------|---------|----------|----|
| Dashboard | Own audits | Department audits | Org-wide | Org-wide |
| Checklists | View + run | View + run | View + run | Create + edit + delete |
| Audits | Own only | Department | All | All |
| Findings | Own only | Department | All | All |
| Analytics | Own only | Department | Org-wide | Org-wide |
| Import | Yes | Yes | Yes | Yes |
| Reports | Own only | Department | Org-wide | Org-wide |
| Settings | No | Thresholds | Thresholds | Full (org, team, thresholds) |

---

## Navigation

```
/                         Landing page / login entry
/dashboard                Recent audits, open findings, compliance score summary
/checklists               Checklist library with category filter and search
/checklists/new           Checklist builder (metadata + dynamic item list)
/checklists/[id]          Read-only template detail; Clone always available
/checklists/[id]/edit     Edit custom checklists (built-ins are read-only)
/audits                   Audit history with status and date-range filters
/audits/[id]/results      Per-audit: score, section bars, finding lifecycle cards
/findings                 Cross-audit findings aggregated; severity and status filters
/analytics                Trend chart, top failures, section heatmap, auditor table
/import                   CSV upload wizard: upload → column map → confirm
/reports                  Report builder + history; AI-generated output
/settings                 Organization, Team, Thresholds, Staffing Tools tabs
/settings/staffing        Staffing calculator with coverage ratio display
/settings/schedule        7-day smart scheduler grid
```

---

## Phase Status

All 11 build phases are complete.

| Phase | Description | Status |
|-------|-------------|--------|
| 01 | Product Clarity | COMPLETE |
| 02 | Core User Flow | COMPLETE |
| 03 | Frontend Foundation | COMPLETE |
| 04 | Core Experience Completion | COMPLETE |
| 05 | Content and Resource System | COMPLETE |
| 06 | Assessment and Feedback Layer | COMPLETE |
| 07 | Org Structure and Role Management | COMPLETE |
| 08 | Backend and Data Reality | COMPLETE |
| 09 | Intelligence and Personalization | COMPLETE |
| 10 | Production Hardening | COMPLETE |
| 11 | Launch Readiness | COMPLETE |

---

## Known Gaps (Documented, Not Blocking Launch)

- Imported CSV dataset rows are stored but not yet surfaced as a separate data series in Analytics charts (analytics aggregator reads audit records only).
- PDF export is browser print-to-PDF via `window.print()` — no server-generated PDF blob. `app/print.css` styles the print layout.
- Supabase reads/writes are schema-ready but the app is currently localStorage-first. Supabase tables, RLS, and the auth flow are production-ready; full data migration from localStorage to Supabase is the next architectural milestone post-launch.
- Lighthouse performance benchmarks require a live deployment URL and have not been run against the production build.
