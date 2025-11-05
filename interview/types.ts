/**
 * Shared types for interview components
 * Re-export main types and add component-specific types
 */

export type {
  InterviewConfig,
  InterviewMode,
  InterviewSession,
  InterviewType,
  Message,
  QuestionType,
  SeniorityLevel,
} from "@/types/interview";

// Type definitions for Speech Recognition API
export interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}
