import { Mistral } from "@mistralai/mistralai";
import { type NextRequest, NextResponse } from "next/server";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory, interviewConfig } = await request.json();

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

    const responseAnalysis = analyzeResponseQuality(conversationHistory);

    const systemPrompt = generateAnalysisSystemPrompt(interviewConfig);
    const analysisPrompt = generateAnalysisPrompt(
      conversationHistory,
      interviewConfig,
      responseAnalysis,
    );

    let analysisText: string;

    if (!process.env.MISTRAL_API_KEY) {
      analysisText = generateMockAnalysis(interviewConfig, responseAnalysis);
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
          temperature: 0.2,
          maxTokens: 2500,
        });

        const analysis = chatResponse.choices?.[0]?.message?.content;
        analysisText =
          typeof analysis === "string"
            ? analysis
            : "Unable to generate analysis at this time.";
      } catch (apiError) {
        console.error("Mistral API error, falling back to mock:", apiError);
        analysisText = generateMockAnalysis(interviewConfig, responseAnalysis);
      }
    }

    const feedback = parseAnalysis(
      analysisText,
      responseAnalysis,
      interviewConfig,
    );

    return NextResponse.json({
      success: true,
      feedback,
      rawAnalysis: analysisText,
    });
  } catch (error) {
    console.error("Analysis API error:", error);

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

interface ResponseAnalysis {
  totalQuestions: number;
  totalResponses: number;
  skippedQuestions: number;
  noAnswerResponses: number;
  veryShortResponses: number;
  gibberishResponses: number;
  substantiveResponses: number;
  averageResponseLength: number;
  effectiveResponseRate: number;
  qualityScore: number;
}

function analyzeResponseQuality(
  conversationHistory: Message[],
): ResponseAnalysis {
  const aiMessages = conversationHistory.filter(
    (msg) => msg.type === "ai" && !msg.content.toLowerCase().includes("hello"),
  );
  const userResponses = conversationHistory.filter(
    (msg) => msg.type === "user",
  );

  let skippedQuestions = 0;
  let noAnswerResponses = 0;
  let veryShortResponses = 0;
  let gibberishResponses = 0;
  let substantiveResponses = 0;
  let totalLength = 0;

  const noAnswerPatterns = [
    /^\s*\[question skipped\]\s*$/i,
    /^\s*skip(?:ped)?\s*$/i,
    /^\s*pass\s*$/i,
    /^\s*next\s*$/i,
    /^\s*i\s*don'?t\s*know\s*\.?$/i,
    /^\s*idk\s*\.?$/i,
    /^\s*dunno\s*\.?$/i,
    /^\s*no\s*idea\s*\.?$/i,
    /^\s*not\s*sure\s*\.?$/i,
    /^\s*i'?m\s*not\s*sure\s*\.?$/i,
    /^\s*i\s*have\s*no\s*idea\s*\.?$/i,
    /^\s*don'?t\s*know\s*\.?$/i,
    /^\s*no\s*clue\s*\.?$/i,
    /^\s*unsure\s*\.?$/i,
    /^\s*unknown\s*\.?$/i,
    /^\s*maybe\s*\.?$/i,
    /^\s*perhaps\s*\.?$/i,
    /^\s*possibly\s*\.?$/i,
    /^\s*i\s*think\s*\.?$/i,
    /^\s*not\s*really\s*\.?$/i,
    /^\s*kind\s*of\s*\.?$/i,
    /^\s*sort\s*of\s*\.?$/i,
    /^\s*um+\s*\.?$/i,
    /^\s*uh+\s*\.?$/i,
    /^\s*er+\s*\.?$/i,
    /^\s*hmm+\s*\.?$/i,
    /^\s*well+\s*\.?$/i,
    /^\s*\.+\s*$/,
    /^\s*\?+\s*$/,
  ];

  const gibberishPatterns = [
    /^(.)\1{5,}$/,
    /^[^a-zA-Z0-9\s]{5,}$/,
    /^\s*lol+\s*$/i,
    /^\s*haha+\s*$/i,
    /^\s*ok+\s*$/i,
    /^\s*okay+\s*$/i,
    /^\s*yes\s*$/i,
    /^\s*no\s*$/i,
    /^\s*nope\s*$/i,
    /^\s*yep\s*$/i,
    /^\s*sure\s*$/i,
    /^\s*fine\s*$/i,
    /^\s*whatever\s*$/i,
    /^[0-9]+$/,
    /^[a-z]$/,
  ];

  userResponses.forEach((response) => {
    const content = response.content.trim();
    const wordCount = content.split(/\s+/).filter((w) => w.length > 0).length;
    totalLength += content.length;

    if (
      content === "[Question skipped]" ||
      content.toLowerCase() === "[question skipped]"
    ) {
      skippedQuestions++;
      return;
    }

    const isNoAnswer = noAnswerPatterns.some((pattern) =>
      pattern.test(content),
    );
    if (isNoAnswer) {
      noAnswerResponses++;
      return;
    }

    const isGibberish = gibberishPatterns.some((pattern) =>
      pattern.test(content),
    );
    if (isGibberish) {
      gibberishResponses++;
      return;
    }

    if (content.length < 20 || wordCount < 4) {
      veryShortResponses++;
      return;
    }

    substantiveResponses++;
  });

  const totalQuestions = aiMessages.length;
  const totalResponses = userResponses.length;
  const poorResponses =
    skippedQuestions +
    noAnswerResponses +
    gibberishResponses +
    veryShortResponses;

  const effectiveResponseRate =
    totalResponses > 0 ? (substantiveResponses / totalResponses) * 100 : 0;

  const averageResponseLength =
    totalResponses > 0 ? totalLength / totalResponses : 0;

  const qualityScore = Math.max(
    0,
    Math.min(
      100,
      (substantiveResponses / Math.max(totalQuestions, 1)) * 100 -
        (poorResponses / Math.max(totalQuestions, 1)) * 50,
    ),
  );

  return {
    totalQuestions,
    totalResponses,
    skippedQuestions,
    noAnswerResponses,
    veryShortResponses,
    gibberishResponses,
    substantiveResponses,
    averageResponseLength,
    effectiveResponseRate,
    qualityScore,
  };
}

function getPassingThreshold(seniority: string): {
  score: number;
  description: string;
} {
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

  return thresholds[seniority as keyof typeof thresholds] || thresholds.mid;
}

function generateAnalysisSystemPrompt(config: InterviewConfig): string {
  const { position, seniority, interviewType } = config;
  const passingThreshold = getPassingThreshold(seniority);

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

function generateAnalysisPrompt(
  conversationHistory: Message[],
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  const { position, seniority, interviewType } = config;

  const conversation = conversationHistory
    .map(
      (msg) =>
        `${msg.type === "ai" ? "INTERVIEWER" : "CANDIDATE"}: ${msg.content}`,
    )
    .join("\n\n");

  const passingThreshold = getPassingThreshold(seniority);

  return `Analyze this ${interviewType} interview for a ${seniority}-level ${position} position.

INTERVIEW TRANSCRIPT:
${conversation}

RESPONSE QUALITY ANALYSIS:
📊 Total Questions Asked: ${responseAnalysis.totalQuestions}
📝 Total Responses Given: ${responseAnalysis.totalResponses}
❌ Skipped Questions: ${responseAnalysis.skippedQuestions}
🚫 "I Don't Know" Responses: ${responseAnalysis.noAnswerResponses}
⚠️ Gibberish/Single-Word Responses: ${responseAnalysis.gibberishResponses}
📏 Very Short Responses (<20 chars): ${responseAnalysis.veryShortResponses}
✅ Substantive Responses: ${responseAnalysis.substantiveResponses}
📈 Effective Response Rate: ${responseAnalysis.effectiveResponseRate.toFixed(1)}%
🎯 Quality Score: ${responseAnalysis.qualityScore.toFixed(1)}/100
📊 Average Response Length: ${responseAnalysis.averageResponseLength.toFixed(0)} characters

CRITICAL ASSESSMENT FLAGS:
${
  responseAnalysis.substantiveResponses === 0
    ? "🚨 CRITICAL: ZERO substantive responses. This is an automatic FAIL. Score must be 0-10."
    : responseAnalysis.effectiveResponseRate < 30
      ? "🚨 CRITICAL: Under 30% effective responses. Strong FAIL likely. Maximum score should be 15-25."
      : responseAnalysis.effectiveResponseRate < 50
        ? "⚠️ WARNING: Under 50% effective responses. FAIL likely. Maximum score should be 25-40."
        : responseAnalysis.effectiveResponseRate < 70
          ? "⚠️ CAUTION: Under 70% effective responses. May fail if responses lack depth. Score caps around 50-60."
          : "✓ Adequate response rate. Now assess actual quality and correctness of content."
}

PASSING CRITERIA:
- Required Score: ${passingThreshold.score}/100
- ${passingThreshold.description}

INSTRUCTIONS:
1. Read EVERY response carefully
2. Score based ONLY on actual knowledge demonstrated
3. Give ZERO points for "I don't know", gibberish, or wrong answers
4. Identify specific examples of good and bad responses
5. Make a clear PASS or FAIL decision
6. Explain your decision with evidence

Remember: Be honest and strict. A bad hire costs companies hundreds of thousands of dollars. Only pass candidates who truly demonstrated the required knowledge.`;
}

function parseAnalysis(
  analysis: string,
  responseAnalysis: ResponseAnalysis,
  config: InterviewConfig,
) {
  const sections: {
    decision: string;
    overallScore: string;
    strengths: string[];
    improvements: string[];
    detailedAnalysis: string;
    recommendations: string;
    nextSteps: string;
    whyDecision: string;
  } = {
    decision: "UNKNOWN",
    overallScore: "",
    strengths: [],
    improvements: [],
    detailedAnalysis: "",
    recommendations: "",
    nextSteps: "",
    whyDecision: "",
  };

  try {
    const decisionMatch = analysis.match(/\*\*DECISION:\s*(PASS|FAIL)\*\*/i);
    if (decisionMatch) {
      sections.decision = decisionMatch[1].toUpperCase();
    }

    const scoreMatch = analysis.match(
      /##\s*INTERVIEW RESULT\s*([\s\S]*?)(?=##|$)/i,
    );
    if (scoreMatch) {
      sections.overallScore = scoreMatch[1].trim();
    }

    const whyMatch = analysis.match(
      /##\s*WHY THIS DECISION\s*([\s\S]*?)(?=##|$)/i,
    );
    if (whyMatch) {
      sections.whyDecision = whyMatch[1].trim();
    }

    const strengthMatches = analysis.matchAll(
      /\*\*Strengths:\*\*\s*([\s\S]*?)(?=\*\*Critical Weaknesses:|\*\*Areas for Growth:|\*\*|\n##|$)/gi,
    );
    for (const match of strengthMatches) {
      const items = match[1]
        .split("\n")
        .filter((line) => line.trim().match(/^[-•*]\s+/))
        .map((line) => line.replace(/^[-•*]\s+/, "").trim())
        .filter(
          (line) =>
            line.length > 0 &&
            !line.toLowerCase().includes("none demonstrated"),
        );
      sections.strengths.push(...items);
    }

    const weaknessMatches = analysis.matchAll(
      /\*\*(?:Critical Weaknesses|Areas for Growth):\*\*\s*([\s\S]*?)(?=##|\*\*Strengths:|\n\n##|$)/gi,
    );
    for (const match of weaknessMatches) {
      const items = match[1]
        .split("\n")
        .filter((line) => line.trim().match(/^[-•*]\s+/))
        .map((line) => line.replace(/^[-•*]\s+/, "").trim())
        .filter((line) => line.length > 0);
      sections.improvements.push(...items);
    }

    const recommendationsMatch = analysis.match(
      /##\s*RECOMMENDATIONS\s*([\s\S]*?)(?=##|$)/i,
    );
    if (recommendationsMatch) {
      sections.recommendations = recommendationsMatch[1].trim();
      sections.nextSteps = recommendationsMatch[1].trim();
    }

    const categories = [
      "TECHNICAL COMPETENCY",
      "PROBLEM SOLVING",
      "COMMUNICATION",
      "PROFESSIONAL READINESS",
    ];
    const detailedParts: string[] = [];

    categories.forEach((category) => {
      const categoryMatch = analysis.match(
        new RegExp(
          `##\\s*${category}\\s*\\([^)]+\\)\\s*([\\s\\S]*?)(?=##|$)`,
          "i",
        ),
      );
      if (categoryMatch) {
        detailedParts.push(`**${category}**\n${categoryMatch[1].trim()}`);
      }
    });

    if (sections.whyDecision) {
      detailedParts.unshift(`**WHY THIS DECISION**\n${sections.whyDecision}`);
    }

    sections.detailedAnalysis = detailedParts.join("\n\n");

    let scoreNumber = extractScore(sections.overallScore);

    const maxAllowedScore = calculateMaxScore(responseAnalysis);
    if (scoreNumber > maxAllowedScore) {
      console.warn(
        `Score ${scoreNumber} exceeds maximum ${maxAllowedScore} for response quality, capping`,
      );
      scoreNumber = maxAllowedScore;
    }

    const passingThreshold = getPassingThreshold(config.seniority);
    if (scoreNumber < passingThreshold.score && sections.decision === "PASS") {
      sections.decision = "FAIL";
    } else if (
      scoreNumber >= passingThreshold.score &&
      sections.decision === "FAIL"
    ) {
      sections.decision = "PASS";
    }

    if (sections.strengths.length === 0) {
      sections.strengths.push(
        "No significant strengths demonstrated in this interview",
      );
    }
    if (sections.improvements.length === 0) {
      sections.improvements.push("Fundamental knowledge gaps across all areas");
    }

    return {
      ...sections,
      score: scoreNumber,
      scoreColor: getScoreColor(scoreNumber),
      passed: sections.decision === "PASS",
      passingThreshold: passingThreshold.score,
    };
  } catch (error) {
    console.error("Error parsing analysis:", error);
    return {
      decision: "FAIL",
      overallScore: analysis,
      strengths: ["Unable to parse analysis"],
      improvements: ["Please review the detailed analysis below"],
      detailedAnalysis: analysis,
      recommendations: "Please try generating the analysis again.",
      nextSteps: "Contact support if this issue persists.",
      whyDecision: "Analysis parsing failed",
      score: 0,
      scoreColor: "text-red-500",
      passed: false,
      passingThreshold: getPassingThreshold(config.seniority).score,
    };
  }
}

function calculateMaxScore(responseAnalysis: ResponseAnalysis): number {
  const { substantiveResponses, totalQuestions, qualityScore } =
    responseAnalysis;

  if (substantiveResponses === 0) return 10;

  const responseRate = substantiveResponses / Math.max(totalQuestions, 1);

  if (responseRate < 0.3) return 25;
  if (responseRate < 0.5) return 40;
  if (responseRate < 0.7) return 60;

  return Math.min(100, Math.round(qualityScore * 1.2));
}

function extractScore(scoreText: string): number {
  const patterns = [
    /Score:\s*(\d+)\s*\/\s*100/i,
    /(\d+)\s*\/\s*100/i,
    /score[:\s]+(\d+)/i,
    /(\d+)\s*points?/i,
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

function generateMockAnalysis(
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  const passingThreshold = getPassingThreshold(config.seniority);
  const maxScore = calculateMaxScore(responseAnalysis);
  const baseScore = Math.min(
    maxScore,
    Math.round(responseAnalysis.qualityScore * 0.9),
  );
  const score = Math.max(0, baseScore);

  const passed = score >= passingThreshold.score;
  const decision = passed ? "PASS" : "FAIL";

  const technicalScore = Math.round((score / 100) * 30);
  const problemSolvingScore = Math.round((score / 100) * 25);
  const communicationScore = Math.round((score / 100) * 25);
  const professionalScore = Math.round((score / 100) * 20);

  const performanceLevel =
    score >= 80
      ? "Exceeds Expectations"
      : score >= 70
        ? "Meets Expectations"
        : score >= 50
          ? "Below Expectations"
          : "Far Below Expectations";

  let executiveSummary = "";
  if (responseAnalysis.substantiveResponses === 0) {
    executiveSummary =
      "The candidate failed to provide any substantive responses during the interview. Every answer was either 'I don't know', skipped, or gibberish. This demonstrates a complete lack of preparation and knowledge required for this role.";
  } else if (responseAnalysis.effectiveResponseRate < 30) {
    executiveSummary = `The candidate struggled severely, with only ${responseAnalysis.substantiveResponses} out of ${responseAnalysis.totalQuestions} questions receiving real answers. This indicates fundamental knowledge gaps that make them unsuitable for this ${config.seniority}-level position.`;
  } else if (responseAnalysis.effectiveResponseRate < 50) {
    executiveSummary = `The candidate showed limited knowledge, failing to adequately answer over half the interview questions. While they demonstrated some basic understanding, the numerous "I don't know" responses (${responseAnalysis.noAnswerResponses}) indicate they are not ready for this role.`;
  } else if (passed) {
    executiveSummary = `The candidate demonstrated sufficient knowledge and problem-solving ability to pass this ${config.seniority}-level interview. While there are areas for improvement, they showed the foundational competencies required for the role.`;
  } else {
    executiveSummary = `The candidate showed some knowledge but fell short of the ${passingThreshold.score}-point threshold required for ${config.seniority}-level positions. Key technical gaps and inconsistent responses prevented a passing score.`;
  }

  let whyDecision = "";
  if (!passed) {
    whyDecision = `The candidate FAILED this interview with a score of ${score}/${passingThreshold.score}. `;
    if (
      responseAnalysis.substantiveResponses <
      responseAnalysis.totalQuestions / 2
    ) {
      whyDecision += `They were unable to answer ${responseAnalysis.noAnswerResponses + responseAnalysis.skippedQuestions} questions out of ${responseAnalysis.totalQuestions} total questions, saying "I don't know" or skipping them entirely. `;
    }
    whyDecision += `For a ${config.seniority}-level ${config.position} role, we expect candidates to demonstrate strong foundational knowledge and the ability to work through problems even when unsure. This candidate showed neither, failing to meet the minimum bar for hiring.`;
  } else {
    whyDecision = `The candidate PASSED this interview with a score of ${score}/${passingThreshold.score}. They provided substantive answers to ${responseAnalysis.substantiveResponses} out of ${responseAnalysis.totalQuestions} questions, demonstrating adequate knowledge of core ${config.position} concepts. While not perfect, they showed sufficient competency to perform at a ${config.seniority} level with appropriate onboarding and support.`;
  }

  const strengthsList =
    technicalScore > 15
      ? [
          "Attempted to engage with technical questions when knowledgeable",
          responseAnalysis.averageResponseLength > 100
            ? "Provided detailed responses on familiar topics"
            : "Showed basic understanding of some concepts",
        ]
      : [];

  const technicalWeaknesses = [
    responseAnalysis.noAnswerResponses > 0
      ? `Said "I don't know" to ${responseAnalysis.noAnswerResponses} technical questions`
      : "Significant gaps in fundamental knowledge",
    responseAnalysis.skippedQuestions > 0
      ? `Skipped ${responseAnalysis.skippedQuestions} questions entirely`
      : "Unable to explain core concepts in depth",
    responseAnalysis.substantiveResponses < responseAnalysis.totalQuestions / 2
      ? "Failed to answer over 50% of questions adequately"
      : "Inconsistent technical knowledge across topics",
  ];

  const problemSolvingWeaknesses = [
    "Unable to work through problems when faced with unknowns",
    "Gave up quickly instead of attempting logical reasoning",
    responseAnalysis.veryShortResponses > 2
      ? "Many responses were too brief to show problem-solving process"
      : "Did not break down complex problems systematically",
  ];

  const communicationStrengths =
    communicationScore > 12
      ? [
          responseAnalysis.averageResponseLength > 100
            ? "Provided detailed explanations when knowledgeable"
            : "Communicated clearly on familiar topics",
          "Honest about knowledge gaps",
        ]
      : [];

  const communicationWeaknesses = [
    responseAnalysis.veryShortResponses + responseAnalysis.gibberishResponses >
    3
      ? "Many responses were single words or gibberish"
      : "Could not articulate technical concepts effectively",
    responseAnalysis.averageResponseLength < 50
      ? "Extremely brief responses that lacked substance"
      : "Struggled to structure coherent answers",
    "Failed to elaborate or provide examples",
  ];

  const professionalWeaknesses = [
    responseAnalysis.effectiveResponseRate < 50
      ? "Appears unprepared for this level of interview"
      : "Knowledge gaps suggest insufficient experience",
    responseAnalysis.substantiveResponses === 0
      ? "Complete lack of preparation demonstrates unprofessional approach"
      : "Unable to demonstrate practical application of concepts",
    `Not ready for ${config.seniority}-level responsibilities`,
  ];

  const recommendations = passed
    ? `### Next Steps Before Starting:
1. **Strengthen Weak Areas** (2-4 weeks): Review the topics where you struggled during the interview
2. **Practical Application** (Ongoing): Build small projects to reinforce theoretical knowledge
3. **Communication Practice** (1-2 weeks): Practice explaining technical concepts clearly and concisely

### Learning Resources:
- Official documentation for ${config.position} core technologies
- Online courses: Udemy, Coursera, or Pluralsight specific to your role
- Practice platforms: LeetCode, HackerRank for technical problem-solving
- Mock interviews: Practice with peers or use interview prep services

### Interview Performance Tips:
- Even when unsure, explain your thinking process rather than saying "I don't know"
- Use the STAR method (Situation, Task, Action, Result) for behavioral questions
- Ask clarifying questions before answering to show analytical thinking`
    : `### Critical Improvements Required Before Re-interviewing:
1. **Master Fundamentals** (3-6 months): ${responseAnalysis.substantiveResponses === 0 ? "You need to learn the basics from scratch. Start with introductory courses." : `Focus on core ${config.position} concepts you couldn't answer`}
2. **Build Real Projects** (3-6 months): Create 3-5 substantial projects to gain practical experience
3. **Study Consistently** (Daily for 6+ months): Dedicate 2-3 hours per day to structured learning

### Learning Resources:
- **START HERE**: Beginner courses on Udemy/Coursera for ${config.position}
- **Read Daily**: Official documentation and tutorials
- **Practice Daily**: LeetCode Easy problems, gradually increase difficulty
- **Build Projects**: Follow YouTube tutorials first, then create original projects
- **Join Communities**: Reddit, Discord servers for ${config.position} to ask questions

### Before Your Next Interview:
- **Never say "I don't know" without attempting an answer** - explain your thought process
- **Study the job description thoroughly** - know every technology mentioned
- **Practice out loud** - record yourself answering common questions
- **Do at least 50 practice interview questions** - time yourself and review
- **Wait at least 3-6 months before reapplying** - use this time to build real skills

### Honest Assessment:
${
  responseAnalysis.effectiveResponseRate < 30
    ? `You are not ready for ${config.seniority}-level interviews. Consider applying for internships or junior positions first to gain foundational experience.`
    : `You have some knowledge but significant gaps remain. Focus on systematic learning and practical application before attempting another interview at this level.`
}`;

  return `## INTERVIEW RESULT
**DECISION: ${decision}**
Score: ${score}/100 (Passing threshold: ${passingThreshold.score})
Performance Level: ${performanceLevel}

${executiveSummary}

## TECHNICAL COMPETENCY (${technicalScore}/30)
**Strengths:**
${strengthsList.length > 0 ? strengthsList.map((s) => `- ${s}`).join("\n") : "- None demonstrated"}

**Critical Weaknesses:**
${technicalWeaknesses.map((w) => `- ${w}`).join("\n")}

## PROBLEM SOLVING (${problemSolvingScore}/25)
**Strengths:**
${problemSolvingScore > 12 ? "- Attempted systematic approaches when comfortable with topics" : "- None demonstrated"}

**Critical Weaknesses:**
${problemSolvingWeaknesses.map((w) => `- ${w}`).join("\n")}

## COMMUNICATION (${communicationScore}/25)
**Strengths:**
${communicationStrengths.length > 0 ? communicationStrengths.map((s) => `- ${s}`).join("\n") : "- None demonstrated"}

**Critical Weaknesses:**
${communicationWeaknesses.map((w) => `- ${w}`).join("\n")}

## PROFESSIONAL READINESS (${professionalScore}/20)
**Strengths:**
${professionalScore > 10 ? "- Showed up and participated in the interview process" : "- None demonstrated"}

**Critical Weaknesses:**
${professionalWeaknesses.map((w) => `- ${w}`).join("\n")}

## WHY THIS DECISION
${whyDecision}

## RECOMMENDATIONS
${recommendations}

---

**Note**: This analysis reflects the actual performance demonstrated during the interview. ${!passed ? "A failing score means you did not meet the minimum threshold required for this position." : "While you passed, continue improving in the areas identified above."}`;
}
