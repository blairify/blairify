"use client";

import { motion } from "motion/react";
import { Typography } from "@/components/common/atoms/typography";
import { RankBadge } from "@/components/ranks/organisms/rank-badge";
import { XPProgressBar } from "@/components/ranks/organisms/xp-progress-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Rank } from "@/lib/ranks";
import { formatRankLevel, formatXP } from "@/lib/ranks";
import { cn } from "@/lib/utils";

interface CurrentRankCardProps {
  rank: Rank;
  nextRank: Rank | null;
  totalXP: number;
  progressToNextRank: number;
  xpToNextRank: number;
}

export function CurrentRankCard({
  rank,
  nextRank,
  totalXP,
  progressToNextRank,
  xpToNextRank,
}: CurrentRankCardProps) {
  return (
    <Card
      className={cn(
        "border-border/60 bg-gradient-to-br from-card to-muted/20 shadow-sm overflow-hidden relative group h-full",
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      {/* Glow effect behind the rank badge if high rank */}
      <div
        className={cn(
          "absolute -right-20 -top-20 size-60 rounded-full blur-[80px] opacity-10 pointer-events-none",
          rank.badge.bg,
        )}
      />

      <CardContent className="p-6 sm:p-8 relative z-10 h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-8 h-full">
          {/* Rank Badge Column */}
          <div className="flex flex-col items-center justify-center text-center gap-4 min-w-[140px]">
            <Typography.CaptionMedium
              color="secondary"
              className="uppercase tracking-wide text-[10px] font-bold"
            >
              Current Rank
            </Typography.CaptionMedium>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <RankBadge
                rank={rank}
                size="xl"
                showGlow
                showLabel={false}
                showLevel={false}
                animated
              />
            </motion.div>

            <div className="space-y-1">
              <Typography.Heading3
                className={cn(
                  "text-xl font-bold tracking-tight",
                  rank.badge.text,
                )}
              >
                {rank.name} {formatRankLevel(rank.level)}
              </Typography.Heading3>
              <div className="px-3 py-1 rounded-full bg-muted/50 border border-border/50 inline-block">
                <Typography.SubCaptionMedium className="text-primary font-semibold">
                  {formatXP(totalXP)} Total XP
                </Typography.SubCaptionMedium>
              </div>
            </div>
          </div>

          {/* Stats & Progress Column */}
          <div className="flex-1 flex flex-col justify-center gap-6 border-t sm:border-t-0 sm:border-l border-border/40 pt-6 sm:pt-0 sm:pl-8">
            <div className="space-y-4">
              <Typography.BodyBold className="text-muted-foreground uppercase tracking-wider text-xs">
                Rank Progression
              </Typography.BodyBold>
              <XPProgressBar
                currentXP={totalXP}
                rank={rank}
                nextRank={nextRank}
                progress={progressToNextRank}
                xpToNextRank={xpToNextRank}
                size="lg"
                showLabel={true}
                showNumbers={true}
                animated
              />
            </div>

            {rank.perks.length > 0 && (
              <div className="space-y-3">
                <Typography.BodyBold className="text-muted-foreground uppercase tracking-wider text-xs">
                  Current Perks
                </Typography.BodyBold>
                <div className="flex flex-wrap gap-2">
                  {rank.perks.map((perk, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-background/80 hover:bg-background border border-border/50 text-muted-foreground font-normal px-3 py-1"
                    >
                      {perk}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Next Rank Preview */}
            {nextRank && (
              <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Next Rank
                  </div>
                  <div className={cn("font-bold text-sm", nextRank.badge.text)}>
                    {nextRank.name} {formatRankLevel(nextRank.level)}
                  </div>
                </div>
                <div className="opacity-80 grayscale group-hover:grayscale-0 transition-all duration-500">
                  <RankBadge
                    rank={nextRank}
                    size="sm"
                    showGlow={false}
                    showContainer={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
