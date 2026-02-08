import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VerticalSeparatorBarProps {
  variant?: "primary" | "green" | "amber" | "blue" | "red" | "gray";
  className?: string;
  children: ReactNode;
}

export function VerticalSeparatorBar({
  variant = "primary",
  className,
  children,
}: VerticalSeparatorBarProps) {
  const variantStyles = {
    primary: "bg-primary/40",
    green: "bg-green-500/40",
    amber: "bg-amber-500/40",
    blue: "bg-blue-500/40",
    red: "bg-red-500/40",
    gray: "bg-gray-500/40",
  };

  return (
    <div className={cn("relative pl-5", className)}>
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-full",
          variantStyles[variant],
        )}
      />
      {children}
    </div>
  );
}
