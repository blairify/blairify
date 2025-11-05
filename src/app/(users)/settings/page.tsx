"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard immediately
    router.replace("/dashboard");
  }, [router]);

  // Return null to prevent any rendering
  return null;
}
