"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { landing } from "@/lib/constants/landing-theme";

const t = landing;
import {
  STANDARDS,
  HOW_IT_WORKS,
  CAPABILITIES,
  COMPLIANCE_DOMAINS,
  USE_CASES,
  HERO_MOCK,
} from "@/lib/constants/landing-content";

/* ------------------------------------------------------------------ */
/* Scroll-reveal helpers (kept from the original page)                 */
/* ------------------------------------------------------------------ */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Safety: if IntersectionObserver is unavailable, reveal immediately so
    // content can never get stuck at opacity:0.
    if (typeof IntersectionObserver === "undefined") {
      setIsInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setIsInView(true),
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline line icons (no emoji, no icon dependency)                    */
/* ------------------------------------------------------------------ */
const ICONS: Record<string, string[]> = {
  check:     ["M20 6 9 17l-5-5"],
  arrow:     ["M5 12h14", "M13 6l6 6-6 6"],
  clipboard: ["M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2", "M9 2h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z", "M9 12h6", "M9 16h4"],
  gauge:     ["M12 14l4-4", "M3.34 19a10 10 0 1 1 17.32 0"],
  target:    ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  list:      ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
  sparkles:  ["M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z", "M19 14l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"],
  document:  ["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M9 13h6", "M9 17h5"],
  shield:    ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-4"],
  decon:     ["M9.6 4.6A2 2 0 1 1 11 8H2", "M12.6 19.4A2 2 0 1 0 14 16H2", "M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2"],
  package:   ["M16.5 9.4 7.5 4.2", "M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z", "M3.3 7 12 12l8.7-5", "M12 22V12"],
  sterile:   ["M9 3h6", "M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3", "M7 14h10"],
  storage:   ["M4 8h16", "M4 8l1.4-4h13.2L20 8", "M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8", "M10 13h4"],
  staff:     ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 21v-2a4 4 0 0 0-3-3.9", "M16 3.1a4 4 0 0 1 0 7.7"],
  water:     ["M12 2.5S5 9 5 14a7 7 0 0 0 14 0c0-5-7-11.5-7-11.5z"],
  scope:     ["M22 12h-4l-3 9L9 3l-3 9H2"],
};

function Icon({ name, size = 20, color }: { name: string; size?: number; color?: string }) {
  const paths = ICONS[name] ?? ICONS.check;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */
function PrimaryCTA({ href, children, large = false }: { href: string; children: React.ReactNode; large?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: large ? "16px 30px" : "12px 22px",
        borderRadius: t.radius.md,
        background: t.color.accent,
        color: "#fff",
        fontSize: large ? 16 : 14,
        fontWeight: 600,
        textDecoration: "none",
        boxShadow: hover ? "0 10px 28px rgba(37,99,235,0.30)" : "0 4px 14px rgba(37,99,235,0.22)",
        transform: hover ? "translateY(-1px)" : "none",
        transition: "transform 0.18s, box-shadow 0.18s",
      }}
    >
      {children}
      <Icon name="arrow" size={large ? 18 : 16} />
    </Link>
  );
}

function SecondaryCTA({ href, children, large = false }: { href: string; children: React.ReactNode; large?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: large ? "16px 28px" : "12px 20px",
        borderRadius: t.radius.md,
        background: "#fff",
        color: t.color.heading,
        fontSize: large ? 16 : 14,
        fontWeight: 600,
        textDecoration: "none",
        border: `1px solid ${hover ? t.color.borderStrong : t.color.border}`,
        boxShadow: hover ? t.shadow.sm : "none",
        transition: "border-color 0.18s, box-shadow 0.18s",
      }}
    >
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Hero readiness mock — a JSX "screenshot" of the real dashboard      */
/* ------------------------------------------------------------------ */
function factorColor(score: number) {
  if (score >= 85) return t.color.success;
  if (score >= 65) return t.color.accent;
  return t.color.danger;
}

function ReadinessMock() {
  return (
    <div
      style={{
        background: t.color.card,
        border: `1px solid ${t.color.border}`,
        borderRadius: t.radius.lg,
        boxShadow: t.shadow.lift,
        padding: 24,
        width: "100%",
        maxWidth: 460,
      }}
    >
      {/* fake window chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
        <span style={{ width: 9, height: 9, borderRadius: 99, background: "#e2e8f0" }} />
        <span style={{ width: 9, height: 9, borderRadius: 99, background: "#e2e8f0" }} />
        <span style={{ width: 9, height: 9, borderRadius: 99, background: "#e2e8f0" }} />
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: t.color.muted, letterSpacing: "0.02em" }}>
          Readiness Dashboard
        </span>
      </div>

      {/* score row */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
        <div style={{ textAlign: "center", minWidth: 92 }}>
          <div style={{ fontSize: 11, color: t.color.muted, marginBottom: 2 }}>{HERO_MOCK.org}</div>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: t.color.success }}>
            {HERO_MOCK.score}
            <span style={{ fontSize: 22, fontWeight: 700 }}>%</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: t.radius.pill,
              background: t.color.successSoft,
              border: `1px solid ${t.color.success}33`,
              color: t.color.success,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Icon name="check" size={13} /> {HERO_MOCK.band}
          </span>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {HERO_MOCK.meta.map((m) => (
              <span
                key={m}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: t.color.muted,
                  background: t.color.band,
                  border: `1px solid ${t.color.border}`,
                  borderRadius: t.radius.sm,
                  padding: "4px 9px",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* factor bars */}
      <div style={{ fontSize: 11, fontWeight: 700, color: t.color.muted, marginBottom: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        What&apos;s driving the score
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {HERO_MOCK.factors.map((f) => (
          <div key={f.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.color.heading }}>
                {f.label}
                <span style={{ fontSize: 10, color: t.color.muted, fontWeight: 500, marginLeft: 6 }}>{f.weight}%</span>
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: t.color.heading }}>{f.score}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: "#eef2f7", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${f.score}%`, borderRadius: 99, background: factorColor(f.score) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function Home() {
  // The app shell is dark; this page is light. Swap the document background
  // while the landing page is mounted so overscroll doesn't flash dark.
  useEffect(() => {
    const prevBody = document.body.style.background;
    const prevHtml = document.documentElement.style.background;
    document.body.style.background = t.color.bg;
    document.documentElement.style.background = t.color.bg;
    return () => {
      document.body.style.background = prevBody;
      document.documentElement.style.background = prevHtml;
    };
  }, []);

  const container: React.CSSProperties = { maxWidth: 1080, margin: "0 auto", padding: "0 24px" };

  return (
    <div style={{ minHeight: "100vh", background: t.color.bg, color: t.color.body }}>
      {/* ---------------- Nav ---------------- */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${t.color.border}`,
        }}
      >
        <div style={{ ...container, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: t.color.accent,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              S
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: t.color.heading, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>SPD Intel</span>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <a href="#how" style={{ fontSize: 14, fontWeight: 600, color: t.color.body, textDecoration: "none" }}>How it works</a>
            <a href="#compliance" style={{ fontSize: 14, fontWeight: 600, color: t.color.body, textDecoration: "none" }}>Compliance</a>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: t.color.body, textDecoration: "none" }}>Sign in</Link>
            <PrimaryCTA href="/signup">Get started</PrimaryCTA>
          </div>
        </div>
      </nav>

      {/* ---------------- Hero ---------------- */}
      <section style={{ ...container, paddingTop: 132, paddingBottom: 72 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left: copy */}
          <div>
            <AnimatedSection>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px",
                  borderRadius: t.radius.pill,
                  background: t.color.accentSoft,
                  border: `1px solid ${t.color.accentBorder}`,
                  color: t.color.accent,
                  fontSize: 12.5,
                  fontWeight: 600,
                  marginBottom: 24,
                }}
              >
                <Icon name="check" size={14} />
                {STANDARDS.join(" · ")} aligned
              </div>
            </AnimatedSection>

            <AnimatedSection delay={80}>
              <h1
                style={{
                  fontSize: "clamp(36px, 5.4vw, 58px)",
                  fontWeight: 800,
                  lineHeight: 1.06,
                  letterSpacing: "-0.03em",
                  color: t.color.heading,
                  margin: "0 0 20px",
                }}
              >
                Know your survey readiness before the surveyor does.
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={160}>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: t.color.body, maxWidth: 540, margin: "0 0 32px" }}>
                SPD Intel turns your sterile processing audits into a live readiness score — so you
                walk into Joint Commission, DNV, and CMS surveys knowing exactly where you stand.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={240}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
                <PrimaryCTA href="/signup" large>Get my readiness score</PrimaryCTA>
                <SecondaryCTA href="/checklist" large>Try a free audit — no login</SecondaryCTA>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={320}>
              <p style={{ fontSize: 13, color: t.color.muted, margin: 0 }}>
                Set up in minutes · ~180 checkpoints across ST79 / ST91 / ST108
              </p>
            </AnimatedSection>
          </div>

          {/* Right: product mock */}
          <AnimatedSection delay={200}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ReadinessMock />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ---------------- Trust strip ---------------- */}
      <section style={{ borderTop: `1px solid ${t.color.border}`, borderBottom: `1px solid ${t.color.border}`, background: t.color.band }}>
        <div style={{ ...container, paddingTop: 28, paddingBottom: 28 }}>
          <p style={{ textAlign: "center", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: t.color.muted, margin: "0 0 16px" }}>
            Built on the standards surveyors cite
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 28 }}>
            {["AAMI ST79", "AAMI ST91", "AAMI ST108", "AORN", "CMS", "Joint Commission", "DNV"].map((s) => (
              <span key={s} style={{ fontSize: 15, fontWeight: 700, color: t.color.heading, opacity: 0.7 }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how" style={{ ...container, paddingTop: 88, paddingBottom: 40 }}>
        <AnimatedSection>
          <SectionHeading kicker="How it works" title="From audit to survey-ready in three steps" />
        </AnimatedSection>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginTop: 40 }}>
          {HOW_IT_WORKS.map((s, i) => (
            <AnimatedSection key={s.step} delay={i * 90}>
              <div style={{ ...cardStyle, height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <span style={iconChip}><Icon name={s.icon} size={20} color={t.color.accent} /></span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: t.color.borderStrong }}>{s.step}</span>
                </div>
                <h3 style={cardTitle}>{s.title}</h3>
                <p style={cardBody}>{s.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ---------------- Capabilities ---------------- */}
      <section style={{ ...container, paddingTop: 56, paddingBottom: 40 }}>
        <AnimatedSection>
          <SectionHeading kicker="The platform" title="A survey readiness operating system — not a one-off checklist" />
        </AnimatedSection>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginTop: 40 }}>
          {CAPABILITIES.map((c, i) => (
            <AnimatedSection key={c.title} delay={i * 80}>
              <div style={{ ...cardStyle, display: "flex", gap: 16, height: "100%" }}>
                <span style={{ ...iconChip, flexShrink: 0 }}><Icon name={c.icon} size={20} color={t.color.accent} /></span>
                <div>
                  <h3 style={cardTitle}>{c.title}</h3>
                  <p style={cardBody}>{c.desc}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ---------------- Compliance domains ---------------- */}
      <section id="compliance" style={{ background: t.color.band, borderTop: `1px solid ${t.color.border}`, borderBottom: `1px solid ${t.color.border}` }}>
        <div style={{ ...container, paddingTop: 80, paddingBottom: 80 }}>
          <AnimatedSection>
            <SectionHeading kicker="Coverage" title="All 7 SPD compliance domains" subtitle="Comprehensive coverage mapped to the AAMI standards your surveyors hold you to." />
          </AnimatedSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginTop: 40 }}>
            {COMPLIANCE_DOMAINS.map((d, i) => (
              <AnimatedSection key={d.label} delay={i * 50}>
                <div style={{ ...cardStyle, padding: 20, height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ ...iconChip, width: 36, height: 36 }}><Icon name={d.icon} size={18} color={t.color.accent} /></span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: t.color.heading }}>{d.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: t.color.body, lineHeight: 1.5, margin: "0 0 12px" }}>{d.desc}</p>
                  <span style={{ fontSize: 11, fontWeight: 600, color: t.color.accent, background: t.color.accentSoft, border: `1px solid ${t.color.accentBorder}`, padding: "4px 9px", borderRadius: t.radius.sm }}>
                    {d.standard}
                  </span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Use cases ---------------- */}
      <section style={{ ...container, paddingTop: 80, paddingBottom: 56 }}>
        <AnimatedSection>
          <SectionHeading kicker="Built for SPD leaders" title="One score, every accountability moment" />
        </AnimatedSection>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginTop: 40 }}>
          {USE_CASES.map((u, i) => (
            <AnimatedSection key={u.title} delay={i * 90}>
              <div style={{ ...cardStyle, height: "100%" }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: t.color.accent, display: "block", marginBottom: 16 }} />
                <h3 style={cardTitle}>{u.title}</h3>
                <p style={cardBody}>{u.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ---------------- Final CTA ---------------- */}
      <section style={{ background: t.color.band, borderTop: `1px solid ${t.color.border}` }}>
        <div style={{ ...container, paddingTop: 88, paddingBottom: 88, textAlign: "center" }}>
          <AnimatedSection>
            <h2 style={{ fontSize: "clamp(28px, 4.4vw, 42px)", fontWeight: 800, letterSpacing: "-0.02em", color: t.color.heading, lineHeight: 1.15, margin: "0 0 16px" }}>
              See your department&apos;s readiness score today.
            </h2>
            <p style={{ fontSize: 17, color: t.color.body, maxWidth: 560, margin: "0 auto 32px", lineHeight: 1.6 }}>
              Run your first audit and watch a live readiness score, factor breakdown, and AI action
              plan appear — built for the survey that&apos;s already on your calendar.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
              <PrimaryCTA href="/signup" large>Get started</PrimaryCTA>
              <SecondaryCTA href="/checklist" large>Try a free audit</SecondaryCTA>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer style={{ borderTop: `1px solid ${t.color.border}`, background: t.color.bg }}>
        <div style={{ ...container, paddingTop: 32, paddingBottom: 32, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: t.color.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>S</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.color.heading }}>SPD Intel</span>
            <span style={{ fontSize: 13, color: t.color.muted }}>· Survey Readiness OS for Sterile Processing</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: t.color.muted }}>
            <Icon name="shield" size={15} color={t.color.muted} />
            HIPAA-conscious · your data stays in your organization
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared style fragments + small components                           */
/* ------------------------------------------------------------------ */
const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${landing.color.border}`,
  borderRadius: landing.radius.lg,
  padding: 26,
  boxShadow: landing.shadow.card,
};

const iconChip: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 11,
  background: landing.color.accentSoft,
  border: `1px solid ${landing.color.accentBorder}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cardTitle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 700,
  color: landing.color.heading,
  margin: "0 0 8px",
};

const cardBody: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: landing.color.body,
  margin: 0,
};

function SectionHeading({ kicker, title, subtitle }: { kicker: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: landing.color.accent, marginBottom: 12 }}>
        {kicker}
      </div>
      <h2 style={{ fontSize: "clamp(26px, 3.6vw, 36px)", fontWeight: 800, letterSpacing: "-0.02em", color: landing.color.heading, lineHeight: 1.2, margin: 0 }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: 16, color: landing.color.body, lineHeight: 1.6, margin: "14px 0 0" }}>{subtitle}</p>}
    </div>
  );
}
