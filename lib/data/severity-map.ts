// ─── SEVERITY MAP ─────────────────────────────────────────────────────────────
// Keys map section id → item id → severity level.
// Items not explicitly listed fall back to the "default" key for that section.
// Sections not listed default to "medium".

export const SEVERITY_MAP: Record<string, Record<string, string>> = {
  decon:  { d5: "high", d7: "high", d8: "high", d9: "high", d12: "high", d13: "high", default: "medium" },
  steril: { st8: "high", st9: "high", st13: "high", st5: "high", default: "medium" },
  hld:    { hd6: "high", hd15: "high", hd16: "high", hd19: "high", hd20: "high", default: "medium" },
};

export function getSeverity(sectionId: string, itemId: string): string {
  const map = SEVERITY_MAP[sectionId];
  if (!map) return "medium";
  return map[itemId] || map.default || "medium";
}

export const SEVERITY_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  high:   { bg: "rgba(239,68,68,0.12)",  border: "#ef4444", text: "#ef4444", label: "High" },
  medium: { bg: "rgba(234,179,8,0.12)",  border: "#eab308", text: "#eab308", label: "Medium" },
  low:    { bg: "rgba(34,197,94,0.12)",  border: "#22c55e", text: "#22c55e", label: "Low" },
};
