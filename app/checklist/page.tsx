"use client";

import { useState, useCallback } from "react";
import { SECTIONS } from "@/lib/data/checklist-sections";
import { getSeverity } from "@/lib/data/severity-map";
import AuditModeSelector from "@/components/checklist/AuditModeSelector";
import SectionPicker from "@/components/checklist/SectionPicker";
import ChecklistItemRow from "@/components/checklist/ChecklistItemRow";
import GapReport, { Gap, calcSectionScore, scoreColor, scoreBg } from "@/components/checklist/GapReport";

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function SPDIntelChecklist() {
  const [phase, setPhase] = useState<"mode" | "picker" | "audit" | "report">("mode");
  const [auditMode, setAuditMode] = useState<string | null>(null);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});

  const activeSections = SECTIONS.filter(s => selectedSectionIds.includes(s.id));
  const currentSection = activeSections[currentSectionIndex];

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleModeSelect = (mode: string, sectionIds: string[]) => {
    setAuditMode(mode);
    if (mode === "full") {
      setSelectedSectionIds(sectionIds);
      setPhase("audit");
    } else {
      setPhase("picker");
    }
  };

  const handleSectionStart = (ids: string[]) => {
    setSelectedSectionIds(ids);
    setPhase("audit");
  };

  const handleAnswer = useCallback((itemId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const handleComment = useCallback((itemId: string, value: string) => {
    setComments(prev => ({ ...prev, [itemId]: value }));
  }, []);

  const handleRestart = () => {
    setPhase("mode");
    setAnswers({});
    setComments({});
    setCurrentSectionIndex(0);
    setSelectedSectionIds([]);
  };

  const buildGaps = (): Gap[] => {
    const gaps: Gap[] = [];
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

  // ─── Phase routing ──────────────────────────────────────────────────────────

  if (phase === "mode")   return <AuditModeSelector onSelect={handleModeSelect} />;
  if (phase === "picker") return <SectionPicker onStart={handleSectionStart} />;
  if (phase === "report") return <GapReport gaps={buildGaps()} answers={answers} selectedSectionIds={selectedSectionIds} onRestart={handleRestart} />;

  // ─── Audit phase ────────────────────────────────────────────────────────────

  const sectionAnswered  = currentSection?.items.filter(i => answers[i.id]).length || 0;
  const sectionTotal     = currentSection?.items.length || 1;
  const sectionComplete  = sectionAnswered === sectionTotal;
  const overallProgress  = Math.round(((currentSectionIndex + (sectionAnswered / sectionTotal)) / activeSections.length) * 100);
  const sectionScore     = calcSectionScore(answers, currentSection);
  const gapCount         = Object.keys(answers).filter(k => answers[k] === "no").length;

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

          {/* Overall progress bar */}
          <div style={{ height: "3px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", marginBottom: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg,#3b82f6,#6366f1)", width: `${overallProgress}%`, transition: "width 0.4s ease" }} />
          </div>

          {/* Section tabs */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
            {activeSections.map((s, i) => {
              const score   = calcSectionScore(answers, s);
              const isActive = i === currentSectionIndex;
              const isDone   = score !== null;
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

        {/* Checklist items */}
        <div>
          {currentSection.items.map(item => (
            <ChecklistItemRow
              key={item.id}
              item={item}
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
