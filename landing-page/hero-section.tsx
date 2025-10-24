"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

const MainLogo = dynamic(() => import("../common/atoms/main-logo"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-transparent flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  ),
});

export default function HeroSection() {
  const router = useRouter();
  return (
    <header className="bg-[color:var(--background)] text-[color:var(--foreground)] relative overflow-visible">
      {/* 
        RESPONSIVE CONTAINER STRATEGY:
        - Container provides consistent max-width across breakpoints
        - Responsive padding: px-4 (mobile) → px-6 (tablet) → px-8 (desktop)
        - Vertical padding scales with screen size: py-8 → py-12 → py-16
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
        {/* 
          RESPONSIVE GRID LAYOUT:
          - Mobile: Single column stack (grid-cols-1)
          - Desktop: Two columns (lg:grid-cols-2)
          - Gap scales: gap-8 (mobile) → gap-12 (tablet) → gap-16 (desktop)
          - Items center-aligned for balanced layout
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* 
            LOGO SECTION - RESPONSIVE POSITIONING:
            - Mobile: Centered, appears first (order-1)
            - Desktop: Right-aligned, appears second (lg:order-2)
            - Size adapts: max-w-[250px] (mobile) → max-w-[400px] (desktop)
          */}
          <div className="flex justify-center lg:justify-end items-center order-1 lg:order-2 animate-in slide-in-from-right-8 duration-1000 delay-400">
            <div className="relative w-full pt-14 max-w-[250px] sm:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px] aspect-[1/1]">
              <MainLogo />
            </div>
          </div>

          {/* 
            CONTENT SECTION - RESPONSIVE TYPOGRAPHY & LAYOUT:
            - Mobile: Centered text, appears second (order-2)
            - Desktop: Left-aligned, appears first (lg:order-1)
            - Responsive spacing with space-y utilities
          */}
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1 animate-in slide-in-from-left-8 duration-1000 delay-200">
            {/* 
              BADGE - RESPONSIVE SIZING:
              - Self-centering on mobile (mx-auto)
              - Left-aligned on desktop (lg:mx-0)
              - Responsive text and padding
            */}
            <p className="inline-flex items-center gap-2 sm:gap-3 bg-[color:var(--accent)]/20 text-[color:var(--accent-foreground)] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm w-max mx-auto lg:mx-0">
              <span className="font-medium">AI-powered</span>
              <span className="text-xs opacity-80">Interview Prep</span>
            </p>

            {/* 
              MAIN HEADING - RESPONSIVE TYPOGRAPHY:
              - Mobile: text-3xl (48px)
              - Small screens: text-4xl (56px) 
              - Medium screens: text-5xl (72px)
              - Large screens: text-6xl (96px)
              - Maintains tight leading for readability
            */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              Ace Every Interview{" "}
              <span className="text-[color:var(--primary)]">with AI</span>
            </h1>

            {/* 
              DESCRIPTION - RESPONSIVE TEXT:
              - Base: text-base (16px)
              - Large screens: text-lg (18px)
              - Max-width constrains line length for readability
              - Centers on mobile, left-aligns on desktop
            */}
            <p className="text-base sm:text-lg text-[color:var(--muted-foreground)] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Practice with AI-generated questions, get instant feedback, and
              track your progress on a career-focused platform.
            </p>

            {/* 
              BUTTON GROUP - RESPONSIVE LAYOUT:
              - Mobile: Stacked buttons with flex-col
              - Small screens: Side-by-side with flex-row
              - Responsive gap and justification
              - Touch-friendly sizing on mobile
            */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 justify-center lg:justify-start">
              <Button
                className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                onClick={() => {
                  router.push("/auth");
                }}
              >
                Start Practicing Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                onClick={() => {
                  router.push("/practice");
                }}
              >
                Browse Practice Sets
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
