import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e27" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "AutoHire - AI-Powered Hiring Platform",
    template: "%s | AutoHire",
  },
  description:
    "Revolutionary AI-powered hiring platform that automates candidate screening, interviews, and hiring decisions.",
  keywords: [
    "hiring",
    "recruitment",
    "AI",
    "candidates",
    "job posting",
    "screening",
    "interviews",
    "SaaS",
  ],
  authors: [{ name: "AutoHire", url: "https://autohire.dev" }],
  creator: "AutoHire",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "AutoHire",
    title: "AutoHire - AI-Powered Hiring Platform",
    description:
      "Revolutionary AI-powered hiring platform that automates candidate screening, interviews, and hiring decisions.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AutoHire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoHire - AI-Powered Hiring Platform",
    description:
      "Revolutionary AI-powered hiring platform that automates candidate screening, interviews, and hiring decisions.",
    images: ["/twitter-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}