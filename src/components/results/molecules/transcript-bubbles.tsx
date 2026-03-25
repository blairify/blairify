"use client";

import { Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import {
  qaQuestionMarkdownComponents,
  readableMarkdownComponents,
} from "@/components/results/atoms/result-markdown-renderers";
import type { InterviewerProfile } from "@/lib/config/interviewers";

interface InterviewerBubbleProps {
  interviewer: InterviewerProfile;
  markdown: string;
}

export function InterviewerBubble({
  interviewer,
  markdown,
}: InterviewerBubbleProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 mt-1">
        <InterviewerAvatar interviewer={interviewer} size={32} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
          <span>{interviewer.name}</span>
          <span className="size-1 rounded-full bg-border" aria-hidden="true" />
          <span>Interviewer</span>
        </div>
        <div className="p-4 rounded-2xl rounded-tl-none bg-muted/30 border border-border/40">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={qaQuestionMarkdownComponents}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

interface CandidateBubbleProps {
  displayInitial: string;
  markdown: string;
}

export function CandidateBubble({
  displayInitial,
  markdown,
}: CandidateBubbleProps) {
  return (
    <div className="flex flex-row-reverse gap-4">
      <div className="flex-shrink-0 mt-1">
        <div className="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
          {displayInitial}
        </div>
      </div>
      <div className="flex-1 space-y-2 text-right">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Your Response
        </div>
        <div className="p-4 rounded-2xl rounded-tr-none bg-primary/[0.03] border border-primary/10 text-left">
          <div className="whitespace-pre-line text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={readableMarkdownComponents}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ExampleAnswerCardProps {
  markdown: string;
}

export function ExampleAnswerCard({ markdown }: ExampleAnswerCardProps) {
  return (
    <div className="pl-12 pt-2">
      <div className="p-4 rounded-xl border-l-2 border-primary/30 bg-primary/5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-primary">
          <Lightbulb className="size-3.5" aria-hidden="true" />
          Suggested Best Practice Answer:
        </div>
        <div className="text-sm leading-relaxed text-muted-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={readableMarkdownComponents}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
