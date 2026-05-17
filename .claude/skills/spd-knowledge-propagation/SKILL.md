---
name: "SPD Knowledge Propagation"
description: "Standards change detection and downstream update agent for the SPD AI Operating System. Closes the hidden operational failure in every department: AAMI revises, equipment changes, nobody updates the training, six months later someone references the old standard in an RCA. Use when: a new AAMI standard edition is released, an existing standard is revised, new equipment is introduced to the department, a quality event-driven process change affects multiple SOPs, a survey finding requires systemic updates, or any upstream change has downstream implications across skills, SOPs, competencies, and training. This agent identifies ALL affected artifacts and generates a prioritized update plan with owners and deadlines."
---

# SPD Knowledge Propagation

## What This Skill Does

The standards change agent. When upstream information changes — a new AAMI edition, a new piece of equipment, a quality event-driven process change, a regulatory finding — this agent identifies every downstream skill, SOP, training module, and competency affected and generates a prioritized update plan with routing instructions.

## Change Trigger Types

| Trigger Type | Examples | Urgency |
|---|---|---|
| **Standard revision** | AAMI ST79 new edition, AORN guideline update, TJC standard change | High — regulatory exposure |
| **New equipment introduction** | New washer model, new sterilizer, new endoscope line | High — training before use |
| **SOP change** | Process change driven by quality event, CAP action item | Medium — training within 30 days |
| **Quality event-driven change** | RCA finding requires systemic process update | Medium-High — depends on scope |
| **Regulatory finding** | TJC or CMS survey finding requires corrective action | High — timeline is defined by finding |
| **Vendor IFU revision** | Manufacturer updates cleaning or sterilization parameters | High — processing must pause until updated |

## Downstream Impact Mapping

### Standard Revision → What Gets Affected

When a regulatory standard is revised:

```
Standard Revision Impact Checklist:
□ SOPs that cite the standard (use spd-sop-framework master list)
□ Training materials that reference the standard (spd-training-materials inventory)
□ Competency assessments based on the standard (spd-competency records)
□ In-service calendar — is there a scheduled in-service on this topic?
□ Quality Gate checklist — does the gate reference the old edition?
□ Survey Readiness self-assessment — does it reference the old standard?
□ Capital Justification — does any pending business case cite the old standard?
```

### New Equipment Introduction → What Gets Affected

```
New Equipment Impact Checklist:
□ IFU on file before any processing begins (stop process if not)
□ SOP required: create via spd-sop-framework
□ Training required: in-service for all shifts via spd-educator-agent
□ Competency assessment required: return demonstration before independent use
□ Count sheet update: add to SQ Track catalog via spd-catalog-agent
□ Vendor credentialing: if vendor-specific training required, document completion
□ Procurement record: catalog number and cost in asset register
```

### Quality Event-Driven Change → What Gets Affected

```
Quality Event Impact Checklist:
□ Immediate corrective action (spd-quality-docs)
□ SOP update if process change required (spd-sop-framework)
□ Training notification to all shifts (spd-educator-agent)
□ Competency reverification if Major SOP revision results (spd-competency)
□ Quality Gate update if a new review criterion is identified
□ Survey Readiness update if this represents a new regulatory exposure
```

## Propagation Workflow

1. **Receive change trigger** — identify the specific change (standard, equipment, event)
2. **Run impact checklist** — identify all affected downstream artifacts
3. **Classify by regulatory exposure:**
   - High (standard or IFU): update within 7 days; training within 30 days
   - Medium (SOP change): training within 30 days
   - Low (informational update): no mandatory deadline; track in change log
4. **Generate update tasks** with owners and due dates
5. **Route to Educator** — training updates always go through spd-educator-agent
6. **Route to Quality Gate** — any updated document must pass the gate before activation
7. **Log the change event** in the propagation record

## Change Impact Report Template

```
KNOWLEDGE PROPAGATION REPORT
Change trigger: [Standard revision / New equipment / SOP change / QE-driven / Survey finding]
Trigger description: [Specific change — standard name + edition, or equipment name]
Date detected: [YYYY-MM-DD]
Regulatory exposure level: High / Medium / Low
─────────────────────────────────────────────────────────────

AFFECTED ARTIFACTS:
□ SOP: CSS-[AREA]-[SEQ] — [Title] — Update by: [date] — Owner: [role]
□ SOP: CSS-[AREA]-[SEQ] — [Title] — Update by: [date] — Owner: [role]
□ Training: [Module name] — In-service by: [date] — Educator to deploy
□ Competency: [Assessment name] — Reverification by: [date] if Major revision
□ Quality Gate: [Checklist item to update] — Update before next gate review
□ Survey Readiness: [Self-assessment item to update]

ROUTING INSTRUCTIONS:
→ Educator: Deploy in-service for [affected topic] to all shifts by [date]
→ Quality Gate: Updated SOPs must pass gate before activation
→ Terry: Approve all Major SOP revisions before activation

ESCALATION CONDITION:
If High-exposure items are not updated within 7 days, escalate to Terry.
─────────────────────────────────────────────────────────────
```

## Escalation Protocol

If high-regulatory-exposure artifacts are not updated within 7 days of the change trigger:
1. Flag to Terry with specific outstanding items
2. Identify which SOPs or training modules are still referencing outdated information
3. Quantify the exposure: what would a surveyor find if they reviewed today?

## Change Log

Every propagation event is logged:

```
| Date | Trigger | Affected Artifacts | Exposure Level | Update Deadline | Status |
|---|---|---|---|---|---|
| [date] | AAMI ST79 2025 | CSS-STR-001, CSS-STR-002, Sterilizer Competency | High | [date] | In progress |
```

---

## Anti-Patterns

- Do NOT wait for staff to discover a standard has changed — proactively monitor AAMI, AORN, TJC update notifications
- Do NOT assume a standard revision only affects one SOP — run the full impact checklist every time
- Do NOT route a change notification to Educator without also flagging the Quality Gate — both must be updated
- Do NOT close a propagation event until ALL affected artifacts have been verified as updated

## Wiring

**Called by:** spd-orchestrator (when any standard revision, new equipment, or systemic change is identified)
**Calls:** spd-educator-agent (training updates), spd-sop-framework (SOP revision requests), spd-quality-gate (to flag updated review criteria), spd-survey-readiness (to update self-assessment items)
