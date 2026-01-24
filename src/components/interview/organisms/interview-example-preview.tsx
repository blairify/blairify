"use client";

import { Lightbulb, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "@/components/common/atoms/typography";
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
          <div className="relative group my-6 overflow-hidden rounded-xl border border-emerald-500/10 bg-black shadow-2xl">
            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500/5 border-l border-b border-emerald-500/10 rounded-bl-lg">
              <Typography.SubCaptionBold className="text-[9px] text-emerald-500/60 uppercase tracking-widest font-mono">
                Console
              </Typography.SubCaptionBold>
            </div>
            <pre className="p-4 sm:p-5 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed text-emerald-400/90 selection:bg-emerald-500/20 whitespace-pre">
              {children}
            </pre>
          </div>
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
      <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <Sparkles className="size-5 text-primary/40" />
          </div>
          <div className="h-5 w-32 bg-white/5 animate-pulse rounded-md" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-11/12 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-center">
        <Typography.Body className="text-gray-500 italic">
          {loadError ?? "Sample data is not available for this configuration."}
        </Typography.Body>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-primary/10 rounded-[32px] blur opacity-30 group-hover:opacity-50 transition duration-1000" />
      <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Lightbulb className="size-5" />
            </div>
            <Typography.BodyBold className="text-xl font-bold tracking-tight text-white uppercase">
              Interview Preview
            </Typography.BodyBold>
          </div>

          <div className="space-y-10">
            <section className="space-y-4" aria-label="Example Question">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-3.5 text-gray-500" />
                <Typography.SubCaptionMedium className="font-mono text-gray-500 uppercase tracking-widest">
                  Sample Question
                </Typography.SubCaptionMedium>
              </div>
              <div className="pl-6 border-l-2 border-primary/20">
                <Typography.BodyBold className="text-lg sm:text-xl text-white mb-2 block">
                  {data.description}
                </Typography.BodyBold>
              </div>
            </section>

            <section className="space-y-4" aria-label="Reference Answer">
              <Typography.SubCaptionBold className="text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Reference Response
              </Typography.SubCaptionBold>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 sm:p-8 relative overflow-hidden group/ans">
                {/* Technical Grid Accent */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

                <div className="relative z-10 prose prose-invert prose-emerald max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {data.answer || "No preview content available."}
                  </ReactMarkdown>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Holographic accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
}
