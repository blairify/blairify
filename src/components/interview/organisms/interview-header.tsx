import { Pause, Play, SkipForward, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InterviewQuestionSteps } from "../atoms/interview-question-steps";
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
  return (
    <div
      className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm"
      data-interview-type={interviewType}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <InterviewQuestionSteps
              currentQuestion={currentQuestion}
              totalQuestions={totalQuestions}
            />
            <TimerDisplay seconds={timeRemaining} />
          </div>
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPauseResume}
                    disabled={isComplete}
                    aria-label={
                      isPaused ? "Resume interview" : "Pause interview"
                    }
                    className="max-h-9 sm:h-10 px-3 sm:px-4 font-medium"
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
                    size="sm"
                    onClick={onSkip}
                    disabled={isLoading || isComplete}
                    aria-label="Skip question"
                    className="max-h-9 sm:h-10 px-3 sm:px-4 font-medium"
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
                    size="sm"
                    onClick={onEnd}
                    disabled={isComplete}
                    aria-label="End interview"
                    className="max-h-9 sm:h-10 px-3 sm:px-4 font-medium"
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
