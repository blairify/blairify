"use client";

import { usePartnerVerification } from "@/hooks/use-partner-verification";
import { useAuth } from "@/providers/auth-provider";

function PartnerVerificationRunner() {
  usePartnerVerification();
  return null;
}

export function PartnerVerificationListener() {
  const { user } = useAuth();
  if (!user) return null;
  return <PartnerVerificationRunner />;
}
