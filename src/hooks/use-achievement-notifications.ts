"use client";

import { useCallback, useEffect, useState } from "react";
import { ACHIEVEMENTS, type Achievement } from "@/lib/achievements";

interface AchievementNotificationState {
  pendingAchievements: Achievement[];
  showNotifications: boolean;
}

/**
 * Hook to manage achievement unlock notifications
 * Listens for newly unlocked achievements and displays notifications
 */
export function useAchievementNotifications() {
  const [state, setState] = useState<AchievementNotificationState>({
    pendingAchievements: [],
    showNotifications: false,
  });

  /**
   * Trigger notifications for newly unlocked achievements
   */
  const notifyAchievements = useCallback((achievementIds: string[]) => {
    if (achievementIds.length === 0) return;

    const achievements = ACHIEVEMENTS.filter((a) =>
      achievementIds.includes(a.id),
    );

    setState({
      pendingAchievements: achievements,
      showNotifications: true,
    });
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setState({
      pendingAchievements: [],
      showNotifications: false,
    });
  }, []);

  /**
   * Remove a specific notification
   */
  const removeNotification = useCallback((achievementId: string) => {
    setState((prev) => ({
      ...prev,
      pendingAchievements: prev.pendingAchievements.filter(
        (a) => a.id !== achievementId,
      ),
    }));
  }, []);

  return {
    pendingAchievements: state.pendingAchievements,
    showNotifications: state.showNotifications,
    notifyAchievements,
    clearNotifications,
    removeNotification,
  };
}

/**
 * Hook to detect and notify about new achievements
 * Compares previous and current unlocked achievements
 */
export function useAchievementDetector(
  currentUnlockedIds: string[],
  onNewAchievements?: (achievementIds: string[]) => void,
) {
  const [previousUnlocked, setPreviousUnlocked] = useState<string[]>([]);

  useEffect(() => {
    // Skip on first render
    if (previousUnlocked.length === 0 && currentUnlockedIds.length > 0) {
      setPreviousUnlocked(currentUnlockedIds);
      return;
    }

    // Detect newly unlocked achievements
    const newAchievements = currentUnlockedIds.filter(
      (id) => !previousUnlocked.includes(id),
    );

    if (newAchievements.length > 0) {
      console.log("🎉 New achievements unlocked:", newAchievements);
      onNewAchievements?.(newAchievements);
    }

    setPreviousUnlocked(currentUnlockedIds);
  }, [currentUnlockedIds, previousUnlocked, onNewAchievements]);
}
