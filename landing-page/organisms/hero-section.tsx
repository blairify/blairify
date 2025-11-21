"use client";

import { ArrowRight, Gift, Share2, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "../../ui/button";
import RotatingText from "../../ui/rotating-text";

const MainLogo = dynamic(() => import("../../common/atoms/main-logo"), {
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-16 items-center">
          <div className="flex justify-center lg:justify-end items-center order-1 lg:order-2 animate-in slide-in-from-right-8 duration-1000 delay-400">
            <div
              className="relative w-full pt-8 sm:pt-12 lg:pt-14 max-w-[180px] sm:max-w-[250px] lg:max-w-[350px] xl:max-w-[450px] aspect-[1/1]"
              role="img"
              aria-label="Blairify logo - AI-powered interview preparation platform"
            >
              <MainLogo size="md" />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-3 sm:space-y-5 lg:space-y-6 text-center lg:text-left order-2 lg:order-1 animate-in slide-in-from-left-8 duration-1000 delay-200">
            <h1
              id="hero-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight"
            >
              <span className="block">Transforming talent</span>
              <span className="flex items-center flex-wrap justify-center lg:justify-start gap-2">
                <span>acquisition</span>
                <RotatingText
                  texts={["with AI", "with Us"]}
                  mainClassName="text-[color:var(--primary)] overflow-hidden inline-flex items-center"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={8000}
                />
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[color:var(--muted-foreground)] max-w-2xl mx-auto lg:mx-0 leading-relaxed px-2 sm:px-0">
              This is a new standard in job search. Curated jobs meet AI-powered
              interview prep. Browse opportunities, practice 1000+ questions,
              and land your dream role faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center lg:justify-start">
              {!loading && user ? (
                <>
                  <Button
                    className="w-full sm:w-auto text-xs sm:text-sm lg:text-base px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3"
                    onClick={() => {
                      router.push("/dashboard");
                    }}
                    aria-label="View your progress dashboard"
                  >
                    Go to dashboard{" "}
                    <TrendingUp
                      className="w-3 h-3 sm:w-4 sm:h-4 ml-2"
                      aria-hidden="true"
                    />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-xs sm:text-sm lg:text-base px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3"
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
                    <Share2
                      className="w-3 h-3 sm:w-4 sm:h-4 ml-2"
                      aria-hidden="true"
                    />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full sm:w-auto text-xs sm:text-sm lg:text-base px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3"
                    onClick={() => {
                      router.push("/auth");
                    }}
                    aria-label="Start practicing for free - Sign up now"
                  >
                    Start Practicing Free{" "}
                    <ArrowRight
                      className="w-3 h-3 sm:w-4 sm:h-4 ml-2"
                      aria-hidden="true"
                    />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-xs sm:text-sm lg:text-base px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3"
                    onClick={() => {
                      router.push("/practice");
                    }}
                    aria-label="Special gift for new members - Start practicing"
                  >
                    Gift for new joiners
                    <Gift
                      className="w-3 h-3 sm:w-4 sm:h-4 ml-2"
                      aria-hidden="true"
                    />
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
