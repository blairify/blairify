import { useEffect, useState } from "react";
import type { InterviewConfig } from "../components/interview/types";

function getDurationSeconds(config: InterviewConfig): number {
  const minutes = Number.parseInt(config.duration, 10);
  if (Number.isNaN(minutes)) return 30 * 60;
  const clampedMinutes = Math.min(Math.max(minutes, 5), 120);
  return clampedMinutes * 60;
}

export function useInterviewTimer(
  config: InterviewConfig,
  mounted: boolean,
  isStarted: boolean,
  isPaused: boolean,
  isComplete: boolean,
  onTimeUp: () => void,
) {
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);

  useEffect(() => {
    if (!mounted) return;

    if (
      config.interviewMode === "practice" ||
      config.interviewMode === "teacher"
    ) {
      setTimeRemaining(Number.POSITIVE_INFINITY);
      return;
    }

    setTimeRemaining(getDurationSeconds(config));
  }, [config, mounted]);

  useEffect(() => {
    if (
      !isStarted ||
      isPaused ||
      isComplete ||
      timeRemaining === Number.POSITIVE_INFINITY
    )
      return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isPaused, isComplete, timeRemaining, onTimeUp]);

  return timeRemaining;
}
