"use client";

import { CiBookmarkCheck } from "react-icons/ci";
import { Typography } from "@/components/common/atoms/typography";
import { MarkdownContent } from "@/components/common/molecules/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  formatKnowledgeGapBlurb,
  formatKnowledgeGapTitle,
} from "@/lib/utils/interview-normalizers";
import {
  getGapBlurbText,
  getGapSummaryTextWithFallback,
  getPriorityClass,
  getPriorityLabel,
  isGeneratedSearchResourceUrl,
} from "@/lib/utils/results-content-utils";
import type { KnowledgeGapPriority, ResourceLink } from "@/types/interview";

type GapDisplayMode = "full" | "compact";

interface GapInput {
  title: string;
  priority: KnowledgeGapPriority;
  tags: string[];
  why: string;
  summary?: string;
  resources?: ResourceLink[];
}

interface KnowledgeGapsSectionProps {
  knowledgeGaps: GapInput[];
  mode?: GapDisplayMode;
  className?: string;
}

function renderGapTitle(gap: GapInput): string {
  return formatKnowledgeGapTitle(gap.title, gap.tags);
}

function renderGapDescription(
  gap: GapInput,
  mode: GapDisplayMode,
): string | null {
  if (mode === "compact") {
    return formatKnowledgeGapBlurb({
      title: gap.title,
      tags: gap.tags,
      priority: gap.priority,
    });
  }
  const normalizedGap = { ...gap, resources: gap.resources ?? [] };
  const summary = getGapSummaryTextWithFallback(normalizedGap);
  const blurb = getGapBlurbText(normalizedGap);
  return blurb || summary || null;
}

function filterResources(resources: ResourceLink[]): ResourceLink[] {
  return resources.filter((r) => !isGeneratedSearchResourceUrl(r.url));
}

function GapResources({ resources }: { resources: ResourceLink[] }) {
  const filtered = filterResources(resources);

  if (filtered.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No curated links yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {filtered.map((r, idx) => (
        <li key={`${r.id}-${idx}`} className="text-sm">
          <a
            className="text-blue-600 dark:text-blue-400 hover:underline"
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {r.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

function GapItem({ gap, mode }: { gap: GapInput; mode: GapDisplayMode }) {
  const title = renderGapTitle(gap);
  const description = renderGapDescription(gap, mode);

  return (
    <div
      className={
        mode === "full"
          ? "rounded-lg border border-gray-200 dark:border-gray-800 p-4"
          : "space-y-3 p-4"
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div className="text-sm font-bold text-foreground">{title}</div>
        <Badge className={`font-semibold ${getPriorityClass(gap.priority)}`}>
          {getPriorityLabel(gap.priority)}
        </Badge>
      </div>

      {description &&
        (mode === "full" ? (
          <MarkdownContent
            className="text-gray-700 dark:text-gray-300 mb-3"
            markdown={description}
          />
        ) : (
          <div className="text-sm text-muted-foreground">{description}</div>
        ))}

      {mode === "full" && gap.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {gap.tags.map((tag) => (
            <Typography.Caption
              key={tag}
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              {tag}
            </Typography.Caption>
          ))}
        </div>
      )}

      <GapResources resources={gap.resources ?? []} />
    </div>
  );
}

export function KnowledgeGapsSection({
  knowledgeGaps,
  mode = "full",
  className,
}: KnowledgeGapsSectionProps) {
  if (knowledgeGaps.length === 0) return null;

  if (mode === "compact") {
    return (
      <Card
        className={`border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm ${className ?? ""}`}
      >
        <CardContent className="px-3 pt-6 pb-0">
          <div className="flex flex-col items-center gap-2 mb-4">
            <Typography.BodyBold className="text-4xl">
              {knowledgeGaps.length}
            </Typography.BodyBold>
            <Typography.Caption className="text-xl sm:text-2xl font-bold tracking-tight text-center">
              Knowledge Gaps & Resources
            </Typography.Caption>
          </div>
        </CardContent>
        <CardContent className="px-2 pt-0 pb-2">
          {knowledgeGaps.map((gap, idx) => (
            <div key={`${gap.title}-${idx}`}>
              {idx > 0 && <Separator className="mx-4 my-0 opacity-40" />}
              <GapItem gap={gap} mode={mode} />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border shadow-md hover:shadow-lg transition-shadow duration-200 animate-in fade-in slide-in-from-bottom-4 duration-700 ${className ?? ""}`}
    >
      <CardTitle className="flex flex-row items-start gap-3 mt-2 ml-8">
        <CiBookmarkCheck className="size-8 text-amber-600 dark:text-amber-400" />
        <div className="flex flex-col items-left gap-1">
          <Typography.BodyBold>Knowledge Gaps & Resources</Typography.BodyBold>
          <Typography.Caption>
            Focus on the high-priority items first. Each gap has curated links
            from the resource library.
          </Typography.Caption>
        </div>
      </CardTitle>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {knowledgeGaps.map((gap, idx) => (
            <GapItem key={`${gap.title}-${idx}`} gap={gap} mode={mode} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
