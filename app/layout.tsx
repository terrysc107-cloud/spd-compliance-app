import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SPD Intel — Sterile Processing Compliance Audits",
  description: "AI-powered compliance audits and gap analysis for Sterile Processing Departments. Aligned with AAMI, AORN, and CMS standards.",
};

export const viewport: Viewport = {
  themeColor: "#05091a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ background: "#05091a" }}>
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
