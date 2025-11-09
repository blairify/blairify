"use client";

import { Building2, X } from "lucide-react";
import type React from "react";
import * as SimpleIcons from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { parseFullMarkdown } from "@/lib/utils/markdown-parser";
import type { Question } from "@/types/practice-question";

interface QuestionModalProps {
  question: Question;
  onClose: () => void;
}

export function QuestionModal({ question, onClose }: QuestionModalProps) {
  const companyLogo = question.companies?.[0]?.logo;
  const CompanyIcon = companyLogo
    ? (
        SimpleIcons as Record<
          string,
          React.ComponentType<{ className?: string }>
        >
      )[companyLogo]
    : Building2;
  const FallbackIcon = CompanyIcon || Building2;

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
              <FallbackIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {question.companies?.[0]?.name || "Company"}
              </h2>
              <span className="text-sm text-muted-foreground">
                {question.topic}
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
            <div
              className="text-base text-foreground prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={parseFullMarkdown(question.prompt)}
            />
          </div>

          {/* Tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
              {question.tags.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-3 py-1 text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
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
              dangerouslySetInnerHTML={parseFullMarkdown(
                question.description ||
                  "Answer will be revealed after submission.",
              )}
            />
          </div>

          {/* Learning Resources section removed - not in current schema */}
        </div>
      </div>
    </div>
  );
}
