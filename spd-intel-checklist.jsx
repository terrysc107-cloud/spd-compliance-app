import { useState, useCallback } from "react";

// ─── CHECKLIST DATA (from PDF) ───────────────────────────────────────────────
const SECTIONS = [
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

const SEVERITY_MAP = {
  decon: { d5: "high", d7: "high", d8: "high", d9: "high", d12: "high", d13: "high", default: "medium" },
  steril: { st8: "high", st9: "high", st13: "high", st5: "high", default: "medium" },
  hld: { hd6: "high", hd15: "high", hd16: "high", hd19: "high", hd20: "high", default: "medium" },
};

function getSeverity(sectionId, itemId) {
  const map = SEVERITY_MAP[sectionId];
  if (!map) return "medium";
  return map[itemId] || map.default || "medium";
}

const SEVERITY_COLORS = {
  high: { bg: "rgba(239,68,68,0.12)", border: "#ef4444", text: "#ef4444", label: "High" },
  medium: { bg: "rgba(234,179,8,0.12)", border: "#eab308", text: "#eab308", label: "Medium" },
  low: { bg: "rgba(34,197,94,0.12)", border: "#22c55e", text: "#22c55e", label: "Low" },
};

// ─── SCORE UTILS ─────────────────────────────────────────────────────────────
function calcSectionScore(answers, section) {
  const applicable = section.items.filter(i => answers[i.id] !== "na");
  if (!applicable.length) return null;
  const yes = applicable.filter(i => answers[i.id] === "yes").length;
  return Math.round((yes / applicable.length) * 100);
}

function scoreColor(pct) {
  if (pct === null) return "#475569";
  if (pct >= 85) return "#22c55e";
  if (pct >= 65) return "#eab308";
  if (pct >= 40) return "#f97316";
  return "#ef4444";
}

function scoreBg(pct) {
  if (pct === null) return "rgba(71,85,105,0.1)";
  if (pct >= 85) return "rgba(34,197,94,0.1)";
  if (pct >= 65) return "rgba(234,179,8,0.1)";
  if (pct >= 40) return "rgba(249,115,22,0.1)";
  return "rgba(239,68,68,0.1)";
}

// ─── AI REPORT ───────────────────────────────────────────────────────────────
async function generateAIReport(gaps, profile, sectionScores) {
  const gapList = gaps.map(g =>
    `- [${g.severity.toUpperCase()}] ${g.sectionLabel} — ${g.text}${g.comment ? ` (Note: ${g.comment})` : ""}`
  ).join("\n");

  const scoreList = sectionScores.map(s =>
    `${s.label}: ${s.score !== null ? s.score + "%" : "N/A"}`
  ).join(", ");

  const prompt = `You are an expert sterile processing quality consultant reviewing a compliance self-assessment for a healthcare facility.

Facility context: ${profile}
Section scores: ${scoreList}

Findings (${gaps.length} total non-compliant items):
${gapList}

Generate a concise, actionable quality improvement report with:
1. Executive Summary (2-3 sentences on overall risk posture)
2. Top 3 Critical Priorities (high-severity items requiring immediate action within 7 days)
3. Section-by-Section Analysis (brief finding + recommended action per section that had findings)
4. 30/60/90 Day Action Framework (categorize all findings into timeframes)
5. Regulatory Risk Note (which standards are most at risk: AAMI, CMS, OSHA, Joint Commission)

Be direct, specific, and clinical. No filler. Format with clear headers using ##.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await response.json();
  return data.content?.[0]?.text || "Report generation failed.";
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function AuditModeSelector({ onSelect }) {
  const [hover, setHover] = useState(null);
  return (
    <div style={{ minHeight: "100vh", background: "#05091a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "99px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd", fontSize: "12px", fontWeight: 600, marginBottom: "20px", letterSpacing: "0.04em" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
          SPD INTEL · COMPLIANCE AUDIT
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#fff", marginBottom: "12px", letterSpacing: "-0.02em" }}>Select Audit Type</h1>
        <p style={{ color: "#64748b", fontSize: "15px", maxWidth: "400px" }}>Choose a full department-wide audit or focus on specific areas of concern.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "640px", width: "100%", marginBottom: "32px" }}>
        {/* Full Audit */}
        <button
          onMouseEnter={() => setHover("full")}
          onMouseLeave={() => setHover(null)}
          onClick={() => onSelect("full", SECTIONS.map(s => s.id))}
          style={{
            padding: "32px 24px", borderRadius: "20px", border: hover === "full" ? "1px solid rgba(59,130,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
            background: hover === "full" ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
            cursor: "pointer", textAlign: "left", transition: "all 0.2s"
          }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>📋</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Full Department Audit</div>
          <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>All 7 sections · ~100 items · Complete compliance picture · Recommended for annual surveys and pre-inspection readiness</div>
          <div style={{ marginTop: "16px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {SECTIONS.map(s => (
              <span key={s.id} style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "99px", background: "rgba(59,130,246,0.1)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.15)" }}>{s.label}</span>
            ))}
          </div>
        </button>

        {/* Focus Audit */}
        <button
          onMouseEnter={() => setHover("focus")}
          onMouseLeave={() => setHover(null)}
          onClick={() => onSelect("focus", [])}
          style={{
            padding: "32px 24px", borderRadius: "20px", border: hover === "focus" ? "1px solid rgba(168,85,247,0.6)" : "1px solid rgba(255,255,255,0.08)",
            background: hover === "focus" ? "rgba(168,85,247,0.08)" : "rgba(255,255,255,0.02)",
            cursor: "pointer", textAlign: "left", transition: "all 0.2s"
          }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>🎯</div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Focus Audit</div>
          <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>Select specific sections · Target known problem areas · Ideal for follow-up assessments and corrective action verification</div>
          <div style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "10px", background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.15)", fontSize: "12px", color: "#a78bfa" }}>
            You'll choose which sections to include →
          </div>
        </button>
      </div>
    </div>
  );
}

function SectionPicker({ onStart }) {
  const [selected, setSelected] = useState([]);
  const toggle = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  return (
    <div style={{ minHeight: "100vh", background: "#05091a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ maxWidth: "560px", width: "100%" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#fff", marginBottom: "8px", textAlign: "center" }}>Select Sections to Audit</h2>
        <p style={{ color: "#64748b", fontSize: "14px", textAlign: "center", marginBottom: "32px" }}>Choose one or more areas of focus.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "32px" }}>
          {SECTIONS.map(s => {
            const active = selected.includes(s.id);
            return (
              <button key={s.id} onClick={() => toggle(s.id)} style={{
                display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", borderRadius: "14px",
                border: active ? "1px solid rgba(99,102,241,0.6)" : "1px solid rgba(255,255,255,0.07)",
                background: active ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.02)",
                cursor: "pointer", textAlign: "left", transition: "all 0.15s"
              }}>
                <span style={{ fontSize: "22px" }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: active ? "#a5b4fc" : "#94a3b8" }}>{s.label}</div>
                  <div style={{ fontSize: "11px", color: "#475569" }}>{s.items.length} items · {s.standard}</div>
                </div>
                <div style={{ width: "20px", height: "20px", borderRadius: "6px", border: active ? "none" : "1px solid rgba(255,255,255,0.15)", background: active ? "#6366f1" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {active && <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
        <button
          disabled={!selected.length}
          onClick={() => onStart(selected)}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px", fontWeight: 700, fontSize: "15px",
            background: selected.length ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "rgba(255,255,255,0.05)",
            color: selected.length ? "#fff" : "#334155", border: "none", cursor: selected.length ? "pointer" : "not-allowed", transition: "all 0.2s"
          }}>
          Start Focus Audit ({selected.length} section{selected.length !== 1 ? "s" : ""} selected) →
        </button>
      </div>
    </div>
  );
}

function ChecklistItem({ item, sectionId, answer, comment, onAnswer, onComment }) {
  const isNo = answer === "no";
  return (
    <div style={{
      padding: "20px", borderRadius: "14px", border: isNo ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.07)",
      background: isNo ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)", marginBottom: "10px", transition: "all 0.2s"
    }}>
      <p style={{ color: "#e2e8f0", fontSize: "14px", lineHeight: 1.65, marginBottom: item.rationale ? "8px" : "14px", fontWeight: 500 }}>{item.text}</p>
      {item.rationale && (
        <p style={{ color: "#475569", fontSize: "12px", lineHeight: 1.55, marginBottom: "14px", fontStyle: "italic" }}>{item.rationale}</p>
      )}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["yes", "no", "na"].map(opt => {
          const labels = { yes: "✓ Yes", no: "✗ No", na: "N/A" };
          const colors = {
            yes: { active: { bg: "rgba(34,197,94,0.15)", border: "#22c55e", color: "#22c55e" }, idle: {} },
            no: { active: { bg: "rgba(239,68,68,0.15)", border: "#ef4444", color: "#ef4444" }, idle: {} },
            na: { active: { bg: "rgba(100,116,139,0.15)", border: "#64748b", color: "#64748b" }, idle: {} },
          };
          const isActive = answer === opt;
          return (
            <button key={opt} onClick={() => onAnswer(item.id, opt)} style={{
              padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              border: isActive ? `1px solid ${colors[opt].active.border}` : "1px solid rgba(255,255,255,0.1)",
              background: isActive ? colors[opt].active.bg : "rgba(255,255,255,0.03)",
              color: isActive ? colors[opt].active.color : "#475569",
              cursor: "pointer", transition: "all 0.15s"
            }}>{labels[opt]}</button>
          );
        })}
      </div>
      {isNo && (
        <div style={{ marginTop: "12px" }}>
          <textarea
            placeholder="Document finding, location, or context (recommended)..."
            value={comment}
            onChange={e => onComment(item.id, e.target.value)}
            rows={2}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", color: "#94a3b8",
              background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
              resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box"
            }}
          />
        </div>
      )}
    </div>
  );
}

function GapReport({ gaps, answers, selectedSectionIds, onRestart }) {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("gaps"); // gaps | report

  const sectionScores = SECTIONS.filter(s => selectedSectionIds.includes(s.id)).map(s => ({
    label: s.label,
    score: calcSectionScore(answers, s)
  }));

  const highGaps = gaps.filter(g => g.severity === "high");
  const medGaps = gaps.filter(g => g.severity === "medium");
  const lowGaps = gaps.filter(g => g.severity === "low");

  const handleGenerate = async () => {
    setLoading(true);
    setView("report");
    const profileStr = `SPD compliance self-assessment covering ${selectedSectionIds.length} section(s). ${sectionScores.map(s => `${s.label}: ${s.score}%`).join(", ")}.`;
    const text = await generateAIReport(gaps, profileStr, sectionScores);
    setReportText(text);
    setLoading(false);
  };

  const handlePrint = () => window.print();

  const formatReport = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h3 key={i} style={{ color: "#60a5fa", fontSize: "15px", fontWeight: 700, marginTop: "20px", marginBottom: "8px" }}>{line.replace("## ", "")}</h3>;
      if (line.startsWith("**") && line.endsWith("**")) return <p key={i} style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{line.replace(/\*\*/g, "")}</p>;
      if (!line.trim()) return <div key={i} style={{ height: "6px" }} />;
      return <p key={i} style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.7, marginBottom: "4px" }}>{line}</p>;
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05091a" }}>
      {/* Header */}
      <div style={{ background: "rgba(5,9,26,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "16px 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>⚕</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>SPD Intel</div>
              <div style={{ color: "#475569", fontSize: "11px" }}>Assessment Complete · {gaps.length} Finding{gaps.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => setView("gaps")} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: view === "gaps" ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.08)", background: view === "gaps" ? "rgba(59,130,246,0.1)" : "transparent", color: view === "gaps" ? "#60a5fa" : "#64748b", cursor: "pointer" }}>Gap Log</button>
            <button onClick={() => setView("report")} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: view === "report" ? "1px solid rgba(99,102,241,0.5)" : "1px solid rgba(255,255,255,0.08)", background: view === "report" ? "rgba(99,102,241,0.1)" : "transparent", color: view === "report" ? "#a5b4fc" : "#64748b", cursor: "pointer" }}>AI Report</button>
            <button onClick={handlePrint} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#64748b", cursor: "pointer" }}>Print</button>
            <button onClick={onRestart} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#64748b", cursor: "pointer" }}>New Audit</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Score Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", marginBottom: "32px" }}>
          {sectionScores.map(s => (
            <div key={s.label} style={{ padding: "16px", borderRadius: "12px", background: scoreBg(s.score), border: `1px solid ${scoreColor(s.score)}30`, textAlign: "center" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: scoreColor(s.score) }}>{s.score !== null ? `${s.score}%` : "—"}</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Severity Summary Bar */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
          {[{ label: "High", count: highGaps.length, color: "#ef4444", bg: "rgba(239,68,68,0.1)" }, { label: "Medium", count: medGaps.length, color: "#eab308", bg: "rgba(234,179,8,0.1)" }, { label: "Low", count: lowGaps.length, color: "#22c55e", bg: "rgba(34,197,94,0.1)" }].map(s => (
            <div key={s.label} style={{ flex: 1, padding: "14px", borderRadius: "12px", background: s.bg, border: `1px solid ${s.color}25`, textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{s.label} Priority</div>
            </div>
          ))}
        </div>

        {/* Gap Log View */}
        {view === "gaps" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>Gap Analysis Log</h2>
              <button onClick={handleGenerate} style={{ padding: "9px 18px", borderRadius: "10px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer" }}>
                🤖 Generate AI Report
              </button>
            </div>
            {gaps.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#334155" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#22c55e", marginBottom: "8px" }}>No Findings</div>
                <div style={{ fontSize: "14px" }}>All audited items are compliant.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["high", "medium", "low"].map(sev => {
                  const sevGaps = gaps.filter(g => g.severity === sev);
                  if (!sevGaps.length) return null;
                  const sc = SEVERITY_COLORS[sev];
                  return (
                    <div key={sev}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: sc.text, letterSpacing: "0.08em", marginBottom: "8px", marginTop: "8px" }}>{sc.label.toUpperCase()} PRIORITY — {sevGaps.length} finding{sevGaps.length !== 1 ? "s" : ""}</div>
                      {sevGaps.map((g, i) => (
                        <div key={i} style={{ padding: "16px 18px", borderRadius: "12px", background: sc.bg, border: `1px solid ${sc.border}30`, marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                            <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", background: `${sc.border}20`, color: sc.text, fontWeight: 700 }}>{g.sectionLabel}</span>
                            <span style={{ fontSize: "11px", color: "#475569" }}>{g.standard}</span>
                          </div>
                          <p style={{ color: "#e2e8f0", fontSize: "13px", lineHeight: 1.6, marginBottom: g.comment ? "8px" : 0 }}>{g.text}</p>
                          {g.comment && <p style={{ color: "#64748b", fontSize: "12px", fontStyle: "italic" }}>📝 {g.comment}</p>}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* AI Report View */}
        {view === "report" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700 }}>AI Quality Improvement Report</h2>
              {!reportText && !loading && (
                <button onClick={handleGenerate} style={{ padding: "9px 18px", borderRadius: "10px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer" }}>
                  Generate Report
                </button>
              )}
            </div>
            {loading && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>⚙️</div>
                <div style={{ color: "#60a5fa", fontWeight: 600, marginBottom: "8px" }}>Analyzing {gaps.length} findings...</div>
                <div style={{ color: "#475569", fontSize: "13px" }}>Generating prioritized action plan</div>
              </div>
            )}
            {reportText && !loading && (
              <div style={{ padding: "24px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {formatReport(reportText)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SPDIntelChecklist() {
  const [phase, setPhase] = useState("mode"); // mode | picker | audit | report
  const [auditMode, setAuditMode] = useState(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [comments, setComments] = useState({});

  const activeSections = SECTIONS.filter(s => selectedSectionIds.includes(s.id));
  const currentSection = activeSections[currentSectionIndex];

  const handleModeSelect = (mode, sectionIds) => {
    setAuditMode(mode);
    if (mode === "full") {
      setSelectedSectionIds(sectionIds);
      setPhase("audit");
    } else {
      setPhase("picker");
    }
  };

  const handleSectionStart = (ids) => {
    setSelectedSectionIds(ids);
    setPhase("audit");
  };

  const handleAnswer = useCallback((itemId, value) => {
    setAnswers(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const handleComment = useCallback((itemId, value) => {
    setComments(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const handleRestart = () => {
    setPhase("mode");
    setAnswers({});
    setComments({});
    setCurrentSectionIndex(0);
    setSelectedSectionIds([]);
  };

  // Build gaps for report
  const buildGaps = () => {
    const gaps = [];
    SECTIONS.filter(s => selectedSectionIds.includes(s.id)).forEach(section => {
      section.items.forEach(item => {
        if (answers[item.id] === "no") {
          gaps.push({
            sectionId: section.id,
            sectionLabel: section.label,
            standard: section.standard,
            text: item.text,
            comment: comments[item.id] || "",
            severity: getSeverity(section.id, item.id),
          });
        }
      });
    });
    return gaps;
  };

  if (phase === "mode") return <AuditModeSelector onSelect={handleModeSelect} />;
  if (phase === "picker") return <SectionPicker onStart={handleSectionStart} />;
  if (phase === "report") return <GapReport gaps={buildGaps()} answers={answers} selectedSectionIds={selectedSectionIds} onRestart={handleRestart} />;

  // Audit phase
  const sectionAnswered = currentSection?.items.filter(i => answers[i.id]).length || 0;
  const sectionTotal = currentSection?.items.length || 1;
  const sectionComplete = sectionAnswered === sectionTotal;
  const overallProgress = Math.round(((currentSectionIndex + (sectionAnswered / sectionTotal)) / activeSections.length) * 100);
  const sectionScore = calcSectionScore(answers, currentSection);
  const gapCount = Object.keys(answers).filter(k => answers[k] === "no").length;

  return (
    <div style={{ minHeight: "100vh", background: "#05091a" }}>
      {/* Sticky Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(5,9,26,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "12px 20px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚕</div>
              <span style={{ fontWeight: 700, color: "#fff", fontSize: "13px" }}>SPD Intel</span>
              <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "99px", background: auditMode === "full" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)", color: auditMode === "full" ? "#60a5fa" : "#c4b5fd", border: `1px solid ${auditMode === "full" ? "rgba(59,130,246,0.25)" : "rgba(168,85,247,0.25)"}` }}>
                {auditMode === "full" ? "Full Audit" : "Focus Audit"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {gapCount > 0 && (
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", padding: "3px 10px", borderRadius: "99px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {gapCount} finding{gapCount !== 1 ? "s" : ""}
                </span>
              )}
              <span style={{ color: "#475569", fontSize: "12px" }}>Section {currentSectionIndex + 1} of {activeSections.length}</span>
            </div>
          </div>

          {/* Overall progress */}
          <div style={{ height: "3px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", marginBottom: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg,#3b82f6,#6366f1)", width: `${overallProgress}%`, transition: "width 0.4s ease" }} />
          </div>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
            {activeSections.map((s, i) => {
              const score = calcSectionScore(answers, s);
              const isActive = i === currentSectionIndex;
              const isDone = score !== null;
              return (
                <button key={s.id} onClick={() => setCurrentSectionIndex(i)} style={{
                  flexShrink: 0, padding: "5px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 600,
                  border: isActive ? "1px solid rgba(59,130,246,0.5)" : isDone ? `1px solid ${scoreColor(score)}40` : "1px solid transparent",
                  background: isActive ? "rgba(59,130,246,0.15)" : isDone ? scoreBg(score) : "rgba(255,255,255,0.04)",
                  color: isActive ? "#60a5fa" : isDone ? scoreColor(score) : "#475569",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"
                }}>
                  {s.icon} {s.label} {isDone && `${score}%`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>{currentSection.icon}</div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>{currentSection.label}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "#475569" }}>Standard: {currentSection.standard}</span>
            <span style={{ fontSize: "12px", color: "#475569" }}>·</span>
            <span style={{ fontSize: "12px", color: "#475569" }}>{sectionAnswered}/{sectionTotal} answered</span>
            {sectionScore !== null && (
              <>
                <span style={{ fontSize: "12px", color: "#475569" }}>·</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: scoreColor(sectionScore) }}>{sectionScore}% compliant</span>
              </>
            )}
          </div>
        </div>

        <div>
          {currentSection.items.map(item => (
            <ChecklistItem
              key={item.id}
              item={item}
              sectionId={currentSection.id}
              answer={answers[item.id]}
              comment={comments[item.id] || ""}
              onAnswer={handleAnswer}
              onComment={handleComment}
            />
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            disabled={currentSectionIndex === 0}
            onClick={() => setCurrentSectionIndex(i => i - 1)}
            style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: currentSectionIndex === 0 ? "#334155" : "#94a3b8", cursor: currentSectionIndex === 0 ? "not-allowed" : "pointer" }}>
            ← Back
          </button>

          <div style={{ fontSize: "12px", color: "#334155" }}>
            {sectionComplete ? "✓ Section complete" : `${sectionTotal - sectionAnswered} remaining`}
          </div>

          {currentSectionIndex < activeSections.length - 1 ? (
            <button
              disabled={!sectionComplete}
              onClick={() => setCurrentSectionIndex(i => i + 1)}
              style={{ padding: "10px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, border: "none", background: sectionComplete ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "rgba(255,255,255,0.05)", color: sectionComplete ? "#fff" : "#334155", cursor: sectionComplete ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              Next Section →
            </button>
          ) : (
            <button
              disabled={!sectionComplete}
              onClick={() => setPhase("report")}
              style={{ padding: "10px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, border: "none", background: sectionComplete ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.05)", color: sectionComplete ? "#fff" : "#334155", cursor: sectionComplete ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              Complete Audit →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
