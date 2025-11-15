import { Loader2, Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  isListening: boolean;
  isPaused: boolean;
  isLoading: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  onStartVoice,
  onStopVoice,
  isListening,
  isPaused,
  isLoading,
}: MessageInputProps) {
  const MAX_CHARS = 2000;
  const charCount = value.length;
  const hasContent = value.trim().length > 0;
  const isNearLimit = charCount > MAX_CHARS * 0.8;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {(isPaused || isListening || isLoading) && (
        <div className="mb-3 flex items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-full text-sm font-medium">
            {isPaused && (
              <>
                <span className="size-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-orange-600 dark:text-orange-400">
                  Interview Paused
                </span>
              </>
            )}
            {isListening && (
              <>
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-600 dark:text-green-400">
                  Listening... Speak now
                </span>
              </>
            )}
            {isLoading && (
              <>
                <Loader2 className="size-4 animate-spin text-blue-600" />
                <span className="text-blue-600 dark:text-blue-400">
                  AI is thinking...
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-end gap-2 p-3">
          <div className="flex-1 relative">
            <Textarea
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= MAX_CHARS) {
                  onChange(newValue);
                }
              }}
              maxLength={MAX_CHARS}
              placeholder={
                isPaused
                  ? "Interview is paused. Resume to continue..."
                  : isLoading
                    ? "Waiting for AI response..."
                    : "Message AI interviewer..."
              }
              className="min-h-10 max-h-80 resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  hasContent &&
                  !isPaused &&
                  !isLoading
                ) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={isPaused || isLoading}
              rows={1}
              style={{
                height: "auto",
                minHeight: "40px",
                lineHeight: "1.5",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                const newHeight = Math.min(
                  Math.max(target.scrollHeight, 40),
                  160,
                );
                target.style.height = `${newHeight}px`;

                if (target.scrollHeight > 160) {
                  target.scrollTop = target.scrollHeight - target.clientHeight;
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={isListening ? onStopVoice : onStartVoice}
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              disabled={isPaused || isLoading}
              className={`size-9 p-0 rounded-full transition-all duration-200 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg"
                  : "hover:bg-muted border-2 hover:border-primary/50"
              }`}
              aria-label={
                isListening ? "Stop voice input" : "Start voice input"
              }
              title={
                isListening
                  ? "Stop voice input (Click to stop)"
                  : "Start voice input (Click and speak)"
              }
            >
              {isListening ? (
                <MicOff className="size-4" />
              ) : (
                <Mic className="size-4" />
              )}
            </Button>
            <Button
              onClick={onSend}
              disabled={!hasContent || isPaused || isLoading || isOverLimit}
              size="sm"
              className={`size-8 p-0 rounded-lg transition-all ${
                hasContent && !isPaused && !isLoading && !isOverLimit
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              aria-label={
                !hasContent
                  ? "Type a message first"
                  : isOverLimit
                    ? "Message too long"
                    : isPaused
                      ? "Resume interview to send"
                      : "Send message"
              }
              title={
                !hasContent
                  ? "Type a message first"
                  : isOverLimit
                    ? `Message too long (${charCount}/${MAX_CHARS} characters)`
                    : isPaused
                      ? "Resume interview to send"
                      : "Send message"
              }
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {(charCount > 0 || hasContent) && (
          <div className="px-3 pb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {charCount > 0 && (
              <span
                className={
                  isOverLimit
                    ? "text-red-600 font-semibold"
                    : isNearLimit
                      ? "text-orange-600 font-medium"
                      : ""
                }
              >
                {charCount}/{MAX_CHARS}
                {isOverLimit && " - Too long!"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
