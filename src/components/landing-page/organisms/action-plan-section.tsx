"use client";

import { CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Typography } from "@/components/common/atoms/typography";

const LIGHT_VIDEO_SOURCE = "/devices/demo-mac-light.mp4";
const DARK_VIDEO_SOURCE = "/devices/demo-mac-dark.mp4";

export default function ActionPlanSection() {
  const { theme, systemTheme } = useTheme();
  const [videoSrc, setVideoSrc] = useState(LIGHT_VIDEO_SOURCE);
  const [mounted, setMounted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const lightVideoElement = document.createElement("video");
    lightVideoElement.preload = "auto";
    lightVideoElement.src = LIGHT_VIDEO_SOURCE;
    lightVideoElement.load();

    const darkVideoElement = document.createElement("video");
    darkVideoElement.preload = "auto";
    darkVideoElement.src = DARK_VIDEO_SOURCE;
    darkVideoElement.load();

    return () => {
      lightVideoElement.src = "";
      darkVideoElement.src = "";
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const currentTheme = theme === "system" ? systemTheme : theme;
    const isDark = currentTheme === "dark";
    const newVideoSrc = isDark ? DARK_VIDEO_SOURCE : LIGHT_VIDEO_SOURCE;

    setVideoLoaded(false);
    setVideoSrc(newVideoSrc);
  }, [theme, systemTheme, mounted]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  return (
    <section
      id="action-plan"
      className="bg-card border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden"
      aria-labelledby="action-plan-heading"
      data-analytics-id="home-action-plan"
    >
      <div
        className="pointer-events-none absolute inset-0 "
        aria-hidden="true"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <Typography.HeroSubHeading
              id="action-plan-heading"
              className="mt-5 mb-4"
            >
              Fix gaps with a targeted study plan.
            </Typography.HeroSubHeading>
            <Typography.Body color="secondary" className="mb-6">
              Your report should tell you what to learn next. Blairify flags the
              specific topics you missed and links you to high-signal material.
            </Typography.Body>

            <ul className="space-y-3" aria-label="Action plan highlights">
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="size-5 text-primary mt-0.5"
                  aria-hidden="true"
                />
                <Typography.BodyMedium>
                  Concrete topics, not generic "study more" advice.
                </Typography.BodyMedium>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2
                  className="size-5 text-primary mt-0.5"
                  aria-hidden="true"
                />
                <Typography.BodyMedium>
                  Links to docs, articles, and books you can trust.
                </Typography.BodyMedium>
              </li>
            </ul>
          </div>

          <aside className="relative bg-transparent overflow-hidden py-10">
            <div className="relative w-full h-64 md:h-80 lg:h-96">
              {!videoLoaded && (
                <div className="absolute inset-0 bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
                  <Typography.Body color="secondary">
                    Loading video...
                  </Typography.Body>
                </div>
              )}

              <video
                key={videoSrc}
                className={`w-full h-full object-cover pointer-events-none bg-transparent rounded-lg transition-opacity duration-300 ${
                  videoLoaded ? "opacity-100" : "opacity-0"
                }`}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-label="Study plan demonstration video"
                onLoad={handleVideoLoad}
                onCanPlay={handleVideoLoad}
              >
                <source src={videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
