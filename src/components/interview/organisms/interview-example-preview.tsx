"use client";

import { Lightbulb, MessageSquare } from "lucide-react";
import { useEffect, useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useSWR from "swr";
import { Typography } from "@/components/common/atoms/typography";
import { VerticalSeparatorBar } from "@/components/common/atoms/vertical-separator-bar";
import { Card, CardContent } from "@/components/ui/card";
import type { InterviewConfig } from "../types";

function stableJsonStringify(value: unknown): string {
  if (value === null) return "null";

  const valueType = typeof value;
  if (valueType === "string") return JSON.stringify(value);
  if (valueType === "number")
    return Number.isFinite(value) ? String(value) : "null";
  if (valueType === "boolean") return value ? "true" : "false";
  if (valueType === "undefined") return "null";

  if (Array.isArray(value)) {
    const parts = value.map((entry) => stableJsonStringify(entry));
    return `[${parts.join(",")}]`;
  }

  if (valueType === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    const parts = keys
      .map((key) => {
        const entry = record[key];
        if (entry === undefined) return null;
        return `${JSON.stringify(key)}:${stableJsonStringify(entry)}`;
      })
      .filter((part): part is string => part !== null);

    return `{${parts.join(",")}}`;
  }

  return "null";
}

function isReadyForExamplePreview(config: InterviewConfig): boolean {
  if (!config.position) return false;
  if (!config.seniority) return false;
  if (!config.interviewMode) return false;
  if (!config.interviewType) return false;
  if (!config.duration) return false;
  return true;
}

interface InterviewExamplePreviewProps {
  config: InterviewConfig;
  onLoadingChange?: (isLoading: boolean) => void;
}

type ExampleData = {
  description: string;
  answer: string;
};

type ExampleDataOrNull = ExampleData | null;

type ApiResponse = {
  success: boolean;
  example?: {
    question: { description: string };
    answer: string;
  } | null;
  error?: string;
};

function hashString(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

// SWR fetcher function
const fetcher = async (
  url: string,
  config: InterviewConfig,
): Promise<ExampleDataOrNull> => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interviewConfig: config }),
  });

  if (!res.ok) {
    throw new Error("Failed to load example answer.");
  }

  const payload: ApiResponse = await res.json();

  if (!payload.success) {
    throw new Error(payload.error || "Failed to load example answer.");
  }

  if (!payload.example) {
    return null;
  }

  return {
    description: payload.example.question.description,
    answer: payload.example.answer,
  };
};

export function InterviewExamplePreview({
  config,
  onLoadingChange,
}: InterviewExamplePreviewProps) {
  const swrKey = useMemo(() => {
    if (!isReadyForExamplePreview(config)) return null;

    const jobDescriptionHash = config.jobDescription
      ? hashString(config.jobDescription)
      : "";
    const jobRequirementsHash = config.jobRequirements
      ? hashString(config.jobRequirements)
      : "";

    const normalizedConfig: InterviewConfig = {
      ...config,
      technologies: [...config.technologies].sort(),
      jobDescription: jobDescriptionHash,
      jobRequirements: jobRequirementsHash,
    };

    const fingerprint = stableJsonStringify(normalizedConfig);
    return `interview-example-preview:${fingerprint}`;
  }, [config]);

  const { data, error, isLoading } = useSWR(
    swrKey,
    () => fetcher("/api/interview/example-preview", config),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    },
  );

  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  const markdownComponents = useMemo<Components>(() => {
    return {
      p({ children }) {
        return (
          <Typography.Body className="my-3 first:mt-0 last:mb-0">
            {children}
          </Typography.Body>
        );
      },
      ul({ children }) {
        return <ul className="space-y-2 list-disc pl-5 my-4">{children}</ul>;
      },
      ol({ children }) {
        return <ol className="space-y-2 list-decimal pl-5 my-4">{children}</ol>;
      },
      li({ children }) {
        return (
          <li>
            <Typography.Body className="m-0">{children}</Typography.Body>
          </li>
        );
      },
      pre({ children }) {
        return (
          <div className="relative my-6 overflow-hidden rounded-2xl border border-border bg-muted/30">
            <div className="absolute top-0 right-0 px-3 py-1 bg-muted border-l border-b border-border rounded-bl-xl">
              <Typography.SubCaptionMedium color="secondary">
                Code
              </Typography.SubCaptionMedium>
            </div>
            <pre className="p-5 overflow-x-auto font-mono">{children}</pre>
          </div>
        );
      },
      code({ children }) {
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
            {children}
          </code>
        );
      },
      strong({ children }) {
        return <strong>{children}</strong>;
      },
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card shadow-sm overflow-hidden">
        <CardContent className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="size-4 bg-muted animate-pulse rounded" />
              <div className="h-2.5 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted animate-pulse rounded-full" />
              <div className="pl-4 space-y-2">
                <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>

          {/* Reference Approach Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="size-4 bg-muted animate-pulse rounded" />
              <div className="h-2.5 w-28 bg-muted animate-pulse rounded" />
            </div>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted animate-pulse rounded-full" />
              <div className="pl-4 space-y-3">
                <div className="h-3 w-full bg-muted animate-pulse rounded" />
                <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-5/6 bg-muted animate-pulse rounded" />
                <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-border/60 bg-card/50 shadow-none">
        <CardContent className="p-10 text-center">
          <Typography.Body color="secondary" className="italic">
            {error?.message ?? "Sample questions are currently calibrating."}
          </Typography.Body>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card shadow-sm overflow-hidden">
      <CardContent className="space-y-10">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <Typography.SubCaptionBold color="secondary">
              Generated Question
            </Typography.SubCaptionBold>
          </div>
          <VerticalSeparatorBar variant="primary">
            <Typography.Caption>{data.description}</Typography.Caption>
          </VerticalSeparatorBar>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            <Typography.SubCaptionBold color="secondary">
              Reference Approach
            </Typography.SubCaptionBold>
          </div>

          <VerticalSeparatorBar variant="green">
            <div className="max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {data.answer || "No preview content available."}
              </ReactMarkdown>
            </div>
          </VerticalSeparatorBar>
        </div>
      </CardContent>
    </Card>
  );
}
