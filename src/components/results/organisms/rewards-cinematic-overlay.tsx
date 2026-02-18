"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Achievement } from "@/lib/achievements";
import { checkRankUp } from "@/lib/ranks";
import { cn } from "@/lib/utils";

interface RewardsCinematicOverlayProps {
  xpGained: number;
  achievements: Achievement[];
  oldXP: number;
  newXP: number;
  onDone: () => void;
}

function formatRankLabel(
  rank: ReturnType<typeof checkRankUp>["oldRank"],
): string {
  const levelRoman = (() => {
    switch (rank.level) {
      case 1:
        return "I";
      case 2:
        return "II";
      case 3:
        return "III";
      default: {
        const _never: never = rank.level;
        throw new Error(`Unhandled rank level: ${_never}`);
      }
    }
  })();

  return `${rank.name} ${levelRoman}`;
}

function buildConfettiBurst(seed: string) {
  const colors = [
    "bg-amber-300",
    "bg-emerald-300",
    "bg-sky-300",
    "bg-fuchsia-300",
    "bg-white/80",
  ] as const;

  return Array.from({ length: 64 }).map((_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 90 + Math.random() * 380;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.7 + 120;
    const rot = -360 + Math.random() * 720;
    const size = 4 + Math.round(Math.random() * 8);
    const color =
      colors[Math.floor(Math.random() * colors.length)] ?? colors[0];

    return {
      key: `${seed}_${i}`,
      x,
      y,
      rot,
      size,
      color,
      delayMs: Math.round(Math.random() * 120),
      durationMs: 780 + Math.round(Math.random() * 520),
    };
  });
}

export function RewardsCinematicOverlay({
  xpGained,
  achievements,
  oldXP,
  newXP,
  onDone,
}: RewardsCinematicOverlayProps) {
  const rankDelta = useMemo(() => checkRankUp(oldXP, newXP), [oldXP, newXP]);
  const hasPromotion = rankDelta.rankedUp;

  const safeAchievements = useMemo(
    () => (Array.isArray(achievements) ? achievements.filter(Boolean) : []),
    [achievements],
  );

  const primaryAchievement = safeAchievements[0] ?? null;

  const [canContinue, setCanContinue] = useState(false);
  const continueTimerRef = useRef<number | null>(null);

  const [burstSeed, setBurstSeed] = useState("init");
  const burstPieces = useMemo(() => buildConfettiBurst(burstSeed), [burstSeed]);

  useEffect(() => {
    setBurstSeed(
      hasPromotion
        ? `promotion_${formatRankLabel(rankDelta.newRank)}`
        : primaryAchievement
          ? `ach_${primaryAchievement.id}`
          : "xp",
    );

    if (continueTimerRef.current !== null) {
      window.clearTimeout(continueTimerRef.current);
      continueTimerRef.current = null;
    }

    setCanContinue(false);
    continueTimerRef.current = window.setTimeout(() => {
      setCanContinue(true);
    }, 1500);

    return () => {
      if (continueTimerRef.current !== null) {
        window.clearTimeout(continueTimerRef.current);
      }
      continueTimerRef.current = null;
    };
  }, [hasPromotion, primaryAchievement, rankDelta.newRank]);

  const xpLine = `+${Math.max(0, Math.round(xpGained))} XP`;
  const achievementLine =
    safeAchievements.length > 0
      ? `${safeAchievements.length} achievement${safeAchievements.length === 1 ? "" : "s"} unlocked`
      : "";
  const promotionLine = hasPromotion
    ? `${formatRankLabel(rankDelta.oldRank)} → ${formatRankLabel(rankDelta.newRank)}`
    : "";

  const headline = (() => {
    if (hasPromotion) return "PROMOTED";
    if (safeAchievements.length > 0) return "ACHIEVEMENT UNLOCKED";
    return "CONGRATULATIONS";
  })();

  const subHeadline = (() => {
    if (hasPromotion) return formatRankLabel(rankDelta.newRank);
    if (safeAchievements.length > 0) return primaryAchievement?.name ?? "";
    return xpLine;
  })();

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/85" />

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            background:
              "radial-gradient(900px circle at 20% 18%, rgba(16,185,129,0.18), rgba(16,185,129,0) 60%), radial-gradient(900px circle at 80% 22%, rgba(245,158,11,0.16), rgba(245,158,11,0) 58%), radial-gradient(900px circle at 70% 86%, rgba(59,130,246,0.14), rgba(59,130,246,0) 60%)",
          }}
        />
      </div>

      <div className="absolute inset-0">
        <div className="absolute right-3 top-3 z-10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white"
            onClick={() => onDone()}
          >
            Skip
          </Button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div
            className="relative w-full max-w-4xl text-center"
            animate={
              hasPromotion
                ? {
                    x: [0, -7, 7, -4, 4, 0],
                    y: [0, 3, -3, 2, -1, 0],
                  }
                : { x: 0, y: 0 }
            }
            transition={{
              duration: hasPromotion ? 0.58 : 0.2,
              ease: "easeOut",
            }}
          >
            {hasPromotion ? (
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <motion.div
                  className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30"
                  initial={{ scale: 0.2, opacity: 0.0 }}
                  animate={{ scale: 4.2, opacity: [0.75, 0] }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute left-1/2 top-1/2 size-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
                  initial={{ scale: 0.2, opacity: 0.0 }}
                  animate={{ scale: 3.8, opacity: [0.55, 0] }}
                  transition={{ duration: 1.25, ease: "easeOut", delay: 0.05 }}
                />
              </div>
            ) : null}

            <motion.div
              key={`headline_${headline}_${primaryAchievement?.id ?? "none"}`}
              initial={{ opacity: 0, y: 22, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="space-y-5"
            >
              <div className="text-5xl sm:text-7xl font-black tracking-tight text-white">
                {headline}
              </div>
              {subHeadline ? (
                <div className="text-lg sm:text-2xl font-semibold text-white/70">
                  {subHeadline}
                </div>
              ) : null}

              <div className="text-sm sm:text-base text-white/60">
                {achievementLine ? <div>{achievementLine}</div> : null}
                {promotionLine ? <div>{promotionLine}</div> : null}
                <div>{xpLine}</div>
              </div>

              {canContinue ? (
                <div className="pt-2">
                  <Button type="button" size="sm" onClick={onDone}>
                    Continue
                  </Button>
                </div>
              ) : null}
            </motion.div>

            <AnimatePresence initial={false}>
              {burstSeed.length > 0 ? (
                <motion.div
                  key={`burst_${burstSeed}`}
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {burstPieces.map((p) => (
                    <motion.div
                      key={p.key}
                      className={cn(
                        "absolute left-1/2 top-1/2 rounded-sm",
                        p.color,
                      )}
                      style={{ width: p.size, height: Math.max(4, p.size - 2) }}
                      initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                      animate={{
                        x: p.x,
                        y: p.y,
                        rotate: p.rot,
                        opacity: [1, 1, 0],
                      }}
                      transition={{
                        duration: p.durationMs / 1000,
                        delay: p.delayMs / 1000,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
