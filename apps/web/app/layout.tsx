import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AdTech-SaaS | Campaign Intelligence",
  description: "AI-powered multi-channel advertising campaign analytics and management.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
