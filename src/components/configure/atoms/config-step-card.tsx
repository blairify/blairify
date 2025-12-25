"use client";

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConfigStepCardProps {
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}

export function ConfigStepCard({
  selected,
  disabled,
  onClick,
  className,
  children,
}: ConfigStepCardProps) {
  return (
    <Card
      className={cn(
        "transition-all border-border",
        disabled
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:bg-primary/5 hover:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/40",
        selected &&
          !disabled &&
          "ring-1 ring-primary border-primary bg-primary/5",
        className,
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
