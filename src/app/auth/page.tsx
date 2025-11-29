"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import AuthForm from "@/components/landing-page/organisms/auth-form";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const initialMode: AuthMode = modeParam === "login" ? "login" : "register";
  const [mode, setMode] = useState<AuthMode>(initialMode);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
  };

  return (
    <div data-analytics-id="auth-page">
      <AuthForm mode={mode} onModeChange={handleModeChange} />
    </div>
  );
}
