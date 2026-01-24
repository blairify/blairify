"use client";

import { Building, Clock, Loader2, Play, Shield } from "lucide-react";
import { useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { POSITIONS } from "@/constants/configure";
import { cn } from "@/lib/utils";
import type { InterviewConfig } from "../types";
import { InterviewExamplePreview } from "./interview-example-preview";

interface InterviewConfigScreenProps {
  config: InterviewConfig;
  isLoading: boolean;
  onStart: () => void;
}

export function InterviewConfigScreen({
  config,
  isLoading,
  onStart,
}: InterviewConfigScreenProps) {
  const [isExampleLoading, setIsExampleLoading] = useState(false);

  const isStartDisabled = isLoading || isExampleLoading;

  // Get the icon for the current position
  const positionData = POSITIONS.find((p) => p.value === config.position);
  const PositionIcon = positionData?.icon || Shield;

  return (
    <main className="flex-1 overflow-y-auto relative">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-5xl relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <Typography.Heading1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white uppercase mb-6 leading-none">
            Ready for your{" "}
            <span className="text-primary italic">Interview?</span>
          </Typography.Heading1>
          <Typography.Body className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto font-medium">
            Your technical session is ready. Please review the configuration
            details below before beginning the assessment.
          </Typography.Body>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Configuration Parameters */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[32px] blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
                <div className="p-8 sm:p-10">
                  <div className="grid grid-cols-3 gap-x-12 gap-y-10 items-center justify-center">
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <PositionIcon className="size-5 text-primary/50" />
                        <Typography.BodyBold className=" text-white capitalize leading-none">
                          {config.position}
                        </Typography.BodyBold>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Shield className="size-5 text-primary/50" />

                        <Typography.BodyBold className=" text-white capitalize leading-none">
                          {config.seniority}
                        </Typography.BodyBold>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 justify-center text-white">
                        <Clock className="size-5 text-gray-400" />
                        <Typography.BodyBold className="leading-none">
                          {config.interviewMode === "practice" ||
                          config.interviewMode === "teacher"
                            ? "Infinite"
                            : `${config.duration || "30"}m`}
                        </Typography.BodyBold>
                      </div>
                    </div>
                  </div>

                  {config.contextType === "job-specific" && config.company && (
                    <div className="mt-12 pt-10 border-t border-white/5 relative">
                      <Typography.SubCaptionBold className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 bg-[#0A0A0A] text-primary uppercase tracking-[0.3em]">
                        Job Details
                      </Typography.SubCaptionBold>
                      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <Building className="size-8 text-primary/80" />
                        </div>
                        <div className="flex-1">
                          <Typography.BodyBold className="text-white text-lg mb-1">
                            Tailored for {config.company}
                          </Typography.BodyBold>
                          <Typography.Caption className="text-gray-400 leading-relaxed line-clamp-2 italic">
                            "{config.jobDescription}"
                          </Typography.Caption>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <InterviewExamplePreview
              config={config}
              onLoadingChange={setIsExampleLoading}
            />
          </div>

          {/* Right Column: Ignition / Call to Action */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-primary/5 backdrop-blur-xl shadow-2xl">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              {/* Radial glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

              <div className="relative z-10 p-12 flex flex-col items-center gap-8">
                {/* Start Button */}
                <Button
                  onClick={onStart}
                  disabled={isStartDisabled}
                  className={cn(
                    "size-28 bg-primary text-black rounded-full hover:scale-110 active:scale-95 transition-all duration-500 shadow-[0_0_50px_-5px_rgba(var(--primary),0.4)] hover:shadow-[0_0_80px_-5px_rgba(var(--primary),0.6)] disabled:opacity-50 disabled:grayscale p-0 flex items-center justify-center group/play-btn relative",
                  )}
                >
                  {/* Button glow ring */}
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl group-hover/play-btn:bg-primary/30 transition-all" />

                  {isLoading ? (
                    <Loader2 className="size-10 animate-spin relative z-10" />
                  ) : isExampleLoading ? (
                    <div className="flex flex-col items-center gap-1.5 relative z-10">
                      <Loader2 className="size-7 animate-spin" />
                      <Typography.SubCaptionBold className="uppercase tracking-tighter text-black text-[9px]">
                        Calibrating
                      </Typography.SubCaptionBold>
                    </div>
                  ) : (
                    <Play className="size-12 fill-current ml-1.5 transition-transform group-hover/play-btn:scale-110 relative z-10" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <Typography.SubCaptionBold className="font-mono text-gray-500 uppercase tracking-widest mb-3 block">
                Protips
              </Typography.SubCaptionBold>
              <ul className="space-y-2 list-none">
                <li className="flex gap-2">
                  <Typography.SubCaptionBold className="text-primary">
                    01
                  </Typography.SubCaptionBold>
                  <Typography.SubCaptionMedium className="text-gray-400">
                    Speak clearly and concisely.
                  </Typography.SubCaptionMedium>
                </li>
                <li className="flex gap-2">
                  <Typography.SubCaptionBold className="text-primary">
                    02
                  </Typography.SubCaptionBold>
                  <Typography.SubCaptionMedium className="text-gray-400">
                    Use the Star Method for behavioral.
                  </Typography.SubCaptionMedium>
                </li>
                <li className="flex gap-2">
                  <Typography.SubCaptionBold className="text-primary">
                    03
                  </Typography.SubCaptionBold>
                  <Typography.SubCaptionMedium className="text-gray-400">
                    Thinking out loud is encouraged.
                  </Typography.SubCaptionMedium>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
