import { SpeedInsights } from "@vercel/speed-insights/next";
import { Lora, Noto_Sans } from "next/font/google";
import Script from "next/script";
import { type ReactNode, Suspense } from "react";
import { CookieBanner } from "../components/landing-page/organisms/cookie-banner";
import { Toaster } from "../components/ui/sonner";
import { AuthProvider } from "../providers/auth-provider";
import { SidebarProvider } from "../providers/sidebar-provider";
import { SWRProvider } from "../providers/swr-provider";
import { ThemeProvider } from "../providers/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import LoadingPage from "@/components/common/atoms/loading-page";

const headingFont = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading-var",
});

const bodyFont = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-var",
});

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
      <head>
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TNB35QZL');`}
        </Script>
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1421510179333331');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body
        className={`${bodyFont.variable} ${headingFont.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TNB35QZL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        <noscript>
          {/* biome-ignore lint/performance/noImgElement: Facebook Pixel requires a raw img tag */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1421510179333331&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <Script
          src="https://t.contentsquare.net/uxa/b4b60ede51676.js"
          strategy="afterInteractive"
        />
        <Suspense fallback={<LoadingPage />}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SWRProvider>
              <AuthProvider>
                <SidebarProvider>
                  <div className="flex flex-col min-h-screen">{children}</div>
                  <CookieBanner />
                  <Toaster />
                </SidebarProvider>
              </AuthProvider>
            </SWRProvider>
          </ThemeProvider>
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  );
}
