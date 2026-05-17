---
name: "SPD Training Materials"
description: "In-service curriculum design and training content development skill for Sterile Processing. Use when: an in-service is needed following a quality event or CAP, new staff require onboarding content for a specific role or area, a standards update requires staff retraining (AAMI ST79 revision, new IUSS policy, new IFU), a supervisor development session is needed, a skills day or annual competency event needs curriculum design, content needs to be built for a specific technical skill (manual cleaning, wrapping, autoclave operation, scope processing), a return-to-service protocol requires training verification, or any educational content needs to be developed with measurable learning objectives and a competency verification plan attached. Every training output includes a competency verification plan — training without verification is not training."
---

# SPD Training Materials

## What This Skill Does

Designs and builds educational content for SPD staff, supervisors, and leadership. Produces in-services, onboarding curricula, skills day content, and supervisor development sessions. Every output includes a competency verification plan — if a training does not have a way to confirm that learning occurred, it is not a training; it is a meeting.

## Learning Objective Design

All learning objectives must use observable, measurable action verbs.

### Approved Verbs (observable, measurable)

**Knowledge level:** identify, list, describe, define, recall, name, state
**Comprehension level:** explain, summarize, classify, compare, distinguish
**Application level:** demonstrate, perform, apply, calculate, use, operate
**Analysis level:** analyze, differentiate, examine, select, assess

### Prohibited Verbs (not observable)

- understand (not observable — how do you measure "understanding"?)
- know (not observable)
- appreciate (not observable)
- be aware of (not observable)
- learn (the goal, not a criterion)
- be familiar with (not observable)

### Learning Objective Format

`Upon completion of this training, the staff member will be able to [verb] [specific behavior] [standard or condition].`

Examples:
- "Demonstrate proper PPE donning sequence including gloves, gown, face shield, and shoe covers before entering the decontamination area."
- "Identify the three conditions that require IUSS documentation beyond the sterilizer log."
- "Describe the AAMI ST79 requirement for biological indicator frequency in flash sterilization cycles."

## In-Service Design Template

Standard SPD in-service: 30–45 minutes. Longer sessions lose engagement; shorter sessions cannot cover technical content adequately.

```
IN-SERVICE DESIGN DOCUMENT
Topic: [specific skill or knowledge area]
Target audience: [Decon Techs / P&P Techs / All SPD / Leads / Travelers]
Trigger: [Quality event / Annual / Standards change / New equipment / Post-survey]
Duration: [30 / 45 / 60 minutes]
Date: [YYYY-MM-DD]   Facilitator: [role]
─────────────────────────────────────────────────────────────
LEARNING OBJECTIVES (2–4 per session):
1. [verb + behavior + standard]
2. [verb + behavior + standard]
3. [verb + behavior + standard]

SESSION OUTLINE:
Opening (5 min):
  - Connect to why this matters — patient safety, regulatory, quality data
  - Brief statement of what will be covered

Content block 1 (10–15 min):
  - Topic
  - Key points (3 max — more than 3 and nothing is retained)
  - Demonstrate or show (visual/hands-on preferred over lecture)

Content block 2 (10–15 min):
  - Topic
  - Key points
  - Practice component if applicable

Application/Practice (5–10 min):
  - Return demonstration, case scenario, or skills station

Closing (5 min):
  - Recap key points
  - Q&A
  - Documentation sign-in and competency verification instructions

MATERIALS NEEDED:
□ [Instrument, equipment, or supplies for demonstration]
□ [Reference document — SOP number, IFU]
□ [Sign-in sheet]
□ [Competency verification form — from spd-competency]

COMPETENCY VERIFICATION PLAN:
Method: [direct observation / return demonstration / written check]
Criteria: [specific observable behaviors from spd-competency]
Timing: [at end of session / within 5 business days / within 30 days]
─────────────────────────────────────────────────────────────
```

## Content by Trigger Type

### Post-Quality Event In-Service

**Do not:** reference the specific event or any individual involved
**Do:** use the event's root cause to build the content (teach the gap, not the incident)

Opening: "We've been seeing an increase in [metric]. Today we're reviewing [skill] to make sure everyone is aligned on current standards."

Build content around:
- What the standard requires (cite AAMI / TJC)
- What correct technique looks like (demonstrate)
- What failure looks like (contrast example)
- Practice component (return demonstration or case)

### Standards Update In-Service

When AAMI, TJC, or CMS releases a change:
1. spd-knowledge-propagation identifies the impacted area
2. This skill builds the training content for the updated requirement
3. spd-educator-agent schedules and delivers across all shifts
4. spd-competency validates the new knowledge
5. spd-sop-framework updates the SOP to reflect the change

Content structure for a standards update:
- What changed (before vs. after)
- Why it changed (brief rationale — "AAMI revised this because...")
- What you need to do differently (specific behavior change)
- Where to find the new SOP (CSS-[AREA]-[SEQ])

### New Equipment In-Service

Every new piece of equipment requires:
1. IFU review before training is designed — training must match the IFU
2. Hands-on demonstration with the actual equipment
3. Return demonstration by each staff member who will operate it
4. Documentation in SQ Track before independent operation is permitted

### Traveler Orientation Content

Travelers are oriented to MEMH-specific SOPs — not general SPD technique. They already know the technique. The training gap is facility-specific systems, count sheets, and protocols.

Traveler orientation priority list:
1. SQ Track navigation and documentation requirements
2. MEMH-specific SOP locations and numbering (CSS-[AREA]-[SEQ])
3. Case cart process and case readiness deadlines
4. Shift handoff expectations
5. Who to call for what (escalation contacts by role)
6. Loaner protocol (spd-vendor-loaner-mgmt summary)

## Supervisor Development

Supervisor competencies are different from technician competencies. Build supervisor sessions around:

| Topic | Method | Duration |
|---|---|---|
| Quality event investigation and documentation | Case study + role play | 60 min |
| Staff feedback conversations (performance vs. discipline) | Role play scenarios | 45 min |
| Shift handoff completeness | Simulation using handoff template | 30 min |
| Regulatory standard literacy | Discussion + reference review | 45 min |
| OR relationship management | Scenario + communication practice | 30 min |

## Documentation Requirements

Every in-service must produce:
1. Sign-in sheet with name, role, and date — kept on file per facility policy
2. Completed competency verification forms (where applicable)
3. Record entered in [SQ Track / Annette Brown] within 5 business days

**Record retention:** Per JCAHO and facility policy. Minimum 3 years for training records; longer if competency records (7 years typical).

---

## Anti-Patterns

- Do NOT write learning objectives using "understand," "know," or "be aware of" — use observable verbs
- Do NOT deliver an in-service without a competency verification plan attached
- Do NOT reference a specific quality event or name individuals in training content
- Do NOT use a sign-in sheet as the only evidence of competency — the sign-in proves attendance, not learning
- Do NOT build traveler orientation around general technique — MEMH-specific systems are the gap

## Wiring

**Called by:** spd-orchestrator (new training requests), spd-educator-agent (content development for in-service calendar), spd-knowledge-propagation (standards change → training build), spd-competency (remediation content for competency gaps)
**Calls:** spd-competency (verification plan for every training output), spd-sop-framework (SOP reference for all training content), spd-quality-gate (before any training content is delivered to staff)
