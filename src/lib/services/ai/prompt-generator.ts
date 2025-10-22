/**
 * AI Prompt Generation Service
 * Handles all prompt generation logic for the interview system
 */

import {
  COMPANY_PROMPTS,
  SENIORITY_DETAILED_EXPECTATIONS,
} from "@/lib/config/interview-config";
import type {
  InterviewConfig,
  InterviewMode,
  InterviewType,
  Message,
  SeniorityLevel,
} from "@/types/interview";

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class pattern for organizing related prompt generation functions
export class PromptGenerator {
  /**
   * Generate system prompt for the AI interviewer
   */
  static generateSystemPrompt(config: InterviewConfig): string {
    const {
      position,
      seniority,
      interviewType,
      interviewMode,
      specificCompany,
      isDemoMode,
      contextType,
      company,
      jobDescription,
      jobRequirements,
    } = config;

    if (isDemoMode) {
      return PromptGenerator.generateDemoSystemPrompt();
    }

    const basePrompt = PromptGenerator.generateBaseSystemPrompt(
      position,
      seniority,
      interviewType,
      interviewMode,
    );

    const modeSpecificPrompt = PromptGenerator.getModeSpecificPrompt(
      interviewMode,
      seniority,
    );
    const typeSpecificPrompt = PromptGenerator.getTypeSpecificPrompt(
      interviewType,
      seniority,
    );
    const companyPrompt = specificCompany
      ? PromptGenerator.getCompanyPrompt(specificCompany)
      : "";

    // Add job-specific context if available
    const jobContextPrompt =
      contextType === "job-specific"
        ? PromptGenerator.getJobSpecificPrompt(
            company,
            jobDescription,
            jobRequirements,
          )
        : "";

    const guidelines = PromptGenerator.getSystemPromptGuidelines(seniority);

    return [
      basePrompt,
      modeSpecificPrompt,
      typeSpecificPrompt,
      companyPrompt,
      jobContextPrompt,
      guidelines,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  /**
   * Generate user prompt for specific interview context
   */
  static generateUserPrompt(
    userMessage: string,
    conversationHistory: Message[],
    config: InterviewConfig,
    questionCount: number,
    isFollowUp: boolean,
  ): string {
    if (config.isDemoMode) {
      return PromptGenerator.generateDemoUserPrompt(
        userMessage,
        conversationHistory,
        questionCount,
      );
    }

    if (conversationHistory.length === 0) {
      return PromptGenerator.generateFirstQuestionPrompt(config);
    }

    if (isFollowUp) {
      return PromptGenerator.generateFollowUpPrompt(userMessage);
    }

    const isUnknownResponse = PromptGenerator.isUnknownResponse(userMessage);

    if (isUnknownResponse) {
      return PromptGenerator.generateUnknownResponsePrompt(
        userMessage,
        config,
        questionCount,
      );
    }

    return PromptGenerator.generateNextQuestionPrompt(
      userMessage,
      conversationHistory,
      config,
      questionCount,
    );
  }

  /**
   * Generate analysis system prompt
   */
  static generateAnalysisSystemPrompt(config: InterviewConfig): string {
    const { position, seniority, interviewType } = config;
    const passingThreshold = PromptGenerator.getPassingThreshold(seniority);

    return `You are a strict, no-nonsense senior technical interviewer analyzing a ${seniority}-level ${position} candidate's ${interviewType} interview. You have 15+ years of experience and have seen thousands of candidates. You do NOT give points for participation - only for demonstrating actual knowledge.

## CRITICAL SCORING RULES:

**YOU MUST BE BRUTALLY HONEST. If a candidate doesn't know something, score it as 0. No pity points.**

### Score Distribution (Total: 100 points):
1. **Technical Competency (30 points)**: Actual correct technical knowledge demonstrated
2. **Problem Solving (25 points)**: Ability to break down and solve problems systematically  
3. **Communication (25 points)**: Clarity, structure, and effectiveness of explanations
4. **Professional Readiness (20 points)**: Real-world experience and practical application

### Scoring Guidelines by Response Quality:

**ZERO POINTS** for:
- "I don't know" or any variation
- "[Question skipped]"
- Gibberish, single words, or nonsense answers
- Completely incorrect information presented as fact
- Responses under 20 characters that don't actually answer the question

**MAXIMUM 25% of points** for:
- Vague, generic answers that could apply to anything
- Responses that just repeat the question
- Buzzword salad without substance
- Partially correct but missing key details

**MAXIMUM 50% of points** for:
- Surface-level correct answers without depth
- Answers that show some understanding but significant gaps
- Correct but poorly explained responses

**FULL POINTS** for:
- Accurate, detailed technical explanations
- Practical examples and real-world application
- Consideration of trade-offs and edge cases
- Clear, well-structured communication

### Pass/Fail Criteria:
- **Passing Score for ${seniority}**: ${passingThreshold.score}/100
- **Rationale**: ${passingThreshold.description}

### YOU MUST OUTPUT A CLEAR PASS/FAIL DECISION:
Based on the total score and the quality of responses, explicitly state whether the candidate would pass or fail this interview.

## REQUIRED OUTPUT FORMAT:

## INTERVIEW RESULT
**DECISION: [PASS / FAIL]**
Score: [NUMBER]/100 (Passing threshold: ${passingThreshold.score})
Performance Level: [Far Below Expectations | Below Expectations | Meets Expectations | Exceeds Expectations]

[2-3 sentence executive summary explaining the decision]

## TECHNICAL COMPETENCY ([SCORE]/30)
**Strengths:**
- [Specific strength with example, or "None demonstrated" if applicable]

**Critical Weaknesses:**
- [Specific gaps with examples from the interview]

## PROBLEM SOLVING ([SCORE]/25)
**Strengths:**
- [Specific strength with example, or "None demonstrated" if applicable]

**Critical Weaknesses:**
- [Specific gaps with examples from the interview]

## COMMUNICATION ([SCORE]/25)
**Strengths:**
- [Specific strength with example, or "None demonstrated" if applicable]

**Critical Weaknesses:**
- [Specific gaps with examples from the interview]

## PROFESSIONAL READINESS ([SCORE]/20)
**Strengths:**
- [Specific strength with example, or "None demonstrated" if applicable]

**Critical Weaknesses:**
- [Specific gaps with examples from the interview]

## WHY THIS DECISION
[Detailed paragraph explaining why the candidate passed or failed, with specific examples from their responses]

## RECOMMENDATIONS
### If Passed - Next Steps:
1. [Specific area to strengthen before starting]
2. [Another area to work on]
3. [Final preparation item]

### If Failed - Required Improvements:
1. [Critical knowledge gap to address - with timeline]
2. [Another critical gap - with timeline]
3. [Third critical gap - with timeline]

### Learning Resources:
- [Specific resource]
- [Another resource]
- [Third resource]

## CRITICAL REMINDERS FOR SCORING:
1. If a candidate answered mostly "I don't know" - score should be 0-20 maximum
2. If responses were gibberish or single words - score should be 0-15 maximum  
3. If candidate gave generic buzzwords without understanding - score should be 15-35 maximum
4. Only candidates who demonstrated actual, substantive knowledge should score above 50
5. BE HARSH. This is a real interview. The candidate's score affects hiring decisions.`;
  }

  // Private helper methods
  private static generateDemoSystemPrompt(): string {
    return `You are Alex, a friendly AI demo guide showing users how the Blairify interview system works. Your role is to:

1. Keep things casual and relaxed - this is just a demo!
2. Ask only 2-3 simple, non-intimidating questions
3. Be encouraging and supportive throughout
4. Explain what you're doing as you go ("Now I'll ask you about...")
5. Make it feel like exploring the system rather than being evaluated
6. Use a conversational, friendly tone
7. Remind users this is just practice and not being scored

Keep questions broad and approachable - focus on letting them experience the interface rather than testing their knowledge. Think of yourself as a helpful guide rather than an interviewer.`;
  }

  private static generateBaseSystemPrompt(
    position: string,
    seniority: SeniorityLevel,
    interviewType: InterviewType,
    interviewMode: InterviewMode,
  ): string {
    return `You are Sarah, an expert technical interviewer with 10+ years of experience conducting interviews at top tech companies. You're conducting a ${interviewType} interview for a ${seniority}-level ${position} position.

## CORE PRINCIPLES:
1. **Progressive Questioning**: Start with fundamentals, build complexity based on responses
2. **Contextual Assessment**: Adapt difficulty and depth to candidate's demonstrated knowledge level
3. **Real-world Focus**: Prioritize practical scenarios over theoretical knowledge
4. **Clear Communication**: Use precise technical language while remaining accessible
5. **Constructive Approach**: Guide candidates toward better answers when they struggle

## INTERVIEW BEHAVIOR:
- **Question Quality**: Each question should assess specific competencies relevant to ${seniority}-level ${position}
- **Response Length**: Keep questions concise (1-3 sentences), detailed enough to be clear
- **Professional Tone**: Maintain friendly professionalism, encourage elaboration when appropriate
- **Interview Mode**: Adapt to ${interviewMode} - ${interviewMode === "timed" ? "move efficiently, expect concise answers" : "allow exploration, encourage detailed explanations"}

## EXAMPLE INTERACTIONS:
**Good Question**: "Can you walk me through how you'd optimize a React component that's causing performance issues in a large application?"
**Good Follow-up**: "That's a solid approach with React.memo. What would you do if the performance issue persisted even after memoization?"

## ASSESSMENT CRITERIA FOR ${seniority.toUpperCase()} LEVEL:
${SENIORITY_DETAILED_EXPECTATIONS[seniority]}`;
  }

  private static getModeSpecificPrompt(
    mode: InterviewMode,
    seniority: SeniorityLevel,
  ): string {
    const prompts = {
      timed: `
- Keep questions brief and focused for ${seniority} level
- Expect concise but comprehensive answers
- Move efficiently through topics`,

      untimed: `
- Allow for exploration appropriate to ${seniority} level
- Encourage explanations matching their experience level
- Ask follow-up questions suited to their knowledge`,

      bullet: `
- Ask only 3 focused, concise questions
- Keep responses brief and to the point
- Cover essential ${seniority} level topics efficiently`,

      whiteboard: `
- Present challenges appropriate for ${seniority} level
- Encourage step-by-step problem-solving
- Ask about complexity matching their expected knowledge`,
    };

    return prompts[mode] || "";
  }

  private static getTypeSpecificPrompt(
    type: InterviewType,
    seniority: SeniorityLevel,
  ): string {
    const prompts = {
      technical: `
- Cover fundamental concepts for ${seniority} level
- Ask about frameworks and tools they should know
- Include practical scenarios they might face`,

      bullet: `
- Ask 3 essential questions for ${seniority} level
- Focus on core competencies and quick assessment
- Keep questions concise and direct`,

      coding: `
- Present problems appropriate for ${seniority} level
- Focus on clean, working solutions over optimization
- Ask about their thought process`,

      "system-design": `
- Start with basic architecture for ${seniority} level
- Focus on fundamental design principles
- Keep complexity appropriate to their experience`,
    };

    return prompts[type] || "";
  }

  private static getCompanyPrompt(company: string): string {
    const prompt = COMPANY_PROMPTS[company.toLowerCase()];
    return prompt ? `\n\nCompany Context for ${company}: ${prompt}` : "";
  }

  private static getSystemPromptGuidelines(seniority: SeniorityLevel): string {
    return `\n\nImportant Guidelines:
- Keep responses conversational and brief (2-3 sentences max)
- Provide context for your questions
- If answering a follow-up, reference the candidate's previous response
- End with ONE clear, specific question
- Adjust difficulty for ${seniority} level: 
  * Junior: Focus on fundamentals and basic concepts
  * Mid: Include some intermediate concepts and practical scenarios
  * Senior: Advanced topics and complex scenarios
- Avoid overly complex or theoretical questions for junior/mid levels`;
  }

  private static generateDemoUserPrompt(
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

  private static generateFirstQuestionPrompt(config: InterviewConfig): string {
    if (config.contextType === "job-specific" && config.company) {
      return `This is the start of a ${config.interviewType} interview for a ${config.position} position at ${config.company}. Please introduce yourself as Sarah, the interviewer, and ask the first question that's specifically tailored to this job opportunity and the requirements mentioned in the job context.`;
    }

    return `This is the start of a ${config.interviewType} interview. Please introduce yourself as Sarah, the interviewer, and ask the first question appropriate for a ${config.seniority}-level ${config.position} position.`;
  }

  /**
   * Generate job-specific context prompt
   */
  private static getJobSpecificPrompt(
    company?: string,
    jobDescription?: string,
    jobRequirements?: string,
  ): string {
    if (!company) return "";

    let prompt = `\n**JOB-SPECIFIC CONTEXT:**\nThis interview is for a specific position at ${company}.`;

    if (jobDescription) {
      prompt += `\n\n**Job Description:**\n${jobDescription}`;
    }

    if (jobRequirements) {
      prompt += `\n\n**Key Requirements:**\n${jobRequirements}`;
    }

    prompt += `\n\n**IMPORTANT:** Tailor your questions specifically to this job posting. Focus on the technologies, skills, and requirements mentioned above. Ask about real-world scenarios that would be relevant to this specific role at ${company}. Make the interview feel personalized and directly related to what they would actually be doing in this job.`;

    return prompt;
  }

  private static generateFollowUpPrompt(userMessage: string): string {
    return `The candidate just responded: "${userMessage}"

Based on their response, ask a thoughtful follow-up question that digs deeper into their understanding or asks them to elaborate on a specific aspect. Keep it related to the current topic.`;
  }

  private static generateUnknownResponsePrompt(
    userMessage: string,
    config: InterviewConfig,
    questionCount: number,
  ): string {
    return `The candidate responded: "${userMessage}"

The candidate indicated they don't know the answer or skipped the question. Acknowledge this professionally and move to the next question. Ask a different ${config.interviewType} question appropriate for a ${config.seniority}-level ${config.position} position that covers a different topic area. 

Be encouraging and supportive - it's normal not to know everything. Consider asking about a topic they might be more familiar with based on the conversation so far.

This is question ${questionCount + 1} of the interview.`;
  }

  private static generateNextQuestionPrompt(
    userMessage: string,
    conversationHistory: Message[],
    config: InterviewConfig,
    questionCount: number,
  ): string {
    const recentContext = conversationHistory
      .slice(-4)
      .map(
        (msg) =>
          `${msg.type === "ai" ? "Interviewer" : "Candidate"}: ${msg.content}`,
      )
      .join("\n");

    return `The candidate's previous response was: "${userMessage}"

This is question ${questionCount + 1} of the interview. Please ask the next ${config.interviewType} question appropriate for a ${config.seniority}-level ${config.position} position. 

Recent conversation context:
${recentContext}

Ask a new question that builds upon the conversation and covers different aspects of the role.`;
  }

  private static isUnknownResponse(message: string): boolean {
    return (
      message.toLowerCase().includes("don't know") ||
      message.toLowerCase().includes("not sure") ||
      message.toLowerCase().includes("idk") ||
      message === "[Question skipped]"
    );
  }

  private static getPassingThreshold(seniority: SeniorityLevel) {
    const thresholds = {
      junior: {
        score: 60,
        description:
          "Junior candidates must demonstrate basic understanding of core concepts and show learning potential.",
      },
      mid: {
        score: 70,
        description:
          "Mid-level candidates must show solid technical knowledge and independent problem-solving ability.",
      },
      senior: {
        score: 80,
        description:
          "Senior candidates must demonstrate deep expertise, architectural thinking, and leadership capability.",
      },
    };

    return thresholds[seniority] || thresholds.mid;
  }
}
