"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INTERVIEWERS } from "@/lib/config/interviewers";

const TERMINAL_COMMAND = "start --from-url";
const TERMINAL_DESCRIPTION =
  "Paste a job posting URL. I will extract the role requirements and prepare the interview.";
const TERMINAL_DESCRIPTION_WITH_MISTAKE =
  "Paste a job postin URL. I will extract the role requirements and prepare the interview.";
const TERMINAL_FOLLOW_UP = "Are we doing it?";
const TERMINAL_CORRECT_WORD = "posting";
const MISTAKE_CHAR_INDEX = TERMINAL_DESCRIPTION_WITH_MISTAKE.indexOf("postin");
const MISTAKE_BACKSPACE_COUNT = 7;
const COMMAND_START_DELAY_MS = 1000;
const DESCRIPTION_START_DELAY_MS = 500;
const MISTAKE_PAUSE_MS = 800;
const CORRECTION_RESUME_DELAY_MS = 200;
const FOLLOW_UP_DELAY_MS = 4000;
const BACKSPACE_INTERVAL_MS = 50;
const TYPING_SPEED_MIN_MS = 30;
const TYPING_SPEED_RANGE_MS = 50;

const randomTypingSpeed = () =>
  Math.random() * TYPING_SPEED_RANGE_MS + TYPING_SPEED_MIN_MS;

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
  commandText: string;
  displayText: string;
  isTypingCommand: boolean;
  isTyping: boolean;
  isCorrecting: boolean;
  showFollowUp: boolean;
  followUpText: string;
  isTypingFollowUp: boolean;
  followUpCompleted: boolean;
}

function useHeroTypingAnimation(): TypingAnimationState {
  const [commandText, setCommandText] = useState("");
  const [displayText, setDisplayText] = useState("");
  const [isTypingCommand, setIsTypingCommand] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpText, setFollowUpText] = useState("");
  const [isTypingFollowUp, setIsTypingFollowUp] = useState(false);
  const [followUpCompleted, setFollowUpCompleted] = useState(false);

  useEffect(() => {
    if (animationCompleted) return;

    let cmdIndex = 0;
    let cmdText = "";
    let descIndex = 0;
    let descText = "";
    let mistakeMade = false;

    const finishDescription = () => {
      setIsTyping(false);
      setAnimationCompleted(true);
    };

    const resumeAfterCorrection = () => {
      if (descIndex >= TERMINAL_DESCRIPTION.length) {
        finishDescription();
        return;
      }
      descText += TERMINAL_DESCRIPTION[descIndex++];
      setDisplayText(descText);
      setTimeout(resumeAfterCorrection, randomTypingSpeed());
    };

    const typeCorrectWord = (correctIndex: number) => {
      if (correctIndex >= TERMINAL_CORRECT_WORD.length) {
        setIsCorrecting(false);
        setTimeout(resumeAfterCorrection, CORRECTION_RESUME_DELAY_MS);
        return;
      }
      descText += TERMINAL_CORRECT_WORD[correctIndex];
      setDisplayText(descText);
      setTimeout(() => typeCorrectWord(correctIndex + 1), randomTypingSpeed());
    };

    const backspace = (count: number) => {
      if (count >= MISTAKE_BACKSPACE_COUNT) {
        typeCorrectWord(0);
        return;
      }
      descText = descText.slice(0, -1);
      setDisplayText(descText);
      setTimeout(() => backspace(count + 1), BACKSPACE_INTERVAL_MS);
    };

    const typeDescription = () => {
      if (descIndex >= TERMINAL_DESCRIPTION_WITH_MISTAKE.length) {
        finishDescription();
        return;
      }
      descText += TERMINAL_DESCRIPTION_WITH_MISTAKE[descIndex++];
      setDisplayText(descText);
      if (descIndex === MISTAKE_CHAR_INDEX + 7 && !mistakeMade) {
        mistakeMade = true;
        setIsCorrecting(true);
        setTimeout(() => backspace(0), MISTAKE_PAUSE_MS);
        return;
      }
      setTimeout(typeDescription, randomTypingSpeed());
    };

    const typeCommand = () => {
      if (cmdIndex >= TERMINAL_COMMAND.length) {
        setIsTypingCommand(false);
        setTimeout(typeDescription, DESCRIPTION_START_DELAY_MS);
        return;
      }
      cmdText += TERMINAL_COMMAND[cmdIndex++];
      setCommandText(cmdText);
      setTimeout(typeCommand, randomTypingSpeed());
    };

    const startTimer = setTimeout(typeCommand, COMMAND_START_DELAY_MS);
    return () => clearTimeout(startTimer);
  }, [animationCompleted]);

  useEffect(() => {
    if (!animationCompleted || showFollowUp) return;

    const followUpTimer = setTimeout(() => {
      setShowFollowUp(true);
      setIsTypingFollowUp(true);

      let followUpIndex = 0;
      let currentFollowUpText = "";

      const typeFollowUp = () => {
        if (followUpIndex >= TERMINAL_FOLLOW_UP.length) {
          setIsTypingFollowUp(false);
          setFollowUpCompleted(true);
          return;
        }
        currentFollowUpText += TERMINAL_FOLLOW_UP[followUpIndex++];
        setFollowUpText(currentFollowUpText);
        setTimeout(typeFollowUp, randomTypingSpeed());
      };

      typeFollowUp();
    }, FOLLOW_UP_DELAY_MS);

    return () => clearTimeout(followUpTimer);
  }, [animationCompleted, showFollowUp]);

  return {
    commandText,
    displayText,
    isTypingCommand,
    isTyping,
    isCorrecting,
    showFollowUp,
    followUpText,
    isTypingFollowUp,
    followUpCompleted,
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
  const {
    commandText,
    displayText,
    isTypingCommand,
    isTyping,
    isCorrecting,
    showFollowUp,
    followUpText,
    isTypingFollowUp,
    followUpCompleted,
  } = useHeroTypingAnimation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <section
      className="flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100"
      aria-label="Interview terminal preview"
    >
      <div className="flex items-center justify-between border-zinc-800 border-b px-4 py-2">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="ml-2 text-xs">~/blairify</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-5 overflow-hidden rounded-full bg-background shadow-sm flex-shrink-0">
            <InterviewerAvatar interviewer={INTERVIEWERS[0]} size={20} />
          </div>
          <Typography.SubCaption color="secondary" className="truncate">
            {INTERVIEWERS[0].name}
          </Typography.SubCaption>
        </div>
      </div>

      <div className="h-48 overflow-hidden p-4 font-mono text-sm leading-relaxed">
        <pre className="whitespace-pre-wrap break-words">
          <span className="text-green-400">$</span>{" "}
          <span className="text-zinc-300">
            {commandText}
            {isTypingCommand && (
              <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />
            )}
          </span>
          <br />
          {!isTypingCommand && (
            <>
              <span className="text-zinc-300">
                {displayText}
                {(isTyping || isCorrecting) && (
                  <span
                    className={`inline-block w-2 h-4 ml-1 ${isCorrecting ? "bg-red-400" : "bg-white"} animate-pulse`}
                  />
                )}
              </span>
              {!isTyping && !isCorrecting && (
                <>
                  <br />
                  <span className="text-zinc-500">
                    {canStartFromUrl
                      ? "Status: valid URL detected"
                      : "Status: waiting for HTTPS URL"}
                  </span>
                  {showFollowUp && (
                    <>
                      <br />
                      <span className="text-green-400">$</span>{" "}
                      <span
                        className={`text-zinc-300 ${followUpCompleted ? "animate-pulse" : ""}`}
                      >
                        {followUpText}
                        {isTypingFollowUp && (
                          <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />
                        )}
                      </span>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </pre>
      </div>

      <div className="border-zinc-800 border-t p-3">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3">
              <span className="text-blue-400 mr-2">{">"}</span>
              <Input
                id="hero-job-url"
                value={jobUrlDraft}
                onChange={(event) => onJobUrlChange(event.target.value)}
                placeholder="https://justjoin.it/job-offer/software-engineer"
                inputMode="url"
                autoComplete="url"
                className="h-8 border-0 bg-transparent px-0 shadow-none text-zinc-100 placeholder:text-zinc-500 focus-visible:border-0 focus-visible:shadow-none focus-visible:ring-0 text-xs sm:text-sm truncate"
                aria-describedby="hero-job-url-hint"
              />
            </div>
            <Button
              type="submit"
              disabled={!canStartFromUrl}
              className="h-8 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700"
              aria-label="Start interview from job offer link"
            >
              Run
            </Button>
          </div>
        </form>
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
              Simulate real interview.
            </Typography.HeroHeading1>
            <Typography.Body
              color="secondary"
              className="max-w-md mx-auto lg:mx-0"
            >
              Define your target role and run a realistic simulation. Get scored
              across core competencies with clear, actionable feedback on where
              to improve.
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
