# Decisions

## Product Brief

### What are we building?
A quality data analytics platform for SPD (public safety / law enforcement) leadership. Core capabilities:

- **Quality Audit Checklists & Questionnaires** — structured audits leaders can run on their area, save results, and revisit
- **Audit Gap Analysis** — automatically surface gaps between actual vs. expected performance
- **Data Analytics & Visualization** — charts, graphs, trend lines derived from audit data and imported tracking data
- **Actionable Insights Engine** — turn raw audit results into prioritized action items
- **Staffing Calculator & Ratio Analysis** — calculate staffing levels, coverage ratios, and flag understaffing risks
- **Smart Scheduler** — help leaders balance workloads against busy periods / shift patterns
- **Data Import** — ingest data from external tracking systems (CSV, spreadsheet, or API)
- **Documentation & Record Keeping** — log every audit, decision, and corrective action with timestamps
- **Report Generation** — exportable, defensible audit reports for accountability

### Who are the users?
- SPD Supervisors (line leaders conducting audits)
- Managers (area oversight, trend review)
- Directors (executive dashboard, org-wide risk view)
- Quality & Risk Management staff (audit design, gap analysis, compliance tracking)

### What does success look like?
A leader who has **no quality plan, no oversight, no trend visibility** can:
1. Stand up a full quality program in one session
2. Run defensible, documented audits by checklist
3. See hidden risks surfaced automatically from their data
4. Move from **reactive** (responding to incidents) to **proactive** (spotting trends before incidents)
5. Have a complete audit trail and record system for accountability / accreditation

### Key Outcomes
- Zero-to-quality-program in < 1 hour for a new user
- Audit completion time < 15 minutes per checklist
- Risk trends visible without manual spreadsheet work
- Exportable reports that stand up to external review

---

## Technical Decisions

### Stack
- Next.js (App Router) — already in repo
- Supabase — auth + database + storage (MCP available)
- Vercel — deployment (already connected, preview live)
- TypeScript throughout

### Phase Status
- Phase 01: Product Clarity — IN PROGRESS (2026-05-14)
