/**
 * Question Prompt Generation
 * Functions for generating database question prompts
 */

import type { InterviewConfig } from "@/types/interview";
import { CATEGORY_DESCRIPTION, DIFFICULTY_MAP } from "./constants";

/**
 * Generate fallback prompt when no practice library questions are available
 */
export function generateFallbackQuestionsPrompt(
  config: InterviewConfig,
  questionCount: number,
): { prompt: string; questionIds: string[] } {
  const prompt = `\n\n## 📝 INTERVIEW QUESTION GENERATION GUIDELINES:

Since no practice library questions are available for this specific configuration, you will need to generate ${questionCount} appropriate interview questions.

**Interview Configuration**:
- **Position**: ${config.position}
- **Seniority Level**: ${config.seniority} (${DIFFICULTY_MAP[config.seniority]})
- **Interview Type**: ${config.interviewType} (${CATEGORY_DESCRIPTION[config.interviewType]})
- **Tech Stack**: ${config.technologies.length > 0 ? config.technologies.join(", ") : "General"}
- **Total Questions**: ${questionCount}

🎯 **QUESTION GENERATION REQUIREMENTS**:

1. **Difficulty Alignment**: 
   - Questions must match ${config.seniority}-level expectations
   - ${DIFFICULTY_MAP[config.seniority]}

2. **Interview Type Focus**:
   - ${config.interviewType} interview style
   - ${CATEGORY_DESCRIPTION[config.interviewType]}

3. **Technology Relevance**:
   ${
     config.technologies.length > 0
       ? `- Focus on: ${config.technologies.join(", ")}\n   - Questions should test practical knowledge of these technologies`
       : "- Use general technical questions appropriate for the position"
   }

4. **Question Structure**:
   - Start with easier warm-up questions
   - Progress to more challenging topics
   - Include both theoretical and practical aspects
   - Ask one question at a time
   - Wait for candidate's answer before proceeding

5. **Quality Standards**:
   - Questions should be clear and specific
   - Avoid ambiguous or trick questions
   - Focus on real-world scenarios when possible
   - Provide constructive feedback after each answer
   - Ask follow-up questions to assess depth of knowledge

6. **Interview Flow**:
   - Maintain conversational tone
   - Build rapport with the candidate
   - Adapt difficulty based on candidate's responses
   - Provide encouragement and guidance
   - Keep questions relevant to ${config.position} role

✅ **ALLOWED ACTIONS**:
- Generate questions appropriate for the configuration
- Adapt question difficulty based on candidate performance
- Ask clarifying follow-up questions
- Provide detailed feedback and explanations
- Adjust interview pace based on candidate's comfort level

Remember: Create a professional, supportive interview experience that accurately assesses the candidate's skills for a ${config.seniority}-level ${config.position} position.`;

  return { prompt, questionIds: [] };
}

/**
 * Fetch actual questions from database to ask in interview
 */
export async function getDatabaseQuestionsPrompt(
  config: InterviewConfig,
  questionCount: number,
): Promise<{ prompt: string; questionIds: string[] }> {
  try {
    const { getRelevantQuestionsForInterview, formatQuestionForPrompt } =
      await import("../../interview/interview-question-selector");

    const questions = await getRelevantQuestionsForInterview(
      config,
      questionCount,
    );

    // If no questions available from practice library, use AI-generated fallback
    if (questions.length === 0) {
      console.log(
        "⚠️ No practice library questions available, using AI-generated questions",
      );
      return generateFallbackQuestionsPrompt(config, questionCount);
    }

    // If insufficient questions, supplement with AI-generated ones
    if (questions.length < questionCount) {
      console.log(
        `⚠️ Only ${questions.length}/${questionCount} questions available from practice library, will supplement with AI-generated questions`,
      );
    }

    const questionIds = questions.map((q) => q.id || "").filter(Boolean);
    const questionsText = questions
      .map((q, i) => `${i + 1}. ${formatQuestionForPrompt(q)}`)
      .join("\n\n");

    // Determine if we need to supplement with AI-generated questions
    const needsSupplementation = questions.length < questionCount;
    const remainingQuestions = questionCount - questions.length;

    const prompt = needsSupplementation
      ? `\n\n## 📚 HYBRID INTERVIEW QUESTIONS (Practice Library + AI-Generated):

**Available Practice Library Questions**: ${questions.length}
**Additional Questions Needed**: ${remainingQuestions}
**Total Questions for Interview**: ${questionCount}

**Selection Criteria**:
- **Difficulty**: ${config.seniority}-level (${DIFFICULTY_MAP[config.seniority]})
- **Category**: ${config.interviewType} interview (${CATEGORY_DESCRIPTION[config.interviewType]})
- **Tech Stack**: ${config.technologies.length > 0 ? config.technologies.join(", ") : "General"}

---
📋 **PRACTICE LIBRARY QUESTIONS** (Ask these first):
${questionsText}
---

🎯 **INTERVIEW INSTRUCTIONS**:

**Phase 1 - Practice Library Questions (Questions 1-${questions.length})**:
1. **START HERE** - Ask the ${questions.length} questions from the practice library above
2. **Ask sequentially** - Go through them in order
3. **Rephrase naturally** - Make questions conversational while keeping core content
4. **Evaluate carefully** - Use the provided expected answers as guidelines

**Phase 2 - AI-Generated Questions (Questions ${questions.length + 1}-${questionCount})**:
After completing all practice library questions, generate ${remainingQuestions} additional questions that:
- Match the ${config.seniority}-level difficulty
- Focus on ${config.interviewType} interview topics
- Test ${config.technologies.length > 0 ? config.technologies.join(", ") : "general technical"} knowledge
- Maintain consistent difficulty and style with the practice library questions
- Fill any gaps in coverage from the practice library questions

✅ **ALLOWED ACTIONS**:
- Use all practice library questions first
- Generate additional questions only after practice library questions are exhausted
- Rephrase questions naturally
- Ask follow-up clarifications
- Provide constructive feedback
- Adapt difficulty based on candidate performance

Remember: Prioritize practice library questions, then supplement with AI-generated questions to reach ${questionCount} total questions.`
      : `\n\n## ⚠️ MANDATORY INTERVIEW QUESTIONS FROM PRACTICE LIBRARY:

🔒 **STRICT REQUIREMENT**: You MUST ONLY ask questions from the list below. DO NOT create, generate, or improvise any questions outside of this list.

**Total Questions to Ask**: ${questions.length}
**Selection Criteria**:
- **Difficulty**: ${config.seniority}-level (${DIFFICULTY_MAP[config.seniority]})
- **Category**: ${config.interviewType} interview (${CATEGORY_DESCRIPTION[config.interviewType]})
- **Tech Stack**: ${config.technologies.length > 0 ? config.technologies.join(", ") : "General"}

---
📋 **YOUR QUESTION BANK** (Use ONLY these questions):
${questionsText}
---

🎯 **CRITICAL INSTRUCTIONS**:
1. **ONLY USE THE QUESTIONS ABOVE** - Do not create new questions or deviate from this list
2. **Ask questions sequentially** - Start with Question 1, then 2, then 3, etc.
3. **Rephrase naturally** - Make questions conversational while keeping the core content
4. **One question at a time** - Wait for candidate's answer before moving to next question
5. **Use expected answers** - Evaluate responses against the provided answer guidelines
6. **Provide feedback** - Give constructive feedback after each answer
7. **Ask follow-ups** - Clarify or dig deeper based on candidate's response, but return to the next question from the list

🚫 **FORBIDDEN ACTIONS**:
- Creating questions not in the list above
- Skipping questions from the list
- Asking random technical questions
- Generating improvised questions

✅ **ALLOWED FLEXIBILITY**:
- Rephrasing questions for natural conversation
- Asking follow-up clarifications on candidate's answers
- Providing feedback and guidance
- Adjusting tone based on candidate's level

Remember: Your job is to guide the candidate through THESE SPECIFIC QUESTIONS from our practice library, not to create new ones.`;

    return { prompt, questionIds };
  } catch (error) {
    console.error("Failed to fetch database questions:", error);
    return { prompt: "", questionIds: [] };
  }
}
