import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const inter = Sarabun({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin", "thai"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "MarketPulse - Financial Market Analysis Platform",
  description: "Professional market analysis platform with AI-powered insights for commodities and currencies",
  keywords: ["finance", "markets", "trading", "commodities", "currencies", "analysis"],
  authors: [{ name: "MarketPulse Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Header />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}
