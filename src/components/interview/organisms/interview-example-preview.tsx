"use client";

import { Lightbulb, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "@/components/common/atoms/typography";
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

export function InterviewExamplePreview({
  config,
  onLoadingChange,
}: InterviewExamplePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ExampleData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    const load = async () => {
      if (!active) return;
      setIsLoading(true);
      onLoadingChange?.(true);
      setData(null);
      setLoadError(null);

      try {
        const res = await fetch("/api/interview/example-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewConfig: config }),
          signal: controller.signal,
        });

        const payload = (await res.json()) as ApiResponse;
        if (!res.ok) {
          if (!active) return;
          setLoadError("Failed to load example answer.");
          return;
        }

        if (!payload.success) {
          if (!active) return;
          setLoadError(payload.error || "Failed to load example answer.");
          return;
        }

        if (!payload.example) {
          return;
        }

        if (!active) return;
        setData({
          description: payload.example.question.description,
          answer: payload.example.answer,
        });
      } catch {
        if (!active) return;
        setLoadError("Failed to load example answer.");
      } finally {
        if (active) {
          setIsLoading(false);
          onLoadingChange?.(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [config, onLoadingChange]);

  if (isLoading) {
    return (
      <Card className="border-border/60 bg-card/50 shadow-none">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted animate-pulse">
              <Sparkles className="size-5 text-muted-foreground/20" />
            </div>
            <div className="h-6 w-40 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="space-y-4">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
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
            {loadError ?? "Sample questions are currently calibrating."}
          </Typography.Body>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card shadow-sm overflow-hidden">
      <CardContent className="space-y-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            <Typography.CaptionBold className="uppercase tracking-widest text-[10px] text-muted-foreground">
              Generated Question
            </Typography.CaptionBold>
          </div>
          <div className="pl-6 border-l-4 border-primary/20">
            <Typography.Caption>{data.description}</Typography.Caption>
          </div>
        </div>

        {/* Reference Answer Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-amber-500" />
            <Typography.CaptionBold className="uppercase tracking-widest text-[10px] text-muted-foreground">
              Reference Approach
            </Typography.CaptionBold>
          </div>

          <div className="relative rounded-sm bg-muted/20 p-8">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {data.answer || "No preview content available."}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
