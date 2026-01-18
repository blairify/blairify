"use client";

import { useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  markdown: string;
  className?: string;
  components?: Components;
}

export function MarkdownContent({
  markdown,
  className,
  components,
}: MarkdownContentProps) {
  const defaultComponents = useMemo<Components>(() => {
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

  const resolvedComponents = components ?? defaultComponents;

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={resolvedComponents}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
