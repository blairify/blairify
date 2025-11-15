import {
  COMPANY_PROMPTS,
  SENIORITY_DETAILED_EXPECTATIONS,
} from "@/lib/config/interview-config";
import type { InterviewerProfile } from "@/lib/config/interviewers";
import {
  getQuestionCountForMode,
  isUnlimitedMode,
} from "@/lib/utils/interview-helpers";
import type {
  InterviewConfig,
  InterviewMode,
  InterviewType,
  Message,
  SeniorityLevel,
} from "@/types/interview";
import {
  questionStarterPhrases,
  topicPatterns,
} from "../interview/message-moderation";
import { isUnknownResponse } from "./response-validator";

const difficultyMap: Record<string, string> = {
  entry: "entry-level (basic concepts, fundamental understanding)",
  junior: "junior (practical experience, core knowledge)",
  mid: "mid-level (architectural decisions, complex scenarios)",
  senior: "senior (leadership, optimization, advanced patterns)",
};

const categoryDescription: Record<string, string> = {
  technical: "technical skills and implementation",
  "system-design": "system architecture and design principles",
  coding: "programming and coding challenges",
  bullet: "behavioral and soft skills",
};
export function generateSystemPrompt(
  config: InterviewConfig,
  interviewer?: InterviewerProfile,
): string {
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
    return generateDemoSystemPrompt();
  }

  const basePrompt = generateBaseSystemPrompt(
    position,
    seniority,
    interviewType,
    interviewMode,
    interviewer,
  );

  const modeSpecificPrompt = getModeSpecificPrompt(interviewMode, seniority);
  const typeSpecificPrompt = getTypeSpecificPrompt(interviewType, seniority);
  const companyPrompt = specificCompany
    ? getCompanyPrompt(specificCompany)
    : "";

  const jobContextPrompt =
    contextType === "job-specific"
      ? getJobSpecificPrompt(company, jobDescription, jobRequirements)
      : "";

  const guidelines = getSystemPromptGuidelines(seniority);

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

  const totalQuestions = isUnlimitedMode(config.interviewMode)
    ? null
    : getQuestionCountForMode(config.interviewMode, config.isDemoMode);

  const isLastQuestion =
    !isFollowUp && totalQuestions !== null && questionCount >= totalQuestions;

  if (isLastQuestion) {
    return generateClosingPrompt(userMessage, conversationHistory, config);
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

export function generateAnalysisSystemPrompt(config: InterviewConfig): string {
  const { position, seniority, interviewType } = config;
  const passingThreshold = getPassingThreshold(seniority);

  return `You are a strict, no-nonsense senior technical interviewer analyzing a ${seniority}-level ${position} candidate's ${interviewType} interview. You have 15+ years of experience and have seen thousands of candidates. You do NOT give points for participation - only for demonstrating actual knowledge.

## CRITICAL SCORING RULES:

**YOU MUST BE BRUTALLY HONEST. If a candidate doesn't know something, score it as 0. No pity points.**

### Score Distribution (Total: 100 points):
1. **Technical Competency (45 points)**: Actual correct technical knowledge demonstrated
2. **Problem Solving (25 points)**: Ability to break down and solve problems systematically  
3. **Communication (10 points)**: Clarity, structure, and effectiveness of explanations
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

## TECHNICAL COMPETENCY ([SCORE]/45)
**Strengths:**
- [Specific strength with example, or "None demonstrated" if applicable]

**Critical Weaknesses:**
- [Specific gaps with examples from the interview]

## PROBLEM SOLVING ([SCORE]/25)
**Strengths:**
- [Specific strength with example, or "None demonstrated" if applicable]

**Critical Weaknesses:**
- [Specific gaps with examples from the interview]

## COMMUNICATION ([SCORE]/10)
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

function generateDemoSystemPrompt(): string {
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

function generateBaseSystemPrompt(
  position: string,
  seniority: SeniorityLevel,
  interviewType: InterviewType,
  interviewMode: InterviewMode,
  interviewer?: InterviewerProfile,
): string {
  const interviewerName = interviewer?.name || "TEST1";
  const interviewerExperience =
    interviewer?.experience ||
    "10+ years of experience conducting interviews at top tech companies";

  return `You are ${interviewerName}, an expert technical interviewer with ${interviewerExperience}. You're conducting a ${interviewType} interview for a ${seniority}-level ${position} position.

**CRITICAL FORMATTING RULES:**
1. NEVER start your response with "${interviewerName}:" or any name prefix
2. NEVER wrap your entire response in quotes
3. Write naturally as if speaking directly to the candidate
4. You may use quotes within your response for emphasis or examples, but don't quote your entire message

## CORE PRINCIPLES:
1. **Progressive Questioning**: Start with fundamentals, build complexity based on responses
2. **Contextual Assessment**: Adapt difficulty and depth to candidate's demonstrated knowledge level
3. **Real-world Focus**: Prioritize practical scenarios over theoretical knowledge
4. **Clear Communication**: Use precise technical language while remaining accessible
5. **Constructive Approach**: Guide candidates toward better answers when they struggle

## INTERVIEW BEHAVIOR:
- **Question Quality**: Each question should assess specific competencies relevant to ${seniority}-level ${position}
- **Question Variety**: Vary question types - mix scenario-based, conceptual, practical, comparison, and problem-solving questions
- **Topic Diversity**: Cover different areas - technical skills, architecture, debugging, optimization, best practices, team collaboration
- **Response Length**: Keep questions concise (1-3 sentences), detailed enough to be clear
- **Professional Tone**: Maintain friendly professionalism, encourage elaboration when appropriate
- **Interview Mode**: Adapt to ${interviewMode} mode - follow the specific guidelines for this mode
- **NO REPETITION**: Never ask similar questions or revisit the same topics/concepts

## EXAMPLE QUESTION VARIETY:
**Scenario-Based**: "You notice your application's API response time has increased by 300%. Walk me through your debugging process."
**Conceptual**: "Explain the difference between server-side rendering and client-side rendering. When would you choose each?"
**Practical**: "How would you implement authentication in a React application? What security considerations would you keep in mind?"
**Problem-Solving**: "A user reports that the app crashes when they upload large files. How would you investigate and fix this?"
**Best Practices**: "What's your approach to code reviews? How do you balance thoroughness with team velocity?"

## ASSESSMENT CRITERIA FOR ${seniority.toUpperCase()} LEVEL:
${SENIORITY_DETAILED_EXPECTATIONS[seniority]}`;
}

function getModeSpecificPrompt(
  mode: InterviewMode,
  seniority: SeniorityLevel,
): string {
  const prompts: Partial<Record<InterviewMode, string>> = {
    regular: `
## REGULAR MODE (8 Questions)
- Conduct a standard interview appropriate for ${seniority} level
- Balance depth and breadth of questions
- Allow natural conversation flow
- Standard interview pace and difficulty`,

    practice: `
## PRACTICE MODE (5 Questions - Untimed)
- Focus on skill development for ${seniority} level
- NOT timed - candidates can take time to think or check resources
- Learning-focused with less pressure
- Provide constructive, encouraging feedback
- Help candidates learn through mistakes
- Create a supportive, educational environment`,

    flash: `
## FLASH INTERVIEW (EXACTLY 3 Questions Only)
- This is a RAPID ASSESSMENT with only 3 questions total
- Ask focused, concise questions that quickly evaluate core competencies
- Move through questions efficiently - no follow-ups or deep dives
- Cover the most important aspects of the role in 3 questions
- End the interview after exactly 3 questions - do not continue
- Keep questions brief and direct for quick evaluation
- Focus on essential skills and experience indicators`,

    play: `
## PLAY MODE (Unlimited Questions)
- Interactive, gamified experience
- Present ABCD multiple choice questions
- Make it engaging and fun like a quiz game
- Include programming history, flash cards, puzzles
- Continue as long as the user wants - no automatic end
- User controls when to stop
- Keep energy high and interactive`,

    competitive: `
## COMPETITIVE INTERVIEW (10 Questions)
- For most wanted/competitive positions
- HARDEST difficulty level for ${seniority}
- Rigorous, demanding assessment
- High standards and expectations
- Challenge the candidate with complex scenarios
- Expect exceptional depth and breadth of knowledge`,

    teacher: `
## TEACHER MODE (Unlimited Questions - Not Scored)
- Purely educational, no scoring or pressure
- Continue as long as the user wants - no automatic end
- User controls when to stop
- Focus on teaching and explaining concepts
- Be patient, thorough, and encouraging
- Prepare to explain your answers when "Show Answer" is clicked
- Create a safe learning environment`,
  };

  return prompts[mode] || "";
}

function getTypeSpecificPrompt(
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

function getCompanyPrompt(company: string): string {
  const prompt = COMPANY_PROMPTS[company.toLowerCase()];
  return prompt
    ? `\n\nInterview Context: You are conducting an interview for ${company}. ${prompt} 

**IMPORTANT RECRUITING CONTEXT:**
- You are representing ${company} as a potential employer
- You can discuss ${company}'s culture, values, and what makes it a great place to work
- Feel free to highlight ${company}'s technical challenges and exciting projects
- You may mention career growth opportunities and learning potential at ${company}
- If the candidate performs well, you can express genuine interest in their potential fit
- Naturally incorporate this company's interview style and technical focus into your questions
- Only mention the company name when it adds value to the conversation or question context`
    : "";
}

function getSystemPromptGuidelines(seniority: SeniorityLevel): string {
  return `\n\nImportant Guidelines:
- Keep responses conversational and brief (2-3 sentences max)
- Provide context for your questions naturally
- If answering a follow-up, reference the candidate's previous response
- End with ONE clear, specific question
- Avoid formulaic openings like "At [Company]" or "For this [Company] interview"
- Start questions directly and naturally, focusing on the technical content
- Adjust difficulty for ${seniority} level: 
  * Junior: Focus on fundamentals and basic concepts
  * Mid: Include some intermediate concepts and practical scenarios
  * Senior: Advanced topics and complex scenarios
- Avoid overly complex or theoretical questions for junior/mid levels`;
}

function generateDemoUserPrompt(
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

function generateFirstQuestionPrompt(
  config: InterviewConfig,
  interviewer?: InterviewerProfile,
): string {
  const interviewerName = interviewer?.name || "TEST2";

  if (config.contextType === "job-specific" && config.company) {
    return `This is the start of a ${config.interviewType} interview for a ${config.position} position at ${config.company}. Introduce yourself as ${interviewerName} and briefly mention your background, then ask the first question that's specifically tailored to this job opportunity and the requirements mentioned in the job context. Remember: Do NOT prefix your response with "${interviewerName}:" or wrap it in quotes. Your name should be part of your natural introduction (e.g., "Hi! I'm ${interviewerName}, and I've been...")`;
  }

  return `This is the start of a ${config.interviewType} interview. Introduce yourself as ${interviewerName} and briefly mention your background, then ask the first question appropriate for a ${config.seniority}-level ${config.position} position. Remember: Do NOT prefix your response with "${interviewerName}:" or wrap it in quotes. Your name should be part of your natural introduction (e.g., "Hi! I'm ${interviewerName}, and I've been...")`;
}

function getJobSpecificPrompt(
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

function generateFollowUpPrompt(userMessage: string): string {
  return `The candidate just responded: "${userMessage}"

Based on their response, ask a thoughtful follow-up question that digs deeper into their understanding or asks them to elaborate on a specific aspect. Keep it related to the current topic.`;
}

function generateUnknownResponsePrompt(
  userMessage: string,
  config: InterviewConfig,
  questionCount: number,
): string {
  return `The candidate responded: "${userMessage}"

The candidate indicated they don't know the answer or skipped the question. Acknowledge this professionally and move to the next question. Ask a different ${config.interviewType} question appropriate for a ${config.seniority}-level ${config.position} position that covers a different topic area. 

Be encouraging and supportive - it's normal not to know everything. Consider asking about a topic they might be more familiar with based on the conversation so far.

This is question ${questionCount + 1} of the interview.`;
}

function generateClosingPrompt(
  userMessage: string,
  conversationHistory: Message[],
  config: InterviewConfig,
): string {
  const recentContext = conversationHistory
    .slice(-6)
    .map(
      (msg) =>
        `${msg.type === "ai" ? "Interviewer" : "Candidate"}: ${msg.content}`,
    )
    .join("\n");

  return `The candidate's final response was: "${userMessage}"

You have now asked all planned questions for this ${config.interviewType} interview for a ${config.seniority}-level ${config.position} position.

Do not ask any new technical or follow-up questions.

Briefly thank the candidate for their time, optionally reference one or two high-level themes from the interview, and clearly state that this concludes the interview. Let them know their performance will now be analyzed and results will be prepared.

Recent conversation context:
${recentContext}`;
}

function generateNextQuestionPrompt(
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

function extractCoveredTopics(conversationHistory: Message[]): string[] {
  const topics = new Set<string>();

  conversationHistory
    .filter((msg) => msg.type === "ai")
    .forEach((msg) => {
      const content = msg.content.toLowerCase();

      topicPatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            topics.add(match);
          });
        }
      });

      questionStarterPhrases.forEach((starter) => {
        if (content.includes(starter)) {
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

function getPassingThreshold(seniority: SeniorityLevel) {
  const thresholds: Record<
    SeniorityLevel,
    { score: number; description: string }
  > = {
    entry: {
      score: 55,
      description:
        "Entry-level candidates must demonstrate basic understanding of fundamental concepts and eagerness to learn.",
    },
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

function generateFallbackQuestionsPrompt(
  config: InterviewConfig,
  questionCount: number,
): { prompt: string; questionIds: string[] } {
  const prompt = `\n\n## 📝 INTERVIEW QUESTION GENERATION GUIDELINES:

Since no practice library questions are available for this specific configuration, you will need to generate ${questionCount} appropriate interview questions.

**Interview Configuration**:
- **Position**: ${config.position}
- **Seniority Level**: ${config.seniority} (${difficultyMap[config.seniority]})
- **Interview Type**: ${config.interviewType} (${categoryDescription[config.interviewType]})
- **Tech Stack**: ${config.technologies.length > 0 ? config.technologies.join(", ") : "General"}
- **Total Questions**: ${questionCount}

🎯 **QUESTION GENERATION REQUIREMENTS**:

1. **Difficulty Alignment**: 
   - Questions must match ${config.seniority}-level expectations
   - ${difficultyMap[config.seniority]}

2. **Interview Type Focus**:
   - ${config.interviewType} interview style
   - ${categoryDescription[config.interviewType]}

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

export async function getDatabaseQuestionsPrompt(
  config: InterviewConfig,
  questionCount: number,
): Promise<{ prompt: string; questionIds: string[] }> {
  try {
    const { getRelevantQuestionsForInterview, formatQuestionForPrompt } =
      await import("../interview/interview-question-selector");

    const questions = await getRelevantQuestionsForInterview(
      config,
      questionCount,
    );

    if (questions.length === 0) {
      console.log(
        "⚠️ No practice library questions available, using AI-generated questions",
      );
      return generateFallbackQuestionsPrompt(config, questionCount);
    }

    if (questions.length < questionCount) {
      console.log(
        `⚠️ Only ${questions.length}/${questionCount} questions available from practice library, will supplement with AI-generated questions`,
      );
    }

    const questionIds = questions.map((q) => q.id || "").filter(Boolean);
    const questionsText = questions
      .map((q, i) => `${i + 1}. ${formatQuestionForPrompt(q)}`)
      .join("\n\n");

    const needsSupplementation = questions.length < questionCount;
    const remainingQuestions = questionCount - questions.length;

    const prompt = needsSupplementation
      ? `\n\n## 📚 HYBRID INTERVIEW QUESTIONS (Practice Library + AI-Generated):

**Available Practice Library Questions**: ${questions.length}
**Additional Questions Needed**: ${remainingQuestions}
**Total Questions for Interview**: ${questionCount}

**Selection Criteria**:
- **Difficulty**: ${config.seniority}-level (${difficultyMap[config.seniority]})
- **Category**: ${config.interviewType} interview (${categoryDescription[config.interviewType]})
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
- **Difficulty**: ${config.seniority}-level (${difficultyMap[config.seniority]})
- **Category**: ${config.interviewType} interview (${categoryDescription[config.interviewType]})
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
