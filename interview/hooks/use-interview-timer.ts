import { useEffect, useState } from "react";
import type { InterviewConfig } from "../types";

export function useInterviewTimer(
  config: InterviewConfig,
  mounted: boolean,
  isStarted: boolean,
  isPaused: boolean,
  isComplete: boolean,
  onTimeUp: () => void,
) {
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);

  // Initialize timer based on config
  useEffect(() => {
    if (mounted) {
      // Practice and Teacher modes are untimed
      if (
        config.interviewMode === "practice" ||
        config.interviewMode === "teacher"
      ) {
        setTimeRemaining(Number.POSITIVE_INFINITY);
      } else {
        setTimeRemaining(Number.parseInt(config.duration, 10) * 60);
      }
    }
  }, [config, mounted]);

  // Timer countdown
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
