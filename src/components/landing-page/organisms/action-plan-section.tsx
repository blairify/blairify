import { BookOpen, CheckCircle2, FileText, Target } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";

export default function ActionPlanSection() {
  return (
    <section
      id="action-plan"
      className="bg-background border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="action-plan-heading"
      data-analytics-id="home-action-plan"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 right-[-10rem] size-[34rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
              <Target className="size-4 text-blue-600" aria-hidden="true" />
              <Typography.CaptionMedium>
                Actionable Roadmap
              </Typography.CaptionMedium>
            </div>

            <Typography.Heading2 id="action-plan-heading" className="mt-5 mb-4">
              Targeted Action Plan to fix your Knowledge Gaps.
            </Typography.Heading2>
            <Typography.Body color="secondary" className="mb-6">
              Knowing you failed a question isn't enough. Blairify diagnoses
              your weaknesses and generates a study plan mapped directly to
              verified sources.
            </Typography.Body>

            <ul className="space-y-3" aria-label="Action plan highlights">
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="size-5 text-primary mt-0.5"
                  aria-hidden="true"
                />
                <Typography.BodyMedium>
                  Hyper-specific topic identification.
                </Typography.BodyMedium>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="size-5 text-primary mt-0.5"
                  aria-hidden="true"
                />
                <Typography.BodyMedium>
                  Direct links to official docs and proven architectural books.
                </Typography.BodyMedium>
              </li>
            </ul>
          </div>

          <aside className="rounded-2xl border border-border bg-card/70 backdrop-blur p-6 sm:p-8 shadow-sm relative transition-all hover:shadow-md">
            <div className="absolute -top-3 -right-3 size-8 rounded-full bg-red-500 flex items-center justify-center text-white">
              <Typography.SubCaptionBold>3</Typography.SubCaptionBold>
            </div>

            <Typography.Heading3 className="mb-4">
              Identified Vulnerabilities
            </Typography.Heading3>

            <div className="space-y-4">
              <div className="rounded-2xl border border-red-200 bg-background p-4 shadow-sm transition-all hover:shadow-md">
                <Typography.BodyBold>
                  Distributed Transactions (SAGA Pattern)
                </Typography.BodyBold>
                <div className="mt-3 rounded-xl border border-border bg-card p-3">
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

              <div className="rounded-2xl border border-yellow-200 bg-background p-4 shadow-sm transition-all hover:shadow-md">
                <Typography.BodyBold>
                  React Component Re-renders
                </Typography.BodyBold>
                <div className="mt-3 rounded-xl border border-border bg-card p-3">
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
