"use client";

import { useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "@/components/common/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InterviewConfig } from "../types";

interface InterviewExamplePreviewProps {
  config: InterviewConfig;
  onLoadingChange?: (isLoading: boolean) => void;
}

interface ExampleQuestion {
  id: string;
  title: string;
  prompt: string;
}

interface ExamplePreview {
  question: ExampleQuestion;
  answer: string;
}

type ExamplePreviewResponse =
  | {
      success: true;
      example: ExamplePreview | null;
    }
  | {
      success: false;
      error: string;
    };

export function InterviewExamplePreview({
  config,
  onLoadingChange,
}: InterviewExamplePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [example, setExample] = useState<ExamplePreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const markdownComponents = useMemo<Components>(() => {
    return {
      p({ children }) {
        return (
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line my-2 first:mt-0 last:mb-0">
            {children}
          </p>
        );
      },
      ul({ children }) {
        return <ul className="space-y-2 list-disc pl-5 my-2">{children}</ul>;
      },
      ol({ children }) {
        return <ol className="space-y-2 list-decimal pl-5 my-2">{children}</ol>;
      },
      li({ children }) {
        return (
          <li className="text-sm sm:text-base leading-relaxed">{children}</li>
        );
      },
      pre({ children }) {
        return (
          <pre className="my-2 overflow-x-auto whitespace-pre rounded-md border border-border/60 bg-muted/40 p-3 font-mono text-xs leading-relaxed">
            {children}
          </pre>
        );
      },
      code({ children }) {
        return (
          <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-[0.85em]">
            {children}
          </code>
        );
      },
      strong({ children }) {
        return <strong className="font-semibold">{children}</strong>;
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
      setExample(null);
      setLoadError(null);

      try {
        const res = await fetch("/api/interview/example-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interviewConfig: config }),
          signal: controller.signal,
        });

        const data = (await res.json()) as ExamplePreviewResponse;
        if (!res.ok) {
          if (!active) return;
          setLoadError("Failed to load example answer.");
          return;
        }

        if (!data.success) {
          if (!active) return;
          setLoadError(data.error || "Failed to load example answer.");
          return;
        }

        if (!data.example) {
          return;
        }

        if (!active) return;
        setExample(data.example);
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
      <Card>
        <CardHeader className="py-4 sm:py-5">
          <CardTitle className="text-lg sm:text-xl">Example</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="h-4 w-2/3 bg-muted rounded" />
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-11/12 bg-muted rounded" />
            <div className="h-3 w-5/6 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!example) {
    return (
      <Card>
        <CardHeader className="py-4 sm:py-5">
          <CardTitle className="text-lg sm:text-xl">Example</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Typography.Body className="text-sm sm:text-base text-muted-foreground">
            {loadError ??
              "No example answer available for this configuration yet."}
          </Typography.Body>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-4 sm:py-5">
        <CardTitle className="text-lg sm:text-xl">Example</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-5">
        <section className="space-y-2" aria-label="Example Question">
          <Typography.CaptionBold className="text-muted-foreground">
            Example Question
          </Typography.CaptionBold>
          <Typography.BodyBold className="text-sm sm:text-base">
            {example.question.title}
          </Typography.BodyBold>
          <Typography.Body className="text-sm sm:text-base text-foreground">
            {example.question.prompt}
          </Typography.Body>
        </section>

        <section
          className="space-y-2"
          aria-label="What a good answer looks like"
        >
          <Typography.CaptionBold className="text-muted-foreground">
            What a good answer looks like
          </Typography.CaptionBold>
          <div className="rounded-lg border bg-muted/30 p-3 sm:p-4">
            <div className="text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {example.answer || "Example answer unavailable."}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
