"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import LoadingPage from "@/components/common/atoms/loading-page";
import AuthForm from "@/components/landing-page/organisms/auth-form";
import Navbar from "@/components/landing-page/organisms/landing-page-navbar";

type AuthMode = "login" | "register" | "student-register";
type AuthAudience = "individual" | "enterprise";

function AuthPageContent() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const redirectParam = searchParams.get("redirect");
  const initialMode: AuthMode = modeParam === "login" ? "login" : "register";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [audience, setAudience] = useState<AuthAudience>(() => {
    if (typeof window === "undefined") return "individual";
    const host = window.location.hostname;
    return host.startsWith("enterprise.") ? "enterprise" : "individual";
  });
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
  };

  const handleAudienceChange = (value: AuthAudience) => {
    if (value === audience || isRedirecting) return;
    setAudience(value);

    if (typeof window === "undefined") return;

    const { pathname, search } = window.location;
    const targetPath = pathname || "/auth";
    const targetSearch = search || "";

    setIsRedirecting(true);

    if (value === "enterprise") {
      window.location.href = `https://enterprise.blairify.com${targetPath}${targetSearch}`;
      return;
    }

    window.location.href = `https://blairify.com${targetPath}${targetSearch}`;
  };

  return (
    <div className="min-h-screen bg-background" data-analytics-id="auth-page">
      <div className="md:hidden">
        <Navbar scrollThreshold={0} />
      </div>
      <main>
        <AuthForm
          mode={mode}
          onModeChange={handleModeChange}
          audience={audience}
          onAudienceChange={handleAudienceChange}
          redirect={redirectParam}
        />
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <AuthPageContent />
    </Suspense>
  );
}
