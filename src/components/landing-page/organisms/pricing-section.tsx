import { Check } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="bg-background border-b border-border/40 py-16 sm:py-20 scroll-4 relative overflow-hidden"
      aria-labelledby="pricing-heading"
      data-analytics-id="home-pricing"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(99,102,241,0.05),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="text-center mb-12 sm:mb-16">
          <Typography.HeroSubHeading id="pricing-heading" className="mb-3">
            Invest in your leverage
          </Typography.HeroSubHeading>
          <Typography.Body color="secondary">
            Skip one Uber Eats order - invest in your dream job instead.
          </Typography.Body>
        </header>

        <div className="grid gap-16 lg:grid-cols-2 max-w-4xl mx-auto items-center">
          <Card className="w-full h-full py-10 gap-0 border border-border/50">
            <CardHeader className="px-8 gap-8">
              <CardTitle>
                <div className="flex flex-col gap-2">
                  <Typography.Heading1>BASIC</Typography.Heading1>
                  <Typography.SubCaptionMedium className="text-gray-700">
                    Validate mechanics
                  </Typography.SubCaptionMedium>
                </div>
                <div className="flex flex-col items-start gap-0 sm:gap-1 mt-6">
                  <Typography.BodyBold className="text-lg">
                    $0
                  </Typography.BodyBold>
                  <Typography.Body
                    color="secondary"
                    className="text-xs sm:text-sm"
                  >
                    Forever free
                  </Typography.Body>
                </div>
              </CardTitle>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full text-sm sm:text-base py-0 sm:py-3"
              >
                <Link href="/configure">Start for Free</Link>
              </Button>
              <Separator className="mb-6" />
            </CardHeader>

            <CardContent className="px-10">
              <Typography.BodyBold className="mb-3 sm:mb-4 text-[14px] text-gray-700">
                Core features:
              </Typography.BodyBold>
              <ul
                className="space-y-2 sm:space-y-3"
                aria-label="Basic plan features"
              >
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-gray-500 mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    2 interviews per day
                  </Typography.Caption>
                </li>
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-gray-500 mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Manual role configuration
                  </Typography.Caption>
                </li>
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-gray-500 mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Standard AI feedback
                  </Typography.Caption>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="w-full py-10  gap-0 h-full border border-border/50 ">
            <CardHeader className="px-8 gap-8">
              <CardTitle>
                <div className="flex flex-col gap-2">
                  <Typography.Heading1>PRO</Typography.Heading1>
                  <Typography.SubCaptionMedium className="text-gray-700">
                    The full verification environment
                  </Typography.SubCaptionMedium>
                </div>
                <div className="flex flex-col items-start gap-0 sm:gap-1 mt-6">
                  <Typography.BodyBold className="text-lg">
                    $19
                  </Typography.BodyBold>
                  <Typography.Body
                    color="secondary"
                    className="text-xs sm:text-sm"
                  >
                    Billed monthly
                  </Typography.Body>
                </div>
              </CardTitle>

              <Button
                asChild
                size="lg"
                className="w-full text-sm sm:text-base py-0 sm:py-3"
              >
                <Link href="/auth?mode=register">Start PRO Plan</Link>
              </Button>
              <Separator className="mb-6" />
            </CardHeader>

            <CardContent className="px-10">
              <Typography.BodyBold className="mb-3 sm:mb-4 text-[14px] text-gray-700">
                Everything in Basic, plus:
              </Typography.BodyBold>

              <ul
                className="space-y-2 sm:space-y-3"
                aria-label="Pro plan features"
              >
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Unlimited interview sessions
                  </Typography.Caption>
                </li>
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Simulations based on job description
                  </Typography.Caption>
                </li>
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Full analysis and report
                  </Typography.Caption>
                </li>
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Knowledge gap diagnostics
                  </Typography.Caption>
                </li>
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Curated resources links
                  </Typography.Caption>
                </li>
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Premium AI reasoning engine
                  </Typography.Caption>
                </li>
                <li className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <Check
                    className="size-4 sm:size-5 text-primary mt-0.5 sm:mt-0 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <Typography.Caption className="text-sm">
                    Centralized preparation hub
                  </Typography.Caption>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
