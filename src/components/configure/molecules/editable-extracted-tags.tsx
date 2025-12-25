"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useEffect } from "react";
import { Typography } from "@/components/common/atoms/typography";
import type { TechChoice } from "@/components/configure/types/tech-choice";
import type { InterviewConfig } from "@/components/configure/utils/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { POSITIONS, SENIORITY_LEVELS } from "@/constants/configure";
import type { PositionValue } from "@/types/global";

interface EditableExtractedTagsProps {
  config: InterviewConfig;
  filteredTechChoices: TechChoice[];
  techChoicesForPosition: TechChoice[];
  isTechRequired: boolean;
  onUpdateConfig: <K extends keyof InterviewConfig>(
    key: K,
    value: InterviewConfig[K],
  ) => void;
  onToggleTechnology: (tech: string) => void;
}

export function EditableExtractedTags({
  config,
  filteredTechChoices,
  techChoicesForPosition,
  isTechRequired,
  onUpdateConfig,
  onToggleTechnology,
}: EditableExtractedTagsProps) {
  const selectableTechChoices =
    filteredTechChoices.length > 0
      ? filteredTechChoices
      : techChoicesForPosition;
  const selectedTechnologies = new Set(config.technologies);
  const hasSelectedTech = config.technologies?.length ?? 0;
  const selectableTechValues = selectableTechChoices.map((tech) => tech.value);

  useEffect(() => {
    if (!isTechRequired) return;
    if (hasSelectedTech > 0) return;
    if (!selectableTechValues.length) return;
    onUpdateConfig("technologies", selectableTechValues);
  }, [hasSelectedTech, isTechRequired, onUpdateConfig, selectableTechValues]);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="space-y-2">
          <Typography.SubCaptionBold>Position</Typography.SubCaptionBold>
          <Select
            value={config.position}
            onValueChange={(value) =>
              onUpdateConfig("position", value as PositionValue)
            }
          >
            <SelectTrigger className="h-10 bg-input border-border">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {POSITIONS.map((position) => (
                <SelectItem key={position.value} value={position.value}>
                  {position.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Typography.SubCaptionBold>Seniority</Typography.SubCaptionBold>
          <Select
            value={config.seniority}
            onValueChange={(value) => onUpdateConfig("seniority", value)}
          >
            <SelectTrigger className="h-10 bg-input border-border">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {SENIORITY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Typography.SubCaptionBold>Company name</Typography.SubCaptionBold>
          <Input
            value={config.company ?? ""}
            onChange={(event) => onUpdateConfig("company", event.target.value)}
            placeholder="Enter company name"
            className="h-9 bg-input border-border"
          />
        </div>
      </div>
      <Separator className="my-10 bg-gray-200" />
      {isTechRequired && (
        <div className="space-y-2">
          <div className="flex flex-col items-left ">
            <Typography.SubCaptionBold>Technologies</Typography.SubCaptionBold>
            <Typography.Caption className="text-xs text-muted-foreground">
              Tap to select or deselect
            </Typography.Caption>
          </div>
          {selectableTechChoices.length > 0 ? (
            <div className="flex gap-2">
              {selectableTechChoices.map((tech) => {
                const isSelected = selectedTechnologies.has(tech.value);
                return (
                  <button
                    key={tech.value}
                    type="button"
                    onClick={() => onToggleTechnology(tech.value)}
                    aria-pressed={isSelected}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tech.icon && typeof tech.icon !== "string" ? (
                        <tech.icon className="size-4 text-primary" />
                      ) : null}
                      {tech.label}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="size-4 ml-3 text-primary" />
                    ) : (
                      <Circle className="size-4 ml-3 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <Typography.CaptionMedium className="text-muted-foreground">
              Select a position to edit technologies.
            </Typography.CaptionMedium>
          )}
        </div>
      )}
    </div>
  );
}
