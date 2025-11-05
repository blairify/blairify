import { Pause, Play, SkipForward, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InterviewBadge } from "../atoms/interview-badge";
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
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        {/* Top Row: Badge, Timer, Actions */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <InterviewBadge type={interviewType} />
            <TimerDisplay seconds={timeRemaining} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPauseResume}
              disabled={isComplete}
              className="max-h-8 sm:h-10 px-3 sm:px-4 font-medium"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Resume</span>
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">Pause</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              disabled={isLoading || isComplete}
              className="max-h-8 sm:h-10 px-3 sm:px-4 font-medium"
            >
              <SkipForward className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Skip</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onEnd}
              disabled={isComplete}
              className="max-h-8 sm:h-10 px-3 sm:px-4 font-medium"
            >
              <Square className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">End</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-muted-foreground">
              Question Progress
            </span>
            <span className="font-bold text-foreground bg-primary/10 px-2.5 py-0.5 rounded-full">
              {currentQuestion} / {totalQuestions}
            </span>
          </div>
          <Progress
            value={(currentQuestion / totalQuestions) * 100}
            className="h-2.5"
          />
        </div>
      </div>
    </div>
  );
}
