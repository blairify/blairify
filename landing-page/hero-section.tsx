"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MainLogo = dynamic(() => import("../common/atoms/main-logo"), {
  ssr: false,
});

export default function HeroSection() {
  return (
    <header className="bg-[color:var(--background)] text-[color:var(--foreground)] relative overflow-visible">
      <div className="container mx-auto px-6 py-8 sm:py-12 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Logo */}
          <div className="flex justify-center lg:justify-end items-center order-1 lg:order-2">
            <div className="relative w-full max-w-[300px] sm:max-w-[350px] lg:max-w-[500px] aspect-[1/1]">
              <div className="absolute inset-0 w-full h-full">
                <MainLogo />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left order-2 lg:order-1">
            <p className="inline-flex items-center gap-3 bg-[color:var(--accent)]/20 text-[color:var(--accent-foreground)] px-3 py-1 rounded-full text-sm w-max mx-auto lg:mx-0">
              <span className="font-medium">AI-powered</span>
              <span className="text-xs opacity-80">Interview Prep</span>
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Ace Every Interview{" "}
              <span className="text-[color:var(--primary)]">with AI</span>
            </h1>

            <p className="text-lg text-[color:var(--muted-foreground)] max-w-2xl mx-auto lg:mx-0">
              Practice with AI-generated questions, get instant feedback, and
              track your progress on a career-focused platform.
            </p>

            <div className="flex flex-wrap gap-4 mt-2 justify-center lg:justify-start">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 bg-[color:var(--primary)] text-[color:var(--primary-foreground)] px-5 py-3 rounded-lg font-medium hover:opacity-90 transition"
              >
                Start Practicing Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 border border-[color:var(--border)] text-[color:var(--foreground)] px-5 py-3 rounded-lg font-medium hover:bg-[color:var(--muted)] transition"
              >
                Browse Practice Sets
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
