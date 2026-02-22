"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useEffect } from "react";
import { Typography } from "@/components/common/atoms/typography";
import type { TechChoice } from "@/components/configure/types/tech-choice";
import type { InterviewConfig } from "@/components/configure/utils/types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputWrapper,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/tailgrids/core/combobox";
import { Input } from "@/components/tailgrids/core/input";
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
    <div className="flex flex-wrap gap-2">
      <div className="space-y-2">
        <Combobox
          value={config.position}
          onChange={(value) =>
            onUpdateConfig("position", value as PositionValue)
          }
        >
          <ComboboxInputWrapper className="min-w-[205px] border-border rounded-lg">
            <ComboboxInput className="text-sm" placeholder="Select role" />
            <ComboboxTrigger className="text-sm" />
          </ComboboxInputWrapper>
          <ComboboxContent>
            <ComboboxList>
              {POSITIONS.map((position) => (
                <ComboboxItem key={position.value} id={position.value}>
                  {position.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty>No roles found</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="space-y-2">
        <Combobox
          value={config.seniority}
          onChange={(value) => onUpdateConfig("seniority", value as string)}
        >
          <ComboboxInputWrapper className="min-w-[130px] border-border rounded-lg">
            <ComboboxInput className="text-sm" placeholder="Select level" />
            <ComboboxTrigger className="text-sm" />
          </ComboboxInputWrapper>
          <ComboboxContent>
            <ComboboxList>
              {SENIORITY_LEVELS.map((seniority) => (
                <ComboboxItem key={seniority.value} id={seniority.value}>
                  {seniority.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
            <ComboboxEmpty>No levels found</ComboboxEmpty>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="space-y-2">
        <Input
          value={config.company ?? ""}
          onChange={(event) => onUpdateConfig("company", event.target.value)}
          placeholder="Enter company name"
          className="w-[200px] text-sm max-w-[335px] py-2"
        />
      </div>
      <Separator className="my-5 bg-gray-500" />
      {isTechRequired && (
        <div>
          {selectableTechChoices.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectableTechChoices.map((tech) => {
                const isSelected = selectedTechnologies.has(tech.value);
                return (
                  <button
                    key={tech.value}
                    type="button"
                    onClick={() => onToggleTechnology(tech.value)}
                    aria-pressed={isSelected}
                    className={`flex items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                        : "border-border hover:border-primary/40 !hover:bg-muted/50"
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
            <Typography.CaptionMedium color="secondary">
              Select a position to edit technologies.
            </Typography.CaptionMedium>
          )}
        </div>
      )}
    </div>
  );
}
