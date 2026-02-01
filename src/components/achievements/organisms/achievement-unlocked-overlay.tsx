"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  ACHIEVEMENT_FALLBACK_ICON,
  ACHIEVEMENT_ICON_MAP,
} from "@/components/achievements/constants/icon-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Achievement } from "@/lib/achievements";
import { cn } from "@/lib/utils";

type IconKey = keyof typeof ACHIEVEMENT_ICON_MAP;

interface AchievementUnlockedOverlayProps {
  achievements: Achievement[];
  onDone: () => void;
}

export function AchievementUnlockedOverlay({
  achievements,
  onDone,
}: AchievementUnlockedOverlayProps) {
  const [idx, setIdx] = useState(0);

  const [particles, setParticles] = useState<
    Array<{
      leftPct: number;
      delaySec: number;
      durationSec: number;
      sizePx: number;
    }>
  >([]);

  const achievement = achievements[idx];

  useEffect(() => {
    if (!achievement) return;

    setParticles(
      Array.from({ length: 24 }).map(() => ({
        leftPct: Math.random() * 100,
        delaySec: Math.random() * 0.8,
        durationSec: 2.2 + Math.random() * 1.3,
        sizePx: 4 + Math.round(Math.random() * 6),
      })),
    );
  }, [achievement]);

  if (!achievement) return null;

  const Icon =
    ACHIEVEMENT_ICON_MAP[achievement.icon as IconKey] ??
    ACHIEVEMENT_FALLBACK_ICON;

  const handleNext = () => {
    const nextIdx = idx + 1;
    if (nextIdx >= achievements.length) {
      onDone();
      return;
    }
    setIdx(nextIdx);
  };

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={`${idx}-${i}`}
            className={cn(
              "absolute rounded-full animate-confetti",
              "bg-white/70",
            )}
            style={{
              left: `${p.leftPct}%`,
              width: `${p.sizePx}px`,
              height: `${p.sizePx}px`,
              animationDelay: `${p.delaySec}s`,
              animationDuration: `${p.durationSec}s`,
              top: "-8px",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <Card className="border-2 border-primary/40 bg-card shadow-2xl">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="text-sm font-semibold tracking-wide text-muted-foreground">
                    Achievement Unlocked!
                  </div>

                  <div className="mx-auto size-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Icon className="size-10 text-primary" aria-hidden="true" />
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">
                      {achievement.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleNext}
                      className="w-full"
                    >
                      {idx + 1 < achievements.length ? "Next" : "Awesome!"}
                    </Button>
                    {achievements.length > 1 ? (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {idx + 1} / {achievements.length}
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
