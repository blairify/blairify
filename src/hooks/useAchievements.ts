"use client";

import { useMemo } from "react";
import { ACHIEVEMENTS } from "@/lib/achievements";

export function useAchievements(stats: {
    avgScore: number;
    totalSessions: number;
    totalTime: number;
}) {
    const unlocked = useMemo(() => {
        return ACHIEVEMENTS.filter((a) => a.condition(stats));
    }, [stats]);

    return { unlocked };
}
