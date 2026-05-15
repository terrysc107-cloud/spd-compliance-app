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
- Phase 01: Product Clarity — COMPLETE (2026-05-14)
- Phase 02: Core User Flow — COMPLETE (2026-05-15)
- Phase 03: Frontend Foundation — COMPLETE (2026-05-15)
- Phase 04: Core Experience Completion — COMPLETE (2026-05-15)
- Phase 05: Content & Resource System — COMPLETE (2026-05-15)
- Phase 06: Assessment & Feedback Layer — IN PROGRESS (2026-05-15)

---

## Phase 01 Feature Contract

_Authored by: Product Architect — 2026-05-14_
_This is the build contract. Phase 02 does not start until all Definition of Done items are met._

---

### 1. Feature Priority List

#### MVP — Must Ship (Phase 1)

| # | Feature | Rationale |
|---|---------|-----------|
| 1 | **Audit Checklists & Questionnaires** | Core value prop. Without this, nothing else has input data. Must support create, run, save, and repeat. |
| 2 | **Audit Gap Analysis** | Transforms raw checklist results into actionable signal. Required for "proactive" success metric. |
| 3 | **Documentation & Record Keeping** | Every audit must be timestamped and attributable. Non-negotiable for accreditation / defensibility. |
| 4 | **Report Generation** | Exportable PDF/CSV audit reports. Required for the "defensible audit" success criterion. |
| 5 | **Data Analytics & Visualization** | Trend charts and summary views on audit data. Needed for the "zero spreadsheets" success metric. |
| 6 | **User Auth & Role System** | Supervisor / Manager / Director / QA roles gate what users see and can do. Foundation for everything. |
| 7 | **Data Import (CSV)** | Leaders will not rekey data. CSV import unlocks adoption for users with existing tracking systems. |

#### Phase 2 — Nice to Have (Defer)

| # | Feature | Rationale for Deferral |
|---|---------|----------------------|
| 8 | **Staffing Calculator & Ratio Analysis** | High value but separable. Requires staffing data schema that can be added after core audit loop works. |
| 9 | **Smart Scheduler** | Complex domain logic. Needs the staffing model first. Defer until Phase 2. |
| 10 | **API-based Data Import** | CSV covers 90% of the use case in v1. Live API connectors require integration work beyond MVP scope. |
| 11 | **Actionable Insights Engine (AI-generated)** | Manual gap analysis covers Phase 1. AI-generated prioritized recommendations are a Phase 2 differentiator. |

---

### 2. Core User Flows

#### Flow 1: First-Time Setup (Zero to Quality Program)
1. User lands on login page, authenticates (email/password via Supabase Auth).
2. Role is assigned (Supervisor / Manager / Director / QA) — defaults to Supervisor on first login.
3. Onboarding prompt: "Create your first audit checklist or import one."
4. User selects a checklist template (pre-loaded: Use of Force, Body Camera Compliance, Case Review, Training Compliance) or creates custom.
5. User saves checklist. Dashboard now shows it as ready to run.
6. Outcome: User has a repeatable audit instrument in < 10 minutes.

#### Flow 2: Run an Audit
1. User opens a saved checklist from the Dashboard.
2. Steps through each question item — marks Pass / Fail / N/A, adds notes per item.
3. Submits the completed audit. System timestamps it, tags it to the user and date.
4. System immediately calculates a compliance score and flags items below threshold.
5. Gap Analysis view auto-generates: shows which items failed, deviation from expected baseline.
6. Audit is stored in the record log.
7. Outcome: Completed, documented audit with gap report in < 15 minutes.

#### Flow 3: View Trends & Analytics
1. User navigates to Analytics section.
2. Selects a checklist type and date range.
3. System renders: overall compliance trend (line chart), top failing items (bar chart), auditor-level breakdown (table).
4. User can drill into any individual audit from the chart.
5. Outcome: Trend visibility without manual spreadsheet work.

#### Flow 4: Import External Data
1. User navigates to Data Import.
2. Uploads a CSV file (call records, incident data, training completions, etc.).
3. System maps CSV columns to known schema fields (guided column mapper UI).
4. Data is ingested and linked to the relevant audit area.
5. Analytics views update to include imported data alongside audit results.
6. Outcome: External tracking data visible in the same dashboard as audit results.

#### Flow 5: Generate & Export a Report
1. User navigates to Reports.
2. Selects report type (Audit Summary, Gap Analysis, Trend Report), date range, and scope (unit / division / org-wide).
3. System generates a structured report with: cover page, summary statistics, finding details, corrective action log.
4. User downloads as PDF or CSV.
5. Report is logged in the record system with metadata (generated by, date, scope).
6. Outcome: A defensible, exportable document ready for external review or accreditation.

---

### 3. Data Model Sketch

#### Entities and Relationships

**User**
- Has an id, email, name, role (supervisor | manager | director | qa), department, created_at.
- A User creates Checklists, runs Audits, and generates Reports.
- A User belongs to one Organization.

**Organization**
- Top-level tenant boundary. All data is scoped to an Org.
- Has settings (thresholds, branding, compliance baselines).

**Checklist** (the template)
- Belongs to an Org. Created by a User.
- Has a name, category (use-of-force | body-camera | case-review | training | custom), version, status (draft | active | archived).
- Contains an ordered list of ChecklistItems.

**ChecklistItem**
- Belongs to a Checklist.
- Has a question text, response type (pass-fail | yes-no | numeric | text), weight (for scoring), expected answer, order index.

**Audit** (a single completed run of a Checklist)
- Belongs to a Checklist and an Org. Conducted by a User.
- Has a status (in-progress | completed), subject (who or what was audited), conducted_at timestamp, overall score.
- Contains AuditResponses — one per ChecklistItem.

**AuditResponse**
- Belongs to an Audit and a ChecklistItem.
- Stores the actual response value, pass/fail determination, notes, and any attached evidence file reference.

**Finding**
- Belongs to an Audit. Auto-generated when an AuditResponse is out of compliance.
- Has a severity (critical | major | minor), description (auto-populated from item), corrective_action_text, status (open | in-progress | resolved), resolved_at.

**ImportedDataset**
- Belongs to an Org. Uploaded by a User.
- Has a filename, source_type (csv | spreadsheet), upload_timestamp, column_mapping (JSON), row_count, linked_audit_category.

**Report**
- Belongs to an Org. Generated by a User.
- Has a report_type, scope (user | department | org), date_range, generated_at, file_url (stored in Supabase Storage).
- References one or more Audits.

**Key Relationships:**
- Org -> many Users, Checklists, Audits, Reports, ImportedDatasets
- Checklist -> many ChecklistItems, Audits
- Audit -> many AuditResponses, Findings
- Finding -> optional corrective action tracking (status + notes)

---

### 4. Navigation Structure

```
/                          Landing / Login
/dashboard                 Home dashboard — recent audits, open findings, score summary
/checklists                Checklist library (list all)
/checklists/new            Create or clone a checklist
/checklists/[id]           View / edit a checklist template
/audits                    All completed and in-progress audits
/audits/[id]/run           Active audit session (step-through UI)
/audits/[id]/results       Completed audit: score, gap analysis, findings
/findings                  All open findings across all audits (with filters)
/analytics                 Trend charts, compliance over time, top issues
/import                    CSV upload and column mapping
/reports                   Report builder + report history
/reports/[id]              View or re-download a generated report
/settings                  Org settings: thresholds, user management, roles
/settings/users            User list, invite, role assignment
```

Top-level nav (sidebar): Dashboard | Checklists | Audits | Findings | Analytics | Import | Reports | Settings

Role-based visibility:
- Supervisor: Dashboard, Checklists, Audits (own), Findings (own), Reports (own)
- Manager: All of above + team-level Analytics, all Audits in their department
- Director: All sections, org-wide view
- QA: All sections + Settings (checklist management, thresholds)

---

### 5. Definition of Done for Phase 01

Phase 01 is complete when ALL of the following are true. No exceptions.

**Auth & Access**
- [ ] A new user can sign up and be assigned a role.
- [ ] Role-based nav and data visibility is enforced (Supervisor cannot see Director-level views).
- [ ] An existing user can log back in and see their prior work.

**Checklist System**
- [ ] A QA/Manager user can create a checklist from scratch with at least 5 items.
- [ ] A user can load a pre-built template checklist (minimum 2 templates shipped).
- [ ] Checklists can be saved, versioned (v1 vs v2), and set to active/archived.

**Audit Execution**
- [ ] A user can open an active checklist and complete an audit session end-to-end.
- [ ] Each response is saved as the user progresses (no data loss on browser close).
- [ ] Completing an audit produces a timestamped, immutable audit record.
- [ ] A compliance score is calculated automatically on submission.

**Gap Analysis & Findings**
- [ ] Failed/non-compliant items automatically generate Findings.
- [ ] Each Finding has a severity, description, and status (open by default).
- [ ] The Findings list is filterable by severity and status.

**Record Keeping**
- [ ] Every audit record is read-only after submission (cannot be edited, only annotated).
- [ ] Corrective actions can be added to Findings with timestamps.

**Data Import**
- [ ] A user can upload a CSV and map at least 3 columns to schema fields.
- [ ] Imported data appears in the Analytics section linked to the correct category.
- [ ] Import errors (bad format, missing required fields) are shown clearly; no silent failures.

**Analytics**
- [ ] A trend line chart renders for at least one checklist category over a selectable date range.
- [ ] Top failing items are visible as a ranked list.
- [ ] Charts handle "no data" state gracefully (no blank screen crashes).

**Report Generation**
- [ ] A user can generate an Audit Summary report for a single audit.
- [ ] Report exports as a downloadable PDF.
- [ ] Report includes: generated-by, date, scope, compliance score, and finding list.
- [ ] Generated report is logged in the Reports history.

**Non-Functional**
- [ ] All pages load in < 3 seconds on a standard connection.
- [ ] No unhandled errors exposed to the user (all error states have a message).
- [ ] Mobile-responsive layout — usable on a tablet in portrait mode.
- [ ] All user-submitted data is validated server-side before persistence.

---

_When all boxes above are checked: Product Architect signs off, Phase 01 closes, Phase 02 begins._
