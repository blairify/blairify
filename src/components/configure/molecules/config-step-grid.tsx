"use client";

import type { ReactNode } from "react";
import { ConfigStepCard } from "@/components/configure/atoms/config-step-card";
import { cn } from "@/lib/utils";

interface ConfigStepGridProps<TValue extends string> {
  items: Array<{
    value: TValue;
    label: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }>;
  selectedValue: TValue | string;
  onSelect: (value: TValue) => void;
  columns?: string;
  className?: string;
  cardContent: (item: {
    value: TValue;
    label: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    isSelected: boolean;
  }) => ReactNode;
}

export function ConfigStepGrid<TValue extends string>({
  items,
  selectedValue,
  onSelect,
  columns = "grid-cols-2 lg:grid-cols-3",
  className,
  cardContent,
}: ConfigStepGridProps<TValue>) {
  return (
    <div className={cn("grid gap-6", columns, className)}>
      {items.map((item) => {
        const isSelected = selectedValue === item.value;
        return (
          <ConfigStepCard
            key={item.value}
            disabled={item.disabled}
            selected={isSelected}
            onClick={() => {
              if (!item.disabled) onSelect(item.value);
            }}
            className="text-left h-full"
          >
            {cardContent({ ...item, isSelected })}
          </ConfigStepCard>
        );
      })}
    </div>
  );
}
