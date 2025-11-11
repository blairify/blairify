"use client";

import { Sparkles, Trophy, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Rank } from "@/lib/ranks";
import { cn } from "@/lib/utils";
import { RankBadge } from "./rank-badge";

interface RankUpModalProps {
  oldRank: Rank;
  newRank: Rank;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function RankUpModal({
  oldRank,
  newRank,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
}: RankUpModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => {
      setIsVisible(true);
      setShowConfetti(true);
    }, 100);

    // Auto-close if enabled
    if (autoClose) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => {
        clearTimeout(timer);
        clearTimeout(closeTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [autoClose, autoCloseDelay, handleClose]);

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-50",
          "transition-opacity duration-300 cursor-default",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={handleClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card
          className={cn(
            "relative max-w-md w-full pointer-events-auto",
            "border-2 shadow-2xl",
            newRank.badge.border,
            newRank.badge.bg,
            "transition-all duration-500",
            isVisible
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-75 opacity-0 translate-y-8",
          )}
        >
          <CardContent className="p-8 relative overflow-hidden">
            {/* Animated background particles */}
            {showConfetti && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute w-2 h-2 rounded-full animate-confetti",
                      newRank.badge.bg,
                    )}
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Trophy icon */}
              <div className="flex justify-center mb-4">
                <div
                  className={cn(
                    "p-4 rounded-full",
                    newRank.badge.bg,
                    newRank.badge.border,
                    "border-2",
                    "animate-bounce",
                  )}
                >
                  <Trophy className={cn("w-8 h-8", newRank.badge.text)} />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                <span>Rank Up!</span>
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              </h2>

              <p className="text-muted-foreground mb-6">
                You've reached a new rank!
              </p>

              {/* Rank comparison */}
              <div className="flex items-center justify-center gap-6 mb-6">
                {/* Old rank */}
                <div className="flex flex-col items-center">
                  <RankBadge
                    rank={oldRank}
                    size="lg"
                    showLabel={false}
                    animated={false}
                  />
                  <span className="text-sm text-muted-foreground mt-2">
                    {oldRank.name}
                  </span>
                </div>

                {/* Arrow */}
                <div className="text-2xl text-muted-foreground">→</div>

                {/* New rank */}
                <div className="flex flex-col items-center">
                  <RankBadge
                    rank={newRank}
                    size="lg"
                    showGlow
                    showLabel={false}
                    animated
                  />
                  <span
                    className={cn(
                      "text-sm font-semibold mt-2",
                      newRank.badge.text,
                    )}
                  >
                    {newRank.name}
                  </span>
                </div>
              </div>

              {/* New perks */}
              {newRank.perks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                    New Perks Unlocked:
                  </h3>
                  <ul className="space-y-1">
                    {newRank.perks.map((perk, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <Button
                onClick={handleClose}
                className={cn(
                  "w-full",
                  newRank.badge.bg,
                  newRank.badge.text,
                  "hover:opacity-90",
                )}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Hook to manage rank-up notifications
export function useRankUpNotification() {
  const [rankUpData, setRankUpData] = useState<{
    oldRank: Rank;
    newRank: Rank;
  } | null>(null);

  const showRankUp = (oldRank: Rank, newRank: Rank) => {
    setRankUpData({ oldRank, newRank });
  };

  const closeRankUp = () => {
    setRankUpData(null);
  };

  return {
    rankUpData,
    showRankUp,
    closeRankUp,
  };
}
