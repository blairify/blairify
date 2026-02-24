import { Check, MessageSquareText, Target, X } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

export default function ComparisonSection() {
  return (
    <section
      id="comparison"
      className="bg-[hsl(var(--bg-200))] border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="comparison-heading"
      data-analytics-id="home-comparison"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-[34rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <Typography.Heading2 id="comparison-heading" className="mb-4">
            "Can't I just prompt ChatGPT to be a strict interviewer?"
          </Typography.Heading2>
          <Typography.Body color="secondary">
            You can prompt GPT, Claude, or Gemini to roleplay an interview for a
            given Job Description. But you can't prompt them to access actual
            questions asked in interviews. Even the leading AI platforms grade
            static text. Blairify stress-tests reasoning against real,
            closed-door interview scenarios.
          </Typography.Body>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          <article className="h-full rounded-2xl border border-border bg-background/70 backdrop-blur p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 focus-within:outline focus-within:outline-2 focus-within:outline-border focus-within:outline-offset-2">
            <header className="flex items-center gap-3 pb-4 border-b border-background/10">
              <div className="size-10 rounded-xl bg-card flex items-center justify-center border border-border">
                <MessageSquareText
                  className="size-5 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
              <Typography.Heading3>Prompted ChatGPT</Typography.Heading3>
            </header>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <Typography.SubCaptionMedium color="secondary">
                  &gt; User:
                </Typography.SubCaptionMedium>
                <Typography.Body color="secondary" className="mt-1">
                  Act as a tough Tech Lead and ask me a system design question.
                </Typography.Body>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <Typography.SubCaptionMedium color="secondary">
                  &gt; AI:
                </Typography.SubCaptionMedium>
                <Typography.Body color="secondary" className="mt-1">
                  How would you design a scalable e-commerce backend? Explain
                  sharding and load balancing.
                </Typography.Body>
              </div>

              <div className="pt-4 border-t border-background/10 space-y-3">
                <div className="flex items-start gap-3">
                  <X
                    className="size-5 text-red-400 mt-0.5"
                    aria-hidden="true"
                  />
                  <Typography.Body color="secondary">
                    Relies on generic "Hello World" templates.
                  </Typography.Body>
                </div>
                <div className="flex items-start gap-3">
                  <X
                    className="size-5 text-red-400 mt-0.5"
                    aria-hidden="true"
                  />
                  <Typography.Body color="secondary">
                    Accepts buzzwords without testing implementation limits.
                  </Typography.Body>
                </div>
                <div className="flex items-start gap-3">
                  <X
                    className="size-5 text-red-400 mt-0.5"
                    aria-hidden="true"
                  />
                  <Typography.Body color="secondary">
                    Lacks real-world failure scenarios.
                  </Typography.Body>
                </div>
              </div>
            </div>
          </article>

          <article className="h-full rounded-2xl border-2 border-primary bg-background/80 backdrop-blur p-6 sm:p-8 shadow-[0_18px_60px_-34px_hsl(var(--always-black)_/_0.45)] relative transition-all hover:shadow-[0_28px_70px_-36px_hsl(var(--always-black)_/_0.5)] hover:-translate-y-1 focus-within:outline focus-within:outline-2 focus-within:outline-border focus-within:outline-offset-2">
            <div className="absolute -top-3 right-4 rounded-full border border-border bg-background px-4 py-1">
              <Typography.SubCaptionBold>
                Blairify Environment
              </Typography.SubCaptionBold>
            </div>

            <header className="flex items-center gap-3 pb-4 border-b border-background/10">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="size-5 text-primary" aria-hidden="true" />
              </div>
              <Typography.Heading3>Active Assessment</Typography.Heading3>
            </header>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl border-l-4 border-primary border border-border bg-background p-4">
                <Typography.SubCaptionBold color="brand">
                  &gt; Blairify AI:
                </Typography.SubCaptionBold>
                <Typography.Body color="secondary" className="mt-1">
                  You proposed Redis for caching. Let's drill down. A network
                  partition isolates your primary node during a traffic spike.
                  How do you prevent split-brain?
                </Typography.Body>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <Typography.SubCaptionBold>
                  &gt; Feedback:
                </Typography.SubCaptionBold>
                <Typography.Body color="secondary" className="mt-1">
                  Asynchronous replication risks data loss here. In this FinTech
                  scenario, quorum-based approach is required. Let's debug your
                  failover logic.
                </Typography.Body>
              </div>

              <div className="pt-4 border-t border-background/10 space-y-3">
                <div className="flex items-start gap-3">
                  <Check
                    className="size-5 text-primary mt-0.5"
                    aria-hidden="true"
                  />
                  <Typography.Body>
                    - Injects battle-tested constraints from real interviews.
                  </Typography.Body>
                </div>
                <div className="flex items-start gap-3">
                  <Check
                    className="size-5 text-primary mt-0.5"
                    aria-hidden="true"
                  />
                  <Typography.Body>
                    - Forces you to defend logic against specific edge cases.
                  </Typography.Body>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
