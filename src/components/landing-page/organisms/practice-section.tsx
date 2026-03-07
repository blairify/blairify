import { Check } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

export default function PracticeSection() {
  return (
    <section
      className="bg-card border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="practice-heading"
      data-analytics-id="home-practice"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(249,115,22,0.07),transparent_55%)]"
        aria-hidden="true"
      />
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

          <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <header className="text-center mb-6">
              <Typography.Heading3>
                Example simulation report
              </Typography.Heading3>
              <Typography.SubCaptionMedium color="secondary" className="mt-1">
                The kind of feedback you get after a run
              </Typography.SubCaptionMedium>
            </header>

            <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Typography.BodyBold>
                    System design: Redis cache
                  </Typography.BodyBold>
                  <Typography.SubCaptionMedium
                    color="secondary"
                    className="mt-1"
                  >
                    35 minutes · Mid-level
                  </Typography.SubCaptionMedium>
                </div>
                <div className="rounded-xl border border-border bg-primary/10 px-3 py-1">
                  <Typography.CaptionBold color="brand">
                    Score: 6.8/10
                  </Typography.CaptionBold>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-4">
                  <Typography.BodyBold className="mb-3">
                    Breakdown
                  </Typography.BodyBold>
                  <table
                    className="w-full border-separate border-spacing-y-2"
                    aria-label="Score breakdown"
                  >
                    <thead className="sr-only">
                      <tr>
                        <th scope="col">Category</th>
                        <th scope="col">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row" className="text-left">
                          <Typography.SubCaptionMedium color="secondary">
                            Requirements clarity
                          </Typography.SubCaptionMedium>
                        </th>
                        <td className="text-right">
                          <Typography.SubCaptionBold>
                            7/10
                          </Typography.SubCaptionBold>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-left">
                          <Typography.SubCaptionMedium color="secondary">
                            Trade-offs
                          </Typography.SubCaptionMedium>
                        </th>
                        <td className="text-right">
                          <Typography.SubCaptionBold>
                            6/10
                          </Typography.SubCaptionBold>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-left">
                          <Typography.SubCaptionMedium color="secondary">
                            Failure modes
                          </Typography.SubCaptionMedium>
                        </th>
                        <td className="text-right">
                          <Typography.SubCaptionBold>
                            5/10
                          </Typography.SubCaptionBold>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-left">
                          <Typography.SubCaptionMedium color="secondary">
                            Communication
                          </Typography.SubCaptionMedium>
                        </th>
                        <td className="text-right">
                          <Typography.SubCaptionBold>
                            8/10
                          </Typography.SubCaptionBold>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-4">
                  <Typography.BodyBold className="mb-3">
                    Weak areas detected
                  </Typography.BodyBold>
                  <ul className="space-y-2" aria-label="Weak areas">
                    <li className="flex items-start justify-between gap-4">
                      <Typography.SubCaptionMedium color="secondary">
                        Split-brain prevention
                      </Typography.SubCaptionMedium>
                      <Typography.SubCaptionBold>
                        Needs work
                      </Typography.SubCaptionBold>
                    </li>
                    <li className="flex items-start justify-between gap-4">
                      <Typography.SubCaptionMedium color="secondary">
                        Quorum / consistency model
                      </Typography.SubCaptionMedium>
                      <Typography.SubCaptionBold>
                        Needs work
                      </Typography.SubCaptionBold>
                    </li>
                    <li className="flex items-start justify-between gap-4">
                      <Typography.SubCaptionMedium color="secondary">
                        Cache invalidation strategy
                      </Typography.SubCaptionMedium>
                      <Typography.SubCaptionBold>
                        Review
                      </Typography.SubCaptionBold>
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-4">
                  <Typography.BodyBold className="mb-3">
                    Next drills
                  </Typography.BodyBold>
                  <ul className="space-y-2" aria-label="Recommended drills">
                    <li className="flex items-start gap-3">
                      <span
                        className="mt-1 size-2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <Typography.SubCaptionMedium color="secondary">
                        Failover runbook: step-by-step decision tree
                      </Typography.SubCaptionMedium>
                    </li>
                    <li className="flex items-start gap-3">
                      <span
                        className="mt-1 size-2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <Typography.SubCaptionMedium color="secondary">
                        Trade-offs: latency vs consistency (CAP)
                      </Typography.SubCaptionMedium>
                    </li>
                    <li className="flex items-start gap-3">
                      <span
                        className="mt-1 size-2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                      <Typography.SubCaptionMedium color="secondary">
                        Caching patterns: write-through vs write-back
                      </Typography.SubCaptionMedium>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
