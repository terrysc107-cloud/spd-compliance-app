"use client";

import { useState } from "react";
import { SECTIONS, Section } from "@/lib/data/checklist-sections";
import { SEVERITY_COLORS } from "@/lib/data/severity-map";

// ─── SHARED TYPES ─────────────────────────────────────────────────────────────

export interface Gap {
  sectionId: string;
  sectionLabel: string;
  standard: string;
  text: string;
  comment: string;
  severity: string;
}

export interface SectionScore {
  label: string;
  score: number | null;
}

// ─── SCORE UTILS ──────────────────────────────────────────────────────────────

export function calcSectionScore(answers: Record<string, string>, section: Section): number | null {
  const applicable = section.items.filter(i => answers[i.id] !== "na");
  if (!applicable.length) return null;
  const yes = applicable.filter(i => answers[i.id] === "yes").length;
  return Math.round((yes / applicable.length) * 100);
}

export function scoreColor(pct: number | null): string {
  if (pct === null) return "#475569";
  if (pct >= 85) return "#22c55e";
  if (pct >= 65) return "#eab308";
  if (pct >= 40) return "#f97316";
  return "#ef4444";
}

export function scoreBg(pct: number | null): string {
  if (pct === null) return "rgba(71,85,105,0.1)";
  if (pct >= 85) return "rgba(34,197,94,0.1)";
  if (pct >= 65) return "rgba(234,179,8,0.1)";
  if (pct >= 40) return "rgba(249,115,22,0.1)";
  return "rgba(239,68,68,0.1)";
}

// ─── AI REPORT ────────────────────────────────────────────────────────────────

async function generateAIReport(gaps: Gap[], profile: string, sectionScores: SectionScore[]): Promise<string> {
  const gapList = gaps.map(g =>
    `- [${g.severity.toUpperCase()}] ${g.sectionLabel} — ${g.text}${g.comment ? ` (Note: ${g.comment})` : ""}`
  ).join("\n");

  const scoreList = sectionScores.map(s =>
    `${s.label}: ${s.score !== null ? s.score + "%" : "N/A"}`
  ).join(", ");

  const response = await fetch("/api/generate-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      checklistData: {
        profile,
        sectionScores: scoreList,
        gaps: gapList,
        gapCount: gaps.length
      }
    })
  });
  const data = await response.json();
  return data.report || "Report generation failed.";
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

interface GapReportProps {
  gaps: Gap[];
  answers: Record<string, string>;
  selectedSectionIds: string[];
  onRestart: () => void;
}

export default function GapReport({ gaps, answers, selectedSectionIds, onRestart }: GapReportProps) {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"gaps" | "report">("gaps");

  const sectionScores: SectionScore[] = SECTIONS
    .filter(s => selectedSectionIds.includes(s.id))
    .map(s => ({ label: s.label, score: calcSectionScore(answers, s) }));

  const highGaps = gaps.filter(g => g.severity === "high");
  const medGaps  = gaps.filter(g => g.severity === "medium");
  const lowGaps  = gaps.filter(g => g.severity === "low");

  const handleGenerate = async () => {
    setLoading(true);
    setView("report");
    const profileStr = `SPD compliance self-assessment covering ${selectedSectionIds.length} section(s). ${sectionScores.map(s => `${s.label}: ${s.score}%`).join(", ")}.`;
    const text = await generateAIReport(gaps, profileStr, sectionScores);
    setReportText(text);
    setLoading(false);
  };

  const formatReport = (text: string) =>
    text.split("\n").map((line, i) => {
      if (line.startsWith("## "))
        return <h3 key={i} style={{ color: "#60a5fa", fontSize: "15px", fontWeight: 700, marginTop: "20px", marginBottom: "8px" }}>{line.replace("## ", "")}</h3>;
      if (line.startsWith("**") && line.endsWith("**"))
        return <p key={i} style={{ color: "#e2e8f0", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{line.replace(/\*\*/g, "")}</p>;
      if (!line.trim())
        return <div key={i} style={{ height: "6px" }} />;
      return <p key={i} style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.7, marginBottom: "4px" }}>{line}</p>;
    });

  const SEVERITY_ROWS = [
    { label: "High",   count: highGaps.length, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    { label: "Medium", count: medGaps.length,  color: "#eab308", bg: "rgba(234,179,8,0.1)" },
    { label: "Low",    count: lowGaps.length,  color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  ] as const;

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
            <button onClick={() => window.print()} style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#64748b", cursor: "pointer" }}>Print</button>
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
          {SEVERITY_ROWS.map(s => (
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
                {(["high", "medium", "low"] as const).map(sev => {
                  const sevGaps = gaps.filter(g => g.severity === sev);
                  if (!sevGaps.length) return null;
                  const sc = SEVERITY_COLORS[sev];
                  return (
                    <div key={sev}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: sc.text, letterSpacing: "0.08em", marginBottom: "8px", marginTop: "8px" }}>
                        {sc.label.toUpperCase()} PRIORITY — {sevGaps.length} finding{sevGaps.length !== 1 ? "s" : ""}
                      </div>
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
