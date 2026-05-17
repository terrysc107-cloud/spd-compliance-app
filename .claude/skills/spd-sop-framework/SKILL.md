---
name: "SPD SOP Framework"
description: "SOP architecture, versioning, and change control skill for Sterile Processing. Every corrective action plan ends with 'update the SOP' — this skill defines exactly what that means. Use when: writing a new SOP, revising an existing SOP, assigning an SOP number, determining if a revision is major (triggers competency reverification) or minor (clarification only), managing the SOP library master list, scheduling annual SOP reviews, routing an SOP through the approval workflow, archiving an old version, or notifying the Educator agent that a new or revised SOP requires staff training rollout. SOP numbering: CSS-[AREA CODE]-[SEQUENCE], e.g., CSS-DCN-001 for Decon area SOP #1."
---

# SPD SOP Framework

## What This Skill Does

Defines and manages the architecture of the CSS SOP library: numbering, templates, version control, approval workflow, and change control. Every CAP references this skill for the "update the SOP" action item. Every revised SOP triggers the Educator agent for training rollout.

## SOP Numbering Convention

Format: `CSS-[AREA CODE]-[SEQUENCE]`

### Area Codes

| Code | Area |
|---|---|
| DCN | Decontamination |
| PAK | Preparation and Packaging |
| STR | Sterilization |
| END | Endoscopy / HLD |
| STO | Sterile Storage and Distribution |
| QAL | Quality Assurance |
| ADM | Administrative |

**Examples:**
- `CSS-DCN-001` — First Decon SOP (e.g., PPE Donning and Doffing)
- `CSS-STR-003` — Third Sterilization SOP (e.g., Steam Sterilizer Biological Indicator Program)
- `CSS-QAL-001` — First Quality SOP (e.g., Corrective Action Process)

## SOP Template Structure

```
───────────────────────────────────────────────────────────────
CSS STANDARD OPERATING PROCEDURE
Number: CSS-[AREA]-[SEQ]          Title: [Title]
Version: [X.X]                    Effective Date: [YYYY-MM-DD]
Review Date: [YYYY-MM-DD]         Author: [Role, not name]
Approved by: Terry Scott, Director CSS
───────────────────────────────────────────────────────────────

1. PURPOSE
[One paragraph. Patient safety rationale. Why does this SOP exist and
what harm does it prevent?]

2. SCOPE
[Who this applies to: roles, shifts, areas. What equipment or processes
are covered.]

3. DEFINITIONS
[Key terms used in this SOP — especially technical terms staff may not know.]

4. EQUIPMENT AND MATERIALS REQUIRED
- [Item 1]
- [Item 2]

5. PROCEDURE
[Numbered steps. Each step begins with a verb. Each step is specific and
observable — not "clean the instrument" but "scrub with a soft-bristle
brush under running water for a minimum of 60 seconds on each surface."]

5.1 [Sub-step if needed]
5.2 [Sub-step if needed]

6. REFERENCES
- AAMI [Standard] [Section] ([Edition/Year])
- AORN Guidelines [section] ([Year])
- Manufacturer IFU: [name, version]
- Related SOPs: [CSS-XXX-00X — Title]

7. QUALITY MONITORING
[How compliance with this SOP is measured. Audit frequency. Who audits.
What the audit tool is (e.g., SPD compliance checklist in the compliance app).]

8. REVISION HISTORY
| Version | Date | Author | Change Description |
|---|---|---|---|
| 1.0 | [date] | [role] | Initial release |
| 1.1 | [date] | [role] | [what changed] |
───────────────────────────────────────────────────────────────
```

## Version Control Rules

| Change Type | Version Increment | Training Required |
|---|---|---|
| **Minor revision** | 0.x (1.0 → 1.1) | Notification only — Educator posts update |
| **Major revision** | x.0 (1.1 → 2.0) | Full competency reverification required |

### What constitutes a Major revision:
- Any change to the procedure steps
- Any change to required equipment or materials
- Any change driven by a regulatory update or quality event
- Any change that changes what staff must DO (not just how it's described)

### What constitutes a Minor revision:
- Correcting a typo or formatting error
- Adding a definition that was missing
- Updating a reference number without changing the procedure

## Approval Workflow

```
Request → Draft → Quality Gate Review → Terry Approval → Activation → Training Notification
```

1. **Request:** Comes from CAP, new equipment, regulatory change, or survey finding
2. **Draft:** SOP is written using the template above
3. **Quality Gate:** Route to spd-quality-gate for citation check, format check, scope check
4. **Terry Approval:** Terry reviews and approves — no SOP is active without this step
5. **Activation:** Document number assigned, effective date set, published to SOP library
6. **Training Notification:** spd-educator-agent notified with change brief — Educator owns rollout

**Old versions:** Archive with effective date range. Never delete. Store in same system as active SOPs, tagged as ARCHIVED.

## SOP Library Architecture

### Master List (maintain this)

| SOP Number | Title | Version | Effective Date | Review Date | Owner (Role) | Standard Reference |
|---|---|---|---|---|---|---|
| CSS-DCN-001 | [Title] | 1.0 | [date] | [date] | Supervisor | AAMI ST79 §10 |
| CSS-STR-001 | [Title] | 2.1 | [date] | [date] | Lead Tech | AAMI ST79 §12 |

### Annual Review Schedule

- All SOPs reviewed at least annually
- Review date = 12 months from effective date
- Review trigger events (also review outside annual schedule):
  - Regulatory standard revision
  - Quality event finding
  - New equipment introduction
  - Survey finding
  - CAP action item

## Change Control Log

Every change to the SOP library is logged:

```
Change Event Log
Date: [YYYY-MM-DD]
Trigger: [Standard revision / Quality event / New equipment / Survey finding / CAP]
SOPs Affected: [List CSS numbers]
Change type: Major / Minor
Approval: Terry Scott
Activation date: [date]
Training notification sent to Educator: Y/N
```

---

## Anti-Patterns

- Do NOT activate an SOP without Terry approval — no exceptions
- Do NOT delete old SOP versions — archive them with their effective date range
- Do NOT write a procedure step that is not observable ("ensure understanding" → use "demonstrate" instead)
- Do NOT write an SOP without a regulatory reference — if there is no standard to cite, explain why in the Purpose section
- Do NOT create a new SOP number without adding it to the Master List

## Wiring

**Called by:** spd-orchestrator (Full Chain for SOP creation/revision requests), spd-quality-docs (every CAP action item requiring SOP update), spd-survey-readiness (SOP currency check), spd-knowledge-propagation (when upstream standard changes require SOP updates)
**Calls:** spd-quality-gate (for review before activation), spd-educator-agent (training notification on every activation), spd-document-design (final PDF output of the SOP)
