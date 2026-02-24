import { Check } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="bg-[hsl(var(--bg-200))] border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="pricing-heading"
      data-analytics-id="home-pricing"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -bottom-48 left-[-10rem] size-[34rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="text-center mb-12 sm:mb-16">
          <Typography.Heading2 id="pricing-heading" className="mb-3">
            Invest in your leverage
          </Typography.Heading2>
          <Typography.Body color="secondary">
            Skip one Uber Eats order - invest in your dream job instead.
          </Typography.Body>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 max-w-5xl mx-auto items-stretch">
          <article className="h-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm flex flex-col transition-all hover:shadow-md hover:-translate-y-0.5 focus-within:outline focus-within:outline-2 focus-within:outline-border focus-within:outline-offset-2">
            <header className="text-center">
              <Typography.Heading3>Basic</Typography.Heading3>
              <Typography.SubCaptionMedium color="secondary" className="mt-2">
                Validate mechanics.
              </Typography.SubCaptionMedium>

              <div className="mt-6 border-b border-border/60 pb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <Typography.Heading2>$0</Typography.Heading2>
                  <Typography.Body color="secondary">
                    / month - forever free
                  </Typography.Body>
                </div>
              </div>
            </header>

            <ul className="mt-6 space-y-3" aria-label="Basic plan features">
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.Body>2 interviews per day</Typography.Body>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.Body>Manual Role Configuration</Typography.Body>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.Body>Standard AI Feedback</Typography.Body>
              </li>
            </ul>

            <div className="mt-8">
              <Button asChild className="w-full h-12" variant="default">
                <Link href="/configure">Start for Free</Link>
              </Button>
            </div>
          </article>

          <article className="h-full rounded-2xl border-2 border-primary bg-card p-6 sm:p-8 shadow-[0_18px_60px_-34px_hsl(var(--always-black)_/_0.45)] flex flex-col relative transition-all hover:shadow-[0_28px_70px_-36px_hsl(var(--always-black)_/_0.5)] hover:-translate-y-1 focus-within:outline focus-within:outline-2 focus-within:outline-border focus-within:outline-offset-2 lg:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-5 py-1.5 text-primary-foreground">
              <Typography.SubCaptionBold>
                Most Popular
              </Typography.SubCaptionBold>
            </div>

            <header className="text-center">
              <Typography.Heading3>PRO</Typography.Heading3>
              <Typography.SubCaptionMedium color="secondary" className="mt-2">
                The full verification environment.
              </Typography.SubCaptionMedium>

              <div className="mt-6 border-b border-border/60 pb-6">
                <div className="flex items-baseline justify-center gap-2">
                  <Typography.Heading2>$19</Typography.Heading2>
                  <Typography.Body color="secondary">/ month</Typography.Body>
                </div>
              </div>
            </header>

            <Typography.BodyBold className="mt-6 mb-4">
              Everything in Basic, plus:
            </Typography.BodyBold>

            <ul className="space-y-3" aria-label="Pro plan features">
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.BodyBold>
                  Unlimited Interview Sessions
                </Typography.BodyBold>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.BodyBold>
                  Targeted Simulations based on Job Description
                </Typography.BodyBold>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.Body color="secondary">
                  Full Analysis and Report
                </Typography.Body>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.Body color="secondary">
                  Knowledge Gap Diagnostics
                </Typography.Body>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.Body color="secondary">
                  Curated Resources Links
                </Typography.Body>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.Body color="secondary">
                  Premium AI Reasoning Engine
                </Typography.Body>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 text-primary" aria-hidden="true" />
                <Typography.Body color="secondary">
                  Centralized Preparation Hub
                </Typography.Body>
              </li>
            </ul>

            <div className="mt-8">
              <Button asChild className="w-full h-12">
                <Link href="/auth?mode=register">Start PRO Plan</Link>
              </Button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
