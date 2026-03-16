import { Check } from "lucide-react";
import Image from "next/image";
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

          <div className="relative mx-auto lg:mx-0">
            {/* iPhone container */}
            <div className="relative">
              <Image
                src="/devices/iphonedemo.svg"
                alt="iPhone showing app demo"
                width={500}
                height={500}
                className="relative z-10"
              />
              {/* Video overlay positioned inside phone frame */}
              <div className="absolute top-[15px] left-[15px] w-[220px] h-[480px] z-0">
                <video
                  src="/devices/video.mov"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover rounded-[24px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
