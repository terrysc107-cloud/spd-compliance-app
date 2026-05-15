// ─── BUILT-IN ST79 TEMPLATE ───────────────────────────────────────────────────
// Derived from lib/data/checklist-sections.ts (SECTIONS array).
// The original 108-item hardcoded checklist is preserved here as a ChecklistTemplate.

import type { ChecklistItemDef, ChecklistTemplate, Severity } from '@/lib/types/checklist'

// Severity map: sectionId → itemId → severity (mirrors lib/data/severity-map.ts)
const SEV: Record<string, Record<string, Severity>> = {
  decon:  { d5: 'critical', d7: 'critical', d8: 'critical', d9: 'critical', d12: 'critical', d13: 'critical' },
  steril: { st8: 'critical', st9: 'critical', st13: 'critical', st5: 'critical' },
  hld:    { hd6: 'critical', hd15: 'critical', hd16: 'critical', hd19: 'critical', hd20: 'critical' },
}

function sev(sectionId: string, itemId: string): Severity {
  return SEV[sectionId]?.[itemId] ?? 'major'
}

function weight(severity: Severity): 1 | 2 | 3 {
  return severity === 'critical' ? 3 : severity === 'major' ? 2 : 1
}

// ─── SECTION: DECONTAMINATION ─────────────────────────────────────────────────
const deconItems: ChecklistItemDef[] = [
  { id: 'st79-0-0',  order: 1,  question: 'Decontamination area physically separated from clean areas by walls or partitions', rationale: 'Separating dirty and clean areas limits environmental contamination.', responseType: 'pass-fail', severity: sev('decon','d1'),  weight: weight(sev('decon','d1'))  },
  { id: 'st79-0-1',  order: 2,  question: 'Workflow is unidirectional — dirty to clean, without crisscrossing', rationale: 'Unidirectional workflow contains contaminants and minimizes bloodborne pathogen exposure.', responseType: 'pass-fail', severity: sev('decon','d2'),  weight: weight(sev('decon','d2'))  },
  { id: 'st79-0-2',  order: 3,  question: 'Floors and walls are nonporous materials that withstand frequent wet cleaning and chemical agents', rationale: 'Nonporous materials are essential for effective cleaning and chemical exposure.', responseType: 'pass-fail', severity: sev('decon','d3'),  weight: weight(sev('decon','d3'))  },
  { id: 'st79-0-3',  order: 4,  question: 'Ceiling is flush surface with recessed, enclosed fixtures', rationale: 'Finished ceilings with enclosed fixtures limit condensation and dust accumulation.', responseType: 'pass-fail', severity: sev('decon','d4'),  weight: weight(sev('decon','d4'))  },
  { id: 'st79-0-4',  order: 5,  question: 'Negative air pressure relative to adjoining clean areas with minimum 10 air exchanges/hour, exhausted outdoors via nonrecirculating system', rationale: 'Negative pressure prevents air contaminants from entering clean areas.', responseType: 'pass-fail', severity: sev('decon','d5'),  weight: weight(sev('decon','d5'))  },
  { id: 'st79-0-5',  order: 6,  question: 'Temperature maintained 16–18°C (60–65°F), humidity 30–60%', rationale: 'Cool temperatures minimize bioburden; humidity control prevents microbial growth.', responseType: 'pass-fail', severity: sev('decon','d6'),  weight: weight(sev('decon','d6'))  },
  { id: 'st79-0-6',  order: 7,  question: 'Emergency eyewash station accessible within 10 seconds from chemical use location', rationale: 'OSHA requires immediate access to eyewash where hazardous chemicals are used.', responseType: 'pass-fail', severity: sev('decon','d7'),  weight: weight(sev('decon','d7'))  },
  { id: 'st79-0-7',  order: 8,  question: 'Instruments pre-cleaned at point of use immediately following procedure', rationale: 'Prompt cleaning is critical to prevent biofilm formation.', responseType: 'pass-fail', severity: sev('decon','d8'),  weight: weight(sev('decon','d8'))  },
  { id: 'st79-0-8',  order: 9,  question: 'All multi-part instruments disassembled for cleaning to expose all surfaces', rationale: 'Hidden surfaces can prevent thorough cleaning and reduce sterilization effectiveness.', responseType: 'pass-fail', severity: sev('decon','d9'),  weight: weight(sev('decon','d9'))  },
  { id: 'st79-0-9',  order: 10, question: 'Lumened devices flushed and brushed with correct size/type brush creating friction with lumen walls', rationale: 'Specific brushing and flushing are needed to remove soil from lumens.', responseType: 'pass-fail', severity: sev('decon','d10'), weight: weight(sev('decon','d10')) },
  { id: 'st79-0-10', order: 11, question: 'Fresh cleaning solution used for each endoscope; test strips verify disinfectant concentration before each use', rationale: 'Fresh solution minimizes cross-contamination risk.', responseType: 'pass-fail', severity: sev('decon','d11'), weight: weight(sev('decon','d11')) },
  { id: 'st79-0-11', order: 12, question: 'Devices thoroughly rinsed after both manual and mechanical cleaning', rationale: 'Residues can detrimentally affect disinfection/sterilization efficacy.', responseType: 'pass-fail', severity: sev('decon','d12'), weight: weight(sev('decon','d12')) },
  { id: 'st79-0-12', order: 13, question: 'Every item visually inspected for cleanliness and functionality after cleaning, before packaging', rationale: 'Visual inspection verifies cleaning process success.', responseType: 'pass-fail', severity: sev('decon','d13'), weight: weight(sev('decon','d13')) },
]

// ─── SECTION: PREP & PACKAGING ────────────────────────────────────────────────
const prepPackItems: ChecklistItemDef[] = [
  { id: 'st79-1-0',  order: 14, question: 'Prep/packaging area physically separate from decontamination area', rationale: 'Separation prevents cross-contamination of cleaned items.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-1',  order: 15, question: 'Workflow unidirectional: decon → packaging → sterilization → sterile storage', rationale: 'Unidirectional flow minimizes risk of recontamination.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-2',  order: 16, question: 'Temperature maintained 68–73°F (20–23°C)', rationale: 'Prevents issues such as superheating during sterilization.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-3',  order: 17, question: 'Relative humidity maintained 30–60%', rationale: 'High humidity promotes microbial growth; low humidity affects packaging performance.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-4',  order: 18, question: 'All personnel trained, competent, and compliant with decontamination, inspection, and packaging procedures', rationale: 'Proper training reduces operator error and protects patients.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-5',  order: 19, question: 'All instruments visually inspected for cleanliness, damage, and functionality before packaging', rationale: 'Inspections ensure all visible soil removed and devices are functional.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-6',  order: 20, question: 'All multi-part instruments disassembled; jointed instruments held open and unlocked before sterilization', rationale: 'Disassembly ensures all surfaces are exposed to sterilizing agent.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-7',  order: 21, question: 'Excess moisture removed using filtered, medical-grade compressed air or validated drying methods', rationale: 'Excess moisture can compromise sterility — wet packaging is considered contaminated.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-8',  order: 22, question: 'Instrument sets arranged in perforated or wire-mesh-bottom trays', rationale: 'Proper tray selection is critical for air removal, steam penetration, and drainage.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-9',  order: 23, question: 'Only FDA-cleared packaging materials used, suitable for chosen sterilization method', rationale: 'Packaging must allow sterilant penetration and maintain sterility until use.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-10', order: 24, question: 'Packages labeled with lot control identifier including sterilizer number, date, and cycle number', rationale: 'Lot identification enables recall and problem investigation if failure detected.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-11', order: 25, question: 'External chemical indicator (CI) used on outside of every package (unless internal is visible)', rationale: 'External CI distinguishes between processed and unprocessed items.', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-1-12', order: 26, question: 'Internal CI placed inside every package in area least accessible to sterilant', rationale: 'Internal CI provides assurance sterilant penetrated packaging and reached contents.', responseType: 'pass-fail', severity: 'major', weight: 2 },
]

// ─── SECTION: STERILIZATION ───────────────────────────────────────────────────
const sterilItems: ChecklistItemDef[] = [
  { id: 'st79-2-0',  order: 27, question: 'Correct sterilization cycle type selected (gravity-displacement vs. dynamic-air-removal) based on load', rationale: 'Correct cycle must be selected based on sterilizer and load configuration.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-1',  order: 28, question: 'Exposure time, temperature, and drying time selected per sterilizer manufacturer\'s written IFU', rationale: 'Manufacturer has validated parameters for specific cycles.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-2',  order: 29, question: 'All discrepancies between sterilizer, device, and packaging manufacturers\' IFUs resolved before sterilization', rationale: 'Device manufacturer specifies conditions necessary for safe sterilization.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-3',  order: 30, question: 'Sterilizer loaded to allow adequate air removal, sterilant penetration, and steam evacuation', rationale: 'Proper loading ensures sterilizing agent contacts all surfaces for prescribed time.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-4',  order: 31, question: 'Physical monitors (time, temperature, pressure recorders or digital printouts) used for every sterilization load', rationale: 'Physical monitoring provides real-time assessment of cycle conditions.', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-2-5',  order: 32, question: 'External Class 1 CI used on every package to distinguish processed from unprocessed items', rationale: 'Differentiates between processed and unprocessed items.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-6',  order: 33, question: 'Internal CI placed inside each package, tray, or rigid sterilization container', rationale: 'Internal CI indicates conditions necessary for sterilization were reached within the package.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-7',  order: 34, question: 'Biological indicator (BI) used within a PCD at minimum weekly, preferably every day sterilizer is in use', rationale: 'BIs provide the only direct measure of lethality of a sterilization process.', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-2-8',  order: 35, question: 'PCD containing a BI used in every sterilization load containing implants; load quarantined until BI negative', rationale: 'Implant sterilization should be closely monitored with quarantine until verified.', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-2-9',  order: 36, question: 'Sterilizers inspected and cleaned daily per manufacturer\'s written IFU', rationale: 'Periodic inspection and cleaning reduce equipment malfunction frequency.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-10', order: 37, question: 'Preventive maintenance performed by qualified individual per manufacturer\'s written IFU', rationale: 'Malfunction of critical components can cause sterilization failures.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-11', order: 38, question: 'Maintenance record kept for each sterilizer including continuous history of all scheduled and unscheduled service', rationale: 'Accurate records required for process verification and malfunction analysis.', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-2-12', order: 39, question: 'Loads from malfunctioning sterilizers considered nonsterile and quarantined', rationale: 'A faulty sterilizer cannot be made operational without identifying and correcting the underlying problem.', responseType: 'pass-fail', severity: 'critical', weight: 3 },
]

// ─── SECTION: STERILE STORAGE ─────────────────────────────────────────────────
const storageItems: ChecklistItemDef[] = [
  { id: 'st79-3-0',  order: 40, question: 'Sterile storage is a separate, enclosed area with limited access', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-1',  order: 41, question: 'Temperature maintained at approximately 24°C (75°F)', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-2',  order: 42, question: 'Relative humidity maintained at or below 70%', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-3',  order: 43, question: 'Positive air pressure with minimum 4 air exchanges per hour', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-4',  order: 44, question: 'Area free from exposed water or sewer pipes; not located next to or under sinks', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-5',  order: 45, question: 'Sterile items stored at least 8–10 inches above the floor', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-6',  order: 46, question: 'Sterile items stored at least 18 inches below ceiling or sprinkler heads', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-7',  order: 47, question: 'Sterile items stored at least 2 inches from outside walls', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-8',  order: 48, question: 'All stored items protected from being crushed, bent, compressed, or punctured', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-9',  order: 49, question: 'Outside shipping containers and corrugated cartons excluded from sterile storage area', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-10', order: 50, question: 'All shelves and carts used for storage kept clean and dry', responseType: 'pass-fail', severity: 'minor', weight: 1 },
  { id: 'st79-3-11', order: 51, question: 'Flexible endoscopes stored hanging vertically with distal tip free to allow drainage', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-3-12', order: 52, question: 'All valves and detachable components removed from endoscopes before storage', responseType: 'pass-fail', severity: 'major', weight: 2 },
]

// ─── SECTION: GENERAL & STAFF ─────────────────────────────────────────────────
const generalItems: ChecklistItemDef[] = [
  { id: 'st79-4-0',  order: 53, question: 'Up-to-date policies and procedures for all SPD functions available and accessible to all staff', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-1',  order: 54, question: 'Documented and current competency assessment for all SPD staff members', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-2',  order: 55, question: 'Ongoing continuing education provided and documented for all staff', responseType: 'pass-fail', severity: 'minor', weight: 1 },
  { id: 'st79-4-3',  order: 56, question: 'Appropriate PPE (gowns, masks, face shields, gloves) readily available in all areas', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-4',  order: 57, question: 'All staff consistently and correctly don and doff required PPE for assigned tasks', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-5',  order: 58, question: 'All required documentation (load records, maintenance logs) complete, accurate, and legible', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-6',  order: 59, question: 'Hand hygiene performed between tasks and before entering clean areas', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-7',  order: 60, question: 'Routine schedule for cleaning and disinfecting work surfaces maintained and documented', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-8',  order: 61, question: 'Department layout follows clear one-way workflow dirty to clean, preventing cross-contamination', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-9',  order: 62, question: 'Access to clean and sterile areas restricted to authorized personnel', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-10', order: 63, question: 'Adequate ventilation in all areas to maintain appropriate temperature, humidity, and air pressure', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-11', order: 64, question: 'All manufacturer IFUs for cleaning, disinfecting, and sterilizing devices available and current', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-12', order: 65, question: 'Discrepancies between sterilizer, device, and packaging manufacturers\' IFUs investigated and resolved', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-13', order: 66, question: 'All SPD equipment regularly maintained per manufacturer IFUs', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-4-14', order: 67, question: 'Specific documented process for managing loaner instrumentation receipt, processing, and return', responseType: 'pass-fail', severity: 'major', weight: 2 },
]

// ─── SECTION: WATER QUALITY ───────────────────────────────────────────────────
const waterItems: ChecklistItemDef[] = [
  { id: 'st79-5-0',  order: 68, question: 'Facility tap water is colorless, clear, with no sediment', responseType: 'pass-fail', severity: 'minor', weight: 1 },
  { id: 'st79-5-1',  order: 69, question: 'Utility Water used for flushing, washing, and intermediate rinsing', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-2',  order: 70, question: 'When Utility Water used as final rinse after chemical HLD: bacterial level < 10 CFU/mL, endotoxin < 10 EU/mL', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-5-3',  order: 71, question: 'Critical Water used for final rinse of all critical and semi-critical devices', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-5-4',  order: 72, question: 'Steam condensate pH within 5.0–9.2 range and total hardness < 1 mg CaCO₃/L', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-5',  order: 73, question: 'Water treatment system in secure, designated area with restricted access', responseType: 'pass-fail', severity: 'minor', weight: 1 },
  { id: 'st79-5-6',  order: 74, question: 'Water distribution pipelines constructed from compatible material (e.g., Schedule 80 PVC, polypropylene)', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-7',  order: 75, question: 'All pipelines designed to avoid dead-legs where water can become stagnant', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-8',  order: 76, question: 'Water distribution system is a fully recirculating loop', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-9',  order: 77, question: 'System recirculation flow rate maintained at minimum 3–5 feet per second', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-10', order: 78, question: 'Storage tank designed with conical base that drains completely', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-11', order: 79, question: 'Schematic diagram (PFD) of water system available and clearly labeled', responseType: 'pass-fail', severity: 'minor', weight: 1 },
  { id: 'st79-5-12', order: 80, question: 'Multidisciplinary team in place to manage water quality program', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-13', order: 81, question: 'Regular maintenance schedule followed for all water treatment equipment', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-14', order: 82, question: 'Water storage tanks and distribution loops disinfected at least monthly', responseType: 'pass-fail', severity: 'major', weight: 2 },
  { id: 'st79-5-15', order: 83, question: 'Routine water quality tests performed: at least quarterly for Utility Water, monthly for Critical Water', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-5-16', order: 84, question: 'Regular visual inspections conducted daily for water-related issues (staining, scaling, corrosion)', responseType: 'pass-fail', severity: 'minor', weight: 1 },
]

// ─── SECTION: HLD & FLEXIBLE SCOPES ──────────────────────────────────────────
const hldItems: ChecklistItemDef[] = [
  { id: 'st79-6-0',  order: 85,  question: 'All channels flushed with water and cleaning solution immediately after procedure to prevent soil drying', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-1',  order: 86,  question: 'Time between device use and start of reprocessing recorded; staff aware of maximum allowable delay', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-2',  order: 87,  question: 'Dedicated transport containers used with clear \'dirty\' designations, properly cleaned/disinfected between uses', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-3',  order: 88,  question: 'Decontamination area maintains negative air pressure relative to preparation/clean side', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-4',  order: 89,  question: 'If single sink used, drained, cleaned, and refilled with fresh solution after processing each scope', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-5',  order: 90,  question: 'Leak test performed immediately upon arrival; leak tester air flow routinely tested and documented', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-6-6',  order: 91,  question: 'Scope manually cleaned with detergent at correct concentration and temperature', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-7',  order: 92,  question: 'Correct size brushes used for each lumen, verified against scope manufacturer\'s IFU', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-8',  order: 93,  question: 'If Simethicone used during case, additional pre-cleaning steps taken to ensure residue removal', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-9',  order: 94,  question: 'Endoscope inspected using lighted magnification before HLD', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-10', order: 95,  question: 'Borescope/scope camera used to inspect high-risk channels (e.g., elevator wire channel)', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-11', order: 96,  question: 'Protein residual testing performed as part of routine audit to verify channel cleaning efficacy', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-12', order: 97,  question: 'Automated Endoscope Reprocessor (AER) operated strictly per manufacturer\'s IFU', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-13', order: 98,  question: 'AER water filters changed at frequency specified by AER manufacturer\'s IFU', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-14', order: 99,  question: 'Minimum Effective Concentration (MEC) of HLD/Sterilant tested and documented for every cycle', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-6-15', order: 100, question: 'AER utilizes Critical Water for final rinse step', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-6-16', order: 101, question: 'All channels flushed with filtered medical-grade air/alcohol to ensure complete drying before storage', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-17', order: 102, question: 'Scope stored hanging vertically with distal tip free-hanging in dedicated storage cabinet', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-18', order: 103, question: 'Reprocessing record fully completed including physician and patient identifier/case linkage', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-6-19', order: 104, question: 'All reprocessing staff certified (CRCST, CGRN) or actively working toward professional certification', responseType: 'pass-fail', severity: 'critical', weight: 3 },
  { id: 'st79-6-20', order: 105, question: 'HLD container clearly labeled with Date Opened and calculated Date of Expiration', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-21', order: 106, question: 'HLD test strips stored, used, and interpreted per strip manufacturer\'s IFU', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-22', order: 107, question: 'HLD solution temperature measured and documented before each use', responseType: 'pass-fail', severity: 'major',    weight: 2 },
  { id: 'st79-6-23', order: 108, question: 'Reprocessing log captures HLD Lot Number, MEC Test Strip Lot Number, Temperature, Date/Time Tested', responseType: 'pass-fail', severity: 'major',    weight: 2 },
]

// ─── ASSEMBLED TEMPLATE ───────────────────────────────────────────────────────

export const st79Template: ChecklistTemplate = {
  id:          'builtin-st79',
  name:        'AAMI ST79 — Comprehensive Sterile Processing',
  description: 'Covers decontamination, packaging, sterilization, sterile storage, general department requirements, water quality, and flexible endoscope HLD. The foundational standard for central sterile processing departments.',
  category:    'st79',
  version:     'v1',
  status:      'active',
  isBuiltIn:   true,
  createdAt:   '2024-01-01T00:00:00.000Z',
  updatedAt:   '2024-01-01T00:00:00.000Z',
  items: [
    ...deconItems,
    ...prepPackItems,
    ...sterilItems,
    ...storageItems,
    ...generalItems,
    ...waterItems,
    ...hldItems,
  ],
}
