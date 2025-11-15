import { Check } from "lucide-react";

interface InterviewQuestionStepsProps {
  currentQuestion: number;
  totalQuestions: number;
}

export function InterviewQuestionSteps({
  currentQuestion,
  totalQuestions,
}: InterviewQuestionStepsProps) {
  if (totalQuestions <= 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <ul
        className="flex items-center gap-1.5 sm:gap-2"
        aria-label="Question steps"
      >
        {Array.from({ length: totalQuestions }).map((_, index) => {
          const step = index + 1;
          const isCompleted = currentQuestion > step;
          const isCurrent = currentQuestion === step;

          const statusLabel = isCompleted
            ? "completed"
            : isCurrent
              ? "current"
              : "upcoming";

          const baseClasses =
            "flex items-center justify-center rounded-full transition-colors";
          const sizeClasses = "size-4 sm:size-5";

          const visualClasses = isCompleted
            ? "bg-primary text-background"
            : isCurrent
              ? "border-1 border-primary bg-background"
              : "bg-muted";

          return (
            <li
              key={step}
              aria-label={`Question ${step} of ${totalQuestions} (${statusLabel})`}
              className={`${baseClasses} ${sizeClasses} ${visualClasses}`}
            >
              {isCompleted ? (
                <Check className="size-3" />
              ) : (
                <span className="text-xs">{step}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
