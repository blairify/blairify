"use client";

import { Send } from "lucide-react";
import { useMemo, useState } from "react";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import { INTERVIEWERS } from "@/lib/config/interviewers";
import { Typography } from "../../common/atoms/typography";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";

const HERO_INTERVIEWER = INTERVIEWERS[0];

type SentResponse = {
  id: string;
  text: string;
};

function createSentResponseId() {
  return crypto.randomUUID?.() ?? String(Date.now());
}

export default function HeroSection() {
  const [draftResponse, setDraftResponse] = useState("");
  const [sentResponses, setSentResponses] = useState<readonly SentResponse[]>(
    [],
  );

  const isResponseSubmittable = useMemo(
    () => draftResponse.trim().length > 0,
    [draftResponse],
  );

  const handleSendResponse = () => {
    const trimmed = draftResponse.trim();
    if (!trimmed) return;
    setSentResponses((prev) => [
      ...prev,
      { id: createSentResponseId(), text: trimmed },
    ]);
    setDraftResponse("");
  };

  return (
    <section
      className="bg-[hsl(var(--bg-200))] text-[color:var(--foreground)] relative overflow-hidden scroll-mt-24"
      aria-labelledby="hero-heading"
      data-analytics-id="home-hero"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-[36rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 right-[-8rem] size-[30rem] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <header className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center lg:min-h-[78vh]">
          <div className="space-y-5 text-center lg:text-left animate-in slide-in-from-left-8 duration-700 max-w-xl lg:max-w-none mx-auto lg:mx-0">
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-x-6 -inset-y-4 rounded-3xl bg-primary/10 blur-2xl"
                aria-hidden="true"
              />
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

            <div className="mt-7 flex justify-center lg:justify-start">
              <Button
                type="button"
                className="h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-sm px-8"
                aria-label="Practice Now"
                onClick={() => {
                  const textarea = document.getElementById("hero-response");
                  if (!(textarea instanceof HTMLTextAreaElement)) return;
                  textarea.focus();
                }}
              >
                Practice Now
              </Button>
            </div>
          </div>

          <div className="animate-in slide-in-from-right-8 duration-700 flex justify-center lg:justify-end">
            <div className="w-full max-w-xl mx-auto lg:mx-0 rounded-3xl bg-gradient-to-br from-primary/30 via-border/30 to-transparent p-px shadow-[0_22px_70px_-34px_hsl(var(--always-black)_/_0.55)]">
              <div className="rounded-[calc(var(--radius)+0.75rem)] border border-border bg-card overflow-hidden relative">
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                >
                  <div className="absolute -top-24 right-[-8rem] size-[22rem] rounded-full bg-primary/10 blur-3xl" />
                  <div className="absolute -bottom-28 left-[-10rem] size-[26rem] rounded-full bg-primary/5 blur-3xl" />
                </div>

                <div className="relative flex items-center gap-2 border-b border-border bg-muted/30 px-3 sm:px-4 py-3">
                  <span
                    className="size-3 rounded-full bg-muted"
                    aria-hidden="true"
                  />
                  <span
                    className="size-3 rounded-full bg-muted"
                    aria-hidden="true"
                  />
                  <span
                    className="size-3 rounded-full bg-muted"
                    aria-hidden="true"
                  />
                  <div className="ml-3 flex items-center gap-2 min-w-0">
                    <div className="size-6 rounded-full ring-2 ring-primary/20 overflow-hidden bg-background flex-shrink-0">
                      <InterviewerAvatar
                        interviewer={HERO_INTERVIEWER}
                        size={24}
                      />
                    </div>
                    <Typography.SubCaptionMedium
                      color="secondary"
                      className="truncate"
                    >
                      {`session: fintech-senior-dev · ${HERO_INTERVIEWER.name}`}
                    </Typography.SubCaptionMedium>
                  </div>
                </div>

                <div className="relative p-4 sm:p-6 flex flex-col gap-5">
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="size-10 flex-shrink-0 ring-2 ring-primary/20 rounded-full overflow-hidden bg-background shadow-sm">
                        <InterviewerAvatar
                          interviewer={HERO_INTERVIEWER}
                          size={40}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="size-2 rounded-full bg-green-500"
                              aria-hidden="true"
                            />
                            <Typography.SubCaptionBold
                              color="secondary"
                              className="truncate"
                            >
                              {HERO_INTERVIEWER.name}
                            </Typography.SubCaptionBold>
                          </div>
                          <Typography.SubCaptionMedium color="secondary">
                            online
                          </Typography.SubCaptionMedium>
                        </div>
                        <div className="mt-2 relative rounded-2xl shadow-lg border border-border/50 backdrop-blur-sm bg-gradient-to-br from-card to-card/95 transition-shadow hover:shadow-xl">
                          <div
                            className="absolute top-4 size-3 rotate-45 border left-[-6px] bg-card border-border/50 border-r-0 border-t-0"
                            aria-hidden="true"
                          />
                          <div className="relative px-4 py-3">
                            <Typography.SubCaptionBold color="brand">
                              Tech Lead AI
                            </Typography.SubCaptionBold>
                            <Typography.Body className="mt-1">
                              The microservice is timing out under heavy load.
                              Do we scale vertically, or implement a message
                              queue? Defend your choice.
                            </Typography.Body>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {sentResponses.length > 0 && (
                    <div className="space-y-3">
                      {sentResponses.slice(-1).map((response) => (
                        <div
                          key={response.id}
                          className="flex gap-3 justify-end items-start"
                        >
                          <div className="min-w-0 flex-1 relative rounded-2xl shadow-lg border border-border/50 backdrop-blur-sm bg-gradient-to-br from-secondary via-secondary to-secondary/90">
                            <div
                              className="absolute top-4 size-3 rotate-45 border right-[-6px] bg-secondary border-secondary/20 border-l-0 border-b-0"
                              aria-hidden="true"
                            />
                            <div className="relative px-4 py-3">
                              <Typography.SubCaptionBold color="secondary">
                                YOU
                              </Typography.SubCaptionBold>
                              <Typography.Body className="mt-1">
                                {response.text}
                              </Typography.Body>
                            </div>
                          </div>
                          <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                            <Typography.SubCaptionBold color="brandDark">
                              YOU
                            </Typography.SubCaptionBold>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form
                    className="pt-4 border-t border-border/60"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSendResponse();
                    }}
                  >
                    <div className="group relative w-full max-w-[34rem] mx-auto transition-all duration-200 ease-out focus-within:scale-[1.01]">
                      <div
                        className="pointer-events-none absolute inset-x-2 sm:inset-x-6 -top-2 h-10 rounded-3xl bg-primary/10 blur-2xl opacity-0 transition-opacity duration-200 group-focus-within:opacity-100"
                        aria-hidden="true"
                      />
                      <div className="flex flex-col items-center gap-3 md:flex-row md:items-end">
                        <label
                          htmlFor="hero-response"
                          className="w-full md:flex-1"
                        >
                          <Typography.CaptionMedium
                            color="secondary"
                            className="block"
                          >
                            Your response
                          </Typography.CaptionMedium>
                          <Textarea
                            id="hero-response"
                            value={draftResponse}
                            onChange={(event) =>
                              setDraftResponse(event.target.value)
                            }
                            placeholder="Type your response..."
                            className="mt-2 min-h-14 max-w-[28rem] mx-auto"
                            onKeyDown={(event) => {
                              if (event.key !== "Enter") return;
                              if (!event.metaKey && !event.ctrlKey) return;
                              event.preventDefault();
                              handleSendResponse();
                            }}
                          />
                        </label>
                        <Button
                          type="submit"
                          className="h-12 w-full max-w-[12rem] md:w-auto"
                          disabled={!isResponseSubmittable}
                          aria-label="Send response"
                        >
                          <Send className="size-4" aria-hidden="true" />
                          Send
                        </Button>
                      </div>
                    </div>
                    <Typography.SubCaptionMedium
                      color="secondary"
                      className="mt-2 block"
                    >
                      Tip: Press Ctrl+Enter (or Cmd+Enter) to send.
                    </Typography.SubCaptionMedium>
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
