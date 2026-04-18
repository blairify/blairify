"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";

interface UsageStatus {
  canStart: boolean;
  currentCount: number;
  maxCount: number;
  isPro: boolean;
  remainingMinutes: number;
  isLoading: boolean;
  error: string | null;
  /** Absolute epoch ms when limits reset. null when user can already start. */
  resetAtMs: number | null;
}

interface FormattedTimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

const MAX_INTERVIEWS = 2;
const RESET_PERIOD_MINUTES = 24 * 60;

export function useUsageStatus() {
  const { user, userData } = useAuth();
  const [status, setStatus] = useState<UsageStatus>({
    canStart: true,
    currentCount: 0,
    maxCount: MAX_INTERVIEWS,
    isPro: false,
    remainingMinutes: 0,
    isLoading: true,
    error: null,
    resetAtMs: null,
  });
  const [timeRemaining, setTimeRemaining] = useState<FormattedTimeRemaining>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    formatted: "",
  });

  // Check if user is Pro from userData (can be used before fetching full status)
  const isPro =
    userData?.subscription?.plan === "pro" &&
    userData?.subscription?.status === "active";

  const fetchUsageStatus = useCallback(async () => {
    if (!user?.uid) {
      setStatus((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const response = await fetch(
        `/api/usage/status?uid=${encodeURIComponent(user.uid)}`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setStatus({
        canStart: result.canStart,
        currentCount: result.currentCount,
        maxCount: result.maxCount ?? MAX_INTERVIEWS,
        isPro: result.isPro,
        remainingMinutes: 0,
        isLoading: false,
        error: null,
        resetAtMs: result.resetAtMs ?? null,
      });
    } catch (error) {
      console.error("Error fetching usage status:", error);
      setStatus((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to fetch usage status",
      }));
    }
  }, [user?.uid]);

  // Initial fetch
  useEffect(() => {
    fetchUsageStatus();
  }, [fetchUsageStatus]);

  // Real-time countdown timer — anchored to the absolute resetAtMs epoch so
  // page refreshes never restart the countdown.
  useEffect(() => {
    if (status.isPro || status.resetAtMs === null) {
      setTimeRemaining({
        hours: 0,
        minutes: 0,
        seconds: 0,
        formatted: "",
      });
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, status.resetAtMs! - Date.now());

      if (remaining === 0) {
        setTimeRemaining({
          hours: 0,
          minutes: 0,
          seconds: 0,
          formatted: "",
        });
        // Refetch status when timer expires
        fetchUsageStatus();
        return;
      }

      const totalSeconds = Math.ceil(remaining / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      let formatted: string;
      if (hours > 0) {
        formatted = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        formatted = `${minutes}m ${seconds}s`;
      } else {
        formatted = `${seconds}s`;
      }

      setTimeRemaining({ hours, minutes, seconds, formatted });
    };

    // Run immediately then every second
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [status.resetAtMs, status.isPro, fetchUsageStatus]);

  // Computed values
  const remainingInterviews = Math.max(0, MAX_INTERVIEWS - status.currentCount);
  const usagePercentage = (status.currentCount / MAX_INTERVIEWS) * 100;

  return {
    ...status,
    isPro: status.isPro || isPro, // Use both sources
    timeRemaining,
    remainingInterviews,
    usagePercentage,
    maxInterviews: MAX_INTERVIEWS,
    resetPeriodMinutes: RESET_PERIOD_MINUTES,
    refetch: fetchUsageStatus,
  };
}
