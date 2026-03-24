"use client";

import { useEffect, useRef, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import AbacusIcon from "@/components/common/icons/abacus-icon";
import BrandMinecraftIcon from "@/components/common/icons/brand-minecraft-icon";
import FlameIcon from "@/components/common/icons/flame-icon";

export default function GamificationSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [_isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reduceMotionQuery.matches) {
      setIsVisible(true);
      return;
    }

    let hasTriggered = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (!entry.isIntersecting) return;
        if (hasTriggered) return;

        hasTriggered = true;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-background border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="gamification-heading"
      data-analytics-id="home-gamification"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.06),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.05),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Typography.HeroSubHeading
            id="gamification-heading"
            className="mt-4 mb-3"
          >
            Level up while you prep.
          </Typography.HeroSubHeading>
          <Typography.Body color="secondary">
            Every session earns XP, unlocks achievements, and pushes your rank
            higher. It turns the grind into a game you actually want to play.
          </Typography.Body>
        </header>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Achievement Progress */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-4">
              <BrandMinecraftIcon
                size={32}
                color="currentColor"
                strokeWidth={1.5}
              />
            </div>
            <Typography.BodyBold className="mb-2">Collect</Typography.BodyBold>
            <Typography.SubCaption color="secondary">
              Unlock rewards as you practice
            </Typography.SubCaption>
          </div>

          {/* Current Streak */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-orange-500/10 mb-4">
              <FlameIcon size={32} color="currentColor" strokeWidth={1.5} />
            </div>
            <Typography.BodyBold className="mb-2">Streak</Typography.BodyBold>
            <Typography.SubCaption color="secondary">
              Keep the momentum going
            </Typography.SubCaption>
          </div>

          {/* Skill Progress */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-500/10 mb-4">
              <AbacusIcon size={32} color="currentColor" strokeWidth={1.5} />
            </div>
            <Typography.BodyBold className="mb-2">Score</Typography.BodyBold>
            <Typography.SubCaption color="secondary">
              Track your improvement
            </Typography.SubCaption>
          </div>
        </div>
      </div>
    </section>
  );
}
