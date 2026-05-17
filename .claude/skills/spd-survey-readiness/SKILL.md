---
name: "SPD Survey Readiness"
description: "Mock survey and self-assessment skill for Sterile Processing. Proactively audits the department against TJC, CMS, and NJ DOH standards before surveyors arrive. Use when: preparing for an upcoming survey, running a quarterly self-assessment, a recent quality event pattern suggests a survey vulnerability, a surveyor has arrived unannounced and staff need response coaching, pre-survey corrective actions need to be generated, documents need to be pulled for surveyor review, or staff need to practice answering surveyor questions. Finding classification mirrors TJC language: Immediate Jeopardy equivalent (must correct today), Requirement for Improvement (CAP within 30 days), Opportunity for Improvement (no mandatory deadline)."
---

# SPD Survey Readiness

## What This Skill Does

Proactively audits SPD against TJC, CMS, and NJ DOH standards. Simulates a surveyor walkthrough to identify gaps before they become findings. Generates classified findings with CAPs. Coaches staff on how to respond on the floor when surveyors are present.

## Mock Survey Protocol

### Trigger Conditions

Run a mock survey when:
- Quarterly self-assessment (minimum schedule)
- Any quality event cluster (3+ events of same type in 30 days)
- New equipment introduced (survey exposure until SOP and training complete)
- Recent external survey at a peer facility identified issues in your areas
- TJC window is open (surveys typically occur within 36 months of last survey)

### Surveyor Simulation Walkthrough

Conduct this walkthrough as if you are the surveyor. Review each area:

#### Decontamination

- [ ] PPE availability and donning compliance — full PPE visible and accessible at point of entry?
- [ ] Unidirectional traffic flow — is there a physical or procedural barrier between dirty and clean?
- [ ] Manual cleaning stations — brushes clean and not frayed, chemistry labeled with dilution ratio and date opened?
- [ ] Sharps disposal — puncture-resistant containers accessible and not overfilled?
- [ ] Personal items — no food, drink, or personal items in decon?
- [ ] Sink setup — dedicated instrument sink vs. handwash sink clearly differentiated?

#### Preparation and Packaging

- [ ] Count sheets present at assembly stations and current (revision date within 12 months)?
- [ ] Chemical indicators in every package?
- [ ] Instruments inspected before packaging — any visibly damaged instruments in workflow?
- [ ] Tray labels include contents, lot number, expiration/event-related dating?
- [ ] Work surfaces clean, no pooled water, organized workflow?

#### Sterilization

- [ ] Biological indicator program: frequency per AAMI ST79, results logged, spore log accessible?
- [ ] Chemical integrator/indicator use documented per load?
- [ ] Load records: complete, retrievable, signed?
- [ ] Immediate Use Steam Sterilization (IUSS): documented justification, flash log, no routine use?
- [ ] Parametric release criteria met for every load?
- [ ] Sterilizer maintenance logs current?
- [ ] Water quality records: conductivity/TDS tested and documented per frequency requirement?

#### Sterile Storage

- [ ] 8-18 inches off floor, 18 inches from ceiling, 2 inches from outside wall?
- [ ] Solid-bottom shelving or wrapped items not stored on wire shelving directly?
- [ ] No expired items in circulation? (event-related dating: any compromised packaging removed)
- [ ] No cardboard boxes in sterile storage?
- [ ] Temperature and humidity logged per facility policy?

#### Personnel

- [ ] Competency records for all active staff — current and on file?
- [ ] New hire orientation documentation complete?
- [ ] CRCST/CSPDT certifications current (no expired certs for staff claiming certification)?
- [ ] Annual competency reverification done for all staff?

#### Equipment

- [ ] Sterilizer validation (installation qualification, operational qualification, performance qualification) on file?
- [ ] Washer validation and maintenance schedule current?
- [ ] IFUs on file for all items processed?

#### Vendors

- [ ] Vendor credentialing current for all active reps?
- [ ] IFUs on file for all loaner sets processed in the last 12 months?
- [ ] Loaner intake documentation on file?

## Finding Classification

| Level | TJC Equivalent | Definition | Required Action |
|---|---|---|---|
| **Critical** | Immediate Jeopardy | Patient safety risk requires correction today | Correct before survey ends; notify Terry immediately |
| **Major** | Requirement for Improvement | Process or documentation gap requiring CAP | CAP within 30 days; document completion |
| **Minor** | Opportunity for Improvement | Improvement possible but not urgent | Track; no mandatory deadline |

## Pre-Survey Corrective Action

For every Major or Critical finding:
1. Generate a CAP using spd-quality-docs
2. Assign responsible party (role, not name)
3. Set due date (Critical: same day; Major: 30 days)
4. Verify completion before the actual survey date
5. Keep completion documentation accessible for surveyors

## Document Pull List (When Surveyor Asks)

Pull immediately when requested:

| Document | Location |
|---|---|
| Sterilizer load logs | [NEEDS INPUT FROM TERRY: SQ Track module or paper log location] |
| Biological indicator log | [NEEDS INPUT FROM TERRY] |
| Water quality records | [NEEDS INPUT FROM TERRY] |
| Competency records | facility education tracking system (SQ Track, LMS, or equivalent) |
| IFU library | [NEEDS INPUT FROM TERRY: file location] |
| Loaner intake records | SQ Track or paper log |
| IUSS (flash sterilization) log | [NEEDS INPUT FROM TERRY] |
| Equipment maintenance records | [NEEDS INPUT FROM TERRY] |
| SOPs | CSS SOP library (per spd-sop-framework numbering) |

## Staff Interview Coaching

Surveyors will ask staff directly. Train staff to answer these:

**"What do you do if an instrument fails inspection?"**
Expected answer: "I remove it from the tray, document it as a missing instrument, and notify my supervisor."

**"Walk me through what you do when a BI comes back positive."**
Expected answer: "I notify my supervisor immediately, recall all loads from that sterilizer back to the last negative BI, document the event, and do not release loads until the cause is investigated and the sterilizer is re-qualified."

**"What PPE do you wear in decontamination?"**
Expected answer: "Surgical gown, shoe covers, eye protection or face shield, and two pairs of gloves — utility gloves under cut-resistant gloves [or as specified in the facility PPE SOP]."

**"How do you know what cleaning method to use for an instrument?"**
Expected answer: "I follow the IFU — the manufacturer's written instructions for use. If I don't have the IFU, I can't process the instrument."

## On-Site Survey Response Protocol (Surveyor Is Here Now)

1. Notify Terry immediately — do not wait until they find you
2. Accompany surveyors to the area — never leave them unescorted
3. Answer questions factually and directly — do not volunteer additional information
4. If you don't know: "I don't have that in front of me right now. Let me get that for you." (then get Terry)
5. If a finding is cited in real time: acknowledge, do not argue, document
6. Pull documents promptly when asked — delays create an impression of disorganization

---

## Anti-Patterns

- Do NOT wait until a survey window opens to run a self-assessment — quarterly is the minimum
- Do NOT correct findings verbally during a real survey without documentation — verbal promises are not compliant
- Do NOT coach staff to say "I don't know" as a default — only use it if genuinely uncertain; it signals training gaps
- Do NOT let surveyors walk unescorted — this is both a compliance risk and a communication risk

## Wiring

**Called by:** spd-orchestrator (Full Chain for survey prep requests)
**Calls:** spd-quality-docs (CAP generation for each finding), spd-regulatory-research (standard citation validation), spd-sop-framework (to check SOP currency), spd-quality-gate (before any survey response document is delivered)
