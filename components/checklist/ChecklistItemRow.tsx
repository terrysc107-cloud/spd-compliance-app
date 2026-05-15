"use client";

import { ChecklistItem } from "@/lib/data/checklist-sections";

interface ChecklistItemRowProps {
  item: ChecklistItem;
  answer: string | undefined;
  comment: string;
  onAnswer: (itemId: string, value: string) => void;
  onComment: (itemId: string, value: string) => void;
}

const ANSWER_COLORS = {
  yes: { active: { bg: "rgba(34,197,94,0.15)",  border: "#22c55e", color: "#22c55e" } },
  no:  { active: { bg: "rgba(239,68,68,0.15)",  border: "#ef4444", color: "#ef4444" } },
  na:  { active: { bg: "rgba(100,116,139,0.15)", border: "#64748b", color: "#64748b" } },
} as const;

const ANSWER_LABELS = { yes: "✓ Yes", no: "✗ No", na: "N/A" } as const;

export default function ChecklistItemRow({ item, answer, comment, onAnswer, onComment }: ChecklistItemRowProps) {
  const isNo = answer === "no";

  return (
    <div style={{
      padding: "20px", borderRadius: "14px", marginBottom: "10px", transition: "all 0.2s",
      border: isNo ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.07)",
      background: isNo ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)",
    }}>
      <p style={{ color: "#e2e8f0", fontSize: "14px", lineHeight: 1.65, marginBottom: item.rationale ? "8px" : "14px", fontWeight: 500 }}>
        {item.text}
      </p>
      {item.rationale && (
        <p style={{ color: "#475569", fontSize: "12px", lineHeight: 1.55, marginBottom: "14px", fontStyle: "italic" }}>
          {item.rationale}
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {(["yes", "no", "na"] as const).map(opt => {
          const isActive = answer === opt;
          const colors = ANSWER_COLORS[opt].active;
          return (
            <button key={opt} onClick={() => onAnswer(item.id, opt)} style={{
              padding: "6px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              border: isActive ? `1px solid ${colors.border}` : "1px solid rgba(255,255,255,0.1)",
              background: isActive ? colors.bg : "rgba(255,255,255,0.03)",
              color: isActive ? colors.color : "#475569",
            }}>
              {ANSWER_LABELS[opt]}
            </button>
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
