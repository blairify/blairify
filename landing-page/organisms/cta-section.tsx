"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";

export default function CTASection() {
  return (
    <section className="bg-[color:var(--card)] text-[color:var(--foreground)] py-24 transition-colors duration-300 border-t border-[color:var(--border)]">
      <div className="container mx-auto px-6 text-center max-w-4xl space-y-8">
        <Typography.Heading2>
          Start Preparing with{" "}
          <span className="text-[color:var(--primary)]">Confidence</span>
        </Typography.Heading2>
        <p className="text-lg text-[color:var(--muted-foreground)] max-w-2xl mx-auto">
          Your AI interview coach is ready — get personalized feedback, targeted
          questions, and track your performance over time.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md"
        >
          Get Started Now <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
