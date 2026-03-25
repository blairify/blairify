"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";

export default function CTASection() {
  return (
    <section className="bg-background border-b border-border/40 py-24 scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl space-y-8">
        <Typography.Heading2>
          Start Preparing with Confidence
        </Typography.Heading2>
        <Typography.Body color="secondary" className="max-w-2xl mx-auto">
          Your AI interview coach is ready — get personalized feedback, targeted
          questions, and track your performance over time.
        </Typography.Body>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md"
        >
          Get Started Now <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
