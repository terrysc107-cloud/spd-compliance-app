import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SPD Intel - Sterile Processing Compliance",
  description: "AI-powered sterile processing department compliance and gap analysis tool",
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
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
