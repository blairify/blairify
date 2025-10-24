"use client";

import { ArrowRight, Gift, Share2, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
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
  const { user, loading } = useAuth();
  return (
    <section
      className="bg-[color:var(--background)] text-[color:var(--foreground)] relative overflow-visible"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="flex justify-center lg:justify-end items-center order-1 lg:order-2 animate-in slide-in-from-right-8 duration-1000 delay-400">
            <div
              className="relative w-full pt-14 max-w-[250px] sm:max-w-[300px] lg:max-w-[400px] xl:max-w-[500px] aspect-[1/1]"
              role="img"
              aria-label="Blairify logo - AI-powered interview preparation platform"
            >
              <MainLogo />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1 animate-in slide-in-from-left-8 duration-1000 delay-200">
            <p className="inline-flex items-center gap-2 sm:gap-3 bg-[color:var(--accent)]/20 text-[color:var(--accent-foreground)] px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm w-max mx-auto lg:mx-0">
              <span className="font-medium">AI-powered</span>
              <span className="text-xs opacity-80">Interview Prep</span>
            </p>
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight"
            >
              Ace Every Interview{" "}
              <span className="text-[color:var(--primary)]">with AI</span>
            </h1>

            <p className="text-base sm:text-lg text-[color:var(--muted-foreground)] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              This is a new standard in job search. Curated jobs meet AI-powered
              interview prep. Browse opportunities, practice 1000+ questions,
              and land your dream role faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 justify-center lg:justify-start">
              {!loading && user ? (
                <>
                  <Button
                    className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    onClick={() => {
                      router.push("/dashboard");
                    }}
                    aria-label="View your progress dashboard"
                  >
                    See your progress{" "}
                    <TrendingUp className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    onClick={() => {
                      // TODO: Implement share functionality
                      navigator
                        .share?.({
                          title: "Blairify - AI Interview Prep",
                          text: "Check out this amazing AI-powered interview preparation platform!",
                          url: window.location.origin,
                        })
                        .catch(() => {
                          // Fallback: copy to clipboard
                          navigator.clipboard.writeText(window.location.origin);
                        });
                    }}
                    aria-label="Share Blairify with friends"
                  >
                    Share with friends
                    <Share2 className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    onClick={() => {
                      router.push("/auth");
                    }}
                    aria-label="Start practicing for free - Sign up now"
                  >
                    Start Practicing Free{" "}
                    <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                    onClick={() => {
                      router.push("/practice");
                    }}
                    aria-label="Special gift for new members - Start practicing"
                  >
                    Gift for new joiners
                    <Gift className="w-4 h-4 ml-2" aria-hidden="true" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
