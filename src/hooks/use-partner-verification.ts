"use client";

import { sendEmailVerification, type User } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import { isPartnerEmail } from "@/lib/services/subscriptions/partner-domains";
import { useAuth } from "@/providers/auth-provider";

type PartnerVerificationStatus =
  | "not_partner"
  | "awaiting_verification"
  | "verifying"
  | "activated"
  | "error";

interface PartnerUpgradeResult {
  status: string;
  error?: string;
  requiresVerification?: boolean;
}

async function requestPartnerUpgrade(
  user: User,
): Promise<PartnerUpgradeResult> {
  const idToken = await user.getIdToken();
  const response = await fetch("/api/partner/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!response.ok) {
    const body = (await response.json()) as { error?: string };
    throw new Error(
      body.error ?? `Request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<PartnerUpgradeResult>;
}

export function usePartnerVerification() {
  const { user, userData, refreshUserData } = useAuth();
  const hasAttemptedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isPartner = Boolean(user?.email && isPartnerEmail(user.email));
  const isEmailVerified = Boolean(user?.emailVerified);
  const isAlreadyProPartner =
    userData?.subscription?.subscriptionSource === "partner" &&
    userData?.subscription?.plan === "pro";

  const getStatus = useCallback((): PartnerVerificationStatus => {
    if (!isPartner) return "not_partner";
    if (isAlreadyProPartner) return "activated";
    if (error) return "error";
    if (!isEmailVerified) return "awaiting_verification";
    return "verifying";
  }, [isPartner, isAlreadyProPartner, isEmailVerified, error]);

  useEffect(() => {
    if (retryCount < 0) return;
    if (!user || !isPartner || !isEmailVerified || isAlreadyProPartner) return;
    if (hasAttemptedRef.current) return;

    hasAttemptedRef.current = true;

    requestPartnerUpgrade(user)
      .then(async (result) => {
        if (
          result.status === "activated" ||
          result.status === "already_active"
        ) {
          await refreshUserData();
        }
      })
      .catch((err: unknown) => {
        hasAttemptedRef.current = false;
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        console.error("Partner verification failed:", message);
      });
  }, [
    user,
    isPartner,
    isEmailVerified,
    isAlreadyProPartner,
    refreshUserData,
    retryCount,
  ]);

  const retryVerification = useCallback(() => {
    setError(null);
    hasAttemptedRef.current = false;
    setRetryCount((c) => c + 1);
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!user) return;
    await sendEmailVerification(user);
  }, [user]);

  const reloadEmailVerificationStatus = useCallback(async () => {
    if (!auth?.currentUser) return;
    await auth.currentUser.reload();
    await refreshUserData();
  }, [refreshUserData]);

  return {
    isPartner,
    isEmailVerified,
    isAlreadyProPartner,
    status: getStatus(),
    error,
    retryVerification,
    resendVerificationEmail,
    reloadEmailVerificationStatus,
  };
}
