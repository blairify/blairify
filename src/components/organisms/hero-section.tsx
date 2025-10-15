"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

// dynamic import so SSR doesn't try to render the canvas
const MainLogo = dynamic(() => import("../molecules/MainLogo"), { ssr: false });

export default function HeroSection() {
  return (
    <header
      className="bg-[color:var(--background)] text-[color:var(--foreground)] relative overflow-visible"
      aria-label="Hero"
    >
      <div className="container mx-auto px-6 py-20 sm:py-28 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Left side — copy */}
          <div className="flex flex-col justify-center space-y-6 z-10">
            <p className="inline-flex items-center gap-3 bg-[color:var(--accent)]/20 text-[color:var(--accent-foreground)] px-3 py-1 rounded-full text-sm w-max">
              <span className="font-medium">AI-powered</span>
              <span className="text-xs opacity-80">Interview Prep</span>
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Ace Every Interview <span className="text-[color:var(--primary)]">with AI</span>
            </h1>

            <p className="text-lg text-[color:var(--muted-foreground)] max-w-2xl">
              Practice with AI-generated questions, get instant feedback, and track your progress on a career-focused platform.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
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

          {/* Right side — 3D logo container */}
          <div className="relative w-full h-full overflow-visible" aria-hidden>
            {/* Canvas fills the column */}
            <div className="absolute inset-0">
              <MainLogo />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
