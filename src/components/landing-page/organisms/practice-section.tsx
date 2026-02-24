import { Check } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

export default function PracticeSection() {
  return (
    <section
      className="bg-background border-y border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="practice-heading"
      data-analytics-id="home-practice"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 right-[-8rem] size-[30rem] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 left-[-10rem] size-[34rem] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <Typography.Heading2 id="practice-heading" className="mb-4">
              Practice = Performance = Offer
            </Typography.Heading2>
            <Typography.Body color="secondary" className="mb-8">
              It's simple math. Consistent exposure to real interview conditions
              sharpens your thinking under scrutiny.
            </Typography.Body>

            <ul className="space-y-6" aria-label="Practice benefits">
              <li className="flex items-start gap-4">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <Typography.Heading3 className="mb-1">
                    A Clear Path
                  </Typography.Heading3>
                  <Typography.Body color="secondary">
                    A simple, repeatable plan that removes uncertainty and helps
                    you perform when it counts.
                  </Typography.Body>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <Typography.Heading3 className="mb-1">
                    Structured Thinking
                  </Typography.Heading3>
                  <Typography.Body color="secondary">
                    Learn to clarify assumptions, outline approaches, and
                    communicate with confidence.
                  </Typography.Body>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Check className="size-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <Typography.Heading3 className="mb-1">
                    Side Effects May Include Confidence
                  </Typography.Heading3>
                  <Typography.Body color="secondary">
                    You might stop panicking mid-sentence and start enjoying
                    hard questions. Weird, but we'll take it.
                  </Typography.Body>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <header className="text-center mb-6">
              <Typography.Heading3>
                Correlation: Stress vs Confidence
              </Typography.Heading3>
              <Typography.SubCaptionMedium color="secondary" className="mt-1">
                Based on telemetry from users' first 5 simulations
              </Typography.SubCaptionMedium>
            </header>

            <div
              className="relative rounded-2xl border border-border bg-background p-4 overflow-hidden"
              role="img"
              aria-label="Chart preview"
            >
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
              </div>

              <div className="grid grid-cols-6 gap-3 items-end relative">
                {[30, 45, 60, 75, 85, 92].map((value, index) => (
                  <div key={value} className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 rounded-xl border border-border bg-gradient-to-b from-primary/35 to-primary/10"
                      style={{ height: `${Math.max(24, value * 2)}px` }}
                      aria-hidden="true"
                    />
                    <Typography.SubCaptionMedium color="secondary">
                      {index === 0 ? "Start" : `S${index}`}
                    </Typography.SubCaptionMedium>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
