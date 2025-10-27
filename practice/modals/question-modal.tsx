"use client";

import { BookOpen, ExternalLink, X } from "lucide-react";
import type React from "react";
import * as SimpleIcons from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PracticeQuestion } from "@/lib/services/practice-questions/practice-questions-service";

// Simple markdown renderer with XSS protection
function renderMarkdown(text: string | null | undefined): { __html: string } {
  if (!text) return { __html: "" };

  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  let html = escapeHtml(text)
    .replace(
      /^### (.*$)/gim,
      '</p><h3 class="text-lg font-bold mt-6 mb-2">$1</h3><p class="mt-2">',
    )
    .replace(
      /^## (.*$)/gim,
      '</p><h2 class="text-xl font-bold mt-6 mb-3">$1</h2><p class="mt-2">',
    )
    .replace(
      /^# (.*$)/gim,
      '</p><h1 class="text-2xl font-bold mt-6 mb-4">$1</h1><p class="mt-2">',
    )
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(
      /```([\s\S]*?)```/g,
      '</p><pre class="bg-muted p-4 rounded-lg my-3 overflow-x-auto"><code class="text-sm font-mono">$1</code></pre><p class="mt-2">',
    )
    .replace(
      /`(.*?)`/g,
      '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>',
    )
    .replace(
      /\[([^\]]+)\]$$([^\s)]+)(?:\s+"([^"]+)")?$$/g,
      (text: string, href: string, title?: string) => {
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
        return `<a href="${escapeHtml(href)}" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer"${titleAttr}>${escapeHtml(text)}</a>`;
      },
    )
    .replace(/^\s*\* (.*$)/gm, '<li class="ml-6 list-disc">$1</li>')
    .replace(/^\s*\d+\. (.*$)/gm, '<li class="ml-6 list-decimal">$1</li>')
    .replace(
      /^> (.*$)/gm,
      '</p><blockquote class="border-l-4 border-border pl-4 my-2 text-muted-foreground">$1</blockquote><p>',
    )
    .replace(/^\*\*\*$/gm, '<hr class="my-4 border-border" />')
    .replace(/\n\n+/g, '</p><p class="mt-4">')
    .replace(/\n/g, "<br />");

  if (
    !html.startsWith("<h") &&
    !html.startsWith("<p>") &&
    !html.startsWith("<ul>") &&
    !html.startsWith("<ol>") &&
    !html.startsWith("<pre>")
  ) {
    html = `<p>${html}`;
  }
  if (
    !html.endsWith("</p>") &&
    !html.endsWith("</h1>") &&
    !html.endsWith("</h2>") &&
    !html.endsWith("</h3>") &&
    !html.endsWith("</ul>") &&
    !html.endsWith("</ol>") &&
    !html.endsWith("</pre>")
  ) {
    html = `${html}</p>`;
  }

  return { __html: html };
}

interface QuestionModalProps {
  question: PracticeQuestion;
  onClose: () => void;
}

export function QuestionModal({ question, onClose }: QuestionModalProps) {
  const CompanyIcon =
    (
      SimpleIcons as Record<string, React.ComponentType<{ className?: string }>>
    )[question.companyLogo] || SimpleIcons.SiApple;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200">
      <div className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl ring-2 ring-primary/20">
              <CompanyIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {question.companyLogo?.replace("Si", "") || "Company"}
              </h2>
              <span className="text-sm text-muted-foreground capitalize">
                {question.category.replace("-", " ")}
              </span>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-foreground">
                Question
              </h3>
              <Badge
                variant="outline"
                className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(question.difficulty)}`}
              >
                {question.difficulty.toUpperCase()}
              </Badge>
            </div>
            <h2
              className="text-xl font-bold text-foreground mb-4 prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={renderMarkdown(question.title)}
            />
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90"
              dangerouslySetInnerHTML={renderMarkdown(question.question)}
            />
          </div>

          {/* Tags */}
          {question.topicTags && question.topicTags.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-xl border border-border/50">
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-label="Related Topics"
                >
                  <title>Related Topics</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Related Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {question.topicTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="px-3 py-1 text-xs font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Answer */}
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-label="Answer"
              >
                <title>Answer</title>

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Answer
            </h3>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground/90"
              dangerouslySetInnerHTML={renderMarkdown(question.answer)}
            />
          </div>

          {/* Learning Resources */}
          {question.learningResources &&
            question.learningResources.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Learning Resources
                </h4>
                <div className="space-y-2">
                  {question.learningResources.map((resource) => (
                    <a
                      key={resource.url}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all group"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mt-1">
                          {resource.type}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
