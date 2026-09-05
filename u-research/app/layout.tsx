import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "@/styles/tokens.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UResearch — Find and manage research outreach",
  description:
    "Discover professors, personalize outreach, and keep research outreach organized in one workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${hankenGrotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
