# Debt

Record consciously deferred work, tradeoffs, and cleanup items here.

---

## Phase 10 — Production Hardening (2026-05-15)

### Bundle Size
- `recharts` is 8.7MB on disk (includes all chart types; Next.js tree-shakes only the used exports
  at build time — actual bundle impact is lower). No unnecessary large dependencies found.
  All 7 runtime dependencies are justified: next, react/react-dom (framework), @supabase/ssr +
  @supabase/supabase-js (auth/db), ai (report generation), recharts (analytics charts).
- No unused packages detected. No date-manipulation or heavy utility libraries added.

### Known Gaps (Phase 01 DoD)

1. **PDF export is print-to-PDF only** — window.print() with print.css. A true server-generated
   PDF (react-pdf or Puppeteer) would improve the export experience. Deferred post-launch.

2. **Imported dataset rows not surfaced in analytics charts** — import history works but imported
   rows don't appear as a separate data series in the Analytics trend chart. Fix: extend
   lib/analytics/aggregator.ts to merge imported rows with audit data. Estimated: 2–3 hours.

3. **Lighthouse performance audit not run** — requires a live Vercel deployment URL. Run
   `npx lighthouse <url> --output=json` after next deploy. Target: Performance ≥ 80,
   Accessibility ≥ 90.

4. **Server-side validation for localStorage data layer** — the audit/checklist data layer is
   localStorage-first. Migrating to full server-side persistence (Supabase) would enable proper
   server-side validation. Deferred to post-launch architectural phase.

5. **Vercel error monitoring** — Vercel captures errors in the dashboard automatically for deployed
   apps. Consider adding Sentry or Vercel Analytics for structured error tracking post-launch.

### Security Notes (Phase 10 — Resolved)

- generate-report API route now has a Supabase auth guard (added Phase 10). Previously unauthenticated
  requests could trigger AI calls and incur API costs.
- No NEXT_PUBLIC_ secrets found. ANTHROPIC_API_KEY is server-only.
- .env.example updated to document all required env vars with safety annotations.
- RLS covers all 11 Supabase tables (organizations, departments, profiles, checklists, checklist_items,
  audits, audit_responses, findings, imported_datasets, reports).

---

## Consulting Workspace (2026-10-22)

1. **Migration 007 not yet applied** to the live Supabase project. Validated locally against Postgres (PGlite) with Supabase auth/storage stubs, including cross-org RLS tests. Apply with `supabase db push` or the SQL editor.
2. ~~No offline mode~~ — fixed: field writes (walkthrough answers, observations, photos) queue in IndexedDB and replay in order (`lib/consult/offline/`). Remaining gap: *reads* still need a connection, so open the engagement before going somewhere without signal.
3. ~~HEIC photos skipped in PDF~~ — fixed: photos are re-encoded on-device to JPEG ≤1600px with EXIF/GPS stripped (`lib/consult/photo.ts`). Browsers with no HEIC decoder (non-Apple) show a clear error; iPhones decode HEIC natively.
4. **Single-consultant firms assumed.** Library and clients are shared org-wide; there is no per-consultant assignment or reviewer sign-off workflow yet.
5. **App sidebar is fixed-width (240px)** — pre-existing; on phones the workspace is cramped. The walkthrough itself collapses its area list into a dropdown below 900px.

6. **Voice not yet exercised against live OpenAI.** The sandbox network blocks api.openai.com. The executor and the realtime event handling are unit-tested with simulated model traffic, so the first live run happens on the Vercel preview once `OPENAI_API_KEY` is set. If OpenAI rejects a session field, the error is shown in the dock.
7. **Voice needs a connection.** Offline, the dock says so, and taps still queue.
