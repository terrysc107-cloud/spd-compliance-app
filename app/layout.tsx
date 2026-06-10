import type { Metadata, Viewport } from "next";
import './globals.css'
import './print.css'

export const metadata: Metadata = {
  title: "SPD Intel — Survey Readiness OS for Sterile Processing",
  description: "Turn your sterile processing audits into a live survey readiness score. Track gaps and corrective actions, and walk into Joint Commission, DNV, and CMS surveys knowing exactly where you stand. Aligned with AAMI ST79, ST91, and ST108.",
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
