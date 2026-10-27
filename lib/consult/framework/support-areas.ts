// ─── ASSESSMENT FRAMEWORK: SPECIALTY & SUPPORT AREAS ────────────────────────
// Endoscopes, water, environment, quality systems, equipment, and the OR
// interface. Same citation conventions as core-areas.ts.

import type { FrameworkArea } from '@/lib/consult/types'

const ST79  = 'ANSI/AAMI ST79'
const ST91  = 'ANSI/AAMI ST91'
const ST108 = 'ANSI/AAMI ST108'
const ST58  = 'ANSI/AAMI ST58'
const ST90  = 'ANSI/AAMI ST90'
const AORN  = 'AORN Guidelines for Perioperative Practice'
const SGNA  = 'SGNA Standards for Reprocessing Flexible GI Endoscopes'
const CDC   = 'CDC Guideline for Disinfection and Sterilization (2008)'
const IFU   = 'Manufacturer IFU'
const ASHRAE = 'ASHRAE/ASHE 170'

export const endo: FrameworkArea = {
  id: 'endo', name: 'Flexible Endoscopes & HLD',
  description: 'Endoscope pre-clean, leak testing, cleaning, HLD/sterilization, drying, and storage.',
  items: [
    { id: 'en-1', area: 'endo', risk: 'critical', refs: [ST91, SGNA, IFU], text: 'Bedside pre-cleaning is performed immediately after the procedure and the scope is transported in a closed, labeled container', lookFor: 'Observe a procedure room turnover', fix: 'Implement a bedside pre-clean checklist and closed transport containers for every scope.' },
    { id: 'en-2', area: 'endo', risk: 'critical', refs: [ST91, IFU], text: 'Leak testing is performed before manual cleaning on every scope per IFU', lookFor: 'Leak test logs; observe technique', fix: 'Make leak testing a documented step before manual cleaning for every scope, every time.' },
    { id: 'en-3', area: 'endo', risk: 'critical', refs: [ST91], text: 'Manual cleaning begins within the IFU-defined window; delayed scopes follow a delayed-reprocessing protocol', lookFor: 'Time stamps from procedure end to manual clean', fix: 'Track time-to-clean and adopt a delayed-reprocessing protocol for scopes that exceed it.' },
    { id: 'en-4', area: 'endo', risk: 'critical', refs: [ST91, ST58, IFU], text: 'HLD solution minimum effective concentration (MEC) is tested per IFU and test strips are QC\'d; AER cycles are documented', lookFor: 'MEC log, test-strip QC log, AER printouts', fix: 'Document MEC each use/day per IFU, QC each new bottle of strips, and retain AER cycle records.' },
    { id: 'en-5', area: 'endo', risk: 'major', refs: [ST91], text: 'Cleaning verification is performed on duodenoscopes and other high-risk scopes; microbiological surveillance is considered', lookFor: 'ATP/protein testing logs; culture program', fix: 'Implement cleaning verification for every high-risk scope and evaluate a culture surveillance program.' },
    { id: 'en-6', area: 'endo', risk: 'critical', refs: [ST91, IFU], text: 'Scopes are dried completely (including channels with instrument air) and stored in a ventilated/drying cabinet', lookFor: 'Drying method, cabinet type, hang time policy', fix: 'Add forced instrument-air channel drying and drying/ventilated storage cabinets per ST91.' },
    { id: 'en-7', area: 'endo', risk: 'major', refs: [ST91, 'FDA duodenoscope safety communications'], text: 'Duodenoscopes and other complex scopes follow enhanced reprocessing (e.g., sterilization or double HLD, disposable components where available)', lookFor: 'Duodenoscope policy and inventory', fix: 'Adopt enhanced duodenoscope reprocessing and evaluate disposable-endcap models.' },
    { id: 'en-8', area: 'endo', risk: 'major', refs: [ST91, CDC], text: 'Every scope is traceable to patient, AER/cycle, and reprocessing technician', lookFor: 'Trace one scope end to end', fix: 'Enable scope-level tracking linking patient, reprocessor, and AER cycle.' },
  ],
}

export const water: FrameworkArea = {
  id: 'water', name: 'Water Quality',
  description: 'Utility vs. critical water, monitoring, and response to excursions.',
  items: [
    { id: 'wt-1', area: 'water', risk: 'critical', refs: [ST108], text: 'Water quality requirements are defined for each process step (utility vs. critical water) and documented', lookFor: 'Water management plan section for SPD', fix: 'Write a water quality plan that defines utility vs. critical water for each step per ST108.' },
    { id: 'wt-2', area: 'water', risk: 'critical', refs: [ST108], text: 'Critical water (final rinse) meets specified quality and is monitored at the defined frequency', lookFor: 'Conductivity/TOC/bacterial testing results', fix: 'Install or validate critical-water treatment and establish a monitoring schedule with action limits.' },
    { id: 'wt-3', area: 'water', risk: 'major', refs: [ST108, 'ASHRAE 188'], text: 'SPD is represented on the facility water management team', lookFor: 'Water management team roster/minutes', fix: 'Add SPD leadership to the facility water management team.' },
    { id: 'wt-4', area: 'water', risk: 'major', refs: [ST108], text: 'Steam quality (purity, dryness) is assessed when wet packs or staining occur', lookFor: 'Steam quality test records', fix: 'Perform steam quality testing and include it in wet-pack and staining investigations.' },
    { id: 'wt-5', area: 'water', risk: 'major', refs: [ST108], text: 'A response plan exists for water quality excursions (who is notified, what is held)', lookFor: 'Excursion response procedure', fix: 'Create a water excursion response algorithm with notification and hold steps.' },
  ],
}

export const environment: FrameworkArea = {
  id: 'environment', name: 'Environment & Facility',
  description: 'HVAC, pressure relationships, temperature/humidity, eyewash, and housekeeping.',
  items: [
    { id: 'ev-1', area: 'environment', risk: 'critical', refs: [ST79, ASHRAE], text: 'Decon is under negative pressure and clean areas under positive pressure, with documented verification', lookFor: 'Pressure monitors or facilities verification records', fix: 'Install pressure monitors (or a facilities verification schedule) and document results.' },
    { id: 'ev-2', area: 'environment', risk: 'major', refs: [ST79, ASHRAE], text: 'Temperature and humidity are monitored in each zone and stay within limits', lookFor: 'Logs for decon, IAP, sterile storage', fix: 'Monitor temp/RH continuously by zone with a facilities escalation path.' },
    { id: 'ev-3', area: 'environment', risk: 'critical', refs: ['OSHA 29 CFR 1910.151(c)', 'ANSI/ISEA Z358.1'], text: 'Emergency eyewash/shower is reachable within 10 seconds of chemical use, unobstructed, and tested weekly', lookFor: 'Location, obstructions, weekly activation log', fix: 'Relocate or add eyewash stations within 10 seconds of chemical use and log weekly activation.' },
    { id: 'ev-4', area: 'environment', risk: 'major', refs: [ST79], text: 'Environmental cleaning of SPD is scheduled and documented (floors daily, high surfaces on a schedule)', lookFor: 'EVS schedule and logs', fix: 'Agree a written EVS cleaning schedule for SPD with documentation.' },
    { id: 'ev-5', area: 'environment', risk: 'minor', refs: [ST79], text: 'Surfaces are non-porous and in good repair; no exposed ceiling, damaged walls, or rust', lookFor: 'Ceiling tiles, wall damage, cart condition', fix: 'Submit facilities work orders for surface repairs and track to closure.' },
    { id: 'ev-6', area: 'environment', risk: 'major', refs: [ST79, 'OSHA 29 CFR 1910.1200 (HazCom)'], text: 'Chemicals are labeled, SDS are accessible, and incompatible chemicals are stored separately', lookFor: 'Chemical storage, labels, SDS access', fix: 'Audit chemical labeling/storage and make SDS available at point of use.' },
  ],
}

export const quality: FrameworkArea = {
  id: 'quality', name: 'Quality Systems & Documentation',
  description: 'Records, traceability, event reporting, KPIs, and continuous improvement.',
  items: [
    { id: 'qa-1', area: 'quality', risk: 'critical', refs: [ST79, ST90], text: 'Load records link each sterilized item to sterilizer, cycle, and contents so recalls can be executed', lookFor: 'Trace one tray from patient back to its load', fix: 'Configure tracking so every item is traceable to load and patient; test with a mock recall.' },
    { id: 'qa-2', area: 'quality', risk: 'major', refs: [ST79], text: 'Sterilization records are retained per facility/state requirements and are retrievable', lookFor: 'Retention policy; retrieve a 6-month-old record', fix: 'Define a record retention schedule and move to electronic retention where possible.' },
    { id: 'qa-3', area: 'quality', risk: 'major', refs: [ST90], text: 'A defined KPI set is trended (e.g., IUSS rate, set defects, BI failures, wet packs, turnaround)', lookFor: 'KPI dashboard and trends', fix: 'Publish a monthly SPD dashboard with targets and owners.' },
    { id: 'qa-4', area: 'quality', risk: 'major', refs: [ST90, AORN], text: 'Defects reported from the OR (missing, bioburden, damaged) are captured, categorized, and root-caused', lookFor: 'Defect log, feedback loop to OR', fix: 'Implement a closed-loop defect reporting process with monthly root-cause review.' },
    { id: 'qa-5', area: 'quality', risk: 'major', refs: [ST90], text: 'Internal audits of SPD processes occur on a schedule with corrective actions tracked to closure', lookFor: 'Audit schedule, CAPA log', fix: 'Establish a quarterly internal audit schedule and a CAPA log with owners and due dates.' },
    { id: 'qa-6', area: 'quality', risk: 'minor', refs: [ST90], text: 'Mock recall drill is performed at least annually', lookFor: 'Last drill date and results', fix: 'Schedule an annual mock recall and debrief findings.' },
  ],
}

export const equipment: FrameworkArea = {
  id: 'equipment', name: 'Equipment & Instrument Management',
  description: 'Preventive maintenance, instrument repair, inventory, and loaners.',
  items: [
    { id: 'eq-1', area: 'equipment', risk: 'major', refs: [ST79, IFU], text: 'Preventive maintenance for sterilizers, washers, AERs, and ultrasonics is current with records on file', lookFor: 'PM records vs. schedule for every device', fix: 'Reconcile PM schedules with biomed/vendor and escalate overdue PM.' },
    { id: 'eq-2', area: 'equipment', risk: 'major', refs: [ST79, AORN], text: 'A preventive instrument repair/sharpening program exists and damaged instruments are removed from service', lookFor: 'Repair program, red-tag process', fix: 'Implement a scheduled instrument repair program and a red-tag removal process.' },
    { id: 'eq-3', area: 'equipment', risk: 'major', refs: [AORN, ST79], text: 'Loaner instruments arrive with IFUs and enough lead time (e.g., ≥24–48h) to process; late arrivals are tracked', lookFor: 'Loaner log, late arrival rate', fix: 'Enforce a loaner policy with arrival deadlines, IFU requirement, and late-arrival reporting to surgical leadership.' },
    { id: 'eq-4', area: 'equipment', risk: 'minor', refs: [ST90], text: 'Instrument inventory is sufficient to support case volume without excessive IUSS or rushed turnaround', lookFor: 'Set utilization vs. turns; IUSS reasons', fix: 'Run an inventory-to-demand analysis and fund replacement/additional sets for high-turn trays.' },
    { id: 'eq-5', area: 'equipment', risk: 'major', refs: [ST79, CDC], text: 'Single-use devices are not reprocessed unless through an FDA-registered third-party reprocessor', lookFor: 'Any in-house SUD reprocessing', fix: 'Stop in-house SUD reprocessing; contract with an FDA-registered reprocessor if desired.' },
  ],
}

export const orInterface: FrameworkArea = {
  id: 'or', name: 'OR & Customer Interface',
  description: 'Communication with surgery and procedural customers, case cart accuracy, and scheduling.',
  items: [
    { id: 'or-1', area: 'or', risk: 'major', refs: [AORN], text: 'A standing SPD–OR communication forum exists (huddles, joint committee, defect review)', lookFor: 'Meeting schedule, minutes', fix: 'Stand up a weekly SPD–OR huddle and a monthly joint performance review.' },
    { id: 'or-2', area: 'or', risk: 'major', refs: [AORN, ST90], text: 'Case cart accuracy is measured and preference cards are maintained', lookFor: 'Case cart accuracy metric', fix: 'Measure case cart accuracy and assign preference card ownership.' },
    { id: 'or-3', area: 'or', risk: 'minor', refs: [AORN], text: 'SPD receives the surgical schedule with enough lead time to plan workload', lookFor: 'When/how schedule is received', fix: 'Automate delivery of next-day and add-on schedules to SPD.' },
    { id: 'or-4', area: 'or', risk: 'major', refs: [AORN, ST79], text: 'OR staff are educated on SPD-relevant practices (point-of-use treatment, IUSS criteria, event-related sterility)', lookFor: 'OR education records', fix: 'Deliver joint SPD/OR education on point-of-use, IUSS criteria, and package inspection.' },
  ],
}
