import type { FC } from "react";
import { Typography } from "@/components/common/atoms/typography";
import type { InterviewConfig } from "@/components/configure/utils/types";
import { Card, CardContent } from "@/components/ui/card";
import { INTERVIEW_MODES } from "@/constants/configure";
import { cn } from "@/lib/utils";

interface ModeSelectionStepProps {
  config: InterviewConfig;
  onSelect: (mode: string) => void;
}

export const ModeSelectionStep: FC<ModeSelectionStepProps> = ({
  config,
  onSelect,
}) => {
  const currentMode = config.interviewMode;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 max-w-fit gap-6">
      {INTERVIEW_MODES.map((mode) => {
        const Icon = mode.icon;
        const isSelected = currentMode === mode.value;
        const isComingSoon = mode.description === "Coming soon...";

        return (
          <Card
            key={mode.value}
            className={cn(
              "group relative overflow-hidden transition-all duration-300",
              isComingSoon
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10",
              isSelected
                ? "ring-1 ring-primary border-primary bg-primary/5 shadow-md shadow-primary/5"
                : "border-border shadow-sm",
            )}
            onClick={() => !isComingSoon && onSelect(mode.value)}
          >
            <CardContent className="flex flex-col items-start gap-4">
              <Icon
                className={cn(
                  "size-5 flex-shrink-0",
                  isComingSoon ? "text-muted-foreground" : "text-primary",
                )}
              />

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Typography.BodyBold>{mode.label}</Typography.BodyBold>
                </div>
                <Typography.Caption color="secondary">
                  {mode.description}
                </Typography.Caption>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
