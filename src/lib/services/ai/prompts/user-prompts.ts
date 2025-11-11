/**
 * User Prompt Generation
 * Functions for generating user-facing prompts during interviews
 */

import type { InterviewerProfile } from "@/lib/config/interviewers";
import type { InterviewConfig, Message } from "@/types/interview";
import { isUnknownResponse } from "../response-validator";
import { extractCoveredTopics } from "./utils";

/**
 * Generate demo mode user prompt
 */
export function generateDemoUserPrompt(
  userMessage: string,
  conversationHistory: Message[],
  questionCount: number,
): string {
  if (conversationHistory.length === 0) {
    return `This is the start of a demo session. Ask a simple, friendly introductory question that helps the user get comfortable with the system. Something like asking about their interests in tech or what they'd like to learn. Keep it very casual and non-intimidating.`;
  }

  if (questionCount < 2) {
    return `The user just responded: "${userMessage}"

Ask a casual follow-up question that keeps the conversation flowing. This is still demo mode, so keep it light and conversational. Maybe ask about their experience level or what type of role they're interested in.`;
  }

  return `The user just responded: "${userMessage}"

This should be the final demo question. Ask something fun and encouraging that wraps up the demo nicely, like asking about their career goals or what they found interesting about the demo. Then let them know the demo is wrapping up.`;
}

/**
 * Generate first question prompt
 */
export function generateFirstQuestionPrompt(
  config: InterviewConfig,
  interviewer?: InterviewerProfile,
): string {
  const interviewerName = interviewer?.name || "the interviewer";

  if (config.contextType === "job-specific" && config.company) {
    return `This is the start of a ${config.interviewType} interview for a ${config.position} position at ${config.company}. Introduce yourself as ${interviewerName} and briefly mention your background, then ask the first question that's specifically tailored to this job opportunity and the requirements mentioned in the job context. Remember: Do NOT prefix your response with "${interviewerName}:" or wrap it in quotes. Your name should be part of your natural introduction (e.g., "Hi! I'm ${interviewerName}, and I've been...")`;
  }

  return `This is the start of a ${config.interviewType} interview. Introduce yourself as ${interviewerName} and briefly mention your background, then ask the first question appropriate for a ${config.seniority}-level ${config.position} position. Remember: Do NOT prefix your response with "${interviewerName}:" or wrap it in quotes. Your name should be part of your natural introduction (e.g., "Hi! I'm ${interviewerName}, and I've been...")`;
}

/**
 * Generate follow-up question prompt
 */
export function generateFollowUpPrompt(userMessage: string): string {
  return `The candidate just responded: "${userMessage}"

Based on their response, ask a thoughtful follow-up question that digs deeper into their understanding or asks them to elaborate on a specific aspect. Keep it related to the current topic.`;
}

/**
 * Generate prompt for unknown/skipped responses
 */
export function generateUnknownResponsePrompt(
  userMessage: string,
  config: InterviewConfig,
  questionCount: number,
): string {
  return `The candidate responded: "${userMessage}"

The candidate indicated they don't know the answer or skipped the question. Acknowledge this professionally and move to the next question. Ask a different ${config.interviewType} question appropriate for a ${config.seniority}-level ${config.position} position that covers a different topic area. 

Be encouraging and supportive - it's normal not to know everything. Consider asking about a topic they might be more familiar with based on the conversation so far.

This is question ${questionCount + 1} of the interview.`;
}

/**
 * Generate next question prompt
 */
export function generateNextQuestionPrompt(
  userMessage: string,
  conversationHistory: Message[],
  config: InterviewConfig,
  questionCount: number,
): string {
  const recentContext = conversationHistory
    .slice(-6)
    .map(
      (msg) =>
        `${msg.type === "ai" ? "Interviewer" : "Candidate"}: ${msg.content}`,
    )
    .join("\n");

  const coveredTopics = extractCoveredTopics(conversationHistory);

  return `The candidate's previous response was: "${userMessage}"

This is question ${questionCount + 1} of the interview. Please ask the next ${config.interviewType} question appropriate for a ${config.seniority}-level ${config.position} position.

⚠️ CRITICAL - AVOID REPETITION:
Topics/concepts already covered: ${coveredTopics.length > 0 ? coveredTopics.join(", ") : "none yet"}

DO NOT ask about these topics again. Instead, explore NEW areas such as:
- Different technical concepts or tools
- Alternative problem-solving scenarios
- Different aspects of the development lifecycle
- Various architectural patterns or design principles
- Different performance or optimization challenges
- Security, testing, or deployment topics not yet covered
- Team collaboration, code review, or best practices
- Real-world debugging or troubleshooting scenarios

Recent conversation:
${recentContext}

Your next question MUST be completely different from previous questions. Vary the question type (scenario-based, conceptual, practical, comparison, problem-solving). Make it specific and relevant to ${config.position} role.`;
}

/**
 * Generate user prompt based on interview context
 */
export function generateUserPrompt(
  userMessage: string,
  conversationHistory: Message[],
  config: InterviewConfig,
  questionCount: number,
  isFollowUp: boolean,
  interviewer?: InterviewerProfile,
): string {
  if (config.isDemoMode) {
    return generateDemoUserPrompt(
      userMessage,
      conversationHistory,
      questionCount,
    );
  }

  if (conversationHistory.length === 0) {
    return generateFirstQuestionPrompt(config, interviewer);
  }

  if (isFollowUp) {
    return generateFollowUpPrompt(userMessage);
  }

  const isUnknown = isUnknownResponse(userMessage);

  if (isUnknown) {
    return generateUnknownResponsePrompt(userMessage, config, questionCount);
  }

  return generateNextQuestionPrompt(
    userMessage,
    conversationHistory,
    config,
    questionCount,
  );
}
