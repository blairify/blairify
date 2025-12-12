"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AuthForm from "@/components/landing-page/organisms/auth-form";

type AuthMode = "login" | "register";
type AuthAudience = "individual" | "enterprise";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
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
    <div data-analytics-id="auth-page">
      <AuthForm
        mode={mode}
        onModeChange={handleModeChange}
        audience={audience}
        onAudienceChange={handleAudienceChange}
      />
    </div>
  );
}
