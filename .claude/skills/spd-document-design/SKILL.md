---
name: "SPD Document Design"
description: "Visual document production skill for Sterile Processing. Produces work guides with photos, visual SOPs, laminated job aids, PDF forms, onboarding packets, count sheets, training handouts, competency checklists, and any branded document intended for physical floor use. Use when any of the following is needed: a document staff will use at the decon sink or assembly bench (not just read on screen), a step-by-step visual guide with photo placeholders, a quick reference card for lamination, a count sheet with image fields, an onboarding packet booklet, a competency checklist for hand-completion, a facility-branded leadership report, or a Scott Advisory Group client deliverable. A text SOP nobody reads is compliance theater — this skill produces documents that get used."
---

# SPD Document Design

## What This Skill Does

Produces physically usable SPD documents — designed to function on the floor, not just in a folder. Every document type has specific layout rules. Photo placeholders mark exactly where Terry provides images. Output in Markdown (for version control), HTML (for Notion), or PDF-ready format.

## Document Type Library

### Visual SOP

Step-by-step with photo at every step. Printed and laminated.

```
VISUAL SOP
Document No: CSS-[AREA]-[SEQ]        Version: X.X
Title: [Title]                        Effective: [YYYY-MM-DD]
Approved by: Terry Scott, Dir CSS     Review Date: [YYYY-MM-DD]
─────────────────────────────────────────────────────────────────

STEP 1: [Action verb + specific instruction]
[PHOTO: What correct action looks like — e.g., "PPE fully donned, gown tied, gloves double-cuffed"]
Caption: Correct PPE configuration before entering decon

STEP 2: [Action verb + specific instruction]
[PHOTO: ...]
Caption: ...

REFERENCES: [AAMI standard, section, edition]
```

### Work Guide (Complex Instrument)

Multi-page reference for complex tray processing. Includes disassembly, cleaning, inspection, reassembly, packaging, cycle parameters.

```
WORK GUIDE
Instrument: [Full primary name per spd-catalog-agent standard]
Catalog No: [MFR CODE]-[PART#]
SQ Track ID: [ID]
Version: X.X   Effective: [YYYY-MM-DD]
─────────────────────────────────────────────────────────────────

SECTION 1 — DISASSEMBLY
[PHOTO: Instrument assembled]
Step 1: [instruction]
Step 2: [instruction]
[PHOTO: Instrument disassembled with parts labeled]

SECTION 2 — CLEANING METHOD
Cleaning method: [Manual / Automated / Both]
Detergent: [product name, dilution per IFU]
Brush required: [size, type]
[PHOTO: Correct brush technique on the critical surface]

SECTION 3 — INSPECTION CRITERIA
- [Specific observable criterion 1]
- [Specific observable criterion 2]
[PHOTO: Acceptable vs. unacceptable condition side-by-side if possible]

SECTION 4 — REASSEMBLY
Step 1: [instruction]
[PHOTO: Reassembled instrument]

SECTION 5 — PACKAGING
Pouch type: [size, single/double wrap]
Placement: [orientation]
CI: [internal CI required Y/N, placement location]

SECTION 6 — STERILIZATION PARAMETERS
Method: [Steam / ETO / Peracetic / Low-Temp]
Cycle: [gravity/prevac, temp, time, drying time]
Per IFU: [IFU file reference]

IFU on file: Y  Last verified: [date]
```

### Quick Reference Card

Single page. High contrast. Key steps only. For lamination and posting.

```
[LARGE HEADER: TOPIC]
[Facility Name] — CSS Department      Version X.X | [YYYY-MM-DD]
─────────────────────────────────────────────────────────────────
1. [Step — 16pt minimum font equivalent in markdown: **bold**]
2. [Step]
3. [Step]
[PHOTO: Most critical visual]
[RED BOX: NEVER ___]
[GREEN BOX: ALWAYS ___]
Reference: [CSS-XXX-001 SOP]
─────────────────────────────────────────────────────────────────
```

### Onboarding Packet

Printable booklet. Day 1 through 90-day. See spd-educator-agent for content matrix.

Structure:
- Cover page: employee name, hire date, role, preceptor name, orientation end date
- Day 1 checklist
- Week 1 checklist
- 30-Day competency signature page
- 60-Day study plan
- 90-Day independence certification page
- CRCST/CSPDT study roadmap

### Competency Checklist

Hand-completion format. Filed as regulatory evidence.

```
COMPETENCY ASSESSMENT
Staff Name: _________________  Role: _________________
Date: ________________  Assessor: ________________

CRITERIA (check each as observed/verified):
□ [Observable criterion 1]      Method: Direct observation
□ [Observable criterion 2]      Method: Return demonstration
□ [Criterion 3 — knowledge]     Method: Verbal Q&A

RESULT:  □ PASS   □ FAIL — Remediation Required
Comments: _______________________________________________
Assessor Signature: _________________  Date: ____________
Next Verification Due: _______________
```

### Count Sheet

Per spd-catalog-agent layout standard, with image column.

See spd-catalog-agent for header and column specification.

### Training Handout

Single page. One topic. For huddle distribution.

- Topic header (large)
- 3–5 key points (bullet, not paragraph)
- One visual or diagram if applicable
- "Questions? See your supervisor or [contact]"
- Document number and version in footer

### Branded Leadership Report (Facility)

Header: Facility logo placement + primary brand color accent bar `[NEEDS INPUT: facility brand colors]`
Footer: Document number | Version | Effective date | "Central Sterile Services — [Facility Name]"

### SAG Client Deliverable

Header: Scott Advisory Group branding `[NEEDS INPUT FROM TERRY: SAG brand colors and logo]`
Footer: "Prepared by Scott Advisory Group. Confidential. Do not distribute without authorization." | Page X of Y

## Design Principles

| Rule | Application |
|---|---|
| Minimum 12pt body | All floor-use documents |
| Minimum 16pt for numbered steps | Visual SOPs, quick reference cards |
| Photos at point of use | Next to the step they illustrate, not at end of document |
| Color coding | Green = safe/compliant, Red = stop/non-compliant, Yellow = caution |
| No decorative elements | Every visual element must earn its place |
| Consistent header/footer | Document number, version, effective date on every page |

## Photo Integration

When Terry provides a photo:
- Insert at the correct step, not at the end
- Caption: describe what the CORRECT action looks like (not what the photo is called)
- Format: `[PHOTO: filename.jpg]` → replaced with actual image on final formatting

When Terry has not yet provided a photo:
- Insert: `[PHOTO NEEDED: description of what should be shown here]`
- Do not omit the placeholder — it is a production task item

## Output Formats

| Format | Use Case |
|---|---|
| Markdown | Version control, source of truth |
| HTML | Notion embedding, web display |
| PDF-ready | Print, lamination, formal distribution (via browser print or bash) |

Every output includes version tag and effective date in the document footer.

---

## Anti-Patterns

- Do NOT produce a document with paragraphs where numbered steps are required
- Do NOT omit photo placeholders — they are production task items, not optional
- Do NOT apply SAG branding to facility-internal documents or vice versa
- Do NOT use font sizes below 12pt in any floor-use document
- Do NOT use checkbox symbols `☐ ✓` in regulatory documents — use Y/N or Pass/Fail

## Wiring

**Called by:** spd-orchestrator, spd-sop-framework (final PDF output), spd-catalog-agent (count sheet formatting), spd-educator-agent (training materials), spd-competency (checklist formatting), spd-survey-readiness (mock survey reports), spd-capital-justification (branded reports), scott-advisory-pra (SAG deliverables)
**Calls:** Nothing — this is a terminal production node
