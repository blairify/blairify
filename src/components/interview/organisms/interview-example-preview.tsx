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

interface InterviewExamplePreviewProps {
  config: InterviewConfig;
  onLoadingChange?: (isLoading: boolean) => void;
}

type ExampleData = {
  description: string;
  answer: string;
};

type ApiResponse = {
  success: boolean;
  example?: {
    question: { description: string };
    answer: string;
  } | null;
  error?: string;
};

// SWR fetcher function
const fetcher = async (
  url: string,
  config: InterviewConfig,
): Promise<ExampleData> => {
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
    throw new Error("No example data available.");
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
  // SWR hook for fetching example data
  const { data, error, isLoading } = useSWR(
    ["/api/interview/example-preview", config],
    ([url, config]) => fetcher(url, config),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
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
          <p className="text-sm leading-relaxed my-3 first:mt-0 last:mb-0">
            {children}
          </p>
        );
      },
      ul({ children }) {
        return <ul className="space-y-2 list-disc pl-5 my-4">{children}</ul>;
      },
      ol({ children }) {
        return <ol className="space-y-2 list-decimal pl-5 my-4">{children}</ol>;
      },
      li({ children }) {
        return <li className="text-sm leading-relaxed">{children}</li>;
      },
      pre({ children }) {
        return (
          <div className="relative my-6 overflow-hidden rounded-2xl border border-border bg-muted/30">
            <div className="absolute top-0 right-0 px-3 py-1 bg-muted border-l border-b border-border rounded-bl-xl">
              <Typography.Caption className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Code
              </Typography.Caption>
            </div>
            <pre className="p-5 overflow-x-auto font-mono text-sm leading-relaxed">
              {children}
            </pre>
          </div>
        );
      },
      code({ children }) {
        return (
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] font-semibold text-primary">
            {children}
          </code>
        );
      },
      strong({ children }) {
        return (
          <strong className="font-bold text-foreground">{children}</strong>
        );
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
          <Typography.Body className="text-muted-foreground italic">
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
            <Typography.CaptionBold className="uppercase tracking-widest text-[10px] text-muted-foreground">
              Generated Question
            </Typography.CaptionBold>
          </div>
          <VerticalSeparatorBar variant="primary">
            <Typography.Caption>{data.description}</Typography.Caption>
          </VerticalSeparatorBar>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            <Typography.CaptionBold className="uppercase tracking-widest text-[10px] text-muted-foreground">
              Reference Approach
            </Typography.CaptionBold>
          </div>

          <VerticalSeparatorBar variant="green">
            <div className="prose prose-sm dark:prose-invert max-w-none">
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
