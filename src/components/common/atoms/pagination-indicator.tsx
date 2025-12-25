"use client";

interface PaginationIndicatorProps {
  total: number;
  current: number;
  variant?: "default" | "numbered";
}

export function PaginationIndicator({
  total,
  current,
  variant = "default",
}: PaginationIndicatorProps) {
  if (variant === "numbered") {
    return (
      <div className="flex items-center gap-2.5">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ease-in-out ${
              index === current
                ? "bg-primary text-primary-foreground"
                : index < current
                  ? "bg-green-50 text-black border border-green-800"
                  : "bg-transparent text-neutral-400 border border-neutral-300"
            }`}
          >
            {index + 1}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5" aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
            index === current
              ? "w-8 bg-sidebar-accent-foreground"
              : "w-2 bg-neutral-300"
          }`}
        />
      ))}
    </div>
  );
}
