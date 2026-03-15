import { motion } from "framer-motion";

interface ScoreRadialChartProps {
  score: number;
  passed?: boolean | null;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  textSize?: string;
}

function getReadiness(score: number): {
  label:
    | "Exceptional Performance"
    | "Outstanding Performance"
    | "Excellent Performance"
    | "Strong Performance"
    | "Good Performance"
    | "Satisfactory Performance"
    | "Needs Improvement"
    | "Below Expectations"
    | "Critical";
  ringClass: string;
} {
  if (score >= 95) {
    return {
      label: "Exceptional Performance",
      ringClass: "text-lime-400 dark:text-lime-400",
    };
  }

  if (score >= 90) {
    return {
      label: "Outstanding Performance",
      ringClass: "text-lime-500 dark:text-lime-400",
    };
  }

  if (score >= 85) {
    return {
      label: "Excellent Performance",
      ringClass: "text-lime-600 dark:text-lime-400",
    };
  }

  if (score >= 80) {
    return {
      label: "Strong Performance",
      ringClass: "text-lime-700 dark:text-lime-400",
    };
  }

  if (score >= 75) {
    return {
      label: "Good Performance",
      ringClass: "text-emerald-400 dark:text-emerald-400",
    };
  }

  if (score >= 70) {
    return {
      label: "Satisfactory Performance",
      ringClass: "text-emerald-500 dark:text-emerald-400",
    };
  }

  if (score >= 50) {
    return {
      label: "Needs Improvement",
      ringClass: "text-yellow-400 dark:text-yellow-400",
    };
  }

  if (score >= 30) {
    return {
      label: "Below Expectations",
      ringClass: "text-orange-400 dark:text-orange-400",
    };
  }

  return {
    label: "Critical",
    ringClass: "text-red-600 dark:text-red-400",
  };
}

export function ScoreRadialChart({
  score,
  passed,
  size = 128,
  strokeWidth = 8,
  showLabel = true,
  textSize = "text-4xl",
}: ScoreRadialChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const scoreValue = Math.max(0, Math.min(100, score));
  const progress = scoreValue / 100;
  const dashOffsetTarget = circumference * (1 - progress);

  const readiness = getReadiness(scoreValue);

  const getScoreTextClass = (passed: boolean | null | undefined): string => {
    if (passed === true) return "text-emerald-900 dark:text-emerald-100";
    if (passed === false) return "text-red-900 dark:text-red-100";
    return "text-foreground";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        focusable="false"
      >
        <title>Score Progress Chart</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffsetTarget }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={readiness.ringClass}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${textSize} font-bold tabular-nums ${getScoreTextClass(
              passed,
            )}`}
          >
            {scoreValue}
          </div>
        </div>
      )}
    </div>
  );
}
