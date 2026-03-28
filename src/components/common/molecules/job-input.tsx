"use client";

import { ArrowUp, Loader2 } from "lucide-react";

type InputFlow = "url" | "description" | "custom" | "unknown" | "unsupported";

const SUPPORTED_JOB_BOARDS = [
  "https://justjoin.it/job-offer",
  "indeed.com",
  "https://www.linkedin.com/jobs/",
  "https://www.google.com/about/careers",
  "https://www.ziprecruiter",
  "https://www.flexjobs.com/",
] as const;

function isSupportedJobBoard(url: string): boolean {
  const lower = url.toLowerCase();
  return SUPPORTED_JOB_BOARDS.some((board) =>
    lower.includes(board.toLowerCase()),
  );
}

function detectInputFlow(input: string): InputFlow {
  const trimmed = input.trim();
  if (!trimmed) return "unknown";

  if (trimmed.toLowerCase() === "/custom") return "custom";
  if (/^https:\/\//i.test(trimmed)) {
    return isSupportedJobBoard(trimmed) ? "url" : "unsupported";
  }
  if (trimmed.length >= 50) return "description";

  return "unknown";
}

export interface JobInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (flow: InputFlow) => void;
  placeholder?: string;
  isLoading?: boolean;
  size?: "default" | "large";
  "aria-label"?: string;
}

export function JobInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Paste job URL, description, or type /custom",
  isLoading = false,
  size = "default",
  "aria-label": ariaLabel = "Job URL, description, or custom command",
}: JobInputProps) {
  const flow = detectInputFlow(value);
  const canSubmit = flow !== "unknown" && flow !== "unsupported";

  const handleSubmit = () => {
    if (!canSubmit || isLoading) return;
    onSubmit(flow);
  };

  const sizeClasses = {
    default: {
      textarea: "px-5 pt-4 pb-14 text-base",
      rows: 2,
    },
    large: {
      textarea: "px-6 pt-5 pb-16 text-base",
      rows: 4,
    },
  };

  const { textarea: textareaClasses, rows } = sizeClasses[size];

  return (
    <div className="w-full">
      <div
        className={`relative rounded-3xl border-2 transition-all ${
          canSubmit
            ? "border-primary"
            : "border-primary/40 focus-within:border-primary/50"
        }`}
      >
        {/* Animated glow effect - only on edges */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
          style={{ padding: "1px" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, orange-500/40, transparent, orange-500/40, transparent)",
              animation: "rotate 3s linear infinite",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMask:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "2px",
            }}
          />
        </div>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`relative w-full bg-transparent text-gray-900 dark:text-gray-50 placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none focus:outline-none ${textareaClasses}`}
          aria-label={ariaLabel}
          disabled={isLoading}
        />

        {/* Bottom bar */}
        <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between z-10">
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-xs min-h-[20px]">
            {flow === "url" && (
              <span className="text-green-500">✓ Supported job board</span>
            )}
            {flow === "description" && (
              <span className="text-green-500">✓ Job description detected</span>
            )}
            {flow === "custom" && (
              <span className="text-primary">→ Custom setup</span>
            )}
            {flow === "unsupported" && (
              <span className="text-red-500">
                ⚠ Unsupported job board - paste description instead
              </span>
            )}
            {flow === "unknown" && value.trim() && (
              <span className="text-zinc-500">
                Paste URL or description (50+ chars)
              </span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className="size-10 rounded-full bg-primary flex items-center justify-center transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Start interview"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { InputFlow };
export { detectInputFlow, isSupportedJobBoard, SUPPORTED_JOB_BOARDS };
