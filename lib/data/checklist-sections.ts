// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  text: string;
  rationale?: string;
}

export interface Section {
  id: string;
  label: string;
  icon: string;
  standard: string;
  items: ChecklistItem[];
}

// ─── CHECKLIST DATA (from PDF) ────────────────────────────────────────────────

export const SECTIONS: Section[] = [
  {
    id: "decon",
    label: "Decontamination",
    icon: "🧫",
    standard: "AAMI ST79 / AORN",
    items: [
      { id: "d1", text: "Decontamination area physically separated from clean areas by walls or partitions", rationale: "Separating dirty and clean areas limits environmental contamination." },
      { id: "d2", text: "Workflow is unidirectional — dirty to clean, without crisscrossing", rationale: "Unidirectional workflow contains contaminants and minimizes bloodborne pathogen exposure." },
      { id: "d3", text: "Floors and walls are nonporous materials that withstand frequent wet cleaning and chemical agents", rationale: "Nonporous materials are essential for effective cleaning and chemical exposure." },
      { id: "d4", text: "Ceiling is flush surface with recessed, enclosed fixtures", rationale: "Finished ceilings with enclosed fixtures limit condensation and dust accumulation." },
      { id: "d5", text: "Negative air pressure relative to adjoining clean areas with minimum 10 air exchanges/hour, exhausted outdoors via nonrecirculating system", rationale: "Negative pressure prevents air contaminants from entering clean areas." },
      { id: "d6", text: "Temperature maintained 16–18°C (60–65°F), humidity 30–60%", rationale: "Cool temperatures minimize bioburden; humidity control prevents microbial growth." },
      { id: "d7", text: "Emergency eyewash station accessible within 10 seconds from chemical use location", rationale: "OSHA requires immediate access to eyewash where hazardous chemicals are used." },
      { id: "d8", text: "Instruments pre-cleaned at point of use immediately following procedure", rationale: "Prompt cleaning is critical to prevent biofilm formation." },
      { id: "d9", text: "All multi-part instruments disassembled for cleaning to expose all surfaces", rationale: "Hidden surfaces can prevent thorough cleaning and reduce sterilization effectiveness." },
      { id: "d10", text: "Lumened devices flushed and brushed with correct size/type brush creating friction with lumen walls", rationale: "Specific brushing and flushing are needed to remove soil from lumens." },
      { id: "d11", text: "Fresh cleaning solution used for each endoscope; test strips verify disinfectant concentration before each use", rationale: "Fresh solution minimizes cross-contamination risk." },
      { id: "d12", text: "Devices thoroughly rinsed after both manual and mechanical cleaning", rationale: "Residues can detrimentally affect disinfection/sterilization efficacy." },
      { id: "d13", text: "Every item visually inspected for cleanliness and functionality after cleaning, before packaging", rationale: "Visual inspection verifies cleaning process success." },
    ]
  },
  {
    id: "preppack",
    label: "Prep & Packaging",
    icon: "📦",
    standard: "AAMI ST79",
    items: [
      { id: "pp1", text: "Prep/packaging area physically separate from decontamination area", rationale: "Separation prevents cross-contamination of cleaned items." },
      { id: "pp2", text: "Workflow unidirectional: decon → packaging → sterilization → sterile storage", rationale: "Unidirectional flow minimizes risk of recontamination." },
      { id: "pp3", text: "Temperature maintained 68–73°F (20–23°C)", rationale: "Prevents issues such as superheating during sterilization." },
      { id: "pp4", text: "Relative humidity maintained 30–60%", rationale: "High humidity promotes microbial growth; low humidity affects packaging performance." },
      { id: "pp5", text: "All personnel trained, competent, and compliant with decontamination, inspection, and packaging procedures", rationale: "Proper training reduces operator error and protects patients." },
      { id: "pp6", text: "All instruments visually inspected for cleanliness, damage, and functionality before packaging", rationale: "Inspections ensure all visible soil removed and devices are functional." },
      { id: "pp7", text: "All multi-part instruments disassembled; jointed instruments held open and unlocked before sterilization", rationale: "Disassembly ensures all surfaces are exposed to sterilizing agent." },
      { id: "pp8", text: "Excess moisture removed using filtered, medical-grade compressed air or validated drying methods", rationale: "Excess moisture can compromise sterility — wet packaging is considered contaminated." },
      { id: "pp9", text: "Instrument sets arranged in perforated or wire-mesh-bottom trays", rationale: "Proper tray selection is critical for air removal, steam penetration, and drainage." },
      { id: "pp10", text: "Only FDA-cleared packaging materials used, suitable for chosen sterilization method", rationale: "Packaging must allow sterilant penetration and maintain sterility until use." },
      { id: "pp11", text: "Packages labeled with lot control identifier including sterilizer number, date, and cycle number", rationale: "Lot identification enables recall and problem investigation if failure detected." },
      { id: "pp12", text: "External chemical indicator (CI) used on outside of every package (unless internal is visible)", rationale: "External CI distinguishes between processed and unprocessed items." },
      { id: "pp13", text: "Internal CI placed inside every package in area least accessible to sterilant", rationale: "Internal CI provides assurance sterilant penetrated packaging and reached contents." },
    ]
  },
  {
    id: "steril",
    label: "Sterilization",
    icon: "⚗️",
    standard: "AAMI ST79",
    items: [
      { id: "st1", text: "Correct sterilization cycle type selected (gravity-displacement vs. dynamic-air-removal) based on load", rationale: "Correct cycle must be selected based on sterilizer and load configuration." },
      { id: "st2", text: "Exposure time, temperature, and drying time selected per sterilizer manufacturer's written IFU", rationale: "Manufacturer has validated parameters for specific cycles." },
      { id: "st3", text: "All discrepancies between sterilizer, device, and packaging manufacturers' IFUs resolved before sterilization", rationale: "Device manufacturer specifies conditions necessary for safe sterilization." },
      { id: "st4", text: "Sterilizer loaded to allow adequate air removal, sterilant penetration, and steam evacuation", rationale: "Proper loading ensures sterilizing agent contacts all surfaces for prescribed time." },
      { id: "st5", text: "Physical monitors (time, temperature, pressure recorders or digital printouts) used for every sterilization load", rationale: "Physical monitoring provides real-time assessment of cycle conditions." },
      { id: "st6", text: "External Class 1 CI used on every package to distinguish processed from unprocessed items", rationale: "Differentiates between processed and unprocessed items." },
      { id: "st7", text: "Internal CI placed inside each package, tray, or rigid sterilization container", rationale: "Internal CI indicates conditions necessary for sterilization were reached within the package." },
      { id: "st8", text: "Biological indicator (BI) used within a PCD at minimum weekly, preferably every day sterilizer is in use", rationale: "BIs provide the only direct measure of lethality of a sterilization process." },
      { id: "st9", text: "PCD containing a BI used in every sterilization load containing implants; load quarantined until BI negative", rationale: "Implant sterilization should be closely monitored with quarantine until verified." },
      { id: "st10", text: "Sterilizers inspected and cleaned daily per manufacturer's written IFU", rationale: "Periodic inspection and cleaning reduce equipment malfunction frequency." },
      { id: "st11", text: "Preventive maintenance performed by qualified individual per manufacturer's written IFU", rationale: "Malfunction of critical components can cause sterilization failures." },
      { id: "st12", text: "Maintenance record kept for each sterilizer including continuous history of all scheduled and unscheduled service", rationale: "Accurate records required for process verification and malfunction analysis." },
      { id: "st13", text: "Loads from malfunctioning sterilizers considered nonsterile and quarantined", rationale: "A faulty sterilizer cannot be made operational without identifying and correcting the underlying problem." },
    ]
  },
  {
    id: "storage",
    label: "Sterile Storage",
    icon: "🗄️",
    standard: "AAMI ST79",
    items: [
      { id: "ss1", text: "Sterile storage is a separate, enclosed area with limited access" },
      { id: "ss2", text: "Temperature maintained at approximately 24°C (75°F)" },
      { id: "ss3", text: "Relative humidity maintained at or below 70%" },
      { id: "ss4", text: "Positive air pressure with minimum 4 air exchanges per hour" },
      { id: "ss5", text: "Area free from exposed water or sewer pipes; not located next to or under sinks" },
      { id: "ss6", text: "Sterile items stored at least 8–10 inches above the floor" },
      { id: "ss7", text: "Sterile items stored at least 18 inches below ceiling or sprinkler heads" },
      { id: "ss8", text: "Sterile items stored at least 2 inches from outside walls" },
      { id: "ss9", text: "All stored items protected from being crushed, bent, compressed, or punctured" },
      { id: "ss10", text: "Outside shipping containers and corrugated cartons excluded from sterile storage area" },
      { id: "ss11", text: "All shelves and carts used for storage kept clean and dry" },
      { id: "ss12", text: "Flexible endoscopes stored hanging vertically with distal tip free to allow drainage" },
      { id: "ss13", text: "All valves and detachable components removed from endoscopes before storage" },
    ]
  },
  {
    id: "general",
    label: "General & Staff",
    icon: "👥",
    standard: "AAMI ST79 / CMS",
    items: [
      { id: "gs1", text: "Up-to-date policies and procedures for all SPD functions available and accessible to all staff" },
      { id: "gs2", text: "Documented and current competency assessment for all SPD staff members" },
      { id: "gs3", text: "Ongoing continuing education provided and documented for all staff" },
      { id: "gs4", text: "Appropriate PPE (gowns, masks, face shields, gloves) readily available in all areas" },
      { id: "gs5", text: "All staff consistently and correctly don and doff required PPE for assigned tasks" },
      { id: "gs6", text: "All required documentation (load records, maintenance logs) complete, accurate, and legible" },
      { id: "gs7", text: "Hand hygiene performed between tasks and before entering clean areas" },
      { id: "gs8", text: "Routine schedule for cleaning and disinfecting work surfaces maintained and documented" },
      { id: "gs9", text: "Department layout follows clear one-way workflow dirty to clean, preventing cross-contamination" },
      { id: "gs10", text: "Access to clean and sterile areas restricted to authorized personnel" },
      { id: "gs11", text: "Adequate ventilation in all areas to maintain appropriate temperature, humidity, and air pressure" },
      { id: "gs12", text: "All manufacturer IFUs for cleaning, disinfecting, and sterilizing devices available and current" },
      { id: "gs13", text: "Discrepancies between sterilizer, device, and packaging manufacturers' IFUs investigated and resolved" },
      { id: "gs14", text: "All SPD equipment regularly maintained per manufacturer IFUs" },
      { id: "gs15", text: "Specific documented process for managing loaner instrumentation receipt, processing, and return" },
    ]
  },
  {
    id: "water",
    label: "Water Quality",
    icon: "💧",
    standard: "AAMI ST108",
    items: [
      { id: "wq1", text: "Facility tap water is colorless, clear, with no sediment" },
      { id: "wq2", text: "Utility Water used for flushing, washing, and intermediate rinsing" },
      { id: "wq3", text: "When Utility Water used as final rinse after chemical HLD: bacterial level < 10 CFU/mL, endotoxin < 10 EU/mL" },
      { id: "wq4", text: "Critical Water used for final rinse of all critical and semi-critical devices" },
      { id: "wq5", text: "Steam condensate pH within 5.0–9.2 range and total hardness < 1 mg CaCO₃/L" },
      { id: "wq6", text: "Water treatment system in secure, designated area with restricted access" },
      { id: "wq7", text: "Water distribution pipelines constructed from compatible material (e.g., Schedule 80 PVC, polypropylene)" },
      { id: "wq8", text: "All pipelines designed to avoid dead-legs where water can become stagnant" },
      { id: "wq9", text: "Water distribution system is a fully recirculating loop" },
      { id: "wq10", text: "System recirculation flow rate maintained at minimum 3–5 feet per second" },
      { id: "wq11", text: "Storage tank designed with conical base that drains completely" },
      { id: "wq12", text: "Schematic diagram (PFD) of water system available and clearly labeled" },
      { id: "wq13", text: "Multidisciplinary team in place to manage water quality program" },
      { id: "wq14", text: "Regular maintenance schedule followed for all water treatment equipment" },
      { id: "wq15", text: "Water storage tanks and distribution loops disinfected at least monthly" },
      { id: "wq16", text: "Routine water quality tests performed: at least quarterly for Utility Water, monthly for Critical Water" },
      { id: "wq17", text: "Regular visual inspections conducted daily for water-related issues (staining, scaling, corrosion)" },
    ]
  },
  {
    id: "hld",
    label: "HLD & Flexible Scopes",
    icon: "🔬",
    standard: "AAMI ST91 / SGNA",
    items: [
      { id: "hd1", text: "All channels flushed with water and cleaning solution immediately after procedure to prevent soil drying" },
      { id: "hd2", text: "Time between device use and start of reprocessing recorded; staff aware of maximum allowable delay" },
      { id: "hd3", text: "Dedicated transport containers used with clear 'dirty' designations, properly cleaned/disinfected between uses" },
      { id: "hd4", text: "Decontamination area maintains negative air pressure relative to preparation/clean side" },
      { id: "hd5", text: "If single sink used, drained, cleaned, and refilled with fresh solution after processing each scope" },
      { id: "hd6", text: "Leak test performed immediately upon arrival; leak tester air flow routinely tested and documented" },
      { id: "hd7", text: "Scope manually cleaned with detergent at correct concentration and temperature" },
      { id: "hd8", text: "Correct size brushes used for each lumen, verified against scope manufacturer's IFU" },
      { id: "hd9", text: "If Simethicone used during case, additional pre-cleaning steps taken to ensure residue removal" },
      { id: "hd10", text: "Endoscope inspected using lighted magnification before HLD" },
      { id: "hd11", text: "Borescope/scope camera used to inspect high-risk channels (e.g., elevator wire channel)" },
      { id: "hd12", text: "Protein residual testing performed as part of routine audit to verify channel cleaning efficacy" },
      { id: "hd13", text: "Automated Endoscope Reprocessor (AER) operated strictly per manufacturer's IFU" },
      { id: "hd14", text: "AER water filters changed at frequency specified by AER manufacturer's IFU" },
      { id: "hd15", text: "Minimum Effective Concentration (MEC) of HLD/Sterilant tested and documented for every cycle" },
      { id: "hd16", text: "AER utilizes Critical Water for final rinse step" },
      { id: "hd17", text: "All channels flushed with filtered medical-grade air/alcohol to ensure complete drying before storage" },
      { id: "hd18", text: "Scope stored hanging vertically with distal tip free-hanging in dedicated storage cabinet" },
      { id: "hd19", text: "Reprocessing record fully completed including physician and patient identifier/case linkage" },
      { id: "hd20", text: "All reprocessing staff certified (CRCST, CGRN) or actively working toward professional certification" },
      { id: "hd21", text: "HLD container clearly labeled with Date Opened and calculated Date of Expiration" },
      { id: "hd22", text: "HLD test strips stored, used, and interpreted per strip manufacturer's IFU" },
      { id: "hd23", text: "HLD solution temperature measured and documented before each use" },
      { id: "hd24", text: "Reprocessing log captures HLD Lot Number, MEC Test Strip Lot Number, Temperature, Date/Time Tested" },
    ]
  }
];
