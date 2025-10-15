import { Mistral } from "@mistralai/mistralai";
import { type NextRequest, NextResponse } from "next/server";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      conversationHistory,
      interviewConfig,
      questionCount,
      isFollowUp,
      checkFollowUpOnly,
    } = await request.json();

    // Validate input
    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "Interview configuration is required" },
        { status: 400 },
      );
    }

    // If this is just a follow-up check, return the decision
    if (checkFollowUpOnly) {
      const shouldFollow = shouldGenerateFollowUp(
        message,
        conversationHistory || [],
        interviewConfig,
        questionCount || 0,
      );
      return NextResponse.json({
        success: true,
        shouldFollowUp: shouldFollow,
      });
    }

    const systemPrompt = generateSystemPrompt(interviewConfig);
    const userPrompt = generateUserPrompt(
      message,
      conversationHistory,
      interviewConfig,
      questionCount,
      isFollowUp,
    );

    const chatResponse = await client.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 800, // Reduced for more concise responses
    });

    const rawAiMessage =
      typeof chatResponse.choices?.[0]?.message?.content === "string"
        ? chatResponse.choices[0].message.content
        : "I apologize, but I encountered an error. Could you please try again?";

    // Validate and potentially enhance the AI response
    const validation = validateAIResponse(
      rawAiMessage,
      interviewConfig,
      isFollowUp || false,
    );

    let finalMessage = rawAiMessage;
    if (!validation.isValid) {
      console.warn(`AI response validation failed: ${validation.reason}`);

      // Fallback to a context-appropriate response
      if (interviewConfig.isDemoMode) {
        finalMessage =
          "That's interesting! Let me ask you another question to help you explore our interview system. What interests you most about this field?";
      } else if (isFollowUp) {
        finalMessage =
          "Thank you for that explanation. Let's move on to the next question.";
      } else {
        finalMessage =
          "Let me ask you a fundamental question about your experience. Can you describe your approach to solving technical problems?";
      }
    } else if (validation.sanitized) {
      finalMessage = validation.sanitized;
    }

    return NextResponse.json({
      success: true,
      message: finalMessage,
      questionType: determineQuestionType(
        interviewConfig.interviewType,
        questionCount,
      ),
      validated: validation.isValid,
    });
  } catch (error) {
    console.error("Mistral AI API error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { success: false, error: "Invalid API key configuration" },
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI response. Please try again.",
      },
      { status: 500 },
    );
  }
}

interface InterviewConfig {
  position: string;
  seniority: string;
  interviewType: string;
  interviewMode: string;
  specificCompany?: string;
  isDemoMode?: boolean;
}

interface Message {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  questionType?: string;
  isFollowUp?: boolean;
}

function getSeniorityExpectations(seniority: string): string {
  const expectations = {
    junior: `
- **Technical Knowledge**: Basic understanding of core concepts and technologies
- **Problem Solving**: Can solve straightforward problems with guidance
- **Communication**: Can explain their thinking process clearly
- **Learning**: Shows eagerness to learn and asks thoughtful questions
- **Examples**: Focus on academic projects, tutorials, or simple implementations`,

    mid: `
- **Technical Knowledge**: Solid understanding of frameworks, tools, and best practices
- **Problem Solving**: Can independently solve complex problems and consider trade-offs
- **Communication**: Can explain technical decisions and their reasoning
- **Experience**: 2-5 years of practical experience with real-world applications
- **Examples**: Focus on production systems, optimization, and architectural decisions`,

    senior: `
- **Technical Leadership**: Deep expertise in technologies and ability to guide technical decisions
- **System Design**: Can design scalable, maintainable systems and consider non-functional requirements
- **Communication**: Can mentor others and communicate complex concepts to various audiences
- **Business Impact**: Understands how technical decisions affect business outcomes
- **Examples**: Focus on system architecture, team leadership, and strategic technical initiatives`,
  };

  return (
    expectations[seniority as keyof typeof expectations] || expectations.mid
  );
}

function generateSystemPrompt(config: InterviewConfig): string {
  const {
    position,
    seniority,
    interviewType,
    interviewMode,
    specificCompany,
    isDemoMode,
  } = config;

  if (isDemoMode) {
    return `You are Alex, a friendly AI demo guide showing users how the Themockr interview system works. Your role is to:

1. Keep things casual and relaxed - this is just a demo!
2. Ask only 2-3 simple, non-intimidating questions
3. Be encouraging and supportive throughout
4. Explain what you're doing as you go ("Now I'll ask you about...")
5. Make it feel like exploring the system rather than being evaluated
6. Use a conversational, friendly tone
7. Remind users this is just practice and not being scored

Keep questions broad and approachable - focus on letting them experience the interface rather than testing their knowledge. Think of yourself as a helpful guide rather than an interviewer.`;
  }

  const basePrompt = `You are Sarah, an expert technical interviewer with 10+ years of experience conducting interviews at top tech companies. You're conducting a ${interviewType} interview for a ${seniority}-level ${position} position.

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
${getSeniorityExpectations(seniority)}`;

  const modeSpecificPrompts = {
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

  const typeSpecificPrompts = {
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

  let prompt =
    basePrompt +
    (modeSpecificPrompts[interviewMode as keyof typeof modeSpecificPrompts] ||
      "");
  prompt +=
    typeSpecificPrompts[interviewType as keyof typeof typeSpecificPrompts] ||
    "";

  if (specificCompany) {
    const companyPrompts = {
      google:
        "Focus on scalability, algorithmic thinking, and large-scale system design. Emphasize data structures and algorithms.",
      meta: "Emphasize user engagement, real-time systems, and social platform challenges. Focus on frontend and backend integration.",
      apple:
        "Focus on user experience, attention to detail, and elegant solutions. Emphasize clean code and design patterns.",
      amazon:
        "Incorporate leadership principles, customer obsession, and large-scale distributed systems.",
      netflix:
        "Focus on microservices, streaming technologies, and high-availability systems.",
      microsoft:
        "Emphasize collaboration, enterprise solutions, and cloud technologies.",
    };

    const companyPrompt =
      companyPrompts[specificCompany as keyof typeof companyPrompts];
    if (companyPrompt) {
      prompt += `\n\nCompany Context for ${specificCompany}: ${companyPrompt}`;
    }
  }

  prompt += `\n\nImportant Guidelines:
- Keep responses conversational and brief (2-3 sentences max)
- Provide context for your questions
- If answering a follow-up, reference the candidate's previous response
- End with ONE clear, specific question
- Adjust difficulty for ${seniority} level: 
  * Junior: Focus on fundamentals and basic concepts
  * Mid: Include some intermediate concepts and practical scenarios
  * Senior: Advanced topics and complex scenarios
- Avoid overly complex or theoretical questions for junior/mid levels`;

  return prompt;
}

function generateUserPrompt(
  userMessage: string,
  conversationHistory: Message[],
  config: InterviewConfig,
  questionCount: number,
  isFollowUp: boolean,
): string {
  let prompt = "";

  if (config.isDemoMode) {
    if (conversationHistory.length === 0) {
      prompt = `This is the start of a demo session. Ask a simple, friendly introductory question that helps the user get comfortable with the system. Something like asking about their interests in tech or what they'd like to learn. Keep it very casual and non-intimidating.`;
    } else if (questionCount < 2) {
      prompt = `The user just responded: "${userMessage}"

Ask a casual follow-up question that keeps the conversation flowing. This is still demo mode, so keep it light and conversational. Maybe ask about their experience level or what type of role they're interested in.`;
    } else {
      prompt = `The user just responded: "${userMessage}"

This should be the final demo question. Ask something fun and encouraging that wraps up the demo nicely, like asking about their career goals or what they found interesting about the demo. Then let them know the demo is wrapping up.`;
    }
    return prompt;
  }

  if (conversationHistory.length === 0) {
    // First question
    prompt = `This is the start of a ${config.interviewType} interview. Please introduce yourself as Sarah, the interviewer, and ask the first question appropriate for a ${config.seniority}-level ${config.position} position.`;
  } else if (isFollowUp) {
    // Follow-up question
    const _lastUserMessage = conversationHistory
      .filter((msg) => msg.type === "user")
      .pop();
    prompt = `The candidate just responded: "${userMessage}"

Based on their response, ask a thoughtful follow-up question that digs deeper into their understanding or asks them to elaborate on a specific aspect. Keep it related to the current topic.`;
  } else {
    // Check if the response indicates lack of knowledge
    const isUnknownResponse =
      userMessage.toLowerCase().includes("don't know") ||
      userMessage.toLowerCase().includes("not sure") ||
      userMessage.toLowerCase().includes("idk") ||
      userMessage === "[Question skipped]";

    if (isUnknownResponse) {
      prompt = `The candidate responded: "${userMessage}"

The candidate indicated they don't know the answer or skipped the question. Acknowledge this professionally and move to the next question. Ask a different ${config.interviewType} question appropriate for a ${config.seniority}-level ${config.position} position that covers a different topic area. 

Be encouraging and supportive - it's normal not to know everything. Consider asking about a topic they might be more familiar with based on the conversation so far.

This is question ${questionCount + 1} of the interview.`;
    } else {
      // New question - normal response
      prompt = `The candidate's previous response was: "${userMessage}"

This is question ${questionCount + 1} of the interview. Please ask the next ${config.interviewType} question appropriate for a ${config.seniority}-level ${config.position} position. 

Recent conversation context:
${conversationHistory
  .slice(-4)
  .map(
    (msg) =>
      `${msg.type === "ai" ? "Interviewer" : "Candidate"}: ${msg.content}`,
  )
  .join("\n")}

Ask a new question that builds upon the conversation and covers different aspects of the role.`;
    }
  }

  return prompt;
}

function determineQuestionType(
  interviewType: string,
  questionCount: number,
): string {
  const types = {
    technical: ["conceptual", "practical", "architectural", "debugging"],
    bullet: ["core-concept", "quick-assessment", "essential-skill"],
    coding: ["algorithms", "data-structures", "optimization", "implementation"],
    "system-design": [
      "architecture",
      "scalability",
      "trade-offs",
      "components",
    ],
  };

  const typeArray =
    types[interviewType as keyof typeof types] || types.technical;
  return typeArray[questionCount % typeArray.length];
}

function shouldGenerateFollowUp(
  userResponse: string,
  conversationHistory: Message[],
  config: InterviewConfig,
  questionCount: number,
): boolean {
  // Don't follow up on empty or very short responses
  if (!userResponse || userResponse.trim().length < 10) {
    return false;
  }

  // Don't follow up if we're near the end of the interview
  if (questionCount >= 8) {
    return false;
  }

  // Don't follow up on "I don't know" or skip responses
  const isUnknownResponse =
    userResponse.toLowerCase().includes("don't know") ||
    userResponse.toLowerCase().includes("not sure") ||
    userResponse.toLowerCase().includes("idk") ||
    userResponse === "[Question skipped]" ||
    userResponse.toLowerCase().includes("no idea");

  if (isUnknownResponse) {
    return false;
  }

  // Analyze response characteristics
  const responseLength = userResponse.trim().length;
  const hasCodeExample = /```|function|class|const|let|var|\{|\}/.test(
    userResponse,
  );
  const hasExplanation = /because|reason|why|how|when|since|due to/i.test(
    userResponse,
  );
  const mentionsTechnology =
    /react|javascript|typescript|node|python|sql|api|database/i.test(
      userResponse,
    );

  // Score factors that indicate a good candidate for follow-up
  let followUpScore = 0;

  // Length indicators
  if (responseLength >= 100 && responseLength <= 500) followUpScore += 2; // Sweet spot
  if (responseLength > 500) followUpScore += 1; // Detailed but may need clarification
  if (responseLength < 50) followUpScore -= 1; // Too brief

  // Technical depth indicators
  if (hasCodeExample) followUpScore += 2;
  if (hasExplanation) followUpScore += 2;
  if (mentionsTechnology) followUpScore += 1;

  // Context-based scoring
  const recentFollowUps = conversationHistory
    .slice(-4)
    .filter((msg) => msg.type === "ai" && msg.isFollowUp).length;

  if (recentFollowUps >= 2) followUpScore -= 2; // Avoid too many consecutive follow-ups

  // Interview type specific adjustments
  if (config.interviewType === "coding" && hasCodeExample) followUpScore += 1;
  if (config.interviewType === "system-design" && responseLength > 200)
    followUpScore += 1;
  if (config.interviewMode === "bullet" && responseLength > 150)
    followUpScore -= 1; // Keep it concise

  // Seniority level adjustments
  if (config.seniority === "senior" && responseLength < 100) followUpScore += 1; // Expect more detail
  if (config.seniority === "junior" && responseLength > 300) followUpScore += 1; // Good elaboration

  // Return true if score is above threshold
  return followUpScore >= 2;
}

function validateAIResponse(
  response: string,
  config: InterviewConfig,
  isFollowUp: boolean,
): { isValid: boolean; reason?: string; sanitized?: string } {
  // Basic validation checks
  if (!response || response.trim().length === 0) {
    return { isValid: false, reason: "Empty response" };
  }

  if (response.length < 10) {
    return { isValid: false, reason: "Response too short" };
  }

  if (response.length > 2000) {
    return {
      isValid: true,
      sanitized:
        response.substring(0, 1800) + "... [Response truncated for clarity]",
    };
  }

  // Check for inappropriate content patterns
  const inappropriatePatterns = [
    /I cannot help with that/i,
    /I'm not able to assist/i,
    /This violates/i,
    /I can't provide/i,
    /As an AI/i,
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(response)) {
      return {
        isValid: false,
        reason: "Contains inappropriate AI safety response",
      };
    }
  }

  // Interview context validation
  if (!config.isDemoMode) {
    // Should contain a question for main questions
    if (!isFollowUp && !response.includes("?")) {
      return {
        isValid: false,
        reason: "Main interview response should contain a question",
      };
    }

    // Check for interviewer persona consistency
    const hasInterviewerContext =
      /let's|can you|what|how|why|tell me|describe|explain/i.test(response);
    if (!hasInterviewerContext && !isFollowUp) {
      return { isValid: false, reason: "Response lacks interviewer context" };
    }
  }

  // Validate technical content appropriateness
  if (config.interviewType === "coding") {
    const hasCodeContext =
      /code|function|algorithm|implement|solution|programming/i.test(response);
    if (!hasCodeContext && !config.isDemoMode) {
      return {
        isValid: false,
        reason: "Coding interview should reference programming concepts",
      };
    }
  }

  // Format validation - check for reasonable structure
  const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 8) {
    return {
      isValid: true,
      sanitized: sentences.slice(0, 6).join(". ") + ". [Question continued...]",
    };
  }

  return { isValid: true };
}
