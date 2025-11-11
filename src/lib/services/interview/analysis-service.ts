/**
 * Interview Analysis Service
 * Handles parsing and processing of interview analysis results
 */

import { SENIORITY_EXPECTATIONS } from "@/lib/config/interview-config";
import type {
  InterviewConfig,
  InterviewResults,
  ResponseAnalysis,
} from "@/types/interview";
import { calculateMaxScore } from "./interview-service";

/**
 * Parse interview analysis from AI response
 */
export function parseAnalysis(
  analysis: string,
  responseAnalysis: ResponseAnalysis,
  config: InterviewConfig,
): InterviewResults {
  const sections = initializeAnalysisSections();

  try {
    // Extract decision
    const decisionMatch = analysis.match(/\*\*DECISION:\s*(PASS|FAIL)\*\*/i);
    if (decisionMatch) {
      sections.decision = decisionMatch[1].toUpperCase() as "PASS" | "FAIL";
    }

    // Extract overall score section
    const scoreMatch = analysis.match(
      /##\s*INTERVIEW RESULT\s*([\s\S]*?)(?=##|$)/i,
    );
    if (scoreMatch) {
      sections.overallScore = scoreMatch[1].trim();
    }

    // Extract why decision section
    const whyMatch = analysis.match(
      /##\s*WHY THIS DECISION\s*([\s\S]*?)(?=##|$)/i,
    );
    if (whyMatch) {
      sections.whyDecision = whyMatch[1].trim();
    }

    sections.strengths = extractListItems(analysis, "Strengths");

    sections.improvements = extractListItems(
      analysis,
      "Critical Weaknesses|Areas for Growth|Required Improvements|If Failed - Required Improvements",
    );

    const recommendationsMatch = analysis.match(
      /##\s*RECOMMENDATIONS\s*([\s\S]*?)(?=##|$)/i,
    );
    if (recommendationsMatch) {
      sections.recommendations = recommendationsMatch[1].trim();
      sections.nextSteps = recommendationsMatch[1].trim();
    }

    sections.detailedAnalysis = buildDetailedAnalysis(
      analysis,
      sections.whyDecision,
    );

    // Extract and validate score
    let scoreNumber = extractScore(sections.overallScore);
    const maxAllowedScore = calculateMaxScore(responseAnalysis);

    if (scoreNumber > maxAllowedScore) {
      console.warn(
        `Score ${scoreNumber} exceeds maximum ${maxAllowedScore} for response quality, capping`,
      );
      scoreNumber = maxAllowedScore;
    }

    // Validate pass/fail consistency and fix contradictions
    const passingThreshold = SENIORITY_EXPECTATIONS[config.seniority];
    const shouldPass = scoreNumber >= passingThreshold.score;
    const originalDecision = sections.decision;

    // Always use score-based decision to avoid contradictions
    sections.decision = shouldPass ? "PASS" : "FAIL";

    // Log if there was a contradiction in the AI analysis
    if (
      originalDecision !== "UNKNOWN" &&
      originalDecision !== sections.decision
    ) {
      console.warn(
        `Fixed contradictory analysis: AI said ${originalDecision} but score ${scoreNumber} should be ${sections.decision}`,
      );
    }

    // Ensure we have fallback content
    if (sections.strengths.length === 0) {
      sections.strengths.push(
        "No significant strengths demonstrated in this interview",
      );
    }
    if (sections.improvements.length === 0) {
      // Generate specific improvements based on the config and analysis
      const position = config.position || "technical";
      const seniority = config.seniority || "mid";

      sections.improvements.push(
        `Study fundamental ${position} concepts and best practices`,
        `Practice coding problems appropriate for ${seniority}-level positions`,
        "Improve technical communication and explanation skills",
        "Gain more hands-on experience with real-world projects",
      );
    }

    return {
      ...sections,
      score: scoreNumber,
      scoreColor: getScoreColor(scoreNumber),
      passed: sections.decision === "PASS",
      passingThreshold: passingThreshold.score,
      decision: sections.decision,
    };
  } catch (error) {
    console.error("Error parsing analysis:", error);
    return createErrorAnalysis(analysis, config);
  }
}

/**
 * Generate mock analysis when AI service is unavailable
 */
export function generateMockAnalysis(
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  const passingThreshold = SENIORITY_EXPECTATIONS[config.seniority];
  const maxScore = calculateMaxScore(responseAnalysis);
  const baseScore = Math.min(
    maxScore,
    Math.round(responseAnalysis.qualityScore * 0.9),
  );
  const score = Math.max(0, baseScore);

  const passed = score >= passingThreshold.score;
  const decision = passed ? "PASS" : "FAIL";

  const categoryScores = calculateCategoryScores(score);
  const performanceLevel = getPerformanceLevel(score);
  const executiveSummary = generateExecutiveSummary(
    responseAnalysis,
    config,
    passed,
    passingThreshold,
  );
  const whyDecision = generateWhyDecision(
    responseAnalysis,
    config,
    score,
    passed,
    passingThreshold,
  );
  const recommendations = generateRecommendations(
    passed,
    config,
    responseAnalysis,
  );

  return formatMockAnalysis({
    decision,
    score,
    passingThreshold: passingThreshold.score,
    performanceLevel,
    executiveSummary,
    categoryScores,
    responseAnalysis,
    config,
    whyDecision,
    recommendations,
    passed,
  });
}

// Helper functions
function initializeAnalysisSections() {
  return {
    decision: "UNKNOWN" as "PASS" | "FAIL" | "UNKNOWN",
    overallScore: "",
    strengths: [] as string[],
    improvements: [] as string[],
    detailedAnalysis: "",
    recommendations: "",
    nextSteps: "",
    whyDecision: "",
  };
}

function extractListItems(analysis: string, sectionPattern: string): string[] {
  const items: string[] = [];

  // Try multiple regex patterns to capture different formats
  const patterns = [
    // Pattern 1: **Section:** followed by content
    new RegExp(
      `\\*\\*(${sectionPattern}):\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|\\n##|$)`,
      "gi",
    ),
    // Pattern 2: ### Section followed by content
    new RegExp(
      `###\\s*(${sectionPattern}):?\\s*([\\s\\S]*?)(?=###|\\n##|$)`,
      "gi",
    ),
    // Pattern 3: ## Section followed by content
    new RegExp(`##\\s*(${sectionPattern}):?\\s*([\\s\\S]*?)(?=##|$)`, "gi"),
  ];

  patterns.forEach((regex) => {
    const matches = analysis.matchAll(regex);
    for (const match of matches) {
      const sectionContent = match[2];

      // Extract numbered list items (1., 2., 3.)
      const numberedItems = sectionContent
        .split("\n")
        .filter((line) => line.trim().match(/^\d+\.\s+/))
        .map((line) => line.replace(/^\d+\.\s+/, "").trim())
        .filter((line) => line.length > 0);

      // Extract bullet point items (-, •, *)
      const bulletItems = sectionContent
        .split("\n")
        .filter((line) => line.trim().match(/^[-•*]\s+/))
        .map((line) => line.replace(/^[-•*]\s+/, "").trim())
        .filter((line) => line.length > 0);

      items.push(...numberedItems, ...bulletItems);
    }
  });

  // Remove duplicates and filter out empty/invalid items
  return [...new Set(items)].filter(
    (item) =>
      item.length > 0 &&
      !item.toLowerCase().includes("none demonstrated") &&
      !item.toLowerCase().includes("no significant") &&
      item.length > 10, // Ensure meaningful content
  );
}

function buildDetailedAnalysis(analysis: string, whyDecision: string): string {
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

  if (whyDecision) {
    detailedParts.unshift(`**WHY THIS DECISION**\n${whyDecision}`);
  }

  return detailedParts.join("\n\n");
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

function createErrorAnalysis(
  analysis: string,
  config: InterviewConfig,
): InterviewResults {
  const passingThreshold = SENIORITY_EXPECTATIONS[config.seniority];

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
    passingThreshold: passingThreshold.score,
  };
}

function calculateCategoryScores(totalScore: number) {
  return {
    technical: Math.round((totalScore / 100) * 30),
    problemSolving: Math.round((totalScore / 100) * 25),
    communication: Math.round((totalScore / 100) * 25),
    professional: Math.round((totalScore / 100) * 20),
  };
}

function getPerformanceLevel(score: number): string {
  if (score >= 80) return "Exceeds Expectations";
  if (score >= 70) return "Meets Expectations";
  if (score >= 50) return "Below Expectations";
  return "Far Below Expectations";
}

function generateExecutiveSummary(
  responseAnalysis: ResponseAnalysis,
  config: InterviewConfig,
  passed: boolean,
  passingThreshold: { score: number; description: string },
): string {
  if (responseAnalysis.substantiveResponses === 0) {
    return "The candidate failed to provide any substantive responses during the interview. Every answer was either 'I don't know', skipped, or gibberish. This demonstrates a complete lack of preparation and knowledge required for this role.";
  }

  if (responseAnalysis.effectiveResponseRate < 30) {
    return `The candidate struggled severely, with only ${responseAnalysis.substantiveResponses} out of ${responseAnalysis.totalQuestions} questions receiving real answers. This indicates fundamental knowledge gaps that make them unsuitable for this ${config.seniority}-level position.`;
  }

  if (responseAnalysis.effectiveResponseRate < 50) {
    return `The candidate showed limited knowledge, failing to adequately answer over half the interview questions. While they demonstrated some basic understanding, the numerous "I don't know" responses (${responseAnalysis.noAnswerResponses}) indicate they are not ready for this role.`;
  }

  if (passed) {
    return `The candidate demonstrated sufficient knowledge and problem-solving ability to pass this ${config.seniority}-level interview. While there are areas for improvement, they showed the foundational competencies required for the role.`;
  }

  return `The candidate showed some knowledge but fell short of the ${passingThreshold.score}-point threshold required for ${config.seniority}-level positions. Key technical gaps and inconsistent responses prevented a passing score.`;
}

function generateWhyDecision(
  responseAnalysis: ResponseAnalysis,
  config: InterviewConfig,
  score: number,
  passed: boolean,
  passingThreshold: { score: number; description: string },
): string {
  if (!passed) {
    let decision = `The candidate FAILED this interview with a score of ${score}/${passingThreshold.score}. `;

    if (
      responseAnalysis.substantiveResponses <
      responseAnalysis.totalQuestions / 2
    ) {
      decision += `They were unable to answer ${responseAnalysis.noAnswerResponses + responseAnalysis.skippedQuestions} questions out of ${responseAnalysis.totalQuestions} total questions, saying "I don't know" or skipping them entirely. `;
    }

    decision += `For a ${config.seniority}-level ${config.position} role, we expect candidates to demonstrate strong foundational knowledge and the ability to work through problems even when unsure. This candidate showed neither, failing to meet the minimum bar for hiring.`;

    return decision;
  }

  return `The candidate PASSED this interview with a score of ${score}/${passingThreshold.score}. They provided substantive answers to ${responseAnalysis.substantiveResponses} out of ${responseAnalysis.totalQuestions} questions, demonstrating adequate knowledge of core ${config.position} concepts. While not perfect, they showed sufficient competency to perform at a ${config.seniority} level with appropriate onboarding and support.`;
}

function generateRecommendations(
  passed: boolean,
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  if (passed) {
    return `### Next Steps Before Starting:
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
- Ask clarifying questions before answering to show analytical thinking`;
  }

  const timeframe =
    responseAnalysis.effectiveResponseRate < 30 ? "6+ months" : "3-6 months";
  const startingPoint =
    responseAnalysis.substantiveResponses === 0
      ? "You need to learn the basics from scratch. Start with introductory courses."
      : `Focus on core ${config.position} concepts you couldn't answer`;

  return `### Critical Improvements Required Before Re-interviewing:
1. **Master Fundamentals** (${timeframe}): ${startingPoint}
2. **Build Real Projects** (${timeframe}): Create 3-5 substantial projects to gain practical experience
3. **Study Consistently** (Daily for ${timeframe}): Dedicate 2-3 hours per day to structured learning

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
- **Wait at least ${timeframe} before reapplying** - use this time to build real skills

### Honest Assessment:
${
  responseAnalysis.effectiveResponseRate < 30
    ? `You are not ready for ${config.seniority}-level interviews. Consider applying for internships or junior positions first to gain foundational experience.`
    : `You have some knowledge but significant gaps remain. Focus on systematic learning and practical application before attempting another interview at this level.`
}`;
}

function formatMockAnalysis(data: {
  decision: string;
  score: number;
  passingThreshold: number;
  performanceLevel: string;
  executiveSummary: string;
  categoryScores: {
    technical: number;
    problemSolving: number;
    communication: number;
    professional: number;
  };
  responseAnalysis: ResponseAnalysis;
  config: InterviewConfig;
  whyDecision: string;
  recommendations: string;
  passed: boolean;
}): string {
  const {
    decision,
    score,
    passingThreshold,
    performanceLevel,
    executiveSummary,
    categoryScores,
    whyDecision,
    recommendations,
  } = data;

  return `## INTERVIEW RESULT
**DECISION: ${decision}**
Score: ${score}/100 (Passing threshold: ${passingThreshold})
Performance Level: ${performanceLevel}

${executiveSummary}

## TECHNICAL COMPETENCY (${categoryScores.technical}/30)
**Strengths:**
${categoryScores.technical > 15 ? "- Attempted to engage with technical questions when knowledgeable" : "- None demonstrated"}

**Critical Weaknesses:**
- Significant gaps in fundamental knowledge
- Unable to explain core concepts in depth

## PROBLEM SOLVING (${categoryScores.problemSolving}/25)
**Strengths:**
${categoryScores.problemSolving > 12 ? "- Attempted systematic approaches when comfortable with topics" : "- None demonstrated"}

**Critical Weaknesses:**
- Unable to work through problems when faced with unknowns
- Gave up quickly instead of attempting logical reasoning

## COMMUNICATION (${categoryScores.communication}/25)
**Strengths:**
${categoryScores.communication > 12 ? "- Communicated clearly on familiar topics\n- Honest about knowledge gaps" : "- None demonstrated"}

**Critical Weaknesses:**
- Could not articulate technical concepts effectively
- Failed to elaborate or provide examples

## PROFESSIONAL READINESS (${categoryScores.professional}/20)
**Strengths:**
${categoryScores.professional > 10 ? "- Showed up and participated in the interview process" : "- None demonstrated"}

**Critical Weaknesses:**
- Knowledge gaps suggest insufficient experience
- Not ready for ${data.config.seniority}-level responsibilities

## WHY THIS DECISION
${whyDecision}

## RECOMMENDATIONS
${recommendations}

---

**Note**: This analysis reflects the actual performance demonstrated during the interview. ${!data.passed ? "A failing score means you did not meet the minimum threshold required for this position." : "While you passed, continue improving in the areas identified above."}`;
}
