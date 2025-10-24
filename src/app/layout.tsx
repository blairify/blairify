import { SpeedInsights } from "@vercel/speed-insights/next";
import { type ReactNode, Suspense } from "react";
import { CookieBanner } from "../components/landing-page/cookie-banner";
import { AuthProvider } from "../providers/auth-provider";
import { SWRProvider } from "../providers/swr-provider";
import { ThemeProvider } from "../providers/theme-provider";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://blairify.com",
  ),

  title: {
    default: "Blairify - Master Your Job Interview Skills | Practice & Prepare",
    template: "%s | Blairify",
  },
  description:
    "Ace your next job interview with Blairify's comprehensive practice platform. Access 1000+ interview questions, expert feedback, and personalized preparation tools.",

  applicationName: "Blairify",
  authors: [{ name: "Blairify Team" }],
  generator: "Next.js",
  keywords: [
    "job interview preparation",
    "interview questions",
    "interview practice",
    "mock interviews",
    "career preparation",
    "job search",
    "interview skills",
    "interview coaching",
  ],

  referrer: "origin-when-cross-origin",

  creator: "Blairify",
  publisher: "Blairify",

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blairify.com",
    siteName: "Blairify",
    title: "Blairify - Master Your Job Interview Skills",
    description:
      "Ace your next job interview with comprehensive practice questions, expert feedback, and personalized preparation tools.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Blairify - Job Interview Preparation Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Blairify - Master Your Job Interview Skills",
    description:
      "Ace your next job interview with comprehensive practice questions and expert feedback.",
    creator: "@blairify",
    images: ["/twitter-image.png"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
      { url: "/apple-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Blairify",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://blairify.com",
    languages: {
      "en-US": "https://blairify.com",
    },
  },

  // Category
  category: "education",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" title="Blairify" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SWRProvider>
              <AuthProvider>
                <div className="flex flex-col min-h-screen">{children}</div>
                <CookieBanner />
              </AuthProvider>
            </SWRProvider>
          </ThemeProvider>
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
