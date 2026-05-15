"use client";

import { useState } from "react";
import { SECTIONS } from "@/lib/data/checklist-sections";

interface AuditModeSelectorProps {
  onSelect: (mode: string, sectionIds: string[]) => void;
}

export default function AuditModeSelector({ onSelect }: AuditModeSelectorProps) {
  const [hover, setHover] = useState<string | null>(null);

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
            {"You'll choose which sections to include →"}
          </div>
        </button>
      </div>
    </div>
  );
}
