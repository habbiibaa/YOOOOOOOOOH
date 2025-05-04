import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { TempoInit } from "@/components/tempo-init";
import { ThemeProvider } from "@/components/theme-provider";
import ImprovedAIChat from "@/components/improved-ai-chat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ramy Ashour Squash Academy - Train Like a World Champion",
  description:
    "Elevate your squash game with AI-powered video analysis, professional coaching, and exclusive training content from world champion Ramy Ashour.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
          <ImprovedAIChat />
          <TempoInit />
        </ThemeProvider>
      </body>
    </html>
  );
}
