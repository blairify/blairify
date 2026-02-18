import { Pause, Play, SkipForward, Square } from "lucide-react";
import { PaginationIndicator } from "@/components/common/atoms/pagination-indicator";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useIsMobile from "@/hooks/use-is-mobile";
import { TimerDisplay } from "../atoms/timer-display";

interface InterviewHeaderProps {
  interviewType: string;
  timeRemaining: number;
  currentQuestion: number;
  totalQuestions: number;
  isPaused: boolean;
  isComplete: boolean;
  isLoading: boolean;
  onPauseResume: () => void;
  onSkip: () => void;
  onEnd: () => void;
}

export function InterviewHeader({
  interviewType,
  timeRemaining,
  currentQuestion,
  totalQuestions,
  isPaused,
  isComplete,
  isLoading,
  onPauseResume,
  onSkip,
  onEnd,
}: InterviewHeaderProps) {
  const { isMobile } = useIsMobile();
  const currentIndex = Math.max(0, currentQuestion - 1);
  return (
    <div
      className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm"
      data-interview-type={interviewType}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            {!isMobile && (
              <PaginationIndicator
                variant="numbered"
                total={totalQuestions}
                current={currentIndex}
              />
            )}
            <TimerDisplay seconds={timeRemaining} />
          </div>
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onPauseResume}
                    disabled={isComplete}
                    aria-label={
                      isPaused ? "Resume interview" : "Pause interview"
                    }
                    className="bg-transparent border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    {isPaused ? (
                      <Play className="size-4" />
                    ) : (
                      <Pause className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{isPaused ? "Resume interview" : "Pause interview"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onSkip}
                    disabled={isLoading || isComplete}
                    aria-label="Skip question"
                    className="bg-transparent border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    <SkipForward className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Skip question</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={onEnd}
                    disabled={isComplete}
                    aria-label="End interview"
                    className="text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    <Square className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>End interview</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
