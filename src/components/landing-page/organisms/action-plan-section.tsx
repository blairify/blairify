import { BookOpen, CheckCircle2, FileText } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";

export default function ActionPlanSection() {
  return (
    <section
      id="action-plan"
      className="bg-card border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="action-plan-heading"
      data-analytics-id="home-action-plan"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_20%,rgba(34,197,94,0.06),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <Typography.Heading2 id="action-plan-heading" className="mt-5 mb-4">
              Fix gaps with a targeted study plan.
            </Typography.Heading2>
            <Typography.Body color="secondary" className="mb-6">
              Your report should tell you what to learn next. Blairify flags the
              specific topics you missed and links you to high-signal material.
            </Typography.Body>

            <ul className="space-y-3" aria-label="Action plan highlights">
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="size-5 text-primary mt-0.5"
                  aria-hidden="true"
                />
                <Typography.BodyMedium>
                  Concrete topics, not generic "study more" advice.
                </Typography.BodyMedium>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="size-5 text-primary mt-0.5"
                  aria-hidden="true"
                />
                <Typography.BodyMedium>
                  Links to docs, articles, and books you can trust.
                </Typography.BodyMedium>
              </li>
            </ul>
          </div>

          <aside className="rounded-2xl border border-border bg-background/80 backdrop-blur p-6 sm:p-8 shadow-sm relative transition-all hover:shadow-md">
            <Typography.Heading3 className="mb-4">
              Your weakest areas
            </Typography.Heading3>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-4 shadow-sm transition-all hover:shadow-md">
                <Typography.BodyBold>
                  Distributed Transactions (SAGA Pattern)
                </Typography.BodyBold>
                <div className="mt-3 rounded-xl border border-border bg-background p-3">
                  <Link
                    href="#pricing"
                    className="flex items-center justify-between gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-border focus-visible:outline-offset-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <Typography.BodyMedium color="brand">
                        Read: Microservices Patterns (Ch. 4)
                      </Typography.BodyMedium>
                    </div>
                    <Typography.CaptionMedium color="secondary">
                      ↗
                    </Typography.CaptionMedium>
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/80 backdrop-blur p-4 shadow-sm transition-all hover:shadow-md">
                <Typography.BodyBold>
                  React Component Re-renders
                </Typography.BodyBold>
                <div className="mt-3 rounded-xl border border-border bg-background p-3">
                  <Link
                    href="#pricing"
                    className="flex items-center justify-between gap-3 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-border focus-visible:outline-offset-2 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <FileText
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <Typography.BodyMedium color="brand">
                        React Dev Docs: useMemo optimization
                      </Typography.BodyMedium>
                    </div>
                    <Typography.CaptionMedium color="secondary">
                      ↗
                    </Typography.CaptionMedium>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
