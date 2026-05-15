// ─── BUILT-IN ST91 TEMPLATE ───────────────────────────────────────────────────
// AAMI ST91: Flexible Endoscope Reprocessing
// 5 sections, 40 items total

import type { ChecklistItemDef, ChecklistTemplate } from '@/lib/types/checklist'

// ─── SECTION 1: PRE-CLEANING & POINT-OF-USE TREATMENT (8 items) ───────────────
const precleanItems: ChecklistItemDef[] = [
  {
    id: 'st91-0-0', order: 1,
    question: 'Endoscope suction/air-water channels flushed immediately at point-of-use following procedure completion',
    rationale: 'Immediate flushing prevents soil from drying in channels, which dramatically increases reprocessing difficulty.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-0-1', order: 2,
    question: 'Outer surface of endoscope wiped with damp cloth or sponge moistened with detergent solution at point-of-use',
    rationale: 'External surface wipe removes gross contamination before transport.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-0-2', order: 3,
    question: 'Elapsed time from end of procedure to start of reprocessing documented for each scope',
    rationale: 'Time elapsed directly impacts reprocessing difficulty; extended delays require validated extended cleaning.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-0-3', order: 4,
    question: 'Soiled endoscopes transported in dedicated, leak-proof, puncture-resistant, closed containers labeled "Biohazard"',
    rationale: 'Proper transport containers protect staff from exposure and prevent environmental contamination.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-0-4', order: 5,
    question: 'Transport containers cleaned and disinfected between each use per validated protocol',
    rationale: 'Contaminated transport containers are a source of cross-contamination between scopes.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-0-5', order: 6,
    question: 'Staff performing point-of-use pre-cleaning are competency-assessed and trained on current IFU requirements',
    rationale: 'Inadequate point-of-use treatment is a primary root cause of reprocessing failures.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-0-6', order: 7,
    question: 'Scope not allowed to dry or be stored unprocessed for longer than the delay time validated by the manufacturer',
    rationale: 'Extended drying of bioburden forms biofilm which may render standard reprocessing ineffective.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-0-7', order: 8,
    question: 'Simethicone use documented on reprocessing record when used during procedure, with additional pre-cleaning steps performed',
    rationale: 'Simethicone is not removed by standard cleaning and requires specific additional steps to prevent channel blockage.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
]

// ─── SECTION 2: LEAK TESTING (6 items) ────────────────────────────────────────
const leakTestItems: ChecklistItemDef[] = [
  {
    id: 'st91-1-0', order: 9,
    question: 'Leak test performed on every endoscope prior to manual cleaning, before immersion in liquid',
    rationale: 'Leak testing before immersion prevents internal flooding of a damaged scope, protecting the scope from irreparable damage.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-1-1', order: 10,
    question: 'Leak tester used is compatible with the scope being tested per scope manufacturer IFU',
    rationale: 'Incompatible leak testers may deliver incorrect pressure or damage scope connectors.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-1-2', order: 11,
    question: 'Scope pressurized to recommended PSI and submerged; all accessible surfaces inspected for bubbling',
    rationale: 'Full submersion is required to detect leaks in all accessible areas of the scope.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-1-3', order: 12,
    question: 'All control knobs, buttons, and angulation in all four directions tested during pressurized leak test',
    rationale: 'Moving angulation during leak test stresses the bending section, where leaks most commonly occur.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-1-4', order: 13,
    question: 'Scopes that fail leak test removed from service, tagged, and sent for repair before any further patient use',
    rationale: 'A leaking endoscope cannot be reliably reprocessed and poses direct patient infection risk.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-1-5', order: 14,
    question: 'Leak tester function verified and documented at least daily per manufacturer IFU before use',
    rationale: 'A malfunctioning leak tester may deliver false-pass results, allowing damaged scopes to proceed to patient use.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
]

// ─── SECTION 3: MANUAL CLEANING (8 items) ─────────────────────────────────────
const manualCleanItems: ChecklistItemDef[] = [
  {
    id: 'st91-2-0', order: 15,
    question: 'Detergent used for manual cleaning is enzymatic, low-foaming, and compatible with the scope per both IFUs',
    rationale: 'High-foaming or incompatible detergents can damage scope materials or leave residues that interfere with HLD.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-2-1', order: 16,
    question: 'Detergent solution prepared fresh for each scope or per manufacturer\'s validated use-life instructions',
    rationale: 'Reused detergent solution accumulates organic material and loses enzymatic efficacy.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-2-2', order: 17,
    question: 'Water temperature for manual cleaning maintained within range specified by detergent manufacturer IFU',
    rationale: 'Temperatures outside the validated range reduce enzymatic effectiveness.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-2-3', order: 18,
    question: 'All accessible channels brushed the number of times and with the brush size specified in scope IFU',
    rationale: 'Insufficient brushing leaves bioburden in channels that may prevent effective high-level disinfection.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-2-4', order: 19,
    question: 'Single-use brushes discarded after each scope; reusable brushes cleaned and high-level disinfected between uses',
    rationale: 'Contaminated brushes can transfer organisms between scopes, creating cross-contamination.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-2-5', order: 20,
    question: 'All detachable components (valves, buttons, caps) removed and cleaned individually per manufacturer IFU',
    rationale: 'Attached components create areas inaccessible to cleaning solutions and mechanical action.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-2-6', order: 21,
    question: 'Scope and all channels thoroughly rinsed with water after manual cleaning to remove detergent residue',
    rationale: 'Residual detergent can inactivate the HLD agent in the subsequent step.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-2-7', order: 22,
    question: 'Scope visually inspected using lighted magnification after cleaning and before HLD; visibly soiled scopes re-cleaned',
    rationale: 'Visual inspection after cleaning is the quality checkpoint before HLD; soil that remains will not be removed by HLD.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
]

// ─── SECTION 4: HIGH-LEVEL DISINFECTION / STERILIZATION (10 items) ────────────
const hldItems: ChecklistItemDef[] = [
  {
    id: 'st91-3-0', order: 23,
    question: 'HLD agent selected is FDA-cleared and listed as compatible with the specific scope model per both IFUs',
    rationale: 'Non-compatible HLD agents can damage scope materials and void manufacturer warranty.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-3-1', order: 24,
    question: 'MEC (Minimum Effective Concentration) tested and documented using test strips before each manual HLD soak',
    rationale: 'HLD solution below MEC is not effective and provides a false sense of safety.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-3-2', order: 25,
    question: 'HLD solution temperature verified and documented before each use; solution discarded if below minimum temperature',
    rationale: 'Temperature is directly correlated with HLD contact-time efficacy.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-3-3', order: 26,
    question: 'HLD container labeled with date opened, expiration date, and current MEC test result',
    rationale: 'Unlabeled HLD containers represent a critical failure point in reprocessing documentation.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-3-4', order: 27,
    question: 'All scope channels perfused with HLD solution for full contact-time duration per manufacturer IFU',
    rationale: 'Channel perfusion is essential; HLD in the basin alone does not guarantee internal channel disinfection.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-3-5', order: 28,
    question: 'AER (Automated Endoscope Reprocessor) used where available; AER validated and used per manufacturer IFU',
    rationale: 'AERs provide more standardized and reproducible reprocessing than manual methods.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-3-6', order: 29,
    question: 'AER water quality (Critical Water for final rinse) tested and documented per AER and scope manufacturer requirements',
    rationale: 'Contaminated rinse water can recontaminate a scope after HLD, making the entire reprocessing cycle futile.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-3-7', order: 30,
    question: 'AER cycle completion verified and documented for each reprocessing cycle; incomplete cycles prompt scope quarantine',
    rationale: 'Incomplete AER cycles must not be presumed effective; scope must be reprocessed.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-3-8', order: 31,
    question: 'Reprocessing record documents scope serial number, patient/procedure identifier, technician ID, and all chemical parameters',
    rationale: 'Complete traceability records are required for patient notification in the event of a reprocessing failure.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-3-9', order: 32,
    question: 'All reprocessing staff hold or are actively working toward CRCST or CGRN certification',
    rationale: 'Professional certification validates competency in the complex reprocessing chain.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
]

// ─── SECTION 5: DRYING, STORAGE & TRANSPORT (8 items) ────────────────────────
const dryingStorageItems: ChecklistItemDef[] = [
  {
    id: 'st91-4-0', order: 33,
    question: 'All channels flushed with filtered, medical-grade, 70–90% isopropyl alcohol followed by filtered compressed air after HLD',
    rationale: 'Alcohol-flush drying is essential for preventing waterborne organisms from proliferating in residual moisture.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-4-1', order: 34,
    question: 'External surface of scope thoroughly dried with a clean, low-lint cloth before storage',
    rationale: 'External moisture supports microbial growth on scope surfaces during storage.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-4-2', order: 35,
    question: 'Scopes stored in a dedicated, ventilated cabinet with sufficient space to prevent scope coiling or compression',
    rationale: 'Improper storage can damage scopes and create conditions that support microbial growth.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-4-3', order: 36,
    question: 'Scopes hung vertically in storage cabinet with all detachable components removed and caps off',
    rationale: 'Vertical hanging promotes drainage; removed caps allow residual moisture to evaporate.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-4-4', order: 37,
    question: 'Storage cabinet HEPA-filtered or positively pressured; temperature and humidity within specified ranges',
    rationale: 'Uncontrolled storage environments can allow recontamination of processed scopes.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-4-5', order: 38,
    question: 'Maximum hang-time (time between reprocessing and next patient use) documented and enforced per facility policy',
    rationale: 'Scopes hanging beyond the validated hang time must be reprocessed before patient use.',
    responseType: 'pass-fail', severity: 'critical', weight: 3,
  },
  {
    id: 'st91-4-6', order: 39,
    question: 'Scope storage cabinet cleaned and disinfected per schedule documented in facility policy',
    rationale: 'Contaminated storage cabinets can recontaminate processed scopes.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
  {
    id: 'st91-4-7', order: 40,
    question: 'Patient-ready scopes transported in clean, closed containers separate from soiled scopes or instruments',
    rationale: 'Transport in open or shared containers exposes processed scopes to environmental contamination.',
    responseType: 'pass-fail', severity: 'major', weight: 2,
  },
]

// ─── ASSEMBLED TEMPLATE ───────────────────────────────────────────────────────

export const st91Template: ChecklistTemplate = {
  id:          'builtin-st91',
  name:        'AAMI ST91 — Flexible Endoscope Reprocessing',
  description: 'End-to-end reprocessing compliance for flexible endoscopes. Covers point-of-use pre-cleaning, leak testing, manual cleaning, high-level disinfection/sterilization (manual and AER), and drying, storage, and transport requirements.',
  category:    'st91',
  version:     'v1',
  status:      'active',
  isBuiltIn:   true,
  createdAt:   '2024-01-01T00:00:00.000Z',
  updatedAt:   '2024-01-01T00:00:00.000Z',
  items: [
    ...precleanItems,
    ...leakTestItems,
    ...manualCleanItems,
    ...hldItems,
    ...dryingStorageItems,
  ],
}
