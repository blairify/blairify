import { AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TerminationReason } from "@/types/interview";

interface InterviewCompleteCardProps {
  onViewResults: () => void;
  terminationReason?: TerminationReason;
  showViewResults?: boolean;
  onGoToProgress?: () => void;
}

export function InterviewCompleteCard({
  onViewResults,
  terminationReason,
  showViewResults = true,
  onGoToProgress,
}: InterviewCompleteCardProps) {
  const handleConfirmViewResults = () => {
    onViewResults();
  };

  const isTermination = terminationReason !== undefined;
  const canGoToProgress = !isTermination && !showViewResults;

  const title = (() => {
    if (!terminationReason && !showViewResults) return "Interview ended";
    if (!terminationReason) return "Interview Complete!";
    switch (terminationReason) {
      case "language":
        return "Terminated due to language";
      case "profanity":
        return "Interview terminated: inappropriate language";
      case "inappropriate-behavior":
        return "Interview terminated: inappropriate behavior";
      default: {
        const _never: never = terminationReason;
        throw new Error(`Unhandled termination reason: ${_never}`);
      }
    }
  })();

  const description = (() => {
    if (!terminationReason && !showViewResults) {
      return "You didn't answer any questions, so there's nothing to analyze. This session won't be saved to your history.";
    }

    if (!terminationReason) {
      return "Congratulations! You've successfully completed the interview. Ready to see how you performed?";
    }
    switch (terminationReason) {
      case "language":
        return "This interview ended early because only English is supported.";
      case "profanity":
        return "This interview ended early due to inappropriate language.";
      case "inappropriate-behavior":
        return "This interview ended early due to inappropriate behavior.";
      default: {
        const _never: never = terminationReason;
        throw new Error(`Unhandled termination reason: ${_never}`);
      }
    }
  })();

  return (
    <Card
      className={
        isTermination
          ? "border-2 border-red-500 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 shadow-xl"
          : canGoToProgress
            ? "border-2 border-border bg-gradient-to-br from-muted/40 to-background shadow-xl"
            : "border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-xl"
      }
    >
      <CardContent className="pt-6 pb-6">
        <div className="text-center">
          <div
            className={
              isTermination
                ? "inline-flex items-center justify-center size-16 sm:size-20 rounded-full bg-red-100 dark:bg-red-900 mb-4"
                : canGoToProgress
                  ? "inline-flex items-center justify-center size-16 sm:size-20 rounded-full bg-muted/60 dark:bg-muted/30 mb-4"
                  : "inline-flex items-center justify-center size-16 sm:size-20 rounded-full bg-green-100 dark:bg-green-900 mb-4"
            }
          >
            {isTermination ? (
              <AlertTriangle className="size-10 sm:size-12 text-red-700 dark:text-red-300" />
            ) : canGoToProgress ? (
              <CheckCircle className="size-10 sm:size-12 text-muted-foreground" />
            ) : (
              <CheckCircle className="size-10 sm:size-12 text-green-600 dark:text-green-400" />
            )}
          </div>
          <Typography.Heading3 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">
            {title}
          </Typography.Heading3>
          <Typography.Body className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
            {description}
          </Typography.Body>
          {canGoToProgress && onGoToProgress ? (
            <Button variant="outline" size="lg" onClick={onGoToProgress}>
              Go to Dashboard
              <ArrowRight className="size-5 ml-2" />
            </Button>
          ) : null}
          {showViewResults ? (
            <Button
              onClick={handleConfirmViewResults}
              size="lg"
              className={
                isTermination
                  ? "h-11 sm:h-12 px-8 text-base font-semibold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg"
                  : "h-11 sm:h-12 px-8 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              }
            >
              View Results
              <ArrowRight className="size-5 ml-2" />
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
