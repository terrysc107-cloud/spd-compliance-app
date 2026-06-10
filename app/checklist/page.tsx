"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { SECTIONS } from "@/lib/data/checklist-sections";
import { getSeverity } from "@/lib/data/severity-map";
import { saveAudit, getAllAudits } from "@/lib/db/audits";
import { snapshotNow } from "@/lib/db/readiness";
import type { StoredAudit, StoredFinding } from "@/lib/db/types";
import { calculateScore, AuditScore } from "@/lib/scoring/engine";
import { getThresholds, DEFAULT_THRESHOLDS, type ThresholdConfig } from "@/lib/db/thresholds";
import AuditModeSelector from "@/components/checklist/AuditModeSelector";
import SectionPicker from "@/components/checklist/SectionPicker";
import ChecklistItemRow from "@/components/checklist/ChecklistItemRow";
import GapReport, { Gap, calcSectionScore, scoreColor, scoreBg } from "@/components/checklist/GapReport";

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function mapSev(raw: string): StoredFinding['severity'] {
  if (raw === "high") return "critical";
  if (raw === "low")  return "minor";
  return "major";
}

function severityToWeight(raw: string): 1 | 2 | 3 {
  if (raw === "high")   return 3;
  if (raw === "medium") return 2;
  return 1;
}

// Build the flat items array and sectionMap needed by the scoring engine.
// All sections are used here; the engine filters by sectionMap itemIndices.
function buildScoringInputs(selectedSectionIds: string[]) {
  const items: Array<{ weight: number; severity: string }> = [];
  const sectionMap: Array<{ name: string; itemIndices: number[] }> = [];

  let globalIdx = 0;
  SECTIONS.forEach(sec => {
    const indices: number[] = [];
    sec.items.forEach(item => {
      if (selectedSectionIds.includes(sec.id)) {
        const rawSev = getSeverity(sec.id, item.id);
        items.push({ weight: severityToWeight(rawSev), severity: mapSev(rawSev) });
        indices.push(globalIdx);
      } else {
        items.push({ weight: 1, severity: "minor" });  // placeholder, not scored
      }
      globalIdx++;
    });
    if (selectedSectionIds.includes(sec.id)) {
      sectionMap.push({ name: sec.label, itemIndices: indices });
    }
  });

  return { items, sectionMap };
}

// Convert string-keyed answers to number-keyed responses expected by engine.
function buildEngineResponses(
  answers: Record<string, string>,
  comments: Record<string, string>,
  selectedSectionIds: string[]
): Record<number, { answer: string; comment: string }> {
  const responses: Record<number, { answer: string; comment: string }> = {};
  let globalIdx = 0;
  SECTIONS.forEach(sec => {
    sec.items.forEach(item => {
      if (selectedSectionIds.includes(sec.id)) {
        responses[globalIdx] = { answer: answers[item.id] ?? '', comment: comments[item.id] ?? '' };
      }
      globalIdx++;
    });
  });
  return responses;
}

function buildAuditPayload(
  id: string, mode: string,
  answers: Record<string, string>,
  comments: Record<string, string>,
  selectedSectionIds: string[],
  completed: boolean,
  thresholds: ThresholdConfig
): StoredAudit {
  let globalIdx = 0;
  const findings: StoredFinding[] = [];

  SECTIONS.forEach(sec => {
    sec.items.forEach(item => {
      if (selectedSectionIds.includes(sec.id)) {
        const ans = answers[item.id];
        if (ans === "no") findings.push({
          itemIndex: globalIdx,
          sectionName: sec.label,
          question: item.text,
          severity: mapSev(getSeverity(sec.id, item.id)),
          comment: comments[item.id] || "",
          status: "open",
        });
      }
      globalIdx++;
    });
  });

  // Weight-aware scoring via canonical engine
  const { items, sectionMap } = buildScoringInputs(selectedSectionIds);
  const responses = buildEngineResponses(answers, comments, selectedSectionIds);
  const auditScore: AuditScore = calculateScore(responses, items, sectionMap, thresholds);

  const now = new Date().toISOString();
  // org/department/conductor are derived server-side in saveAudit() from the
  // signed-in profile, so they are not set here.
  return {
    id,
    checklistName: "SPD Compliance Audit",
    mode: mode === "full" ? "full" : "focus",
    startedAt: now,
    ...(completed
      ? { completedAt: now, status: "completed", score: auditScore.overall, auditScore, findings }
      : { status: "in-progress", findings: [] }
    ),
    responses: {},
  };
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function SPDIntelChecklist() {
  const [phase,               setPhase]               = useState<"mode"|"picker"|"audit"|"report">("mode");
  const [auditMode,           setAuditMode]           = useState<string | null>(null);
  const [selectedSectionIds,  setSelectedSectionIds]  = useState<string[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers,             setAnswers]             = useState<Record<string, string>>({});
  const [comments,            setComments]            = useState<Record<string, string>>({});
  const [auditId,             setAuditId]             = useState<string | null>(null);
  const [resumeAudit,         setResumeAudit]         = useState<StoredAudit | null>(null);
  const [thresholds,          setThresholds]          = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  const skipSave = useRef(true);

  useEffect(() => {
    getThresholds().then(setThresholds).catch(() => {});
    getAllAudits()
      .then(all => {
        const inProgress = all.find(a => a.status === "in-progress");
        if (inProgress) setResumeAudit(inProgress);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (skipSave.current) { skipSave.current = false; return; }
    if (!auditId || phase !== "audit") return;
    saveAudit(buildAuditPayload(auditId, auditMode ?? "full", answers, comments, selectedSectionIds, false, thresholds))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, comments]);

  const activeSections  = SECTIONS.filter(s => selectedSectionIds.includes(s.id));
  const currentSection  = activeSections[currentSectionIndex];
  const newId           = () => { const id = crypto.randomUUID(); setAuditId(id); skipSave.current = true; return id; };

  const handleModeSelect = (mode: string, sectionIds: string[]) => {
    if (!auditId) newId();
    setAuditMode(mode);
    if (mode === "full") { setSelectedSectionIds(sectionIds); setPhase("audit"); }
    else setPhase("picker");
  };

  const handleSectionStart = (ids: string[]) => { setSelectedSectionIds(ids); setPhase("audit"); };
  const handleAnswer  = useCallback((itemId: string, v: string) => setAnswers(p => ({ ...p, [itemId]: v })), []);
  const handleComment = useCallback((itemId: string, v: string) => setComments(p => ({ ...p, [itemId]: v })), []);

  const handleComplete = () => {
    if (!auditId) return;
    saveAudit(buildAuditPayload(auditId, auditMode ?? "full", answers, comments, selectedSectionIds, true, thresholds))
      .then(() => snapshotNow())   // capture a readiness snapshot for the trend
      .catch(() => {});
    setPhase("report");
  };

  const handleRestart = () => {
    setPhase("mode"); setAnswers({}); setComments({});
    setCurrentSectionIndex(0); setSelectedSectionIds([]); setAuditId(null);
    skipSave.current = true;
  };

  const buildGaps = (): Gap[] => {
    const gaps: Gap[] = [];
    SECTIONS.filter(s => selectedSectionIds.includes(s.id)).forEach(sec => {
      sec.items.forEach(item => {
        if (answers[item.id] === "no") gaps.push({ sectionId: sec.id, sectionLabel: sec.label, standard: sec.standard, text: item.text, comment: comments[item.id] || "", severity: getSeverity(sec.id, item.id) });
      });
    });
    return gaps;
  };

  // Resume prompt
  if (resumeAudit) {
    return (
      <div style={{ minHeight: "100vh", background: "#05091a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: "32px", borderRadius: "16px", background: "#0d1529", border: "1px solid rgba(255,255,255,0.08)", maxWidth: "400px", width: "100%", margin: "0 20px" }}>
          <div style={{ fontSize: "28px", marginBottom: "12px" }}>⚕</div>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: "0 0 8px" }}>Resume audit?</h2>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 24px" }}>You have an in-progress audit. Continue where you left off?</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => { setAuditId(resumeAudit.id); setAuditMode(resumeAudit.mode); setCurrentSectionIndex(resumeAudit.sectionIndex ?? 0); setResumeAudit(null); setPhase("audit"); }} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, fontSize: "13px", border: "none", cursor: "pointer" }}>Resume</button>
            <button onClick={() => { newId(); setResumeAudit(null); }} style={{ flex: 1, padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", color: "#94a3b8", fontWeight: 600, fontSize: "13px", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>Start Fresh</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "mode")   return <AuditModeSelector onSelect={handleModeSelect} />;
  if (phase === "picker") return <SectionPicker onStart={handleSectionStart} />;
  if (phase === "report") return (
    <div>
      <GapReport gaps={buildGaps()} answers={answers} selectedSectionIds={selectedSectionIds} onRestart={handleRestart} />
      {auditId && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 50 }}>
          <Link href={`/audits/${auditId}/results`} style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "12px", background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#fff", fontWeight: 700, fontSize: "14px", textDecoration: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
            View Results
          </Link>
        </div>
      )}
    </div>
  );

  // Audit phase
  const sectionAnswered = currentSection?.items.filter(i => answers[i.id]).length || 0;
  const sectionTotal    = currentSection?.items.length || 1;
  const sectionComplete = sectionAnswered === sectionTotal;
  const overallProgress = Math.round(((currentSectionIndex + (sectionAnswered / sectionTotal)) / activeSections.length) * 100);
  const sectionScore    = calcSectionScore(answers, currentSection);
  const gapCount        = Object.keys(answers).filter(k => answers[k] === "no").length;

  return (
    <div style={{ minHeight: "100vh", background: "#05091a" }}>
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
              {gapCount > 0 && <span style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", padding: "3px 10px", borderRadius: "99px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>{gapCount} finding{gapCount !== 1 ? "s" : ""}</span>}
              <span style={{ color: "#475569", fontSize: "12px" }}>Section {currentSectionIndex + 1} of {activeSections.length}</span>
            </div>
          </div>
          <div style={{ height: "3px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", marginBottom: "10px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg,#3b82f6,#6366f1)", width: `${overallProgress}%`, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
            {activeSections.map((s, i) => {
              const sc = calcSectionScore(answers, s);
              const isActive = i === currentSectionIndex;
              const isDone = sc !== null;
              return (
                <button key={s.id} onClick={() => setCurrentSectionIndex(i)} style={{ flexShrink: 0, padding: "5px 12px", borderRadius: "99px", fontSize: "11px", fontWeight: 600, border: isActive ? "1px solid rgba(59,130,246,0.5)" : isDone ? `1px solid ${scoreColor(sc)}40` : "1px solid transparent", background: isActive ? "rgba(59,130,246,0.15)" : isDone ? scoreBg(sc) : "rgba(255,255,255,0.04)", color: isActive ? "#60a5fa" : isDone ? scoreColor(sc) : "#475569", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  {s.icon} {s.label} {isDone && `${sc}%`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "36px", marginBottom: "10px" }}>{currentSection.icon}</div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>{currentSection.label}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "12px", color: "#475569" }}>Standard: {currentSection.standard}</span>
            <span style={{ fontSize: "12px", color: "#475569" }}>·</span>
            <span style={{ fontSize: "12px", color: "#475569" }}>{sectionAnswered}/{sectionTotal} answered</span>
            {sectionScore !== null && <><span style={{ fontSize: "12px", color: "#475569" }}>·</span><span style={{ fontSize: "12px", fontWeight: 700, color: scoreColor(sectionScore) }}>{sectionScore}% compliant</span></>}
          </div>
        </div>
        <div>
          {currentSection.items.map(item => (
            <ChecklistItemRow key={item.id} item={item} answer={answers[item.id]} comment={comments[item.id] || ""} onAnswer={handleAnswer} onComment={handleComment} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button disabled={currentSectionIndex === 0} onClick={() => setCurrentSectionIndex(i => i - 1)} style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: currentSectionIndex === 0 ? "#334155" : "#94a3b8", cursor: currentSectionIndex === 0 ? "not-allowed" : "pointer" }}>Back</button>
          <div style={{ fontSize: "12px", color: "#334155" }}>{sectionComplete ? "Section complete" : `${sectionTotal - sectionAnswered} remaining`}</div>
          {currentSectionIndex < activeSections.length - 1 ? (
            <button disabled={!sectionComplete} onClick={() => setCurrentSectionIndex(i => i + 1)} style={{ padding: "10px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, border: "none", background: sectionComplete ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "rgba(255,255,255,0.05)", color: sectionComplete ? "#fff" : "#334155", cursor: sectionComplete ? "pointer" : "not-allowed", transition: "all 0.2s" }}>Next Section</button>
          ) : (
            <button disabled={!sectionComplete} onClick={handleComplete} style={{ padding: "10px 22px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, border: "none", background: sectionComplete ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.05)", color: sectionComplete ? "#fff" : "#334155", cursor: sectionComplete ? "pointer" : "not-allowed", transition: "all 0.2s" }}>Complete Audit</button>
          )}
        </div>
      </div>
    </div>
  );
}
