import { type ReactNode, Suspense } from "react";
import { CookieBanner } from "../components/organisms/cookie-banner";
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
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SWRProvider>
              <AuthProvider>
                {children}
                <CookieBanner />
              </AuthProvider>
            </SWRProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
