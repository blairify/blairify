import { ChevronDown } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

type Faq = {
  question: string;
  answer: string;
};

const FAQS: readonly Faq[] = [
  {
    question: "How is Blairify different from LeetCode or HackerRank?",
    answer:
      "LeetCode tests memorized algorithms. We test real engineering. We simulate trade-offs and debugging scenarios that actually determine seniority and salary.",
  },
  {
    question: "Can AI actually evaluate complex system design?",
    answer:
      "Generic bots only look for buzzwords. Blairify actively injects failures and limits into the simulation to see if architecture collapses under pressure.",
  },
  {
    question: "Am I just writing code from scratch?",
    answer:
      "No. Memorization is dead. We simulate AI-augmented engineering: analyzing code, debugging logic errors, and defending architectural reasoning.",
  },
  {
    question: "Is my Job Description and code kept private?",
    answer:
      "Yes. Inputs are strictly isolated for your simulation session. We do not use your intellectual property to train generic public models.",
  },
  {
    question: "My interview is tomorrow. Is it too late?",
    answer:
      "Absolutely not. A single 30-minute simulation will expose immediate blind spots. It's the most efficient way to eradicate pre-interview panic.",
  },
] as const;

export default function FaqSection() {
  return (
    <section
      id="faq"
      className="bg-card border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="faq-heading"
      data-analytics-id="home-faq"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(249,115,22,0.06),transparent_55%)]"
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <header className="text-center mb-10 sm:mb-12">
          <Typography.Heading2 id="faq-heading">
            Frequently Asked Questions
          </Typography.Heading2>
        </header>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-border bg-background shadow-sm transition-colors open:bg-background/80 open:backdrop-blur"
            >
              <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden flex items-center justify-between gap-4 p-6 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-border focus-visible:outline-offset-2 rounded-2xl">
                <Typography.BodyBold>{faq.question}</Typography.BodyBold>
                <ChevronDown
                  className="size-5 text-primary transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="px-6 pb-6 border-t border-border/40">
                <Typography.Body color="secondary">
                  {faq.answer}
                </Typography.Body>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
