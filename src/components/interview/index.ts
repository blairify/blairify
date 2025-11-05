/**
 * Interview Components - Modular Export
 *
 * This file provides a clean export structure for all interview components.
 * Components are organized by atomic design principles:
 * - Atoms: Basic building blocks
 * - Molecules: Simple combinations of atoms
 * - Organisms: Complex UI components
 * - Templates: Page-level components
 */

// Atoms
export { InterviewBadge } from "./atoms/interview-badge";
export { TimerDisplay } from "./atoms/timer-display";
// Hooks
export { useInterviewConfig } from "./hooks/use-interview-config";
export { useInterviewSession } from "./hooks/use-interview-session";
export { useInterviewTimer } from "./hooks/use-interview-timer";
export { useSpeechRecognition } from "./hooks/use-speech-recognition";
// Molecules
export { MessageBubble } from "./molecules/message-bubble";
export { MessageInput } from "./molecules/message-input";
export { TypingIndicator } from "./molecules/typing-indicator";
// Organisms
export { InterviewCompleteCard } from "./organisms/interview-complete-card";
export { InterviewConfigScreen } from "./organisms/interview-config-screen";
export { InterviewHeader } from "./organisms/interview-header";
export { InterviewMessagesArea } from "./organisms/interview-messages-area";
// Templates
export { InterviewContent } from "./templates/interview-content";
// Types
export * from "./types";
