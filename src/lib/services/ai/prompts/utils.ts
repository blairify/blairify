/**
 * Prompt Generation Utilities
 * Helper functions for prompt generation
 */

import type { Message } from "@/types/interview";

/**
 * Extract topics that have been covered in the conversation
 */
export function extractCoveredTopics(conversationHistory: Message[]): string[] {
  const topics = new Set<string>();

  // Analyze AI messages (questions) to extract topics
  conversationHistory
    .filter((msg) => msg.type === "ai")
    .forEach((msg) => {
      const content = msg.content.toLowerCase();

      // Extract common technical topics from questions
      const topicPatterns = [
        // Languages
        /\b(javascript|typescript|python|java|c\+\+|c#|go|rust|php|ruby|swift|kotlin|html|css)\b/g,
        // Frameworks & Libraries
        /\b(react|vue|angular|express|django|flask|spring|laravel|rails|next\.?js|nuxt|jquery|bootstrap|tailwind)\b/g,
        // Databases
        /\b(mongodb|postgresql|mysql|redis|cassandra|elasticsearch|dynamodb|sql|nosql)\b/g,
        // Cloud/DevOps
        /\b(aws|azure|gcp|docker|kubernetes|terraform|jenkins|github actions|ci\/cd|deployment)\b/g,
        // Concepts & Patterns
        /\b(algorithms?|data structures?|system design|concurrency|async|promises?|callbacks?|closures?|prototypes?|inheritance|polymorphism)\b/g,
        // Web Technologies
        /\b(dom|api|rest|restful|graphql|http|https|websockets?|jwt|oauth|cors|ajax)\b/g,
        // Architecture & Design
        /\b(microservices|serverless|monolith|scalability|performance|optimization|security|testing|debugging|refactoring)\b/g,
        // Specific Question Types
        /\b(optimize|debug|design|implement|explain|difference|compare|handle|manage|build|create)\b/g,
        // Problem Areas
        /\b(memory leak|performance issue|bug|error handling|state management|caching|authentication|authorization)\b/g,
      ];

      topicPatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            topics.add(match);
          });
        }
      });

      // Extract question topics from common question starters
      const questionStarters = [
        "experience with",
        "how would you",
        "explain",
        "difference between",
        "what is",
        "how does",
        "when would you",
        "can you walk me through",
        "tell me about",
        "have you worked with",
        "what's your approach to",
      ];

      questionStarters.forEach((starter) => {
        if (content.includes(starter)) {
          // Extract the topic that follows the starter
          const startIndex = content.indexOf(starter) + starter.length;
          const remainingText = content.substring(startIndex, startIndex + 50);
          const words = remainingText.split(/\s+/).slice(0, 3).join(" ");
          if (words.length > 3) {
            topics.add(words.trim());
          }
        }
      });
    });

  return Array.from(topics);
}
