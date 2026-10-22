// ─── ASSESSMENT FRAMEWORK: CORE PROCESSING AREAS ────────────────────────────
// Leadership → staffing → the instrument path (POU → decon → IAP → sterilize →
// store). Citations are named at the document level on purpose: editions and
// clause numbers move, and consultants override refs per observation anyway.

import type { FrameworkArea } from '@/lib/consult/types'

const ST79 = 'ANSI/AAMI ST79'
const ST90 = 'ANSI/AAMI ST90'
const AORN = 'AORN Guidelines for Perioperative Practice'
const CMS  = 'CMS CoP 42 CFR 482.42 (Infection Prevention)'
const TJC  = 'Joint Commission IC standards'
const BBP  = 'OSHA 29 CFR 1910.1030 (Bloodborne Pathogens)'
const IFU  = 'Manufacturer IFU'

export const leadership: FrameworkArea = {
  id: 'leadership', name: 'Leadership, Governance & Policy',
  description: 'Reporting structure, policy currency, IP partnership, and how leadership manages risk.',
  items: [
    { id: 'ld-1', area: 'leadership', risk: 'major', refs: [ST79, ST90], text: 'Department policies and procedures are current (reviewed within the defined cycle) and reflect the current editions of AAMI standards', lookFor: 'Policy manual review dates; ask for the ST79 edition they reference', fix: 'Establish a policy review calendar and crosswalk every SPD policy to current AAMI editions; retire superseded documents.' },
    { id: 'ld-2', area: 'leadership', risk: 'major', refs: [CMS, TJC], text: 'Infection Prevention participates in SPD oversight (rounding, reprocessing reviews, event investigation)', lookFor: 'IP rounding logs, committee minutes showing SPD agenda items', fix: 'Formalize a monthly IP/SPD rounding cadence with documented findings and follow-up.' },
    { id: 'ld-3', area: 'leadership', risk: 'major', refs: [ST90], text: 'SPD quality metrics are reported to a hospital-level committee (e.g., Infection Control, Quality, Perioperative Council)', lookFor: 'Dashboard or minutes from the last 2 quarters', fix: 'Define 5–7 SPD KPIs and report them quarterly to the Infection Control and Perioperative committees.' },
    { id: 'ld-4', area: 'leadership', risk: 'critical', refs: [ST79, CMS], text: 'A written process exists for sterilization failures, recalls, and patient notification, and staff can describe it', lookFor: 'Recall policy; ask a technician what happens after a positive BI', fix: 'Rewrite the recall/failure policy as a step-by-step algorithm, post it at each sterilizer, and drill it annually.' },
    { id: 'ld-5', area: 'leadership', risk: 'major', refs: [ST79, IFU], text: 'A process exists to obtain, store, and make current IFUs available at point of use for every device processed', lookFor: 'IFU database/binder; test retrieval on 3 random sets', fix: 'Implement an electronic IFU library linked to the tracking system with an owner for new-device intake.' },
    { id: 'ld-6', area: 'leadership', risk: 'minor', refs: [ST90], text: 'Leader holds a recognized SPD leadership certification and has a defined development plan', lookFor: 'CHL/CRCST or equivalent; leadership training records', fix: 'Support leader certification (e.g., CHL) and a structured leadership development plan.' },
    { id: 'ld-7', area: 'leadership', risk: 'major', refs: [AORN, ST79], text: 'New instruments, sets, and devices go through a documented intake review (IFU, equipment capability, staff training) before first use', lookFor: 'Value analysis or new-product evaluation form with SPD sign-off', fix: 'Require SPD sign-off on the value analysis form before any new reusable device is purchased or trialed.' },
  ],
}

export const staffing: FrameworkArea = {
  id: 'staffing', name: 'Staffing, Competency & Education',
  description: 'Certification, competency validation, orientation, and whether staffing matches workload.',
  items: [
    { id: 'sf-1', area: 'staffing', risk: 'major', refs: [ST79, 'State SPD certification law (where applicable)'], text: 'Technicians hold or are actively pursuing nationally recognized certification within a defined timeframe', lookFor: 'Certification roster vs. hire dates; state requirement', fix: 'Set a certification-within-X-months condition of employment and track progress monthly.' },
    { id: 'sf-2', area: 'staffing', risk: 'critical', refs: [ST79, ST90], text: 'Initial and annual competencies are documented for each process the technician performs (incl. each sterilizer type and complex devices)', lookFor: 'Pull 5 employee files; match competencies to assigned tasks', fix: 'Build a task-based competency matrix and validate every technician against it annually and at each new device introduction.' },
    { id: 'sf-3', area: 'staffing', risk: 'major', refs: [ST79], text: 'Structured orientation with a preceptor and sign-off before independent work', lookFor: 'Orientation checklist, preceptor assignments', fix: 'Standardize a phased orientation (decon → IAP → sterilization) with preceptor sign-off at each phase.' },
    { id: 'sf-4', area: 'staffing', risk: 'major', refs: [ST90], text: 'Staffing levels are matched to workload (case volume, trays/hour) and reviewed against a productivity standard', lookFor: 'FTE budget vs. actual, overtime, trays per labor hour', fix: 'Adopt a workload-based staffing model (trays/case volume per hour) and review it monthly with finance.' },
    { id: 'sf-5', area: 'staffing', risk: 'minor', refs: [ST79], text: 'Continuing education hours are tracked and supported (in-services, vendor education, CE credits)', lookFor: 'CE log, in-service calendar', fix: 'Publish a monthly in-service calendar and track CE hours per technician.' },
    { id: 'sf-6', area: 'staffing', risk: 'major', refs: [BBP], text: 'Staff are trained on bloodborne pathogens, chemical hazards, and PPE annually', lookFor: 'Annual safety training records, HazCom/SDS training', fix: 'Add BBP, HazCom, and PPE modules to the annual mandatory education packet.' },
  ],
}

export const pou: FrameworkArea = {
  id: 'pou', name: 'Point of Use & Transport',
  description: 'Treatment in the OR/procedure areas and safe transport of contaminated items.',
  items: [
    { id: 'pu-1', area: 'pou', risk: 'critical', refs: [ST79, AORN], text: 'Gross soil is removed and instruments are kept moist at point of use immediately after the procedure', lookFor: 'Observe 2–3 case turnovers; check returned trays for dried bioburden', fix: 'Implement a point-of-use treatment protocol (wipe, flush lumens, enzymatic/moisture spray) with OR education and audits.' },
    { id: 'pu-2', area: 'pou', risk: 'major', refs: [ST79, BBP], text: 'Contaminated items are transported in closed, labeled (biohazard) containers or carts', lookFor: 'Transport carts and bins from OR and clinics', fix: 'Standardize closed, labeled transport containers for every area that sends instruments to SPD.' },
    { id: 'pu-3', area: 'pou', risk: 'major', refs: [ST79], text: 'Time from end-of-use to decontamination is monitored and kept within the facility-defined limit', lookFor: 'Ask how delayed items (clinics, after-hours) are handled', fix: 'Define a maximum hold time and a delayed-processing protocol for items that miss it.' },
    { id: 'pu-4', area: 'pou', risk: 'minor', refs: [ST79], text: 'Sharps and disposables are removed at point of use before transport', lookFor: 'Inspect incoming trays in decon', fix: 'Reinforce sharps/disposable removal at point of use; track returns in a feedback log to the OR.' },
    { id: 'pu-5', area: 'pou', risk: 'major', refs: [ST79, 'ANSI/AAMI ST91'], text: 'Clinics and procedural areas outside the OR follow the same point-of-use and transport standards', lookFor: 'Visit 1–2 clinics / procedure rooms', fix: 'Extend point-of-use standards and audits to every department that uses reusable devices.' },
  ],
}

export const decon: FrameworkArea = {
  id: 'decon', name: 'Decontamination',
  description: 'Manual and mechanical cleaning, chemistry, PPE, and physical requirements of the dirty side.',
  items: [
    { id: 'dc-1', area: 'decon', risk: 'critical', refs: [ST79, IFU], text: 'Devices are cleaned per IFU — disassembled, correct brushes for lumens, correct detergent dilution, temperature, and contact time', lookFor: 'Watch a technician clean a lumened device; compare to IFU', fix: 'Post device-specific cleaning cards for high-risk devices and audit technique weekly until compliant.' },
    { id: 'dc-2', area: 'decon', risk: 'critical', refs: [ST79, BBP], text: 'Full PPE is worn in decon (fluid-resistant gown, gloves, face shield or goggles + mask, head and shoe covers)', lookFor: 'Direct observation of all staff in decon', fix: 'Stock PPE at the decon entrance, add a PPE donning poster, and perform daily leader spot checks.' },
    { id: 'dc-3', area: 'decon', risk: 'major', refs: [ST79], text: 'Cleaning chemistry is measured (not eyeballed) and sinks are marked for correct fill volume', lookFor: 'Sink fill lines, dosing pumps, measuring devices', fix: 'Mark fill lines on every sink and install automatic dosing or measured dispensers.' },
    { id: 'dc-4', area: 'decon', risk: 'critical', refs: [ST79], text: 'Mechanical washers are tested for cleaning efficacy (daily/each-cycle verification) and results are documented', lookFor: 'Washer test log (e.g., soil test indicators) and action taken on failures', fix: 'Implement daily washer verification testing with a documented response to failures.' },
    { id: 'dc-5', area: 'decon', risk: 'major', refs: [ST79], text: 'Ultrasonic cleaners are tested for cavitation and the solution is changed per IFU', lookFor: 'Ultrasonic test log, solution change log', fix: 'Add ultrasonic cavitation testing and a solution change schedule to the daily checklist.' },
    { id: 'dc-6', area: 'decon', risk: 'major', refs: [ST79], text: 'Cleaning verification (e.g., ATP or protein residual testing) is performed on complex/lumened devices', lookFor: 'Cleaning verification log and trending', fix: 'Introduce cleaning verification testing for lumened and complex devices with monthly trending.' },
    { id: 'dc-7', area: 'decon', risk: 'major', refs: [ST79], text: 'Brushes and cleaning implements are single-use or disinfected/sterilized at least daily', lookFor: 'Brush storage and replacement practice', fix: 'Move to single-use brushes or a documented daily brush reprocessing process.' },
    { id: 'dc-8', area: 'decon', risk: 'major', refs: [ST79], text: 'Workflow is unidirectional; clean items never re-enter decon and pass-through is controlled', lookFor: 'Traffic patterns, pass-through windows, door usage', fix: 'Re-map workflow and signage to enforce dirty-to-clean flow; restrict door usage.' },
  ],
}

export const iap: FrameworkArea = {
  id: 'iap', name: 'Inspection, Assembly & Packaging',
  description: 'Inspection with magnification, set accuracy, packaging selection, and labeling.',
  items: [
    { id: 'ia-1', area: 'iap', risk: 'critical', refs: [ST79, AORN], text: 'Every instrument is inspected for cleanliness and function; lighted magnification is available and used', lookFor: 'Lighted magnifiers at workstations; inspect 2 assembled sets for residual soil', fix: 'Install lighted magnification at every assembly station and require it for inspection of hinges, serrations, and lumens.' },
    { id: 'ia-2', area: 'iap', risk: 'major', refs: [ST79], text: 'Lumens and insulated instruments are tested (borescope for lumens where indicated, insulation testing for laparoscopic instruments)', lookFor: 'Borescope / insulation tester, testing logs', fix: 'Add borescope inspection for lumened devices and insulation testing for every insulated instrument each cycle.' },
    { id: 'ia-3', area: 'iap', risk: 'major', refs: [ST79], text: 'Count sheets / tracking system recipes are current and sets are assembled to them', lookFor: 'Compare 3 sets to their count sheets', fix: 'Assign set-content ownership and reconcile count sheets with surgeon preference changes quarterly.' },
    { id: 'ia-4', area: 'iap', risk: 'major', refs: [ST79, IFU], text: 'Set weight stays within packaging and container limits (generally ≤25 lb including container)', lookFor: 'Weigh the heaviest sets', fix: 'Split overweight sets and validate drying for heavy and dense trays.' },
    { id: 'ia-5', area: 'iap', risk: 'major', refs: [ST79, IFU], text: 'Packaging (wrap, pouches, rigid containers) is FDA-cleared for the sterilization method and used per IFU; containers are inspected and filters/valves maintained', lookFor: 'Container gaskets, filters, latches; wrap technique', fix: 'Implement a rigid container inspection and maintenance program and audit wrapping technique.' },
    { id: 'ia-6', area: 'iap', risk: 'major', refs: [ST79], text: 'Internal chemical indicators are placed in every package and external indicators/labels show load information', lookFor: 'Open 2 packages; check label for sterilizer, cycle, date, contents, assembler', fix: 'Standardize the label format (sterilizer #, cycle #, date, contents, assembler) and internal CI placement.' },
    { id: 'ia-7', area: 'iap', risk: 'minor', refs: [ST79], text: 'IAP area meets environmental expectations (clean, low-linting, no corrugated cardboard, controlled traffic)', lookFor: 'Shipping boxes in clean areas, food/drink, traffic', fix: 'Remove external shipping containers from clean areas and limit traffic to assigned staff.' },
  ],
}

export const steril: FrameworkArea = {
  id: 'steril', name: 'Sterilization & Monitoring',
  description: 'Cycle selection, physical/chemical/biological monitoring, load release, IUSS, and low-temp.',
  items: [
    { id: 'st-1', area: 'steril', risk: 'critical', refs: [ST79], text: 'Air-removal test (Bowie-Dick type) is run daily in each dynamic-air-removal sterilizer before the first load', lookFor: 'Daily test records for every pre-vac sterilizer', fix: 'Make the daily air-removal test a hard stop before first load, with documented sign-off.' },
    { id: 'st-2', area: 'steril', risk: 'critical', refs: [ST79], text: 'Biological indicators in a PCD are run routinely (at least weekly, preferably daily) and with every implant load', lookFor: 'BI log; frequency per sterilizer; implant load records', fix: 'Move to daily BI monitoring per sterilizer and a BI in every load containing implants.' },
    { id: 'st-3', area: 'steril', risk: 'critical', refs: [ST79, AORN], text: 'Implant loads are quarantined until BI results are known; early releases are documented with an exception form and reported', lookFor: 'Implant release log; early-release rate', fix: 'Implement an implant release policy with exception documentation and a monthly early-release metric reported to Quality.' },
    { id: 'st-4', area: 'steril', risk: 'critical', refs: [ST79], text: 'Each load\'s physical monitors (printout/electronic record) are reviewed and signed before release', lookFor: 'Pull 5 load records; check operator review/sign-off', fix: 'Require documented physical monitor review and sign-off on every load before release.' },
    { id: 'st-5', area: 'steril', risk: 'critical', refs: [ST79, AORN, CMS], text: 'Immediate-use steam sterilization (IUSS) is minimized, documented, monitored, and not used for implants (except documented emergencies)', lookFor: 'IUSS log, IUSS rate trend, reasons', fix: 'Track IUSS by reason, set a reduction target, and address root causes (inventory, turnaround, scheduling).' },
    { id: 'st-6', area: 'steril', risk: 'major', refs: [ST79, IFU], text: 'Correct cycle parameters are used for each device per IFU (including extended cycles)', lookFor: 'Spot-check 3 devices with extended cycles against IFU', fix: 'Build IFU-driven cycle assignments into the tracking system so the cycle is selected by the set, not the technician.' },
    { id: 'st-7', area: 'steril', risk: 'major', refs: ['ANSI/AAMI ST58', IFU, 'OSHA 29 CFR 1910.1047 (EtO, if used)'], text: 'Low-temperature sterilization (H₂O₂/ozone/EtO) is monitored per IFU and device compatibility is verified', lookFor: 'Low-temp BI/CI logs; device compatibility list', fix: 'Maintain a low-temp device compatibility list and monitor every cycle per IFU.' },
    { id: 'st-8', area: 'steril', risk: 'major', refs: [ST79], text: 'Sterilizers are qualified after installation, relocation, major repair, and failures (BI + air removal as indicated)', lookFor: 'Qualification testing after the last major repair', fix: 'Add a qualification-testing checklist to the work order process for every sterilizer repair.' },
    { id: 'st-9', area: 'steril', risk: 'major', refs: [ST79], text: 'Wet packs are tracked, investigated, and treated as non-sterile', lookFor: 'Wet pack log and investigation notes', fix: 'Track wet packs by set/sterilizer/load and investigate patterns (load config, steam quality, set density).' },
  ],
}

export const storage: FrameworkArea = {
  id: 'storage', name: 'Sterile Storage & Distribution',
  description: 'Storage environment, event-related sterility, and delivery to point of use.',
  items: [
    { id: 'sg-1', area: 'storage', risk: 'major', refs: [ST79], text: 'Sterile items are stored ≥8–10 in. above the floor, ≥18 in. below the ceiling/sprinklers, and ≥2 in. from outside walls', lookFor: 'Shelving clearances; bottom shelf solid', fix: 'Reconfigure shelving to required clearances and install solid bottom shelves.' },
    { id: 'sg-2', area: 'storage', risk: 'major', refs: [ST79, 'ASHRAE/ASHE 170'], text: 'Storage temperature and humidity are monitored and kept within limits; excursions are acted on', lookFor: 'Temp/humidity logs and excursion response', fix: 'Install continuous temp/RH monitoring with alarms and a documented excursion response.' },
    { id: 'sg-3', area: 'storage', risk: 'major', refs: [ST79, AORN], text: 'Event-related sterility is practiced; packages are inspected for integrity before use', lookFor: 'Policy; packaging condition on shelves (crushed, torn, dusty)', fix: 'Educate OR and SPD staff on event-related sterility and inspection before opening.' },
    { id: 'sg-4', area: 'storage', risk: 'minor', refs: [ST79], text: 'Stock rotation (FIFO) is practiced and storage is not overcrowded', lookFor: 'Overpacked shelves, compressed packages', fix: 'Right-size par levels and enforce first-in-first-out rotation.' },
    { id: 'sg-5', area: 'storage', risk: 'major', refs: [ST79], text: 'Sterile items are transported covered or in closed carts and protected from contamination', lookFor: 'Case cart and distribution practice', fix: 'Require covered or closed carts for all sterile distribution.' },
    { id: 'sg-6', area: 'storage', risk: 'minor', refs: [ST79], text: 'Sterile storage is limited-access and free of outside shipping cartons and food/drink', lookFor: 'Traffic, signage, cartons', fix: 'Limit access with signage/badging and remove shipping cartons at a breakdown area.' },
  ],
}
