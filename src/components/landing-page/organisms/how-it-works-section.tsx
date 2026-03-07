import { FileSearch, Radar, Terminal } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-background border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="how-it-works-heading"
      data-analytics-id="home-how-it-works"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(59,130,246,0.05),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
        <Typography.Heading2 id="how-it-works-heading" className="mb-3">
          Train for the exact role
        </Typography.Heading2>
        <Typography.Body
          color="secondary"
          className="max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          Stop practicing on generic lists. Configure your test environment in 3
          seconds.
        </Typography.Body>

        <div className="relative grid gap-6 md:grid-cols-3 text-left">
          <div
            className="hidden md:block pointer-events-none absolute top-12 left-[18%] right-[18%] h-px bg-border/50"
            aria-hidden="true"
          />

          <article className="rounded-2xl border border-border bg-background/70 backdrop-blur p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="size-14 rounded-2xl border border-border bg-background flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl"
                aria-hidden="true"
              />
              <FileSearch
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <Typography.Heading3 className="mt-6 mb-2">
              Provide Job Details
            </Typography.Heading3>
            <Typography.Body color="secondary">
              The system instantly maps the tech stack, role scope, and required
              capabilities.
            </Typography.Body>
          </article>

          <article className="rounded-2xl border border-border bg-background/70 backdrop-blur p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="size-14 rounded-2xl border border-border bg-background flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl"
                aria-hidden="true"
              />
              <Terminal
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <Typography.Heading3 className="mt-6 mb-2">
              Simulate &amp; Debug
            </Typography.Heading3>
            <Typography.Body color="secondary">
              Engage in a dynamic chat. Defend system choices, debug code, and
              manage AI pushback just like a real technical round.
            </Typography.Body>
          </article>

          <article className="rounded-2xl border border-border bg-background/70 backdrop-blur p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="size-14 rounded-2xl border border-border bg-background flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl"
                aria-hidden="true"
              />
              <Radar
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <Typography.Heading3 className="mt-6 mb-2">
              Instant Feedback
            </Typography.Heading3>
            <Typography.Body color="secondary">
              Receive brutally honest feedback on logical gaps and how to
              tangibly improve.
            </Typography.Body>
          </article>
        </div>
      </div>
    </section>
  );
}
