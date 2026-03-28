"use client";

import { Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";

// Custom SVG icons
function CollectIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <title>Collect icon</title>
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="currentColor"
        fillOpacity={0.25}
      />
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StreakIcon({ className }: { className?: string }) {
  return <Flame className={className} />;
}

function ScoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <title>Score icon</title>
      {/* Upward arrow/rocket shape */}
      <path
        d="M12 2L12 16"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M5 9L12 2L19 9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 20L12 16L16 20"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 22L12 16L18 22"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    </svg>
  );
}

export default function GamificationSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const features = [
    {
      icon: CollectIcon,
      title: "Collect",
      description: "Unlock rewards as you practice",
      accentColor: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
      delay: "delay-0",
    },
    {
      icon: StreakIcon,
      title: "Streak",
      description: "Keep the momentum going",
      accentColor: "from-rose-500 to-red-600",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      iconBg: "bg-gradient-to-br from-rose-400 to-red-500",
      delay: "delay-100",
    },
    {
      icon: ScoreIcon,
      title: "Score",
      description: "Track your improvement",
      accentColor: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
      delay: "delay-200",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="bg-card border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="gamification-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(251,146,60,0.05),transparent_100%)] dark:bg-[linear-gradient(180deg,rgba(251,146,60,0.05),transparent_100%)]"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Header */}
        <header
          className={`text-center max-w-2xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <Typography.HeroSubHeading
            id="gamification-heading"
            className="mb-6 text-balance"
          >
            Level up while you prep
          </Typography.HeroSubHeading>

          <Typography.Body
            color="secondary"
            className="text-lg sm:text-xl leading-relaxed text-pretty"
          >
            Every session earns XP, unlocks achievements, and pushes your rank
            higher. Turn the grind into a game you actually want to play.
          </Typography.Body>
        </header>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative transition-all duration-700 ${
                feature.delay
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div
                className={`relative h-full p-8 rounded-3xl border ${feature.borderColor} ${feature.bgColor} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-foreground/5`}
              >
                {/* Decorative corner accent */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${feature.accentColor} opacity-10 rounded-tr-3xl overflow-hidden`}
                  style={{
                    clipPath: "ellipse(70% 70% at 100% 0%)",
                  }}
                />

                {/* Icon */}
                <div
                  className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.iconBg} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />

                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.accentColor} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`}
                  />
                </div>

                <Typography.Heading3 className="mb-3">
                  {feature.title}
                </Typography.Heading3>
                <Typography.Body color="secondary" className="leading-relaxed">
                  {feature.description}
                </Typography.Body>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
