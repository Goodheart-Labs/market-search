import type { Metadata } from "next";
import { Spectral, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";
import { Suspense } from "react";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const serif = Spectral({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Market Search",
  description: "Semantic search for forecasting markets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} antialiased`}
    >
      <QueryProvider>
        <body className="bg-[#FFFCF9]">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </body>
      </QueryProvider>
    </html>
  );
}
