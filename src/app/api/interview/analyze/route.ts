import { Mistral } from "@mistralai/mistralai";
import { type NextRequest, NextResponse } from "next/server";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory, interviewConfig } = await request.json();

    // Validate input
    if (
      !conversationHistory ||
      !Array.isArray(conversationHistory) ||
      conversationHistory.length === 0
    ) {
      return NextResponse.json(
        { success: false, error: "No conversation history provided" },
        { status: 400 },
      );
    }

    if (!interviewConfig) {
      return NextResponse.json(
        { success: false, error: "No interview configuration provided" },
        { status: 400 },
      );
    }

    const systemPrompt = generateAnalysisSystemPrompt(interviewConfig);
    const analysisPrompt = generateAnalysisPrompt(
      conversationHistory,
      interviewConfig,
    );

    let analysisText: string;

    // Check if API key is available
    if (!process.env.MISTRAL_API_KEY) {
      analysisText = generateMockAnalysis(interviewConfig);
    } else {
      try {
        const chatResponse = await client.chat.complete({
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent analysis
          maxTokens: 2000,
        });

        const analysis = chatResponse.choices?.[0]?.message?.content;
        analysisText =
          typeof analysis === "string"
            ? analysis
            : "Unable to generate analysis at this time.";
      } catch (apiError) {
        console.error("Mistral API error, falling back to mock:", apiError);
        analysisText = generateMockAnalysis(interviewConfig);
      }
    }

    // Parse the structured analysis
    const feedback = parseAnalysis(analysisText);

    return NextResponse.json({
      success: true,
      feedback,
      rawAnalysis: analysisText,
    });
  } catch (error) {
    console.error("Analysis API error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { success: false, error: "Invalid API key configuration" },
          { status: 401 },
        );
      }
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { success: false, error: "Analysis request timed out" },
          { status: 408 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze interview responses. Please try again.",
      },
      { status: 500 },
    );
  }
}

interface InterviewConfig {
  position: string;
  seniority: string;
  interviewType: string;
  interviewMode?: string;
  specificCompany?: string;
}

interface Message {
  id: string;
  type: string;
  content: string;
  timestamp: Date;
  questionType?: string;
  isFollowUp?: boolean;
}

function identifySkippedOrUnknownResponses(conversationHistory: Message[]): {
  skippedQuestions: number;
  unknownResponses: number;
  totalResponses: number;
  penaltyScore: number;
} {
  const userResponses = conversationHistory.filter(
    (msg) => msg.type === "user",
  );

  let skippedQuestions = 0;
  let unknownResponses = 0;

  const unknownPatterns = [
    /^\s*\[question skipped\]\s*$/i,
    /^\s*i don'?t know\s*$/i,
    /^\s*not sure\s*$/i,
    /^\s*no idea\s*$/i,
    /^\s*i'?m not sure\s*$/i,
    /^\s*skip\s*$/i,
    /^\s*pass\s*$/i,
    /^\s*don'?t know\s*$/i,
    /^\s*idk\s*$/i,
    /^\s*unknown\s*$/i,
  ];

  const vaguePatterns = [
    /^\s*maybe\s*$/i,
    /^\s*possibly\s*$/i,
    /^\s*i think\s*$/i,
    /^\s*probably\s*$/i,
    /^\s*perhaps\s*$/i,
  ];

  userResponses.forEach((response) => {
    const content = response.content.trim();

    // Check for explicit skip
    if (content === "[Question skipped]") {
      skippedQuestions++;
      return;
    }

    // Check for "I don't know" patterns
    const isUnknown = unknownPatterns.some((pattern) => pattern.test(content));
    if (isUnknown) {
      unknownResponses++;
      return;
    }

    // Check for very short or vague responses that are essentially non-answers
    if (content.length < 10) {
      const isVague = vaguePatterns.some((pattern) => pattern.test(content));
      if (isVague) {
        unknownResponses++;
      }
    }
  });

  const totalResponses = userResponses.length;
  const totalPenalizedResponses = skippedQuestions + unknownResponses;

  // Calculate penalty score (maximum 20 points penalty)
  const penaltyScore = Math.min(20, totalPenalizedResponses * 5);

  return {
    skippedQuestions,
    unknownResponses,
    totalResponses,
    penaltyScore,
  };
}

function getSeniorityAnalysisExpectations(seniority: string): string {
  const expectations = {
    junior: `
- **Technical Depth**: Basic to intermediate understanding of core technologies
- **Expected Score Range**: 60-75 points for solid junior performance
- **Problem Solving**: Should break down problems step-by-step with some guidance needed
- **Communication**: Should explain concepts clearly but may lack precision
- **Experience Context**: Academic projects, tutorials, internships`,

    mid: `
- **Technical Depth**: Solid understanding with some specialization areas
- **Expected Score Range**: 70-85 points for strong mid-level performance  
- **Problem Solving**: Independent problem solving with consideration of trade-offs
- **Communication**: Clear technical communication with business context
- **Experience Context**: 2-5 years production experience, mentoring junior developers`,

    senior: `
- **Technical Depth**: Deep expertise with architectural thinking
- **Expected Score Range**: 80-95 points for excellent senior performance
- **Problem Solving**: Systematic approach with multiple solution paths considered
- **Communication**: Can explain complex concepts to various audiences
- **Experience Context**: 5+ years experience, technical leadership, system design`,
  };

  return (
    expectations[seniority as keyof typeof expectations] || expectations.mid
  );
}

function generateAnalysisSystemPrompt(config: InterviewConfig): string {
  const { position, seniority, interviewType } = config;

  return `You are a senior technical interviewer with expertise in ${position} roles and 15+ years of experience at leading tech companies. You're conducting a comprehensive analysis of a ${seniority}-level ${position} candidate's ${interviewType} interview performance.

## ANALYSIS FRAMEWORK:

### TECHNICAL COMPETENCY ASSESSMENT (30 points):
- **Accuracy**: Correctness of technical information and concepts
- **Depth**: Level of technical understanding demonstrated
- **Currency**: Knowledge of modern practices and technologies
- **Application**: Practical application of technical knowledge

### PROBLEM-SOLVING METHODOLOGY (25 points):
- **Approach**: Systematic breakdown of complex problems
- **Trade-offs**: Consideration of alternatives and their implications
- **Edge Cases**: Awareness of potential issues and limitations
- **Optimization**: Ability to improve solutions iteratively

### COMMUNICATION EFFECTIVENESS (25 points):
- **Clarity**: Clear explanation of technical concepts
- **Structure**: Logical organization of responses
- **Audience Awareness**: Appropriate level of technical detail
- **Examples**: Use of concrete examples and analogies

### PROFESSIONAL READINESS (20 points):
- **Experience Application**: Connecting theory to real-world scenarios
- **Best Practices**: Knowledge of industry standards and conventions
- **Collaboration**: Understanding of team dynamics and processes
- **Growth Mindset**: Learning orientation and adaptability

## SENIORITY EXPECTATIONS FOR ${seniority.toUpperCase()}:
${getSeniorityAnalysisExpectations(seniority)}

## SCORING PENALTIES:
- **Skipped Questions**: Each "[Question skipped]" response = 0 points for that question, -5 points overall penalty
- **"I Don't Know" Responses**: Responses like "I don't know", "not sure", "no idea" = 0 points for that question, -5 points overall penalty  
- **Vague Non-Answers**: Very short responses like "maybe", "possibly" without elaboration = significant point deduction
- **Maximum Penalty**: Up to -20 points total for multiple skipped/unknown responses

## OUTPUT FORMAT:

## OVERALL SCORE
Score: [NUMBER]/100
**Performance Level**: [Below Expectations | Meets Expectations | Exceeds Expectations]
[2-3 sentence executive summary]

## TECHNICAL COMPETENCY ([SCORE]/30)
**Strengths**: [Specific technical strengths with examples]
**Areas for Growth**: [Specific technical gaps with examples]

## PROBLEM-SOLVING ([SCORE]/25)  
**Strengths**: [Problem-solving approach highlights]
**Areas for Growth**: [Problem-solving methodology improvements]

## COMMUNICATION ([SCORE]/25)
**Strengths**: [Communication effectiveness highlights] 
**Areas for Growth**: [Communication improvement areas]

## PROFESSIONAL READINESS ([SCORE]/20)
**Strengths**: [Professional experience and readiness indicators]
**Areas for Growth**: [Professional development areas]

## DETAILED RECOMMENDATIONS
### Immediate Focus Areas:
1. [Specific actionable item with timeline]
2. [Specific actionable item with timeline]
3. [Specific actionable item with timeline]

### Learning Resources:
- [Specific books, courses, or materials]
- [Practice problems or projects]
- [Communities or mentorship opportunities]

### Interview Performance Tips:
- [Specific behavioral recommendations]
- [Communication improvements]
- [Technical presentation suggestions]

Be constructive, specific, and actionable in your feedback. Reference specific responses when possible.`;
}

function generateAnalysisPrompt(
  conversationHistory: Message[],
  config: InterviewConfig,
): string {
  const { position, seniority, interviewType } = config;

  // Analyze skipped and unknown responses
  const responseAnalysis =
    identifySkippedOrUnknownResponses(conversationHistory);

  const conversation = conversationHistory
    .map(
      (msg) =>
        `${msg.type === "ai" ? "INTERVIEWER" : "CANDIDATE"}: ${msg.content}`,
    )
    .join("\n\n");

  return `Please analyze this ${interviewType} interview for a ${seniority}-level ${position} position:

INTERVIEW TRANSCRIPT:
${conversation}

CONTEXT:
- Position: ${position}
- Seniority: ${seniority}
- Interview Type: ${interviewType}
- Total Questions: ${conversationHistory.filter((msg) => msg.type === "ai" && !msg.content.includes("Hello!")).length}
- Total Responses: ${conversationHistory.filter((msg) => msg.type === "user").length}

RESPONSE QUALITY ANALYSIS:
- Skipped Questions: ${responseAnalysis.skippedQuestions}
- "I Don't Know" Responses: ${responseAnalysis.unknownResponses}
- Total Penalty Score: -${responseAnalysis.penaltyScore} points
- Effective Response Rate: ${Math.round(((responseAnalysis.totalResponses - responseAnalysis.skippedQuestions - responseAnalysis.unknownResponses) / responseAnalysis.totalResponses) * 100)}%

IMPORTANT: Apply the penalty score (-${responseAnalysis.penaltyScore} points) to the overall score. Skipped questions and "I don't know" responses should be treated as 0-point answers and negatively impact the technical competency and problem-solving scores.

Please provide a comprehensive analysis following the structured format in your system prompt.`;
}

function parseAnalysis(analysis: string) {
  const sections: {
    overallScore: string;
    strengths: string[];
    improvements: string[];
    detailedAnalysis: string;
    recommendations: string;
    nextSteps: string;
  } = {
    overallScore: "",
    strengths: [],
    improvements: [],
    detailedAnalysis: "",
    recommendations: "",
    nextSteps: "",
  };

  try {
    // Extract overall score (handle markdown formatting)
    const scoreMatch = analysis.match(
      /##\s*\*?\*?OVERALL SCORE\*?\*?\s*([\s\S]*?)(?=##|---|$)/i,
    );
    if (scoreMatch) {
      sections.overallScore = scoreMatch[1].trim();
    }

    // Extract strengths (handle markdown formatting)
    const strengthsMatch = analysis.match(
      /##\s*\*?\*?STRENGTHS\*?\*?\s*([\s\S]*?)(?=##|---|$)/i,
    );
    if (strengthsMatch) {
      sections.strengths = strengthsMatch[1]
        .split("\n")
        .filter(
          (line) =>
            line.trim().startsWith("-") ||
            line.trim().startsWith("•") ||
            /^\d+\./.test(line.trim()),
        )
        .map((line) =>
          line
            .replace(/^[-•\d+.\s]*/, "")
            .replace(/^\*\*(.*?)\*\*\s*[-–]?\s*/, "$1: ")
            .trim(),
        )
        .filter((line) => line.length > 0);
    }

    // Extract improvements (handle markdown formatting)
    const improvementsMatch = analysis.match(
      /##\s*\*?\*?AREAS FOR IMPROVEMENT\*?\*?\s*([\s\S]*?)(?=##|---|$)/i,
    );
    if (improvementsMatch) {
      sections.improvements = improvementsMatch[1]
        .split("\n")
        .filter(
          (line) =>
            line.trim().startsWith("-") ||
            line.trim().startsWith("•") ||
            /^\d+\./.test(line.trim()),
        )
        .map((line) =>
          line
            .replace(/^[-•\d+.\s]*/, "")
            .replace(/^\*\*(.*?)\*\*\s*[-–]?\s*/, "$1: ")
            .trim(),
        )
        .filter((line) => line.length > 0);
    }

    // Extract detailed analysis (handle markdown formatting)
    const detailedMatch = analysis.match(
      /##\s*\*?\*?DETAILED ANALYSIS\*?\*?\s*([\s\S]*?)(?=##|---|$)/i,
    );
    if (detailedMatch) {
      sections.detailedAnalysis = detailedMatch[1].trim();
    }

    // Extract recommendations (handle markdown formatting)
    const recommendationsMatch = analysis.match(
      /##\s*\*?\*?RECOMMENDATIONS\*?\*?\s*([\s\S]*?)(?=##|---|$)/i,
    );
    if (recommendationsMatch) {
      sections.recommendations = recommendationsMatch[1].trim();
    }

    // Extract next steps (handle markdown formatting)
    const nextStepsMatch = analysis.match(
      /##\s*\*?\*?NEXT STEPS\*?\*?\s*([\s\S]*?)(?=##|---|$)/i,
    );
    if (nextStepsMatch) {
      sections.nextSteps = nextStepsMatch[1].trim();
    }

    // Calculate numerical score
    const scoreNumber = extractScore(sections.overallScore);

    return {
      ...sections,
      score: scoreNumber,
      scoreColor: getScoreColor(scoreNumber),
    };
  } catch (error) {
    console.error("Error parsing analysis:", error);
    return {
      overallScore: analysis,
      strengths: [],
      improvements: [],
      detailedAnalysis: analysis,
      recommendations: "",
      nextSteps: "",
      score: 0,
      scoreColor: "text-gray-500",
    };
  }
}

function extractScore(scoreText: string): number {
  // Try various score formats
  const patterns = [
    /(\d+)(?:\s*\/\s*100|\s*out\s*of\s*100|\s*%)/i,
    /score[:\s]*(\d+)/i,
    /(\d+)[/\s]*100/i,
    /(\d+)\s*points?/i,
    /^(\d+)/,
    /(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = scoreText.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 0 && num <= 100) {
        return num;
      }
    }
  }

  return 0;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 80) return "text-green-500";
  if (score >= 70) return "text-yellow-500";
  if (score >= 60) return "text-orange-500";
  return "text-red-500";
}

function generateMockAnalysis(config: InterviewConfig): string {
  return `## OVERALL SCORE
Score: 0/100
Analysis requires AI service to be configured.

## STRENGTHS
- Demonstrated solid understanding of core concepts
- Clear and articulate responses
- Good problem-solving approach
- Relevant experience examples
- Professional communication style

## AREAS FOR IMPROVEMENT
- Could provide more detailed technical examples
- Consider discussing edge cases and error handling
- Expand on scalability considerations
- Include more specific metrics or performance considerations

## DETAILED ANALYSIS
The candidate showed strong foundational knowledge in ${config.interviewType} concepts. Responses were well-structured and demonstrated practical experience. Communication was clear and professional throughout the interview. Areas for growth include providing more detailed technical implementations and considering broader system design aspects.

## RECOMMENDATIONS
- Practice explaining technical concepts with specific code examples
- Study advanced ${config.position.toLowerCase()} patterns and best practices
- Review system design principles for scalable applications
- Practice concise responses for bullet interviews

## NEXT STEPS
- Continue building projects that showcase advanced skills
- Consider contributing to open source projects
- Practice mock interviews to improve confidence
- Stay updated with latest industry trends and technologies`;
}
