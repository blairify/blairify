import { Check, X } from "lucide-react";
import { PiOpenAiLogoThin } from "react-icons/pi";
import Logo from "@/components/common/atoms/logo-blairify";
import { Typography } from "@/components/common/atoms/typography";

export default function ComparisonSection() {
  return (
    <section
      id="comparison"
      className="bg-card border-b border-border/50 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="comparison-heading"
      data-analytics-id="home-comparison"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_70%)]"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-5 mb-10 sm:mb-12 text-4xl font-bold sm:gap-10">
            <PiOpenAiLogoThin className="size-30 flex-shrink-0 text-gray-500 sm:size-25" />
            <span className="text-muted-foreground">VS</span>
            <div className="flex-shrink-0 hidden sm:block">
              <Logo variant="transparent" iconSize={100} />
            </div>
            <div className="flex-shrink-0 block sm:hidden">
              <Logo variant="transparent" iconSize={120} />
            </div>
          </div>
          <Typography.HeroSubHeading id="comparison-heading" className="mb-4">
            Prompting isn&apos;t assessment.
          </Typography.HeroSubHeading>
          <Typography.Body color="secondary">
            Chat can roleplay an interview. It can&apos;t reliably pressure-test
            your reasoning with real constraints, edge cases, and follow-ups the
            way a human interviewer does.
          </Typography.Body>
        </header>

        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse"
            aria-label="Comparison: prompted chat versus Active Assessment"
          >
            <thead>
              <tr className="border-b border-border/50">
                <th scope="col" className="text-left p-4 sm:p-6">
                  <Typography.BodyBold>Feature</Typography.BodyBold>
                </th>
                <th scope="col" className="text-center p-4 sm:p-6">
                  <div className="flex items-center justify-center gap-2">
                    <Typography.BodyBold color="secondary">
                      Prompted ChatGPT
                    </Typography.BodyBold>
                  </div>
                </th>
                <th scope="col" className="text-center p-4 sm:p-6">
                  <div className="flex items-center justify-center gap-2">
                    <Typography.BodyBold>Active Assessment</Typography.BodyBold>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/30 hover:bg-background/50 transition-colors">
                <th scope="row" className="p-4 sm:p-6 text-left font-normal">
                  <Typography.Body color="secondary">
                    Uses real interview questions
                  </Typography.Body>
                </th>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-red-300/10 flex items-center justify-center mt-0.5">
                    <X className="size-7 text-red-600" aria-hidden="true" />
                  </div>
                </td>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-green-300/10 flex items-center justify-center mt-0.5">
                    <Check
                      className="size-7 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-background/50 transition-colors">
                <th scope="row" className="p-4 sm:p-6 text-left font-normal">
                  <Typography.Body color="secondary">
                    Avoids generic "Hello World" templates
                  </Typography.Body>
                </th>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-red-300/10 flex items-center justify-center mt-0.5">
                    <X className="size-7 text-red-600" aria-hidden="true" />
                  </div>
                </td>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-green-300/10 flex items-center justify-center mt-0.5">
                    <Check
                      className="size-7 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-background/50 transition-colors">
                <th scope="row" className="p-4 sm:p-6 text-left font-normal">
                  <Typography.Body color="secondary">
                    Tests implementation limits
                  </Typography.Body>
                </th>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-red-300/10 flex items-center justify-center mt-0.5">
                    <X className="size-7 text-red-600" aria-hidden="true" />
                  </div>
                </td>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-green-300/10 flex items-center justify-center mt-0.5">
                    <Check
                      className="size-7 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-background/50 transition-colors">
                <th scope="row" className="p-4 sm:p-6 text-left font-normal">
                  <Typography.Body color="secondary">
                    Includes real-world failure scenarios
                  </Typography.Body>
                </th>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-red-300/10 flex items-center justify-center mt-0.5">
                    <X className="size-7 text-red-600" aria-hidden="true" />
                  </div>
                </td>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-green-300/10 flex items-center justify-center mt-0.5">
                    <Check
                      className="size-7 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border/30 hover:bg-background/50 transition-colors">
                <th scope="row" className="p-4 sm:p-6 text-left font-normal">
                  <Typography.Body color="secondary">
                    Provides real-time feedback
                  </Typography.Body>
                </th>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-red-300/10 flex items-center justify-center mt-0.5">
                    <X className="size-7 text-red-600" aria-hidden="true" />
                  </div>
                </td>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-green-300/10 flex items-center justify-center mt-0.5">
                    <Check
                      className="size-7 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-background/50 transition-colors">
                <th scope="row" className="p-4 sm:p-6 text-left font-normal">
                  <Typography.Body color="secondary">
                    Stress-tests reasoning against edge cases
                  </Typography.Body>
                </th>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-red-300/10 flex items-center justify-center mt-0.5">
                    <X className="size-7 text-red-600" aria-hidden="true" />
                  </div>
                </td>
                <td className="p-4 sm:p-6 text-center">
                  <div className="size-10 px-2 mx-auto rounded-full bg-green-300/10 flex items-center justify-center mt-0.5">
                    <Check
                      className="size-7 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
