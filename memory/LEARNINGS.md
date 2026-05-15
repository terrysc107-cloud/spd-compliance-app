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

---

## Phase 03 — Frontend Foundation (2026-05-15)

### What Was Built

- `lib/constants/design-tokens.ts` — single `tokens` object (color, radius, shadow) as the canonical source of truth for all design values, exported `as const`.
- `app/globals.css` — CSS custom properties mirroring every token, plus a reset (`box-sizing`, `margin`, `padding`) and base `body` styles. The dual representation (TS tokens + CSS vars) means components consume `tokens.*` inline but the design system is also available to any future CSS-authored file.
- `components/ui/` — five primitives: `Button`, `Card`, `Badge`, `ProgressBar`, `Input`. All import from `design-tokens`. `Button` and `Card` use `useState(hovered)` + `onMouseEnter`/`onMouseLeave` for interactive states (consistent with Phase 02 Sidebar pattern). `Badge` and `ProgressBar` are pure (no client state needed). `Input` uses `useState(focused)` for focus-ring styling.
- `lib/data/checklist-sections.ts` and `lib/data/severity-map.ts` — all 108 checklist items and severity rules extracted from the monolithic page into typed data modules. `ChecklistItem` and `Section` interfaces are exported from here and used as the contract across all checklist components.
- `components/checklist/` — four domain components: `AuditModeSelector`, `SectionPicker`, `ChecklistItemRow`, `GapReport`. Score utilities (`calcSectionScore`, `scoreColor`, `scoreBg`) and the `Gap` type live in `GapReport.tsx` and are re-exported from there.
- `app/checklist/page.tsx` — reduced to ~205 lines: pure state orchestrator. Owns phase state machine (`mode → picker → audit → report`), `answers`, `comments`, and delegates all rendering to the four checklist components.

### Patterns to Reuse

- **Token consumption pattern:** always import `tokens` from `@/lib/constants/design-tokens` and reference `tokens.color.*`, `tokens.radius.*` inline. Never hardcode hex values in component files.
- **Hover/focus state pattern:** `const [hovered, setHovered] = useState(false)` + `onMouseEnter`/`onMouseLeave` on the element. Spread hover overrides conditionally: `...(hovered ? variantHover[variant] : {})`. Same pattern for focus rings in `Input`.
- **Variant table pattern:** define `variantBase` and `variantHover` as `Record<Variant, React.CSSProperties>` at module level (not inside the component). Size overrides follow the same `Record<Size, CSSProperties>` shape. Merge all three in the computed style object.
- **Data separation:** checklist data lives in `lib/data/`, not in components. Components receive typed props derived from that data. Adding a new section or adjusting severity requires only editing the data files.
- **Phase-gated state machine:** `app/checklist/page.tsx` shows the correct pattern — a single `phase` string state with early `if (phase === "x") return <Component />` returns. No nested ternaries, no conditional renders mid-JSX.

### Debt and Gaps for Phase 04

1. **Checklist components do not use `components/ui/` primitives.** `AuditModeSelector`, `SectionPicker`, `ChecklistItemRow`, and `GapReport` all hardcode raw hex values and inline style objects instead of consuming `Button`, `Card`, `Badge`, or `tokens`. This is the primary consistency debt to address in Phase 04.
2. **`PageShell` still unused in `app/checklist/page.tsx`.** The checklist route renders its own sticky header rather than integrating with the `(app)` layout established in Phase 02.
3. **`GapReport.tsx` does too much.** It owns the AI fetch call, score utilities, the `Gap` type, and the full report UI. The fetch logic and score utils should move to `lib/` in Phase 04 to keep components under 500 lines (current count: 238, safe now but fragile).
4. **Severity map incomplete.** `preppack`, `storage`, `general`, and `water` sections have no explicit severity entries — every "No" answer in those sections defaults to `"medium"`. Severity coverage needs to be completed before meaningful gap prioritization is possible.
5. **No `aria-label` or role attributes on interactive checklist buttons.** `ChecklistItemRow` answer buttons and `SectionPicker` toggle buttons lack accessible labels. Phase 04 or Design Auditor pass should address this.

---

## Phase 04 — Core Experience Completion (2026-05-15)

### What Was Built

- **`lib/storage/audit-storage.ts`** — localStorage persistence layer. Public API: `saveAudit`, `getAudit`, `getAllAudits`, `updateAudit`, `updateFinding`, `deleteAudit`. Supports upsert (save-on-answer on every `answers`/`comments` state change), finding-level status updates, and corrective action capture per finding.
- **`app/checklist/page.tsx`** (updated) — integrated persistence: detects an in-progress audit on mount via `getAllAudits()` and offers a resume-or-restart prompt; `useEffect` on `answers`/`comments` auto-saves in-progress state; `handleComplete` writes a completed record with score and findings array; "View Results" deep-link appears after completion.
- **`app/(app)/audits/[id]/results/page.tsx`** — per-audit results page. Loads stored audit via `getAudit(id)` in `useEffect`. Displays score hero with overall %, open/resolved counts, per-section score bars (derived from findings), and an editable findings table with inline status select and corrective-action textarea (saves on blur via `updateFinding`).
- **`app/(app)/dashboard/page.tsx`** — live summary dashboard. Reads all audits from localStorage in `useEffect`; derives total audit count, average compliance score, open findings count, and recent-5-audits table with deep-links to results.
- **`app/(app)/audits/page.tsx`** — audit history list with status and date-range filters, using `PageShell` + `Card`/`Badge`/`Button` primitives throughout.
- **`app/(app)/findings/page.tsx`** — cross-audit findings list. Flattens all completed audits into a single findings array; severity and status filter controls; summary counts (critical/major/minor open) at the top.
- **`app/print.css`** — media query stylesheet suppressing sidebar, nav, and buttons for `window.print()`, normalising backgrounds to white, and adding table borders for ink-safe output.

### Key Patterns Worth Reusing

- **SSR guard on localStorage:** both `readAll()` and `writeAll()` in `audit-storage.ts` check `typeof window === 'undefined'` before touching `localStorage`. Copy this guard into every future storage utility — Next.js SSR will otherwise throw at build time.
- **Save-on-answer via `useEffect` + skip-first-render ref:** `useRef(true)` set to `false` after the first effect run prevents a spurious write on mount. The pattern (ref guard → skip → save) is the correct way to auto-persist client state without double-writing on hydration.
- **Finding generation at completion:** `buildAuditPayload` iterates all selected sections, maps `"no"` answers to `StoredFinding` records using `getSeverity()`, and computes overall score from `yes / applicable`. This is the canonical way to produce findings — do not re-derive them at display time.
- **Editable table with local state + blur-save:** `FindingRow` keeps `correctiveAction` in local `useState`, writes on `onBlur`, and calls both `updateFinding` (persistence) and `onUpdate` (parent state lift). Use this pattern for any inline-edit table where round-trip latency must be avoided.
- **Flat findings aggregation:** `findings/page.tsx` derives its dataset entirely from `getAllAudits().flatMap(a => a.findings)` with audit metadata spread in. No separate findings store needed — the audit record is the source of truth.

### Known Debt for Phase 05+

1. **Section scores approximated from findings count, not actual responses.** `buildSectionRows` in `results/page.tsx` estimates section score as `(items.length - failCount) / items.length`. N/A answers are not accounted for — a section with many N/A items will show artificially low scores. True section scores require storing per-section response counts alongside findings.
2. **No ARIA labels on interactive controls.** Answer buttons in `ChecklistItemRow`, section tab buttons in `checklist/page.tsx`, and status selects in `FindingRow` have no `aria-label`. The findings table has no `<caption>` or `role="grid"`. Accessibility audit required before Phase 10.
3. **Corrective actions are not linked across sessions.** Editing a corrective action on the results page saves it to `localStorage` inside the audit record, but the findings list page reads findings fresh from `getAllAudits()` on mount — status and corrective action edits made on the results page are visible only if the findings page re-mounts. No reactive/shared state exists between the two routes; Phase 08 Supabase migration will resolve this structurally.
4. **Dashboard uses its own inline card styles** rather than the `Card` primitive or `PageShell`. Inconsistency will widen as more pages are added — dashboard should be refactored to use `PageShell` in Phase 05.
5. **`StoredAudit` interface is redeclared locally** in `audits/page.tsx` and `findings/page.tsx` instead of importing from `audit-storage.ts`. Creates drift risk if the canonical type changes.

---

## Phase 05 — Content & Resource System (2026-05-15)

### What Was Built

- **`lib/types/checklist.ts`** — canonical type layer: `ChecklistItemDef` (with `weight: 1|2|3`, `severity`, `responseType`, `referenceUrl`, `order`), `ChecklistTemplate` (with `isBuiltIn`, `status`, `version`), and the union types `ResponseType`, `Severity`, `ChecklistCategory`, `ChecklistStatus`.
- **Three AAMI built-in templates** in `lib/data/templates/`: `st79Template` (108 items, 7 sections, severity-mapped), `st91Template` (40 items, 5 sections, endoscope-focused), `ST108_TEMPLATE` (40 items, 5 sections, water quality with `referenceUrl` on every item).
- **`lib/data/templates/index.ts`** — `BUILT_IN_TEMPLATES` registry array and `getAllTemplates(custom)` composer. Built-ins never touch localStorage.
- **`lib/storage/checklist-storage.ts`** — CRUD for custom checklists in localStorage (`saveCustomChecklist`, `getCustomChecklist`, `getAllCustomChecklists`, `updateCustomChecklist`, `deleteCustomChecklist`, `cloneChecklist`). Carries forward the `typeof window === 'undefined'` SSR guard from Phase 04.
- **`app/(app)/checklists/page.tsx`** — library listing with category filter tabs, search, template cards (Clone/Edit/Delete guarded by `isBuiltIn`), uses `PageShell` + all `components/ui` primitives.
- **`app/(app)/checklists/new/page.tsx`** — builder form: template metadata fields plus a dynamic `ItemRow` list (add/remove/reorder visually). Saves as active or draft via `saveCustomChecklist`.
- **`app/(app)/checklists/[id]/page.tsx`** — read-only detail view; resolves built-ins first, then custom; Clone always available, Edit gated by `!isBuiltIn`.
- **`app/(app)/checklists/[id]/edit/page.tsx`** — edit form for custom templates only; blocks with a clear message if `isBuiltIn` is true; `ItemEditor` syncs severity → weight automatically.

### Key Patterns

- **`structuredClone` for clone** — `cloneChecklist` uses `structuredClone(source)` to deep-copy items before stamping new `id`, `isBuiltIn: false`, `status: 'draft'`, timestamps. Safe for nested arrays.
- **`isBuiltIn` guard** — all mutating actions (Edit button, Delete button, edit-page render) check `template.isBuiltIn` before proceeding. Single flag, enforced at both UI and storage layer.
- **`BUILT_IN_TEMPLATES` registry** — the index barrel is the only place built-ins are enumerated. `getAllTemplates(custom)` merges without duplication. Template resolution always checks built-ins first.
- **Severity → weight auto-sync in `ItemEditor`** — changing severity automatically sets weight (`critical→3, major→2, minor→1`), keeping the two fields consistent without requiring the user to set both.

### Debt for Phase 06+

1. **"Start Audit" still links to legacy `/checklist`** — both `checklists/page.tsx` (line 218) and `checklists/[id]/page.tsx` (line 156) hardcode `href="/checklist"`. Must be updated to pass the selected template ID to the audit flow once Phase 06/08 wires up template-aware audits.
2. **`weight` field not yet wired into the scoring engine** — `ChecklistItemDef.weight` is stored and displayed but `buildAuditPayload` in `app/checklist/page.tsx` still counts `yes/applicable` without weighting. Weighted scoring requires a Phase 06 update to the gap/score calculation.
3. **No ARIA on interactive controls** — filter tab buttons, category `<select>` elements, and item remove buttons in both builder and edit pages have no `aria-label` or `role`. Consistent gap across all Phase 03–05 pages; needs a Design Auditor pass before Phase 10.
4. **`edit/page.tsx` at 370 lines** — under the 500-line limit but fragile; `ItemEditor` and its inline `selectStyle`/`labelStyle` constants should be extracted to a shared `components/checklist/ItemEditor.tsx` before Phase 06 adds more item field types (e.g. numeric validation range).

---

## Phase 06 — Assessment & Feedback Layer (2026-05-15)

### What Was Built

- **`lib/scoring/engine.ts`** — weighted scoring engine. Score = sum(weight of yes) / sum(weight of yes + no) × 100; N/A excluded from both numerator and denominator. Exports `calculateScore`, `getScoreStatus`, `getScoreColor`, `ScoringConfig`, `SectionResult`, `AuditScore`.
- **`lib/storage/threshold-storage.ts`** — org-level pass/marginal threshold persistence to localStorage. Defaults: pass ≥ 90, marginal ≥ 70. Validates numeric fields on read; fails silently on quota error on write.
- **`app/(app)/settings/thresholds/page.tsx`** — threshold editor with live `BandPreview` showing Pass/Marginal/Fail ranges. Validates that marginal < pass before saving; resets to defaults on demand.
- **`components/assessment/TrendComparison.tsx`** — three-tile widget showing Current / Previous / 90-Day Avg scores with delta arrows and a mini bar chart of the last 5 completed audits for the same checklist name.
- **`components/assessment/FindingLifecycle.tsx`** — per-finding stepper card: Open → In Progress → Resolved with a `StepIndicator`, corrective action textarea (saves on blur), and Reopen support. Writes via `updateFinding` and calls `onUpdate` to refresh parent state.
- **`app/(app)/audits/[id]/results/page.tsx`** (updated) — now imports `TrendComparison` and `FindingLifecycle`; replaces the inline editable table with lifecycle cards; derives section rows and severity counts from `audit.auditScore` when present, falling back to the legacy count-based approximation for pre-Phase-06 records.

### Key Patterns

- **Global index strategy** — `StoredFinding.itemIndex` is a flat global item index across all sections, used as the stable key in `FindingLifecycle` and `updateFinding`. Consistent across storage, engine, and UI layers.
- **Backward-compatible `auditScore` field** — `StoredAudit.auditScore` is optional. Results page checks `audit.auditScore` before using engine data; `legacySectionRows` provides a count-based fallback so old audits render without migration.
- **`severityToWeight` bridge** — engine maps `critical → weight 3`, `major → 2`, `minor → 1` inline via `item.weight ?? 1`. The severity-to-weight relationship is owned by `lib/data/severity-map.ts` at write time and trusted at scoring time; no re-derivation needed.
- **SSR guard carried forward** — `threshold-storage.ts` and `engine.ts` both check `typeof window === 'undefined'` (storage layer) before touching `localStorage`. Pattern now consistent across all three storage modules (audit, checklist, threshold).

### Debt for Phase 07+

1. **"Start Audit" still links to `/checklist`** — `checklists/page.tsx` and `checklists/[id]/page.tsx` still hardcode the legacy route; not updated to pass a template ID into a dynamic audit flow.
2. **No ARIA on assessment components** — `FindingLifecycle` action buttons and `StepIndicator` circles have no `aria-label`. `TrendComparison` metric tiles and bar segments have no accessible text alternative. Consistent gap across all phases; Design Auditor pass required before Phase 10.
3. **`TrendComparison` has no empty-state label when fewer than 2 audits exist** — the Previous and 90-Day Avg tiles render `—` correctly, but the mini bar chart section is conditionally hidden with no explanatory message. First-time users see only the Current tile with no context.
