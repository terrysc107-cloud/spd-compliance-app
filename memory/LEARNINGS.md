# Learnings

Record lessons, mistakes, and reusable insights here.

## Scout Audit — Phase 01 (2026-05-14)

### What Already Exists and Is Usable

**Package Stack (all locked, no node_modules — pnpm install needed before dev)**
- Next.js 16.2.4 (App Router) with React 19.2.5
- Vercel AI SDK v6.0.168 (via `ai` package, gateway model routing to Anthropic)
- TypeScript 6.0.3, strict mode enabled
- No Supabase, no charting libraries, no UI component library, no Tailwind/CSS framework
- Styling is 100% inline React styles throughout — intentional dark-mode design system in navy (#05091a)

**App Directory Structure (4 files total)**
```
app/
  layout.tsx               — RootLayout, metadata, viewport, inline body styles
  page.tsx                 — Landing page (548 lines, "use client")
  checklist/page.tsx       — Core audit app (785 lines, "use client")
  api/generate-report/route.ts  — AI report generation endpoint (31 lines)
```

**Landing Page (`app/page.tsx`) — Production-quality**
- Fixed nav with blur backdrop, logo, CTA button
- Hero section with gradient headline, two CTAs
- "Two ways to audit" section (Full Audit / Focus Audit cards)
- Feature grid (4 cards: scoring, gap log, AI report, print)
- 7 Compliance Domains grid (AAMI ST79, ST91, ST108 coverage)
- Use-cases section, final CTA, footer
- IntersectionObserver scroll animations throughout
- All routing to `/checklist`

**Checklist App (`app/checklist/page.tsx`) — Core MVP, functionally complete**
- 7 compliance sections fully defined in-code: Decontamination (13 items), Prep & Packaging (13), Sterilization (13), Sterile Storage (13), General & Staff (15), Water Quality (17), HLD & Flexible Scopes (24)
- Total: ~108 checklist items with text, rationale, severity mapping
- State machine: mode selector → section picker → audit → report (4 phases)
- Full Audit vs Focus Audit modes
- Per-item Yes/No/N/A answering with comment textarea on "No"
- Live section scoring (% compliant), color-coded by risk threshold
- Gap log: groups findings by High/Medium/Low severity
- AI report generation via `/api/generate-report` (streamed fetch → JSON)
- Print button (window.print)
- Section tab navigation with completion indicators
- Overall progress bar
- `useCallback` on handlers (performance-aware)

**API Route (`app/api/generate-report/route.ts`)**
- POST handler using Vercel AI SDK `generateText`
- Model: `anthropic/claude-sonnet-4-20250514` (via AI gateway)
- Structured prompt returns 5-section QI report
- No auth, no rate limiting, no input validation beyond destructuring

**TypeScript Configuration**
- Strict mode on, `noEmit`, `isolatedModules`
- Path alias `@/*` maps to repo root
- Target ES2017, module resolution: bundler
- Includes `.next/dev/types` — dev server types path

**Next.js Configuration**
- Minimal: only `reactStrictMode: true`
- No custom headers, rewrites, image domains, or env config

**Design System (inferred from inline styles)**
- Background: `#05091a` (deep navy)
- Primary accent: `#3b82f6` / `#6366f1` (blue/indigo gradient)
- Secondary accent: `#a78bfa` (purple)
- Text primary: `#fff`, secondary: `#94a3b8`, muted: `#475569`, dimmed: `#64748b`
- Danger: `#ef4444`, Warning: `#eab308`, Success: `#22c55e`, Orange: `#f97316`
- Border: `rgba(255,255,255,0.06–0.1)`
- Border radius patterns: 8px (small), 12px (medium), 14–16px (large), 20px (card), 99px (pill)
- No global CSS file — everything inline

---

### What Is Missing and Needs to Be Built

**Critical Gaps (Phase 03 blockers or immediate Phase 08 work)**

1. **No Supabase integration** — zero backend persistence. All audit state lives in React useState. Closing the tab loses all data. Auth, data storage, record keeping, and report export are all absent.
2. **No authentication** — the product brief specifies Supervisors/Managers/Directors as distinct roles. No login, no session, no user identity.
3. **No shared component library** — design tokens and UI patterns are duplicated inline across 1,333+ lines across two files. No `components/` directory exists.
4. **No global CSS** — no `globals.css`, no CSS variables, no Tailwind. Every style is a repeated object literal.
5. **No charting/analytics** — product brief requires charts, graphs, trend lines. No charting library (Recharts, Chart.js, etc.) installed.
6. **No staffing calculator** — required feature, not started.
7. **No smart scheduler** — required feature, not started.
8. **No data import** — CSV/API ingestion not started.
9. **No report export** — only `window.print()` exists; no PDF export, no structured file download.
10. **No `app/dashboard` route** — directors need an org-wide view; no dashboard page exists.
11. **No API validation / error boundaries** — the AI route has no input sanitization, no try/catch, no rate limit.
12. **node_modules absent** — `pnpm install` must be run before the app can start.

**Missing Infrastructure**
- No `.env.example` or `.env.local` — AI gateway and future Supabase keys have no documented home
- No `middleware.ts` — no route protection possible without it
- No error pages (`app/error.tsx`, `app/not-found.tsx`)
- No loading states (`app/loading.tsx`)
- No `components/` directory

**Debt on Existing Code**
- `checklist/page.tsx` is 785 lines — over the 500-line file limit specified in CLAUDE.md. Must be split before Phase 04.
- `page.tsx` is 548 lines — borderline; should be componentized.
- All checklist data is hardcoded in the client component. Should move to `lib/data/` or Supabase-backed content.
- Severity map is incomplete — only decon, steril, hld sections have explicit mappings; preppack, storage, general, water default to "medium" for all items.
- The AI report prompt is duplicated between the client (`checklist/page.tsx` line 247) and the API route. The client-side copy is dead code (fetch goes to API) but creates confusion.
- No `"use server"` usage — everything is client-side rendered; no RSC data fetching pattern established yet.

---

### Conflicts and Blockers

1. **Domain mismatch (low severity, clarify early):** `DECISIONS.md` describes this as a platform for "SPD (public safety / law enforcement)" supervisors. The existing codebase is built entirely for Sterile Processing Departments (hospital/healthcare). The compliance domains (AAMI, AORN, CMS, Joint Commission) are healthcare-specific. Phase 01 should confirm which SPD this is — the healthcare context appears to be the correct one based on all code and metadata.

2. **File size limit:** `checklist/page.tsx` at 785 lines violates the 500-line rule in CLAUDE.md. Cannot add features to it without first splitting it.

3. **No `pnpm install` run:** Cannot verify runtime behavior or build status.

4. **AI SDK model string:** Route uses `anthropic/claude-sonnet-4-20250514` via the AI gateway. This requires the Vercel AI gateway to be configured with valid Anthropic credentials. No `.env` file confirms this is set up. If credentials are missing, the AI report feature will silently fail at the `Response.json` call.

---

### Recommended Starting Point for Phase 03 (Frontend Foundation)

**Priority order for Phase 03:**

1. **Run `pnpm install`** — prerequisite for everything.

2. **Create `components/` directory with extracted primitives** from the existing inline styles:
   - `components/ui/Button.tsx` — primary/secondary/ghost variants
   - `components/ui/Card.tsx` — standard card with border/background
   - `components/ui/Badge.tsx` — pill/tag badges used throughout
   - `components/ui/ProgressBar.tsx`
   - `components/layout/Nav.tsx` — extracted from landing page
   - `components/layout/PageShell.tsx` — shared page wrapper

3. **Create `lib/constants/design-tokens.ts`** — extract all color values, spacing, and border-radius into a single source of truth.

4. **Split `checklist/page.tsx`** into:
   - `app/checklist/page.tsx` — thin orchestrator (state only)
   - `components/checklist/AuditModeSelector.tsx`
   - `components/checklist/SectionPicker.tsx`
   - `components/checklist/ChecklistItem.tsx`
   - `components/checklist/GapReport.tsx`
   - `lib/data/checklist-sections.ts` — move SECTIONS and SEVERITY_MAP out of the component

5. **Add `globals.css`** with CSS custom properties for the design tokens — enables consistent theming and removes repeated inline objects.

6. **Add error boundary and loading state** to the checklist route before Phase 04 adds more complexity.

7. **Do not introduce Supabase or auth yet** — that is Phase 08 work. Phase 03 should only improve frontend structure without changing behavior.

**Do not touch:**
- The AI report flow (working, leave it)
- The landing page content (it is production-quality)
- The checklist data structure (correct, comprehensive)
- The color palette (intentional and consistent)

**Install candidates to evaluate in Phase 03 (propose, do not install without phase contract approval):**
- `recharts` or `chart.js` — needed for Phase 09 analytics (not Phase 03)
- `@supabase/supabase-js` — needed for Phase 08 (not Phase 03)
- A CSS-in-JS or Tailwind solution — discuss with Design Auditor before committing

---

## Phase 02 — Core User Flow (2026-05-14)

### What Was Built

**Route group `app/(app)/` with shared `layout.tsx`**
- The `(app)` route group wraps all authenticated pages (dashboard, checklists, audits, findings, analytics, import, reports, settings) in a single sticky sidebar layout. The group segment is invisible in URLs.
- Layout is a flex row: `Sidebar` (240px, `position: sticky; top: 0; height: 100vh`) + `<main style={{ flex: 1, overflow: auto }}>`. This is the correct pattern for a persistent nav — sticky keeps the sidebar in view without `position: fixed` disrupting the scroll container.

**Three shared layout components created in `components/layout/`**
- `Sidebar.tsx` — `NAV_ITEMS` array drives all nav links. Active state derived from `usePathname()` with `startsWith` for nested routes. Hover effects use `onMouseEnter`/`onMouseLeave` against `e.currentTarget` (the inline-style equivalent of `:hover`). Role badge at the bottom is static ("Supervisor"), explicitly labeled "Phase 08: auth pending".
- `Breadcrumb.tsx` — auto-generates crumbs from `usePathname()` segments. `LABEL_MAP` provides human labels for known segments; unknown segments get title-cased from the URL slug. `aria-label="Breadcrumb"` present for accessibility.
- `PageShell.tsx` — wrapper accepting `title`, `description`, `actions`, and `children`. Renders breadcrumb, page header (h1 + description + optional action slot), then content. Reusable across all future pages.

**Eight stub pages, each following a consistent pattern**
- Header block (h1 + muted description), then feature stubs (disabled inputs, filter chips, drop zones, chart placeholders) labeled with the phase they activate. All pages are RSC (no `'use client'`) except where sidebar/breadcrumb hooks force client context.
- `dashboard/page.tsx` links directly to `/checklists` as the primary CTA — correct flow entry point.
- `checklists/page.tsx` has "Start Audit" links pointing to the legacy `/checklist` route (Phase 01 file), not `/audits/new`. This will need updating when Phase 08 wires up persistence.

**Global fallback pages at `app/` root**
- `error.tsx` — `'use client'` error boundary with reset button; displays `error.message`.
- `loading.tsx` — CSS `@keyframes spin` inline; no external dependency.
- `not-found.tsx` — links back to `/dashboard`.

### Key Technical Decisions

- **Sticky sidebar, not fixed.** The sidebar uses `position: sticky` on the `<aside>`, not `position: fixed`. This avoids body-level scroll lock and lets the main content area scroll independently as a flex sibling.
- **`onMouseEnter`/`onMouseLeave` for hover.** No CSS classes or `:hover` selectors — consistent with the project's all-inline-styles constraint.
- **`usePathname` active detection with `startsWith`.** Handles nested routes (e.g. `/checklists/new` still highlights the Checklists nav item) without requiring exact matches.
- **Pages are RSC by default.** Only `layout.tsx`, `Sidebar.tsx`, `Breadcrumb.tsx`, and `PageShell.tsx` are `'use client'`. Stub pages have no client-side state and are server components.

### Patterns Future Agents Should Reuse

- Wrap all authenticated routes inside `app/(app)/` using the existing `layout.tsx`. Do not create parallel layouts.
- Use `PageShell` for all new pages: pass `title`, `description`, and slot any action buttons via the `actions` prop.
- Follow the `LABEL_MAP` pattern in `Breadcrumb.tsx` when adding new routes — add the segment key and label there so breadcrumbs render correctly.
- Stub interactive features with `disabled` controls and a `"Active in Phase N"` caption rather than leaving blank space.

### Debt and Gaps to Watch in Phase 03

1. **`checklists/page.tsx` links to legacy `/checklist`** (Phase 01 route), not the new route group. Must be updated when the old checklist is migrated or replaced.
2. **`PageShell` is not yet used by any page.** All eight stub pages have their own inline header blocks. Phase 03 should refactor them to use `PageShell` for consistency.
3. **Sidebar role badge is hardcoded** to "Supervisor". No user context exists yet — this is intentional but will need a real identity source in Phase 08.
4. **No `loading.tsx` inside `app/(app)/`** — the root `loading.tsx` covers the whole viewport including the sidebar area. A route-level loading state scoped to `<main>` would be more correct for Phase 03+.
5. **Inline `muted` and `card` style objects are re-declared per file** — not imported from a shared token file. Same debt from Phase 01 remains unresolved.
