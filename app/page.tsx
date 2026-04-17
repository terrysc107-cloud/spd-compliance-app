"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Intersection Observer hook for scroll animations
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Animated section wrapper
function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isInView } = useInView();
  
  return (
    <div
      ref={ref}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Section data for the 7 compliance domains
const COMPLIANCE_DOMAINS = [
  { icon: "🧫", label: "Decontamination", standard: "AAMI ST79 / AORN", desc: "Physical separation, workflow, air pressure, cleaning protocols" },
  { icon: "📦", label: "Prep & Packaging", standard: "AAMI ST79", desc: "Inspection, assembly, wrapping, chemical indicators" },
  { icon: "⚗️", label: "Sterilization", standard: "AAMI ST79", desc: "Cycle selection, monitoring, biological indicators, maintenance" },
  { icon: "🗄️", label: "Sterile Storage", standard: "AAMI ST79", desc: "Environmental controls, shelf placement, endoscope storage" },
  { icon: "👥", label: "General & Staff", standard: "AAMI ST79 / CMS", desc: "Policies, competencies, PPE, documentation, hand hygiene" },
  { icon: "💧", label: "Water Quality", standard: "AAMI ST108", desc: "Utility vs critical water, testing, distribution system design" },
  { icon: "🔬", label: "HLD & Flexible Scopes", standard: "AAMI ST91 / SGNA", desc: "Pre-cleaning, leak testing, AER operation, storage protocols" },
];

// Feature cards data
const FEATURES = [
  { icon: "📊", title: "Real-Time Compliance Scoring", desc: "Every section scored live as you audit, color-coded by risk level" },
  { icon: "🗂️", title: "Auto-Generated Gap Log", desc: "Every 'No' answer captured with severity, context, and applicable standard (AAMI ST79, ST91, ST108)" },
  { icon: "🤖", title: "AI Action Report", desc: "Claude-powered analysis returns prioritized findings, 30/60/90 day plans, and regulatory risk flags" },
  { icon: "📄", title: "Print-Ready Reports", desc: "Share clean, leadership-ready compliance reports in seconds" },
];

// Use cases data
const USE_CASES = [
  { title: "Pre-survey readiness", desc: "Joint Commission, DNV, CMS" },
  { title: "Corrective action verification", desc: "After findings" },
  { title: "New manager onboarding", desc: "Baseline assessment" },
];

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05091a", color: "#fff" }}>
      {/* Navigation Header */}
      <nav style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "16px 24px",
        background: "rgba(5, 9, 26, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: 700,
            color: "#fff",
          }}>
            S
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>SPD Intel</span>
        </div>
        <Link
          href="/checklist"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(59,130,246,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Start Audit
        </Link>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
        maxWidth: "900px",
        margin: "0 auto",
      }}>
        <AnimatedSection>
          {/* Tag Pill */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "99px",
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.25)",
            color: "#93c5fd",
            fontSize: "13px",
            fontWeight: 500,
            marginBottom: "32px",
            letterSpacing: "0.02em",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60a5fa" }} />
            Built for SPD Leaders · AAMI, AORN, CMS Aligned
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "24px",
            background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Run a sterile processing compliance audit in under 30 minutes
          </h1>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          {/* Subheadline */}
          <p style={{
            fontSize: "18px",
            color: "#94a3b8",
            lineHeight: 1.7,
            maxWidth: "600px",
            marginBottom: "40px",
          }}>
            Identify gaps, track findings, and generate prioritized corrective action plans — powered by AI.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          {/* CTAs */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center", marginBottom: "24px" }}>
            <Link
              href="/checklist"
              style={{
                padding: "16px 32px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
                boxShadow: "0 4px 24px rgba(59,130,246,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(59,130,246,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(59,130,246,0.3)";
              }}
            >
              Start Compliance Audit
            </Link>
            <button
              onClick={scrollToFeatures}
              style={{
                padding: "16px 32px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              See how it works
            </button>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          {/* Small text */}
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            No login required · Works on any device · ~100 compliance checkpoints
          </p>
        </AnimatedSection>
      </section>

      {/* Audit Type Preview Section */}
      <section style={{ padding: "80px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <AnimatedSection>
          <h2 style={{
            fontSize: "32px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "48px",
            letterSpacing: "-0.02em",
          }}>
            Two ways to audit
          </h2>
        </AnimatedSection>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}>
          {/* Full Department Audit Card */}
          <AnimatedSection delay={100}>
            <Link href="/checklist" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "32px",
                  borderRadius: "20px",
                  border: hoveredCard === "full" ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: hoveredCard === "full" ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={() => setHoveredCard("full")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ fontSize: "40px", marginBottom: "20px" }}>📋</div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
                  Full Department Audit
                </h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "20px" }}>
                  All 7 sections · ~100 items · Complete compliance picture for annual surveys and pre-inspection readiness
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa", fontSize: "14px", fontWeight: 600 }}>
                  Start Full Audit
                  <span style={{ transition: "transform 0.2s", transform: hoveredCard === "full" ? "translateX(4px)" : "none" }}>→</span>
                </div>
              </div>
            </Link>
          </AnimatedSection>

          {/* Focus Audit Card */}
          <AnimatedSection delay={200}>
            <Link href="/checklist" style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "32px",
                  borderRadius: "20px",
                  border: hoveredCard === "focus" ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  background: hoveredCard === "focus" ? "rgba(167,139,250,0.08)" : "rgba(255,255,255,0.02)",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={() => setHoveredCard("focus")}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={{ fontSize: "40px", marginBottom: "20px" }}>🎯</div>
                <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "12px" }}>
                  Focus Audit
                </h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "20px" }}>
                  Target specific sections · Ideal for follow-up assessments and corrective action verification
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a78bfa", fontSize: "14px", fontWeight: 600 }}>
                  Start Focus Audit
                  <span style={{ transition: "transform 0.2s", transform: hoveredCard === "focus" ? "translateX(4px)" : "none" }}>→</span>
                </div>
              </div>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" style={{ padding: "80px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <AnimatedSection>
          <h2 style={{
            fontSize: "32px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "48px",
            letterSpacing: "-0.02em",
          }}>
            What you get
          </h2>
        </AnimatedSection>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}>
          {FEATURES.map((feature, i) => (
            <AnimatedSection key={feature.title} delay={i * 100}>
              <div style={{
                padding: "28px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}>
                <div style={{ fontSize: "32px", marginBottom: "16px" }}>{feature.icon}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.6 }}>
                  {feature.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Compliance Domains Section */}
      <section style={{ padding: "80px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <AnimatedSection>
          <h2 style={{
            fontSize: "32px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}>
            7 Compliance Domains
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#64748b",
            textAlign: "center",
            marginBottom: "48px",
          }}>
            Comprehensive coverage aligned with industry standards
          </p>
        </AnimatedSection>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}>
          {COMPLIANCE_DOMAINS.map((domain, i) => (
            <AnimatedSection key={domain.label} delay={i * 50}>
              <div style={{
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "24px" }}>{domain.icon}</span>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#fff" }}>{domain.label}</span>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px", lineHeight: 1.5 }}>
                  {domain.desc}
                </p>
                <span style={{
                  fontSize: "11px",
                  color: "#60a5fa",
                  background: "rgba(59,130,246,0.1)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontWeight: 500,
                }}>
                  {domain.standard}
                </span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{ padding: "80px 24px", maxWidth: "900px", margin: "0 auto" }}>
        <AnimatedSection>
          <h2 style={{
            fontSize: "32px",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "48px",
            letterSpacing: "-0.02em",
          }}>
            Built for
          </h2>
        </AnimatedSection>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}>
          {USE_CASES.map((useCase, i) => (
            <AnimatedSection key={useCase.title} delay={i * 100}>
              <div style={{
                padding: "24px",
                borderRadius: "12px",
                border: "1px solid rgba(167,139,250,0.15)",
                background: "rgba(167,139,250,0.05)",
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#a78bfa",
                  marginBottom: "16px",
                }} />
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
                  {useCase.title}
                </h3>
                <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                  {useCase.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{
        padding: "100px 24px",
        textAlign: "center",
        maxWidth: "700px",
        margin: "0 auto",
      }}>
        <AnimatedSection>
          <h2 style={{
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700,
            marginBottom: "32px",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}>
            Ready to know your department&apos;s compliance posture?
          </h2>
          <Link
            href="/checklist"
            style={{
              display: "inline-block",
              padding: "18px 48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 600,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: "0 4px 24px rgba(59,130,246,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(59,130,246,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(59,130,246,0.3)";
            }}
          >
            Start Your Audit
          </Link>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "32px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "13px", color: "#475569" }}>
          SPD Intel · AI-powered compliance audits for Sterile Processing Departments
        </p>
      </footer>
    </div>
  );
}
