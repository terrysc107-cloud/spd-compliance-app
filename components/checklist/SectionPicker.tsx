"use client";

import { useState } from "react";
import { SECTIONS } from "@/lib/data/checklist-sections";

interface SectionPickerProps {
  onStart: (ids: string[]) => void;
}

export default function SectionPicker({ onStart }: SectionPickerProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

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
            color: selected.length ? "#fff" : "#334155", border: "none",
            cursor: selected.length ? "pointer" : "not-allowed", transition: "all 0.2s"
          }}>
          Start Focus Audit ({selected.length} section{selected.length !== 1 ? "s" : ""} selected) →
        </button>
      </div>
    </div>
  );
}
