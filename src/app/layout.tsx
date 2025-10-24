import { type ReactNode, Suspense } from "react";
import { CookieBanner } from "../components/landing-page/cookie-banner";
import { AuthProvider } from "../providers/auth-provider";
import { SWRProvider } from "../providers/swr-provider";
import { ThemeProvider } from "../providers/theme-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 
        RESPONSIVE LAYOUT FOUNDATION:
        - Uses system font stack for optimal performance across devices
        - Antialiased text for crisp rendering on all screen densities
        - Responsive typography scaling handled by Tailwind's default rem units
      */}
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
                {/* 
                  MAIN CONTENT WRAPPER:
                  - min-h-screen ensures full viewport height on all devices
                  - Flexible layout adapts to content and screen size
                */}
                <div className="flex flex-col min-h-screen">{children}</div>
                <CookieBanner />
              </AuthProvider>
            </SWRProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
