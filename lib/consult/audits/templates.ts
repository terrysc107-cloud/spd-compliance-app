// ─── INSTANT AUDIT LIBRARY ──────────────────────────────────────────────────
// Short, repeatable sample audits a consultant can start the moment a gap is
// seen. Each sample (one load, one tray, one scope cycle…) answers every item
// Yes / No / N/A. Items marked critical are patient-safety controls; a single
// "No" on one is called out separately in results.

import type { AreaId } from '@/lib/consult/types'

export interface AuditItemDef { id: string; text: string; critical?: boolean }

export interface AuditTemplate {
  id:          string
  name:        string
  areas:       AreaId[]           // which findings suggest it
  purpose:     string
  sampleUnit:  string             // singular noun shown in "Sample: one …"
  sampleHint:  string             // what to write in the sample reference
  defaultPerDay: number
  refs:        string[]
  items:       AuditItemDef[]
}

const ST79 = 'ANSI/AAMI ST79'
const ST91 = 'ANSI/AAMI ST91'
const ST90 = 'ANSI/AAMI ST90'
const AORN = 'AORN Guidelines for Perioperative Practice'
const IFU  = 'Manufacturer IFU'

export const AUDIT_TEMPLATES: AuditTemplate[] = [
  {
    id: 'steam-load', name: 'Steam Load Record & Release', areas: ['steril', 'quality'],
    purpose: 'Verifies each steam load is documented, monitored, and reviewed before release.',
    sampleUnit: 'load', sampleHint: 'Sterilizer # · Load #', defaultPerDay: 10, refs: [ST79],
    items: [
      { id: 'sl1', text: 'Load record complete: sterilizer, cycle #, date, operator' },
      { id: 'sl2', text: 'Load contents listed / traceable in tracking system' },
      { id: 'sl3', text: 'Cycle type matches contents per IFU (incl. extended cycles)' },
      { id: 'sl4', text: 'Physical monitors (printout/record) reviewed and signed before release', critical: true },
      { id: 'sl5', text: 'External CIs changed on every package' },
      { id: 'sl6', text: 'PCD/BI included when required (routine BI day or implants)', critical: true },
      { id: 'sl7', text: 'Load cooled per policy before handling' },
      { id: 'sl8', text: 'No wet packs found at unload' },
    ],
  },
  {
    id: 'air-removal', name: 'Bowie-Dick / Air-Removal Test Log', areas: ['steril'],
    purpose: 'Confirms the daily air-removal test is run, read, and acted on for every pre-vac sterilizer.',
    sampleUnit: 'sterilizer-day', sampleHint: 'Sterilizer # · date', defaultPerDay: 2, refs: [ST79, IFU],
    items: [
      { id: 'ar1', text: 'Test run in an empty chamber before the first load', critical: true },
      { id: 'ar2', text: 'Result interpreted and documented (pass/fail, initials)' },
      { id: 'ar3', text: 'Test sheet or electronic record retained' },
      { id: 'ar4', text: 'Failed test → sterilizer removed from service and escalated', critical: true },
    ],
  },
  {
    id: 'bi-log', name: 'Biological Indicator Log', areas: ['steril', 'quality'],
    purpose: 'Checks BI testing frequency, controls, documentation, and response to positives.',
    sampleUnit: 'BI test', sampleHint: 'Sterilizer # · date · lot #', defaultPerDay: 3, refs: [ST79, IFU],
    items: [
      { id: 'bi1', text: 'BI run at the required frequency for this sterilizer', critical: true },
      { id: 'bi2', text: 'Control BI from the same lot incubated' },
      { id: 'bi3', text: 'Read at the IFU-specified time; result documented' },
      { id: 'bi4', text: 'Lot number and expiration recorded' },
      { id: 'bi5', text: 'Positive BI → recall process initiated (N/A if negative)', critical: true },
    ],
  },
  {
    id: 'implant', name: 'Implant Load Release', areas: ['steril', 'or'],
    purpose: 'Ensures implants are quarantined until BI results, with documented exceptions only.',
    sampleUnit: 'implant load', sampleHint: 'Load # · set name', defaultPerDay: 3, refs: [ST79, AORN],
    items: [
      { id: 'im1', text: 'PCD with BI (and Class 5 CI) in the load', critical: true },
      { id: 'im2', text: 'Load held in quarantine until BI result', critical: true },
      { id: 'im3', text: 'If released early: exception form completed' },
      { id: 'im4', text: 'If released early: surgeon notified and documented' },
      { id: 'im5', text: 'Implant traceable to patient' },
    ],
  },
  {
    id: 'iuss', name: 'IUSS Log', areas: ['steril', 'or'],
    purpose: 'Tests whether immediate-use sterilization is limited to true urgent need and fully documented.',
    sampleUnit: 'IUSS cycle', sampleHint: 'Date · OR # · item', defaultPerDay: 5, refs: [ST79, AORN, 'CMS CoP 42 CFR 482.42 (Infection Prevention)'],
    items: [
      { id: 'iu1', text: 'Reason meets urgent-need criteria (not inventory or convenience)' },
      { id: 'iu2', text: 'Not an implant (or documented emergency)', critical: true },
      { id: 'iu3', text: 'Item cleaned/decontaminated per IFU before IUSS' },
      { id: 'iu4', text: 'Cycle parameters per IFU; physical monitoring recorded', critical: true },
      { id: 'iu5', text: 'Transported aseptically in a contained device' },
      { id: 'iu6', text: 'Patient traceability recorded' },
    ],
  },
  {
    id: 'hld', name: 'HLD / AER Reprocessing Record', areas: ['endo'],
    purpose: 'Audits each scope reprocessing cycle from leak test to storage.',
    sampleUnit: 'scope cycle', sampleHint: 'Scope serial · date', defaultPerDay: 8, refs: [ST91, IFU],
    items: [
      { id: 'hd1', text: 'Bedside pre-clean documented' },
      { id: 'hd2', text: 'Leak test performed and documented', critical: true },
      { id: 'hd3', text: 'Manual cleaning started within the IFU window' },
      { id: 'hd4', text: 'HLD MEC tested and passed', critical: true },
      { id: 'hd5', text: 'Test strip QC current for this bottle' },
      { id: 'hd6', text: 'AER cycle record complete' },
      { id: 'hd7', text: 'Dried (incl. channels) and stored per policy' },
      { id: 'hd8', text: 'Scope traceable to patient and reprocessor' },
    ],
  },
  {
    id: 'decon-ppe', name: 'Decontamination PPE & Technique', areas: ['decon', 'pou'],
    purpose: 'Direct observation of decon staff for PPE and cleaning technique.',
    sampleUnit: 'staff observation', sampleHint: 'Initials or role · time', defaultPerDay: 5, refs: [ST79, 'OSHA 29 CFR 1910.1030 (Bloodborne Pathogens)'],
    items: [
      { id: 'dp1', text: 'Fluid-resistant gown', critical: true },
      { id: 'dp2', text: 'Gloves appropriate for task' },
      { id: 'dp3', text: 'Face shield, or goggles with mask', critical: true },
      { id: 'dp4', text: 'Hair and shoe covers' },
      { id: 'dp5', text: 'Detergent measured to correct dilution' },
      { id: 'dp6', text: 'Device disassembled; lumens brushed with correct brush' },
      { id: 'dp7', text: 'Cleaning done below water line (no splashing)' },
    ],
  },
  {
    id: 'cleaning-verification', name: 'Cleaning Verification Testing', areas: ['decon', 'endo'],
    purpose: 'Tracks ATP/protein residual testing and response to failures.',
    sampleUnit: 'device tested', sampleHint: 'Device / tray · test type', defaultPerDay: 5, refs: [ST79, ST91],
    items: [
      { id: 'cv1', text: 'Test performed per schedule' },
      { id: 'cv2', text: 'Result passed on first test' },
      { id: 'cv3', text: 'Failure → recleaned and retested before use (N/A if passed)', critical: true },
      { id: 'cv4', text: 'Result documented' },
    ],
  },
  {
    id: 'tray-assembly', name: 'Tray Assembly Accuracy', areas: ['iap', 'or'],
    purpose: 'Inspects finished trays before sterilization for accuracy and cleanliness.',
    sampleUnit: 'tray', sampleHint: 'Tray name · assembler', defaultPerDay: 10, refs: [ST79, AORN],
    items: [
      { id: 'ta1', text: 'Contents match count sheet / recipe' },
      { id: 'ta2', text: 'No residual soil under lighted magnification', critical: true },
      { id: 'ta3', text: 'Instruments functional; insulation tested where applicable' },
      { id: 'ta4', text: 'Jointed instruments open; multipart disassembled' },
      { id: 'ta5', text: 'Internal CI placed correctly' },
      { id: 'ta6', text: 'Weight within limit; correct packaging' },
      { id: 'ta7', text: 'Label complete (contents, assembler, date)' },
    ],
  },
  {
    id: 'environment-log', name: 'Temperature & Humidity Log', areas: ['environment', 'storage'],
    purpose: 'Checks daily environmental readings and the response to excursions.',
    sampleUnit: 'day', sampleHint: 'Date', defaultPerDay: 1, refs: [ST79, 'ASHRAE/ASHE 170'],
    items: [
      { id: 'en1', text: 'Decontamination temperature in range' },
      { id: 'en2', text: 'Decontamination humidity in range' },
      { id: 'en3', text: 'IAP temperature and humidity in range' },
      { id: 'en4', text: 'Sterile storage temperature and humidity in range' },
      { id: 'en5', text: 'Pressure relationships verified' },
      { id: 'en6', text: 'Excursions documented with action taken (N/A if none)', critical: true },
    ],
  },
  {
    id: 'documentation', name: 'Paperwork & Documentation', areas: ['quality', 'leadership', 'staffing'],
    purpose: 'Spot-checks any SPD record for completeness and good documentation practice.',
    sampleUnit: 'record', sampleHint: 'Record type · date', defaultPerDay: 10, refs: [ST90, ST79],
    items: [
      { id: 'dc1', text: 'All required fields completed' },
      { id: 'dc2', text: 'Legible' },
      { id: 'dc3', text: 'Signed or initialed by the person performing the task' },
      { id: 'dc4', text: 'Dated (and timed where required)' },
      { id: 'dc5', text: 'Corrections single-line with initials (no white-out/overwrite)' },
      { id: 'dc6', text: 'Filed and retrievable per retention policy' },
    ],
  },
]

const BY_ID = new Map(AUDIT_TEMPLATES.map(t => [t.id, t]))

export function getAuditTemplate(id: string): AuditTemplate | undefined {
  return BY_ID.get(id)
}

/** Templates relevant to a finding's area first, then the rest. */
export function templatesFor(area?: AreaId): AuditTemplate[] {
  if (!area) return AUDIT_TEMPLATES
  const hit = AUDIT_TEMPLATES.filter(t => t.areas.includes(area))
  return [...hit, ...AUDIT_TEMPLATES.filter(t => !t.areas.includes(area))]
}
