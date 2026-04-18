"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import {
  type InputFlow,
  JobInput,
} from "@/components/common/molecules/job-input";
import { buildSearchParamsFromInterviewConfig } from "@/lib/interview";
import type { ExtractedJobDescription } from "@/lib/services/job-description/extractor";

const BLAIR_MESSAGE =
  "Hey! I'm Blair. Paste a job posting URL and I'll break down what they're looking for. No link? Paste the description and I'll prep a session. Nothing specific? Type `/custom` to configure a interview from my templates.";

function renderBlairMessage(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      const code = part.slice(1, -1);
      return (
        <code
          key={i}
          className="bg-primary/20 px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {code}
        </code>
      );
    }
    return part;
  });
}

function buildConfigureUrlForCustom(): string {
  const params = new URLSearchParams({ flow: "custom", step: "position" });
  return `/configure?${params.toString()}`;
}

function buildInterviewUrlFromExtracted(
  extracted: ExtractedJobDescription,
): string {
  const params = buildSearchParamsFromInterviewConfig({
    position: extracted.position,
    seniority: extracted.seniority,
    technologies: extracted.technologies,
    companyProfile: extracted.companyProfile,
    company: extracted.company,
    interviewMode: "regular",
    interviewType: "mixed",
    duration: "30",
    isDemoMode: false,
    contextType: "job-specific",
    jobDescription: extracted.jobDescription,
    jobRequirements: extracted.jobRequirements,
  });
  return `/interview?${params.toString()}`;
}

async function extractFromDescription(
  description: string,
): Promise<ExtractedJobDescription | null> {
  try {
    const response = await fetch("/api/job-description/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const payload = await response.json();
    if (!payload.success || !payload.data) return null;
    return payload.data as ExtractedJobDescription;
  } catch {
    return null;
  }
}

async function extractFromUrl(
  url: string,
): Promise<ExtractedJobDescription | null> {
  try {
    const response = await fetch("/api/job-description/extract-from-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const payload = await response.json();
    if (!payload.success || !payload.data) return null;
    return payload.data as ExtractedJobDescription;
  } catch {
    return null;
  }
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
  inputDraft: string;
  onInputChange: (value: string) => void;
  onSubmit: (flow: InputFlow) => void;
  isLoading: boolean;
}

function HeroInterviewCard({
  inputDraft,
  onInputChange,
  onSubmit,
  isLoading,
}: HeroInterviewCardProps) {
  const { displayText } = useHeroTypingAnimation();

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
              {renderBlairMessage(displayText)}
            </Typography.BodyMedium>
          </div>
        </div>
      </div>

      <JobInput
        value={inputDraft}
        onChange={onInputChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
        size="default"
      />
    </section>
  );
}

export default function HeroSection() {
  const router = useRouter();
  const [inputDraft, setInputDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (flow: InputFlow) => {
    const trimmed = inputDraft.trim();

    if (flow === "custom") {
      router.push(buildConfigureUrlForCustom());
      return;
    }

    setIsLoading(true);
    try {
      const extracted =
        flow === "url"
          ? await extractFromUrl(trimmed)
          : await extractFromDescription(trimmed);

      console.info("[hero] extracted config:", extracted);

      if (!extracted?.jobDescription?.trim()) {
        router.push(
          flow === "url"
            ? `/configure?flow=url&pastedUrl=${encodeURIComponent(trimmed)}&autoStart=1`
            : `/configure?flow=paste&pastedDescription=${encodeURIComponent(trimmed)}&autoAnalyze=1`,
        );
        return;
      }

      router.push(buildInterviewUrlFromExtracted(extracted));
    } finally {
      setIsLoading(false);
    }
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
                inputDraft={inputDraft}
                onInputChange={setInputDraft}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </header>
    </section>
  );
}
