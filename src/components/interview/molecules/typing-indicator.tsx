import { InterviewerAvatar } from "@/components/common/interviewer-avatar";
import type { InterviewerProfile } from "@/lib/config/interviewers";

interface TypingIndicatorProps {
  interviewer: InterviewerProfile;
}

export function TypingIndicator({ interviewer }: TypingIndicatorProps) {
  return (
    <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 ring-2 ring-primary/20 rounded-full overflow-hidden">
        <InterviewerAvatar interviewer={interviewer} size={40} />
      </div>
      <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2 h-2 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
}
