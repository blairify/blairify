"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import { INTERVIEWERS } from "@/lib/config/interviewers";
import { Typography } from "../../common/atoms/typography";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

const HERO_INTERVIEWER = INTERVIEWERS[0];

function normalizeJobUrlInput(value: string): string {
  return value.trim();
}

function isValidHttpsUrl(value: string): boolean {
  if (!/^https:\/\//i.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function HeroSection() {
  const router = useRouter();
  const [jobUrlDraft, setJobUrlDraft] = useState("");

  const normalizedJobUrl = useMemo(
    () => normalizeJobUrlInput(jobUrlDraft),
    [jobUrlDraft],
  );

  const canStartFromUrl = useMemo(
    () => isValidHttpsUrl(normalizedJobUrl),
    [normalizedJobUrl],
  );

  const handleStartFromJobUrl = () => {
    if (!canStartFromUrl) return;
    const searchParams = new URLSearchParams();
    searchParams.set("flow", "url");
    searchParams.set("pastedUrl", normalizedJobUrl);
    searchParams.set("autoStart", "1");
    router.push(`/configure?${searchParams.toString()}`);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center lg:min-h-[78vh]">
          <div className="space-y-5 text-center lg:text-left animate-in slide-in-from-left-8 duration-700 max-w-xl lg:max-w-none mx-auto lg:mx-0">
            <div className="relative">
              <Typography.HeroHeading1 id="hero-heading">
                Simulate real interview.
                <br />
                <Typography.HeroHeadingAccent color="brand">
                  Land your dream Role.
                </Typography.HeroHeadingAccent>
              </Typography.HeroHeading1>
            </div>

            <Typography.Body
              color="secondary"
              className="max-w-xl mx-auto lg:mx-0"
            >
              Define your target role and run a realistic simulation. Get scored
              across core competencies with clear, actionable feedback on where
              to improve.
            </Typography.Body>
          </div>

          <div className="animate-in slide-in-from-right-8 duration-700 flex justify-center lg:justify-end">
            <div className="w-full max-w-xl mx-auto lg:mx-0">
              <div className="rounded-3xl border border-border/70 bg-background/80 backdrop-blur shadow-[0_18px_55px_-35px_hsl(var(--always-black)_/_0.35)]">
                <div className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="size-12 rounded-full ring-2 ring-primary/25 overflow-hidden bg-background shadow-sm flex-shrink-0">
                      <InterviewerAvatar
                        interviewer={HERO_INTERVIEWER}
                        size={48}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm px-5 py-4 shadow-sm">
                        <Typography.SubCaptionBold color="brand">
                          Sarah
                        </Typography.SubCaptionBold>
                        <Typography.Body className="mt-1">
                          Welcome to Blairify. I’m Sarah - your interview coach.
                          <br />
                          Paste the job link and we’ll start right away.
                        </Typography.Body>
                      </div>
                    </div>
                  </div>

                  <form
                    className="mt-5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleStartFromJobUrl();
                    }}
                  >
                    <div className="rounded-2xl bg-background/80 backdrop-blur border border-border/70 shadow-sm px-5 py-4 ring-offset-background focus-within:ring-2 focus-within:ring-foreground/10 focus-within:ring-offset-2">
                      <label className="sr-only" htmlFor="hero-job-url">
                        Job offer link
                      </label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Input
                          id="hero-job-url"
                          value={jobUrlDraft}
                          onChange={(event) =>
                            setJobUrlDraft(event.target.value)
                          }
                          placeholder="Paste job link (https://…)"
                          inputMode="url"
                          autoComplete="url"
                          className="h-14 field--neutral-ring selection:bg-foreground/10 selection:text-foreground"
                        />
                        <Button
                          type="submit"
                          className="h-14 px-6 w-full sm:w-auto"
                          disabled={!canStartFromUrl}
                          aria-label="Start interview"
                        >
                          <Typography.CaptionMedium>
                            Start
                          </Typography.CaptionMedium>
                          <Send className="ml-2 size-5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </section>
  );
}
