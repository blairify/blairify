"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PassFailBannerProps {
  passed: boolean;
  subtitle?: string;
  compact?: boolean;
  className?: string;
}

const PASSED_CLASSES = {
  border: "border-emerald-500",
  bg: "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30",
  iconBg:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  text: "text-emerald-900 dark:text-emerald-100",
  subtitle: "text-emerald-700 dark:text-emerald-300",
} as const;

const FAILED_CLASSES = {
  border: "border-red-500",
  bg: "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
  iconBg: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  text: "text-red-900 dark:text-red-100",
  subtitle: "text-red-700 dark:text-red-300",
} as const;

export function PassFailBanner({
  passed,
  subtitle,
  compact = false,
  className,
}: PassFailBannerProps) {
  const colors = passed ? PASSED_CLASSES : FAILED_CLASSES;
  const label = passed ? "Interview Passed" : "Not Passed";

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-2xl p-4 border-2",
          colors.border,
          colors.bg,
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              colors.iconBg,
            )}
          >
            {passed ? (
              <CheckCircle className="h-5 w-5" aria-hidden="true" />
            ) : (
              <XCircle className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div className={cn("text-lg font-bold", colors.text)}>{label}</div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "border-2 shadow-lg animate-in fade-in slide-in-from-top-4 duration-700",
        colors.border,
        colors.bg,
        className,
      )}
    >
      <CardContent className="py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div
              className={cn(
                "flex-shrink-0 size-16 rounded-full flex items-center justify-center",
                colors.iconBg,
              )}
            >
              {passed ? (
                <CheckCircle className="size-8" aria-hidden="true" />
              ) : (
                <XCircle className="size-8" aria-hidden="true" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <div className={cn("text-3xl font-bold mb-3", colors.text)}>
                {label}
              </div>
              {subtitle && (
                <Typography.Body
                  className={cn(
                    "text-lg leading-relaxed mb-2",
                    colors.subtitle,
                  )}
                >
                  {subtitle}
                </Typography.Body>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
