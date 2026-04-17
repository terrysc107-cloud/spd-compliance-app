"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#05091a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        {/* Logo/Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "99px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd", fontSize: "12px", fontWeight: 600, marginBottom: "24px", letterSpacing: "0.04em" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa", display: "inline-block" }} />
          SPD INTEL
        </div>

        {/* Main Heading */}
        <h1 style={{ fontSize: "42px", fontWeight: 800, color: "#fff", marginBottom: "16px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          Sterile Processing Intelligence
        </h1>

        <p style={{ color: "#64748b", fontSize: "16px", lineHeight: 1.7, marginBottom: "40px" }}>
          AI-powered compliance tracking and gap analysis for sterile processing departments. 
          Streamline your audits, identify risks, and generate actionable improvement reports.
        </p>

        {/* Navigation Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
          {/* Compliance Checklist Card */}
          <Link 
            href="/checklist" 
            style={{ textDecoration: "none" }}
            onMouseEnter={() => setHovered("checklist")}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={{
              padding: "28px 24px",
              borderRadius: "20px",
              border: hovered === "checklist" ? "1px solid rgba(59,130,246,0.6)" : "1px solid rgba(255,255,255,0.08)",
              background: hovered === "checklist" ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "14px" }}>📋</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Compliance Checklist</div>
              <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
                Full department audit or focused gap analysis with AI-generated improvement reports
              </div>
              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", color: "#60a5fa", fontSize: "13px", fontWeight: 600 }}>
                Start Audit →
              </div>
            </div>
          </Link>

          {/* Assessment Card (placeholder for existing assessment flow) */}
          <div 
            style={{
              padding: "28px 24px",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
              textAlign: "left",
              opacity: 0.6
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "14px" }}>🎯</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>Risk Assessment</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
              Comprehensive risk analysis and prioritization for your SPD operations
            </div>
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "13px", fontWeight: 600 }}>
              Coming Soon
            </div>
          </div>
        </div>

        {/* Quick Stats/Info */}
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", color: "#475569", fontSize: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#22c55e" }}>●</span>
            7 Compliance Sections
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#3b82f6" }}>●</span>
            ~100 Audit Items
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#a855f7" }}>●</span>
            AI-Powered Reports
          </div>
        </div>
      </div>
    </div>
  );
}
