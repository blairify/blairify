"use client";

import { Database, Flame, Medal, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";

export default function GamificationSection() {
  const xpBarRef = useRef<HTMLDivElement | null>(null);
  const [shouldAnimateXp, setShouldAnimateXp] = useState(false);

  useEffect(() => {
    const target = xpBarRef.current;
    if (!target) return;

    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reduceMotionQuery.matches) return;

    let hasAnimated = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) return;
        if (hasAnimated) return;

        hasAnimated = true;
        setShouldAnimateXp(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="bg-background border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="gamification-heading"
      data-analytics-id="home-gamification"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(168,85,247,0.05),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Medal className="size-10 text-primary mx-auto" aria-hidden="true" />
          <Typography.Heading2 id="gamification-heading" className="mt-4 mb-3">
            Gamify your preparation.
          </Typography.Heading2>
          <Typography.Body color="secondary">
            Earn XP for surviving Tech Lead drill-downs, unlock architectural
            badges, and track your streaks.
          </Typography.Body>
        </header>

        <div className="grid gap-6 justify-items-center md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl border border-border bg-background/80 backdrop-blur p-6 sm:p-8 md:col-span-2 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-6">
              <div>
                <Typography.SubCaptionMedium color="secondary">
                  Rank
                </Typography.SubCaptionMedium>
                <Typography.Heading3 className="mt-1">
                  Mid-Level Architect
                </Typography.Heading3>
              </div>
              <div className="text-right">
                <Typography.SubCaptionMedium color="secondary">
                  Total XP
                </Typography.SubCaptionMedium>
                <Typography.BodyBold color="brand" className="mt-1">
                  14,250
                </Typography.BodyBold>
              </div>
            </div>

            <div className="mt-6">
              <div
                ref={xpBarRef}
                className="h-3 rounded-full border border-border bg-background overflow-hidden relative"
                role="progressbar"
                aria-label="Progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={85}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className={
                    shouldAnimateXp
                      ? "h-3 bg-primary blairify-xp-fill"
                      : "h-3 bg-primary"
                  }
                  style={{ width: "85%" }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Flame className="size-4 text-primary" aria-hidden="true" />
                <Typography.SubCaptionMedium color="secondary">
                  7 Day Streak!
                </Typography.SubCaptionMedium>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-background/80 backdrop-blur p-6 sm:p-8 space-y-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 w-full max-w-[32rem] md:col-span-2 md:justify-self-center lg:col-span-1 lg:justify-self-auto lg:max-w-none">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl border border-border bg-background flex items-center justify-center">
                <ShieldCheck
                  className="size-5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div>
                <Typography.BodyBold>Flawless Defense</Typography.BodyBold>
                <Typography.SubCaptionMedium color="secondary">
                  Survived drill-downs.
                </Typography.SubCaptionMedium>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl border border-border bg-background flex items-center justify-center">
                <Database className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <Typography.BodyBold>Data Master</Typography.BodyBold>
                <Typography.SubCaptionMedium color="secondary">
                  Solved DB sharding.
                </Typography.SubCaptionMedium>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
