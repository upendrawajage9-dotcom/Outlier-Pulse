import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "OutlierPulse — YouTube Intelligence & Outlier Detection",
  description:
    "Enterprise YouTube analytics for viral multipliers, title pattern extraction, and outlier strategy detection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(18,20,29,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}
