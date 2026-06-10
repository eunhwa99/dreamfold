import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Dream Insight",
  description: "Mystical dream journaling with AI interpretation and recurring pattern reports."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
