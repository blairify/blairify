"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
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
  const [openItem, setOpenItem] = useState<string | null>(null);

  const toggleItem = (question: string) => {
    setOpenItem(openItem === question ? null : question);
  };

  return (
    <section
      id="faq"
      className="py-16 sm:py-24 scroll-mt-24"
      aria-labelledby="faq-heading"
      data-analytics-id="home-faq"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <header className="text-center mb-16">
          <Typography.HeroSubHeading id="faq-heading">
            Frequently Asked Questions
          </Typography.HeroSubHeading>
        </header>

        <div className="space-y-6">
          {FAQS.map((faq) => (
            <div
              key={faq.question}
              className="border border-border/60 rounded-lg bg-background/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-background"
            >
              <button
                type="button"
                onClick={() => toggleItem(faq.question)}
                className="w-full flex items-center justify-between gap-4 p-6 outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg text-left"
                aria-expanded={openItem === faq.question}
                aria-controls={`faq-answer-${faq.question.replace(/\s+/g, "-").toLowerCase()}`}
              >
                <Typography.BodyBold className="text-left flex-1">
                  {faq.question}
                </Typography.BodyBold>
                <ChevronDown
                  className={`size-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                    openItem === faq.question ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              <div
                id={`faq-answer-${faq.question.replace(/\s+/g, "-").toLowerCase()}`}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: openItem === faq.question ? "500px" : "0px",
                }}
              >
                <div className="px-6 pb-6">
                  <Typography.Body
                    color="secondary"
                    className="leading-relaxed"
                  >
                    {faq.answer}
                  </Typography.Body>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
