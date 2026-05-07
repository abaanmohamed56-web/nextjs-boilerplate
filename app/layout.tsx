import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillPips",
  description: "Premium forex trading brand.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "Georgia, 'Times New Roman', serif" }}>
        {children}
      </body>
    </html>
  );
}
