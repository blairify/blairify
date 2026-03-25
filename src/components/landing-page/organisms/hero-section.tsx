"use client";

import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";

const BLAIR_MESSAGE =
  "Hey! I'm Blair. Ready to prep for your interview? Paste a job posting URL and I'll break down what they're looking for.";

function isValidHttpsUrl(value: string): boolean {
  if (!/^https:\/\//i.test(value)) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function buildConfigureUrl(jobUrl: string): string {
  const params = new URLSearchParams({
    flow: "url",
    pastedUrl: jobUrl,
    autoStart: "1",
  });
  return `/configure?${params.toString()}`;
}

interface TypingAnimationState {
  displayText: string;
}

function useHeroTypingAnimation(): TypingAnimationState {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const timeoutIds: Array<ReturnType<typeof setTimeout>> = [];

    const scheduleTimeout = (callback: () => void, delayMs: number) => {
      timeoutIds.push(setTimeout(callback, delayMs));
    };

    const words = BLAIR_MESSAGE.split(" ");
    let wordIndex = 0;
    let currentText = "";

    const typeWord = () => {
      if (wordIndex < words.length) {
        currentText += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
        setDisplayText(currentText);
        scheduleTimeout(typeWord, 100 + Math.random() * 150);
      }
    };

    scheduleTimeout(typeWord, 1000);

    return () => {
      for (const timeoutId of timeoutIds) clearTimeout(timeoutId);
    };
  }, []);

  return {
    displayText,
  };
}

interface HeroInterviewCardProps {
  canStartFromUrl: boolean;
  jobUrlDraft: string;
  onJobUrlChange: (value: string) => void;
  onSubmit: () => void;
}

function HeroInterviewCard({
  canStartFromUrl,
  jobUrlDraft,
  onJobUrlChange,
  onSubmit,
}: HeroInterviewCardProps) {
  const { displayText } = useHeroTypingAnimation();

  const handleSubmit = () => {
    if (!canStartFromUrl) return;
    onSubmit();
  };

  const interviewer = {
    id: "blair",
    name: "Blair",
    title: "AI Interview Assistant",
    experience: "Expert in technical interviews",
    specialties: ["Communication", "Technical Assessment"],
    personality: "Friendly and encouraging",
    avatarConfig: {
      sex: "woman" as const,
      faceColor: "#F9C9B6",
      earSize: "small" as const,
      eyeStyle: "smile" as const,
      noseStyle: "short" as const,
      mouthStyle: "laugh" as const,
      shirtStyle: "polo" as const,
      glassesStyle: "round" as const,
      hairColor: "#4A312C",
      hairStyle: "womanLong" as const,
      hatStyle: "none" as const,
      shirtColor: "#FF6B6B",
      bgColor: "#DFE6E9",
    },
  };

  return (
    <section
      className="w-full max-w-xl mx-auto"
      aria-label="Interview chat preview"
    >
      {/* Interviewer Message */}
      <div className="flex gap-3 mb-6">
        <div className="size-14 overflow-hidden rounded-full bg-primary/10 flex-shrink-0 mt-1 ring-2 ring-primary/20">
          <InterviewerAvatar interviewer={interviewer} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl rounded-tl-md px-4 py-3 inline-block max-w-full border border-primary/20">
            <Typography.BodyMedium
              color="primary"
              className="leading-relaxed text-base"
            >
              {displayText}
            </Typography.BodyMedium>
          </div>
        </div>
      </div>

      {/* Input Container */}
      <div className="w-full">
        <div
          className={`relative rounded-3xl border-2 transition-all ${
            canStartFromUrl
              ? "border-primary"
              : "border-primary/40  focus-within:border-primary/50"
          }`}
        >
          {/* Animated glow effect - only on edges */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
            style={{ padding: "1px" }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent, orange-500/40, transparent, orange-500/40, transparent)",
                animation: "rotate 3s linear infinite",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                padding: "2px",
              }}
            />
          </div>

          <textarea
            value={jobUrlDraft}
            onChange={(e) => onJobUrlChange(e.target.value)}
            placeholder="https://justjoin.it/job-offer/software-engineer"
            rows={2}
            className="relative w-full bg-transparent text-gray-900 dark:text-gray-50 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none focus:outline-none px-5 pt-4 pb-14 text-base"
          />

          {/* Bottom bar */}
          <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between z-10">
            {/* Helper text */}
            <div className="flex items-center gap-3 text-xs">
              {canStartFromUrl ? (
                <span className="text-green-500">✓ Valid URL</span>
              ) : (
                <span className="text-zinc-500">Paste job URL</span>
              )}
            </div>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canStartFromUrl}
              className={`size-10 rounded-full bg-primary flex items-center justify-center transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Start interview"
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const [jobUrlDraft, setJobUrlDraft] = useState("");

  const normalizedJobUrl = jobUrlDraft.trim();
  const canStartFromUrl = useMemo(
    () => isValidHttpsUrl(normalizedJobUrl),
    [normalizedJobUrl],
  );

  const handleStartFromJobUrl = () => {
    if (!canStartFromUrl) return;
    router.push(buildConfigureUrl(normalizedJobUrl));
  };

  return (
    <section
      className="bg-background text-[color:var(--foreground)] scroll-mt-24 relative overflow-hidden border-b border-border/40"
      aria-labelledby="hero-heading"
      data-analytics-id="home-hero"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.08),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(249,115,22,0.06),transparent_50%)]"
        aria-hidden="true"
      />
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center lg:min-h-[78vh] px-2">
          <div className="space-y-5 text-center lg:text-left animate-in slide-in-from-left-8 duration-700 max-w-xl lg:max-w-none mx-auto lg:mx-0">
            <Typography.HeroHeading1 id="hero-heading">
              Realistic <span className="text-primary">Interview</span>
            </Typography.HeroHeading1>
            <Typography.HeroHeading1 id="hero-heading">
              <span className="text-primary">Instant</span> Feedback
            </Typography.HeroHeading1>

            <Typography.Body
              color="secondary"
              className="max-w-md mx-auto lg:mx-0"
            >
              <span className="text-black dark:text-white font-bold">
                No consequences.
              </span>{" "}
              Practice risk-free with realistic simulations. Get scored across
              core competencies with clear, actionable feedback on where to
              improve.
            </Typography.Body>
          </div>

          <div className="animate-in slide-in-from-right-8 duration-700 flex justify-center lg:justify-end">
            <div className="w-full max-w-xl mx-auto lg:mx-0">
              <HeroInterviewCard
                canStartFromUrl={canStartFromUrl}
                jobUrlDraft={jobUrlDraft}
                onJobUrlChange={setJobUrlDraft}
                onSubmit={handleStartFromJobUrl}
              />
            </div>
          </div>
        </div>
      </header>
    </section>
  );
}
