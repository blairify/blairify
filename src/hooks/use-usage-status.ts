"use client";

import { useCallback, useEffect, useState } from "react";
import { checkUsageStatus } from "@/lib/services/users/database-users";
import { useAuth } from "@/providers/auth-provider";

interface UsageStatus {
  canStart: boolean;
  currentCount: number;
  maxCount: number;
  isPro: boolean;
  remainingMinutes: number;
  isLoading: boolean;
  error: string | null;
}

interface FormattedTimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

const MAX_INTERVIEWS = 2;
const RESET_PERIOD_MINUTES = 60;

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
      const result = await checkUsageStatus(user.uid);
      setStatus({
        canStart: result.canStart,
        currentCount: result.currentCount,
        maxCount: MAX_INTERVIEWS,
        isPro: result.isPro,
        remainingMinutes: result.remainingMinutes,
        isLoading: false,
        error: null,
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

  // Real-time countdown timer
  useEffect(() => {
    if (status.isPro || status.remainingMinutes <= 0) {
      setTimeRemaining({
        hours: 0,
        minutes: 0,
        seconds: 0,
        formatted: "",
      });
      return;
    }

    // Initialize with remaining minutes converted to seconds
    let totalSeconds = Math.ceil(status.remainingMinutes * 60);

    const updateTime = () => {
      if (totalSeconds <= 0) {
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
      totalSeconds -= 1;
    };

    // Initial update
    updateTime();

    // Update every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [status.remainingMinutes, status.isPro, fetchUsageStatus]);

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
