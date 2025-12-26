"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface AiFeedbackCardProps {
  icon?: ReactNode;
  title: string;
  summaryMarkdown?: string | null;
  strengths?: string[] | null;
  improvements?: string[] | null;
  detailsMarkdown?: string | null;
}

function cleanAiFeedbackList(items: string[] | null | undefined): string[] {
  return (items ?? [])
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => {
      const v = item.toLowerCase();
      if (v === "none" || v === "n/a" || v === "na") return false;
      if (v.includes("no significant strengths")) return false;
      if (v.includes("no notable strengths")) return false;
      if (v.includes("no clear strengths")) return false;
      if (v.includes("no strengths demonstrated")) return false;
      if (v.includes("none identified")) return false;
      if (v === "strengths" || v === "strengths:") return false;
      if (v === "weaknesses" || v === "weaknesses:") return false;
      if (v === "areas to improve" || v === "areas to improve:") return false;
      return true;
    });
}

function getMarkdownNodeText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getMarkdownNodeText).join("");
  if (typeof node === "object" && "props" in node) {
    const n = node as { props?: { children?: ReactNode } };
    return getMarkdownNodeText(n.props?.children);
  }
  return "";
}

function normalizeAiFeedbackMarkdown(markdown: string): string {
  const trimmed = markdown
    .replace(/\r\n?/g, "\n")
    .replace(/\u00A0/g, " ")
    .trim();
  if (trimmed.length === 0) return "";

  const ensureHeadingOnNewLine = trimmed
    .replace(
      /([^\n])\s*(\*\*[A-Z][A-Z\s/&-]{3,}\s+(?:Strengths|Weaknesses):\*\*)/g,
      "$1\n$2",
    )
    .replace(
      /([^\n])\s*(\*\*[A-Z][A-Z\s/&-]{3,}\s+(?:Strengths|Weaknesses)\*\*:)/g,
      "$1\n$2",
    )
    .replace(
      /([^\n])\s*([A-Z][A-Z\s/&-]{3,}\s+(?:Strengths|Weaknesses):)/g,
      "$1\n$2",
    );

  const structuredHeadings = ensureHeadingOnNewLine
    .replace(
      /^\s*\*\*([A-Z][A-Z\s/&-]{3,})\s+(Strengths|Weaknesses):\*\*\s*(.*)$/gm,
      (_, category: string, kind: string, rest: string) => {
        const tail = rest.trim();
        if (tail.length === 0) return `### ${category.trim()}\n#### ${kind}`;
        return `### ${category.trim()}\n#### ${kind}\n${tail}`;
      },
    )
    .replace(
      /^\s*\*\*([A-Z][A-Z\s/&-]{3,})\s+(Strengths|Weaknesses)\*\*:\s*(.*)$/gm,
      (_, category: string, kind: string, rest: string) => {
        const tail = rest.trim();
        if (tail.length === 0) return `### ${category.trim()}\n#### ${kind}`;
        return `### ${category.trim()}\n#### ${kind}\n${tail}`;
      },
    )
    .replace(
      /^\s*([A-Z][A-Z\s/&-]{3,})\s+(Strengths|Weaknesses):\s*(.*)$/gm,
      (_, category: string, kind: string, rest: string) => {
        const tail = rest.trim();
        if (tail.length === 0) return `### ${category.trim()}\n#### ${kind}`;
        return `### ${category.trim()}\n#### ${kind}\n${tail}`;
      },
    )
    .replace(
      /^(Critical\s+(?:Weaknesses|Knowledge\s+Gaps|Red\s+Flags|Strengths)):\s*$/gim,
      "### $1",
    );

  const withSpacing = structuredHeadings.replace(
    /\n(?=[A-Za-z][A-Za-z\s/]{2,40}:\s)/g,
    "\n\n",
  );

  const bulletized = withSpacing
    .replace(
      /^\*\*(?![A-Z][A-Z\s]{6,})((?:[^*\n]){2,80})\*\*:\s+(.+)$/gm,
      "- $1: $2",
    )
    .replace(
      /^(?![A-Z][A-Z\s]{6,}:)([A-Za-z][A-Za-z\s/]{2,80}):\s+(.+)$/gm,
      "- $1: $2",
    );

  const unboldLabels = bulletized.replace(
    /^-\s+\*\*([^*\n]{2,80})\*\*:\s+/gm,
    "- $1: ",
  );

  const normalizeStrengthWeaknessLabels = unboldLabels
    .replace(/^\s*\*\*(Strenghts|Strengths)(?::)?\*\*:?\s*$/gim, "Strengths:")
    .replace(
      /^\s*\*\*(Critical\s+Weaknesses|Weaknesses)(?::)?\*\*:?\s*$/gim,
      "Weaknesses:",
    )
    .replace(/^#{3,4}\s*Strengths\s*:?\s*$/gim, "Strengths:")
    .replace(/^#{3,4}\s*Strenghts\s*:?\s*$/gim, "Strengths:")
    .replace(/^#{3,4}\s*Critical\s+Weaknesses\s*:?\s*$/gim, "Weaknesses:")
    .replace(/^#{3,4}\s*Weaknesses\s*:?\s*$/gim, "Weaknesses:");

  const ensureLabelsStandalone = normalizeStrengthWeaknessLabels.replace(
    /([^\n])\s+(Strengths|Weaknesses):\s*/gi,
    "$1\n\n$2:\n",
  );

  const sectionized = ensureLabelsStandalone.replace(
    /^([A-Z][A-Z\s]{6,}):\s*$/gm,
    "### $1",
  );

  const boldCapsOnlyHeadings = sectionized.replace(
    /^\s*\*\*([A-Z][A-Z\s]{6,})\*\*\s*$/gm,
    "### $1",
  );

  const capsOnlyHeadings = boldCapsOnlyHeadings.replace(
    /^([A-Z][A-Z\s]{6,})\s*$/gm,
    "### $1",
  );

  const splitCapsHeading = capsOnlyHeadings.replace(
    /^([A-Z][A-Z\s]{6,})\s+([^\n]+)$/gm,
    "### $1\n$2",
  );

  const withSectionRules = splitCapsHeading
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\n(?=###\s)/g, "\n\n---\n\n")
    .replace(/(\n\s*---\s*\n){2,}/g, "\n\n---\n\n")
    .replace(/\n\s*---\s*\n\s*$/g, "\n")
    .replace(/\n\s*---\s*$/g, "");

  return withSectionRules;
}

function trimMarkdownRuleEdges(value: string): string {
  return value
    .replace(/^(?:\s*---\s*(?:\n|$))+/g, "")
    .replace(/(?:^|\n)\s*---\s*\s*$/g, "")
    .trim();
}

function collapseMarkdownRules(value: string): string {
  return value.replace(/(\n\s*---\s*\n\s*){2,}/g, "\n\n---\n\n").trim();
}

export function AiFeedbackCard({
  icon,
  title,
  summaryMarkdown,
  strengths,
  improvements: _improvements,
  detailsMarkdown,
}: AiFeedbackCardProps) {
  const hasSummary =
    typeof summaryMarkdown === "string" && summaryMarkdown.trim().length > 0;

  const cleanedStrengths = useMemo(
    () => cleanAiFeedbackList(strengths),
    [strengths],
  );

  const hasStrengths = cleanedStrengths.length > 0;

  const normalizedSummary = useMemo(() => {
    if (!hasSummary) return null;
    return normalizeAiFeedbackMarkdown(summaryMarkdown ?? "");
  }, [hasSummary, summaryMarkdown]);

  const normalizedDetails = useMemo(() => {
    const d = detailsMarkdown?.trim();
    if (!d || d.length === 0) return null;
    return normalizeAiFeedbackMarkdown(d);
  }, [detailsMarkdown]);

  const normalizedSummaryForRender = useMemo(() => {
    if (!normalizedSummary) return null;
    if (!normalizedDetails) return collapseMarkdownRules(normalizedSummary);
    return collapseMarkdownRules(trimMarkdownRuleEdges(normalizedSummary));
  }, [normalizedDetails, normalizedSummary]);

  const normalizedDetailsForRender = useMemo(() => {
    if (!normalizedDetails) return null;
    if (!normalizedSummary) return collapseMarkdownRules(normalizedDetails);
    return collapseMarkdownRules(trimMarkdownRuleEdges(normalizedDetails));
  }, [normalizedDetails, normalizedSummary]);

  const markdownComponents = useMemo<Components>(() => {
    return {
      h1({ children }) {
        return (
          <div className="text-sm font-semibold tracking-tight !text-gray-950 dark:!text-gray-50 mb-2">
            {children}
          </div>
        );
      },
      h2({ children }) {
        return (
          <div className="text-sm font-semibold tracking-tight !text-gray-950 dark:!text-gray-50 mb-2">
            {children}
          </div>
        );
      },
      h3({ children }) {
        return (
          <div className="pt-3">
            <div className="text-sm font-semibold tracking-tight !text-gray-950 dark:!text-gray-50">
              {children}
            </div>
          </div>
        );
      },
      h4({ children }) {
        return (
          <div className="pt-1 pb-0">
            <div className="text-sm font-medium tracking-tight !text-gray-950 dark:!text-gray-50">
              {children}
            </div>
          </div>
        );
      },
      p({ children }) {
        const label = (() => {
          const normalized = getMarkdownNodeText(children)
            .trim()
            .replace(/\s+/g, " ");
          if (/^(Strenghts|Strengths):?$/i.test(normalized))
            return "Strengths:";
          if (/^(Critical\s+Weaknesses|Weaknesses):?$/i.test(normalized)) {
            return "Weaknesses:";
          }
          return null;
        })();

        if (label) {
          return (
            <div className="mt-2 mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </div>
          );
        }

        const labelInfo = (() => {
          const text = getMarkdownNodeText(children)
            .trim()
            .replace(/\s+/g, " ");
          const match = /^([A-Za-z][A-Za-z\s/]{2,40}):\s*(.+)$/.exec(text);
          if (!match) return null;
          const [, labelText, valueText] = match;
          return { labelText, valueText };
        })();

        if (labelInfo) {
          return (
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-line my-2">
              <span className="text-gray-900 dark:text-gray-100 font-semibold">
                {labelInfo.labelText}:
              </span>{" "}
              <span className="text-gray-500 dark:text-gray-400">
                {labelInfo.valueText}
              </span>
            </p>
          );
        }

        return (
          <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 whitespace-pre-line my-2">
            {children}
          </p>
        );
      },
      ul({ children }) {
        return (
          <ul className="space-y-2 list-disc pl-5 mt-1 mb-2">{children}</ul>
        );
      },
      ol({ children }) {
        return (
          <ol className="space-y-2 list-decimal pl-5 mt-1 mb-2">{children}</ol>
        );
      },
      li({ children }) {
        return (
          <li className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {children}
          </li>
        );
      },
      strong({ children }) {
        return <strong className="font-normal">{children}</strong>;
      },
      hr() {
        return <Separator className="my-4" />;
      },
    };
  }, []);

  return (
    <Card className="border shadow-md">
      <CardHeader className="px-3 pt-1 pb-0">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold leading-none">
          {icon ? <span className="text-primary">{icon}</span> : null}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pt-0 pb-3 space-y-6">
        {normalizedSummaryForRender && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {normalizedSummaryForRender}
          </ReactMarkdown>
        )}

        {normalizedDetailsForRender && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {normalizedDetailsForRender}
          </ReactMarkdown>
        )}

        {hasStrengths && (
          <div className="rounded-lg border border-border/60 bg-card/50 p-4">
            <div className="text-sm font-semibold mb-3">Strengths</div>
            <ul className="space-y-2">
              {cleanedStrengths.map((item, idx) => (
                <li
                  key={`${idx}-${item}`}
                  className="text-sm text-muted-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
