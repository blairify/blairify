import { AiOutlineBug } from "react-icons/ai";
import { SiOpenai } from "react-icons/si";
import { VscSymbolStructure } from "react-icons/vsc";
import { Typography } from "@/components/common/atoms/typography";

export default function ProblemSection() {
  return (
    <section
      id="problem"
      className="bg-background border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="problem-heading"
      data-analytics-id="home-problem"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(168,85,247,0.06),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <header className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <Typography.HeroSubHeading id="problem-heading" className="mb-4">
            Why people fail the technical stage?
          </Typography.HeroSubHeading>
          <Typography.Body>
            Most candidates don't fail because of a lack of knowledge. They fail
            due to stress and lack of confidence.
          </Typography.Body>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-border/50 bg-background/80 backdrop-blur p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="size-12 sm:size-14 rounded-2xl  bg-background flex items-center justify-left">
              <AiOutlineBug
                className="size-10 text-muted-foreground"
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

          <article className="rounded-2xl border border-border/50 bg-background/80 backdrop-blur p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="size-14 sm:size-14 rounded-2xl bg-background flex items-center justify-left">
              <SiOpenai
                className="size-10 text-muted-foreground"
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

          <article className="rounded-2xl border border-border/50 bg-background/80 backdrop-blur p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md">
            <div className="size-12 sm:size-14 rounded-2xl  bg-background flex items-center justify-left">
              <VscSymbolStructure
                className="size-10 text-muted-foreground"
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
