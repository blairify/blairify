import { SENIORITY_EXPECTATIONS } from "@/lib/config/interview-config";
import type {
  InterviewConfig,
  InterviewResults,
  ResponseAnalysis,
} from "@/types/interview";
import { calculateMaxScore } from "./interview-service";

const SCORE_BOUNDARIES = {
  EXCELLENT: 90,
  GOOD: 80,
  SATISFACTORY: 70,
  NEEDS_IMPROVEMENT: 60,
} as const;

const PERFORMANCE_LEVELS = {
  EXCEEDS: { threshold: 80, label: "Exceeds Expectations" },
  MEETS: { threshold: 70, label: "Meets Expectations" },
  BELOW: { threshold: 50, label: "Below Expectations" },
  FAR_BELOW: { threshold: 0, label: "Far Below Expectations" },
} as const;

const CATEGORY_WEIGHTS = {
  technical: 30,
  problemSolving: 25,
  communication: 25,
  professional: 20,
} as const;

const ANALYSIS_CATEGORIES = [
  "TECHNICAL COMPETENCY",
  "PROBLEM SOLVING",
  "COMMUNICATION",
  "PROFESSIONAL READINESS",
] as const;

const RESPONSE_RATE_THRESHOLDS = {
  CRITICAL: 30,
  LOW: 50,
} as const;

const IMPROVEMENT_TIMEFRAMES = {
  CRITICAL: "6+ months",
  MODERATE: "3-6 months",
} as const;

const MIN_ITEM_LENGTH = 10;

type AnalysisSections = {
  decision: "PASS" | "FAIL" | "UNKNOWN";
  overallScore: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis: string;
  recommendations: string;
  nextSteps: string;
  whyDecision: string;
};

export function parseAnalysis(
  analysis: string,
  responseAnalysis: ResponseAnalysis,
  config: InterviewConfig,
): InterviewResults {
  try {
    const sections = extractAnalysisSections(analysis);
    const score = validateAndCapScore(
      extractScore(sections.overallScore),
      responseAnalysis,
    );
    const decision = determineDecision(score, config, sections.decision);
    const fallbackContent = generateFallbackContent(sections, config);

    return buildInterviewResults({
      sections: { ...sections, ...fallbackContent },
      score,
      decision,
      config,
    });
  } catch (error) {
    console.error("Error parsing analysis:", error);
    return createErrorAnalysis(analysis, config);
  }
}

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

function extractAnalysisSections(analysis: string): AnalysisSections {
  const decision = extractDecision(analysis);
  const overallScore = extractSection(analysis, "INTERVIEW RESULT");
  const whyDecision = extractSection(analysis, "WHY THIS DECISION");
  const recommendations = extractSection(analysis, "RECOMMENDATIONS");

  return {
    decision,
    overallScore,
    whyDecision,
    strengths: extractListItems(analysis, "Strengths"),
    improvements: extractListItems(
      analysis,
      "Critical Weaknesses|Areas for Growth|Required Improvements|If Failed - Required Improvements",
    ),
    detailedAnalysis: buildDetailedAnalysis(analysis, whyDecision),
    recommendations,
    nextSteps: recommendations,
  };
}

function extractDecision(analysis: string): "PASS" | "FAIL" | "UNKNOWN" {
  const match = analysis.match(/\*\*DECISION:\s*(PASS|FAIL)\*\*/i);
  return match ? (match[1].toUpperCase() as "PASS" | "FAIL") : "UNKNOWN";
}

function extractSection(analysis: string, sectionName: string): string {
  const regex = new RegExp(`##\\s*${sectionName}\\s*([\\s\\S]*?)(?=##|$)`, "i");
  const match = analysis.match(regex);
  return match ? match[1].trim() : "";
}

function extractListItems(analysis: string, sectionPattern: string): string[] {
  const patterns = createSectionPatterns(sectionPattern);
  const allItems: string[] = [];

  for (const pattern of patterns) {
    const matches = analysis.matchAll(pattern);
    for (const match of matches) {
      const sectionContent = match[2];
      const items = parseListItemsFromContent(sectionContent);
      allItems.push(...items);
    }
  }

  return deduplicateAndFilterItems(allItems);
}

function createSectionPatterns(sectionPattern: string): RegExp[] {
  return [
    new RegExp(
      `\\*\\*(${sectionPattern}):\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*|\\n##|$)`,
      "gi",
    ),
    new RegExp(
      `###\\s*(${sectionPattern}):?\\s*([\\s\\S]*?)(?=###|\\n##|$)`,
      "gi",
    ),
    new RegExp(`##\\s*(${sectionPattern}):?\\s*([\\s\\S]*?)(?=##|$)`, "gi"),
  ];
}

function parseListItemsFromContent(content: string): string[] {
  const lines = content.split("\n");
  const numberedItems = extractNumberedItems(lines);
  const bulletItems = extractBulletItems(lines);
  return [...numberedItems, ...bulletItems];
}

function extractNumberedItems(lines: string[]): string[] {
  return lines
    .filter((line) => /^\d+\.\s+/.test(line.trim()))
    .map((line) => line.replace(/^\d+\.\s+/, "").trim())
    .filter((line) => line.length > 0);
}

function extractBulletItems(lines: string[]): string[] {
  return lines
    .filter((line) => /^[-•*]\s+/.test(line.trim()))
    .map((line) => line.replace(/^[-•*]\s+/, "").trim())
    .filter((line) => line.length > 0);
}

function deduplicateAndFilterItems(items: string[]): string[] {
  const uniqueItems = [...new Set(items)];
  return uniqueItems.filter(isValidListItem);
}

function isValidListItem(item: string): boolean {
  if (item.length < MIN_ITEM_LENGTH) return false;

  const invalidPhrases = ["none demonstrated", "no significant"];

  const lowerItem = item.toLowerCase();
  return !invalidPhrases.some((phrase) => lowerItem.includes(phrase));
}

function buildDetailedAnalysis(analysis: string, whyDecision: string): string {
  const categoryParts = ANALYSIS_CATEGORIES.map((category) => {
    const content = extractCategoryContent(analysis, category);
    return content ? `**${category}**\n${content}` : null;
  }).filter((part): part is string => part !== null);

  if (whyDecision) {
    categoryParts.unshift(`**WHY THIS DECISION**\n${whyDecision}`);
  }

  return categoryParts.join("\n\n");
}

function extractCategoryContent(
  analysis: string,
  category: string,
): string | null {
  const regex = new RegExp(
    `##\\s*${category}\\s*\\([^)]+\\)\\s*([\\s\\S]*?)(?=##|$)`,
    "i",
  );
  const match = analysis.match(regex);
  return match ? match[1].trim() : null;
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
      const score = parseInt(match[1], 10);
      if (isValidScore(score)) {
        return score;
      }
    }
  }

  return 0;
}

function isValidScore(score: number): boolean {
  return !Number.isNaN(score) && score >= 0 && score <= 100;
}

function validateAndCapScore(
  score: number,
  responseAnalysis: ResponseAnalysis,
): number {
  const maxAllowedScore = calculateMaxScore(responseAnalysis);

  if (score > maxAllowedScore) {
    console.warn(
      `Score ${score} exceeds maximum ${maxAllowedScore} for response quality, capping`,
    );
    return maxAllowedScore;
  }

  return score;
}

function determineDecision(
  score: number,
  config: InterviewConfig,
  aiDecision: "PASS" | "FAIL" | "UNKNOWN",
): "PASS" | "FAIL" {
  const passingThreshold = SENIORITY_EXPECTATIONS[config.seniority];
  const shouldPass = score >= passingThreshold.score;
  const finalDecision = shouldPass ? "PASS" : "FAIL";

  if (aiDecision !== "UNKNOWN" && aiDecision !== finalDecision) {
    console.warn(
      `Fixed contradictory analysis: AI said ${aiDecision} but score ${score} should be ${finalDecision}`,
    );
  }

  return finalDecision;
}

function getScoreColor(score: number): string {
  if (score >= SCORE_BOUNDARIES.EXCELLENT) return "text-green-600";
  if (score >= SCORE_BOUNDARIES.GOOD) return "text-green-500";
  if (score >= SCORE_BOUNDARIES.SATISFACTORY) return "text-yellow-500";
  if (score >= SCORE_BOUNDARIES.NEEDS_IMPROVEMENT) return "text-orange-500";
  return "text-red-500";
}

function generateFallbackContent(
  sections: AnalysisSections,
  config: InterviewConfig,
): Partial<AnalysisSections> {
  const fallback: Partial<AnalysisSections> = {};

  if (sections.strengths.length === 0) {
    fallback.strengths = [
      "No significant strengths demonstrated in this interview",
    ];
  }

  if (sections.improvements.length === 0) {
    fallback.improvements = generateDefaultImprovements(config);
  }

  return fallback;
}

function generateDefaultImprovements(config: InterviewConfig): string[] {
  const position = config.position || "technical";
  const seniority = config.seniority || "mid";

  return [
    `Study fundamental ${position} concepts and best practices`,
    `Practice coding problems appropriate for ${seniority}-level positions`,
    "Improve technical communication and explanation skills",
    "Gain more hands-on experience with real-world projects",
  ];
}

function buildInterviewResults(params: {
  sections: AnalysisSections;
  score: number;
  decision: "PASS" | "FAIL";
  config: InterviewConfig;
}): InterviewResults {
  const { sections, score, decision, config } = params;
  const passingThreshold = SENIORITY_EXPECTATIONS[config.seniority];

  return {
    decision,
    overallScore: sections.overallScore,
    strengths: sections.strengths,
    improvements: sections.improvements,
    detailedAnalysis: sections.detailedAnalysis,
    recommendations: sections.recommendations,
    nextSteps: sections.nextSteps,
    whyDecision: sections.whyDecision,
    score,
    scoreColor: getScoreColor(score),
    passed: decision === "PASS",
    passingThreshold: passingThreshold.score,
  };
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
  const scoreRatio = totalScore / 100;

  return {
    technical: Math.round(scoreRatio * CATEGORY_WEIGHTS.technical),
    problemSolving: Math.round(scoreRatio * CATEGORY_WEIGHTS.problemSolving),
    communication: Math.round(scoreRatio * CATEGORY_WEIGHTS.communication),
    professional: Math.round(scoreRatio * CATEGORY_WEIGHTS.professional),
  };
}

function getPerformanceLevel(score: number): string {
  if (score >= PERFORMANCE_LEVELS.EXCEEDS.threshold) {
    return PERFORMANCE_LEVELS.EXCEEDS.label;
  }
  if (score >= PERFORMANCE_LEVELS.MEETS.threshold) {
    return PERFORMANCE_LEVELS.MEETS.label;
  }
  if (score >= PERFORMANCE_LEVELS.BELOW.threshold) {
    return PERFORMANCE_LEVELS.BELOW.label;
  }
  return PERFORMANCE_LEVELS.FAR_BELOW.label;
}

function generateExecutiveSummary(
  responseAnalysis: ResponseAnalysis,
  config: InterviewConfig,
  passed: boolean,
  passingThreshold: { score: number; description: string },
): string {
  const {
    substantiveResponses,
    totalQuestions,
    effectiveResponseRate,
    noAnswerResponses,
  } = responseAnalysis;

  if (substantiveResponses === 0) {
    return "No substantive responses were provided in this interview. Most answers were 'I don't know', skipped, or off-topic, so it was not possible to reliably assess readiness for this role.";
  }

  if (effectiveResponseRate < RESPONSE_RATE_THRESHOLDS.CRITICAL) {
    return `Only ${substantiveResponses} of ${totalQuestions} questions received substantive answers. This performance highlights significant gaps in core knowledge for a ${config.seniority}-level position.`;
  }

  if (effectiveResponseRate < RESPONSE_RATE_THRESHOLDS.LOW) {
    return `The candidate showed some familiarity with the topics but was unable to give complete answers for more than half of the questions. The number of "I don't know" responses (${noAnswerResponses}) suggests they are not yet ready for this role.`;
  }

  if (passed) {
    return `The candidate demonstrated enough knowledge and problem-solving ability to meet the bar for this ${config.seniority}-level interview. There are still clear areas to strengthen, but the fundamentals for the role are present.`;
  }

  return `The candidate showed partial understanding of several areas but did not reach the ${passingThreshold.score}-point threshold expected for ${config.seniority}-level positions. Important gaps and inconsistent responses prevented a passing recommendation.`;
}

function generateWhyDecision(
  responseAnalysis: ResponseAnalysis,
  config: InterviewConfig,
  score: number,
  passed: boolean,
  passingThreshold: { score: number; description: string },
): string {
  const {
    substantiveResponses,
    totalQuestions,
    noAnswerResponses,
    skippedQuestions,
  } = responseAnalysis;

  if (!passed) {
    let decision = `The candidate did not meet the required standard for this interview, scoring ${score}/${passingThreshold.score}. `;

    if (substantiveResponses < totalQuestions / 2) {
      decision += `They were unable to provide substantive answers to ${noAnswerResponses + skippedQuestions} of ${totalQuestions} questions, often responding with "I don't know" or skipping them. `;
    }

    decision += `For a ${config.seniority}-level ${config.position} role, we expect consistent demonstration of core knowledge and the ability to work through unfamiliar problems. This performance falls below that bar, so a hiring recommendation is not appropriate at this time.`;

    return decision;
  }

  return `The candidate met the standard for this interview with a score of ${score}/${passingThreshold.score}. They provided substantive answers to ${substantiveResponses} of ${totalQuestions} questions, showing sufficient command of key ${config.position} concepts for a ${config.seniority}-level role. With focused onboarding and continued practice, they should be able to grow effectively in this position.`;
}

function generateRecommendations(
  passed: boolean,
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  if (passed) {
    return generatePassingRecommendations(config);
  }

  return generateFailingRecommendations(config, responseAnalysis);
}

function generatePassingRecommendations(config: InterviewConfig): string {
  return `### Next Steps Before Starting:
1. **Strengthen Weak Areas** (2-4 weeks): Review the topics where you struggled during the interview, with emphasis on areas that are critical for a ${config.seniority}-level ${config.position} role.
2. **Practical Application** (Ongoing): Build small projects or enhancements that use the same technologies you discussed to reinforce theoretical knowledge.
3. **Communication Practice** (1-2 weeks): Practice explaining technical concepts clearly and concisely, focusing on structure and real examples.

### Learning Resources:
- Official documentation for ${config.position} core technologies
- Online courses (Udemy, Coursera, Pluralsight) targeted at ${config.seniority}-level ${config.position} work
- Practice platforms: LeetCode, HackerRank for technical problem-solving
- Mock interviews: Practice with peers or use structured interview prep services

### Interview Performance Tips:
- When unsure, walk through your thought process rather than defaulting to "I don't know"
- Use the STAR method (Situation, Task, Action, Result) for behavioral questions
- Ask clarifying questions before answering to show analytical thinking`;
}

function generateFailingRecommendations(
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  const { effectiveResponseRate, substantiveResponses } = responseAnalysis;
  const timeframe =
    effectiveResponseRate < RESPONSE_RATE_THRESHOLDS.CRITICAL
      ? IMPROVEMENT_TIMEFRAMES.CRITICAL
      : IMPROVEMENT_TIMEFRAMES.MODERATE;

  const startingPoint =
    substantiveResponses === 0
      ? "Start with introductory resources to build a solid foundation in the core concepts for this role before focusing on more advanced material."
      : `Focus first on the core ${config.position} concepts you were unable to explain confidently.`;

  const honestAssessment =
    effectiveResponseRate < RESPONSE_RATE_THRESHOLDS.CRITICAL
      ? `This performance suggests you are not yet ready for ${config.seniority}-level interviews. Consider targeting internships or junior positions first to build experience and confidence.`
      : `You have a partial base of knowledge, but significant gaps remain. Prioritize systematic learning and practical application before attempting another interview at this level.`;

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
${honestAssessment}`;
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
    passed,
    config,
  } = data;

  const strengthsOrNone = (threshold: number, text: string) =>
    categoryScores.technical > threshold ? text : "- None demonstrated";

  return `## INTERVIEW RESULT
**DECISION: ${decision}**
Score: ${score}/100 (Passing threshold: ${passingThreshold})
Performance Level: ${performanceLevel}

${executiveSummary}

## TECHNICAL COMPETENCY (${categoryScores.technical}/${CATEGORY_WEIGHTS.technical})
**Strengths:**
${strengthsOrNone(15, "- Attempted to engage with technical questions when knowledgeable")}

**Critical Weaknesses:**
- Significant gaps in fundamental knowledge
- Unable to explain core concepts in depth

## PROBLEM SOLVING (${categoryScores.problemSolving}/${CATEGORY_WEIGHTS.problemSolving})
**Strengths:**
${categoryScores.problemSolving > 12 ? "- Attempted systematic approaches when comfortable with topics" : "- None demonstrated"}

**Critical Weaknesses:**
- Unable to work through problems when faced with unknowns
- Gave up quickly instead of attempting logical reasoning

## COMMUNICATION (${categoryScores.communication}/${CATEGORY_WEIGHTS.communication})
**Strengths:**
${categoryScores.communication > 12 ? "- Communicated clearly on familiar topics\n- Honest about knowledge gaps" : "- None demonstrated"}

**Critical Weaknesses:**
- Could not articulate technical concepts effectively
- Failed to elaborate or provide examples

## PROFESSIONAL READINESS (${categoryScores.professional}/${CATEGORY_WEIGHTS.professional})
**Strengths:**
${categoryScores.professional > 10 ? "- Showed up and participated in the interview process" : "- None demonstrated"}

**Critical Weaknesses:**
- Knowledge gaps suggest insufficient experience
- Not ready for ${config.seniority}-level responsibilities

## WHY THIS DECISION
${whyDecision}

## RECOMMENDATIONS
${recommendations}

**Note**: This analysis reflects your performance in this interview. ${!passed ? "A non-passing score means your current level of readiness does not yet meet the bar for this position." : "Even with a passing score, continuing to work on the areas highlighted above will strengthen your readiness for this role."}`;
}
