import type { ComponentType } from "react";

export type TechnologyIcon = ComponentType<{ className?: string }>;

export type TechChoice = {
  value: string;
  label: string;
  icon: TechnologyIcon | string;
};
