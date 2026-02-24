import { Bot, HeartPulse, TreeDeciduous } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

export default function ProblemSection() {
  return (
    <section
      id="problem"
      className="bg-background border-b border-border/40 py-16 sm:py-20 scroll-mt-24"
      aria-labelledby="problem-heading"
      data-analytics-id="home-problem"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <Typography.Heading2 id="problem-heading" className="mb-4">
            Why do you fail the technical stage?
          </Typography.Heading2>
          <Typography.Body color="secondary">
            Most candidates don't fail because of a lack of knowledge. They fail
            due to stress and lack of confidence.
          </Typography.Body>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="size-12 sm:size-14 rounded-2xl border border-border bg-background flex items-center justify-center">
              <HeartPulse
                className="size-6 sm:size-7 text-red-600"
                aria-hidden="true"
              />
            </div>
            <Typography.Heading3 className="mt-6 mb-2">
              Stress
            </Typography.Heading3>
            <Typography.Body color="secondary">
              Without preparation, your brain treats an interview like a threat.
              You go into fight-or-flight, your heart rate spikes, and your
              thinking gets foggy.
            </Typography.Body>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="size-12 sm:size-14 rounded-2xl border border-border bg-background flex items-center justify-center">
              <Bot
                className="size-6 sm:size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <Typography.Heading3 className="mt-6 mb-2">
              The ChatGPT Illusion
            </Typography.Heading3>
            <Typography.Body color="secondary">
              Even the perfect prompt can't bypass static training data.
              Standard AI simply doesn't know what top-tier companies are asking
              today. It roles textbook theory, not current market constraints.
            </Typography.Body>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="size-12 sm:size-14 rounded-2xl border border-border bg-background flex items-center justify-center">
              <TreeDeciduous
                className="size-6 sm:size-7 text-primary"
                aria-hidden="true"
              />
            </div>
            <Typography.Heading3 className="mt-6 mb-2">
              Lack of Structure
            </Typography.Heading3>
            <Typography.Body color="secondary">
              Candidates jump into solutions without framing the problem,
              clarifying requirements, or outlining their approach.
            </Typography.Body>
          </article>
        </div>
      </div>
    </section>
  );
}
