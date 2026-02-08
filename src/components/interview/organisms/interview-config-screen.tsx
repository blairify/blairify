"use client";

import {
  Building,
  CheckCircle,
  Clock,
  Lightbulb,
  Loader2,
  Play,
  Shield,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { POSITIONS, SENIORITY_LEVELS } from "@/constants/configure";
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

  return (
    <main className="flex-1 overflow-y-auto bg-background/50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        <div className="flex flex-col gap-2 mb-10 text-center lg:text-left">
          <Typography.BodyBold className="text-3xl sm:text-4xl">
            Preview your <span className="text-primary">Interview</span>
          </Typography.BodyBold>
          <Typography.Body className="text-muted-foreground">
            Review your configuration and sample questions before beginning.
          </Typography.Body>
        </div>

        <div className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(() => {
                const positionInfo = POSITIONS.find(
                  (p) => p.value === config.position,
                );
                const seniorityInfo = SENIORITY_LEVELS.find(
                  (s) => s.value === config.seniority,
                );

                const stats = [
                  {
                    label: "Position",
                    value: positionInfo?.label || config.position,
                    icon: positionInfo?.icon || Shield,
                  },
                  {
                    label: "Seniority",
                    value: seniorityInfo?.label || config.seniority,
                    icon: seniorityInfo?.icon || Trophy,
                  },
                  {
                    label: "Duration",
                    value:
                      config.interviewMode === "practice" ||
                      config.interviewMode === "teacher"
                        ? "Infinite"
                        : `${config.duration || "30"} minutes`,
                    icon: Clock,
                  },
                ];

                return stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <Card
                      key={idx}
                      className="border-border/60 bg-card/50 shadow-none"
                    >
                      <CardContent className="flex flex-row items-center sm:items-start gap-3 text-center sm:text-left">
                        <Icon className="size-5 flex-shrink-0" />
                        <div className="flex flex-col gap-1">
                          <div className="font-bold text-sm truncate">
                            {stat.value}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                });
              })()}
            </div>

            {config.contextType === "job-specific" && config.company && (
              <Card className="border-border/60 bg-card/50 shadow-none overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-5 items-start">
                    <div className="p-3 rounded-2xl bg-muted text-muted-foreground flex-shrink-0">
                      <Building className="size-6" />
                    </div>
                    <div className="space-y-2">
                      <Typography.BodyBold className="text-lg">
                        Tailored for {config.company}
                      </Typography.BodyBold>
                      <Typography.Caption className="text-muted-foreground leading-relaxed line-clamp-3 italic">
                        "{config.jobDescription}"
                      </Typography.Caption>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div data-tour="interview-preview-example">
              <InterviewExamplePreview
                config={config}
                onLoadingChange={setIsExampleLoading}
              />
            </div>
          </div>
          <Card className="border-border/60 bg-card shadow-sm">
            <CardContent className="space-y-6">
              <div className="space-y-1 text-left">
                <Typography.BodyBold>Ready to start?</Typography.BodyBold>
                <Typography.Caption color="secondary">
                  Your assessment is calibrated and ready for your responses.
                </Typography.Caption>
              </div>

              <Button
                data-tour="interview-preview-start"
                onClick={onStart}
                disabled={isStartDisabled}
                size="lg"
                className="w-full sm:w-auto sm:mx-auto"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : isExampleLoading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Calibrating...
                  </>
                ) : (
                  <>
                    <Play className="size-3 fill-current" />
                    Start Interview
                  </>
                )}
              </Button>

              <div className="pt-6 border-t border-border/40">
                <div className="flex items-center justify-start gap-2 mb-4">
                  <Lightbulb className="size-4 text-amber-500" />
                  <Typography.CaptionBold className="uppercase tracking-widest text-[10px] text-muted-foreground">
                    Interview Tips
                  </Typography.CaptionBold>
                </div>
                <ul className="space-y-4">
                  {[
                    "Speak clearly and concisely.",
                    "Use the STAR Method for behavioral answers.",
                    "Thinking out loud is highly encouraged.",
                  ].map((tip, i) => (
                    <li
                      key={i}
                      className="flex gap-3 items-start justify-start"
                    >
                      <div className="size-5 rounded-full bg-primary/5 border border-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="size-3 text-green-400" />
                      </div>
                      <Typography.Caption className="text-left">
                        {tip}
                      </Typography.Caption>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
