"use client";

import { useState } from "react";
import AuthForm from "@/components/organisms/auth-form";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("register");

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
  };

  return <AuthForm mode={mode} onModeChange={handleModeChange} />;
}
