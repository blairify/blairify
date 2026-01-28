import { SENIORITY_EXPECTATIONS } from "@/lib/config/interview-config";
import type {
  InterviewConfig,
  InterviewResults,
  KnowledgeGap,
  KnowledgeGapPriority,
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
  categoryScores: {
    technical: number;
    problemSolving: number;
    communication: number;
    professional: number;
  } | null;
  technologyScores: Record<string, number> | null;
  strengths: string[];
  improvements: string[];
  detailedAnalysis: string;
  recommendations: string;
  nextSteps: string;
  whyDecision: string;
  knowledgeGaps: KnowledgeGap[];
};

export function parseAnalysis(
  analysis: string,
  responseAnalysis: ResponseAnalysis,
  config: InterviewConfig,
): InterviewResults {
  try {
    const sections = extractAnalysisSections(analysis);
    const extractedScore = extractScore(sections.overallScore);
    const derivedScore = deriveScoreFromCategoryScores(sections.categoryScores);
    const derivedTechnologyScore = deriveScoreFromTechnologyScores(
      sections.technologyScores,
    );
    const score = validateAndCapScore(
      extractedScore > 0
        ? extractedScore
        : derivedScore > 0
          ? derivedScore
          : derivedTechnologyScore,
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

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/`+/g, "")
    .replace(/\*\*+/g, "")
    .replace(/__+/g, "")
    .replace(/\*+/g, "")
    .replace(/_+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeGapTag(value: string): string {
  const cleaned = stripInlineMarkdown(value)
    .replace(/^Tags:\s*/i, "")
    .trim();
  return toKebabCase(cleaned);
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
  const knowledgeGaps = extractKnowledgeGaps(
    extractSection(analysis, "KNOWLEDGE GAPS"),
  );

  const categoryScores = extractCategoryScores(analysis);
  const technologyScores = extractTechnologyScores(analysis);

  return {
    decision,
    overallScore,
    categoryScores,
    technologyScores,
    whyDecision,
    strengths: extractListItems(analysis, "Strengths"),
    improvements: extractListItems(
      analysis,
      "Critical Weaknesses|Areas for Growth|Required Improvements|If Failed - Required Improvements",
    ),
    detailedAnalysis: buildDetailedAnalysis(analysis, whyDecision),
    recommendations,
    nextSteps: recommendations,
    knowledgeGaps,
  };
}

function extractTechnologyScores(
  analysis: string,
): Record<string, number> | null {
  const section = extractSection(analysis, "TECHNOLOGY SCORES");
  if (!section.trim()) return null;

  const scores: Record<string, number> = {};
  for (const rawLine of section.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const cleaned = line.replace(/^[-*\s]+/, "").trim();
    const match = /^(.+?):\s*(\d{1,3})\s*\/\s*100\s*$/i.exec(cleaned);
    if (!match) continue;
    const tech = match[1]?.trim();
    const value = Number(match[2]);
    if (!tech) continue;
    if (!Number.isFinite(value)) continue;
    scores[tech] = Math.max(0, Math.min(100, value));
  }

  if (Object.keys(scores).length === 0) return null;
  return scores;
}

function extractCategoryScores(
  analysis: string,
): AnalysisSections["categoryScores"] {
  const read = (section: string): number | null => {
    const patterns = [
      new RegExp(`##\\s*${section}\\s*\\(\\s*(\\d{1,3})\\s*pts\\s*\\)`, "i"),
      new RegExp(
        `##\\s*${section}\\s*\\(\\s*(\\d{1,3})\\s*\\/\\s*\\d{1,3}\\s*\\)`,
        "i",
      ),
    ];

    for (const pattern of patterns) {
      const match = analysis.match(pattern);
      if (!match) continue;
      const parsed = Number(match[1]);
      if (!Number.isFinite(parsed)) continue;
      return parsed;
    }

    return null;
  };

  const technical = read("TECHNICAL COMPETENCY");
  const problemSolving = read("PROBLEM SOLVING");
  const communication = read("COMMUNICATION");
  const professional = read("PROFESSIONAL READINESS");

  if (
    technical === null &&
    problemSolving === null &&
    communication === null &&
    professional === null
  ) {
    return null;
  }

  return {
    technical: technical ?? 0,
    problemSolving: problemSolving ?? 0,
    communication: communication ?? 0,
    professional: professional ?? 0,
  };
}

function deriveScoreFromCategoryScores(
  scores: AnalysisSections["categoryScores"],
): number {
  if (!scores) return 0;
  const total =
    (scores.technical ?? 0) +
    (scores.problemSolving ?? 0) +
    (scores.communication ?? 0) +
    (scores.professional ?? 0);
  return Math.max(0, Math.min(100, Math.round(total)));
}

function deriveScoreFromTechnologyScores(
  scores: AnalysisSections["technologyScores"],
): number {
  if (!scores) return 0;
  const values = Object.values(scores).filter((n) => Number.isFinite(n));
  if (values.length === 0) return 0;
  const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
  return Math.max(0, Math.min(100, Math.round(avg)));
}

function extractKnowledgeGaps(sectionText: string): KnowledgeGap[] {
  if (!sectionText.trim()) return [];

  const chunks = sectionText
    .split(/\n\s*-\s*Title:/i)
    .map((s) => s.trim())
    .filter(Boolean);

  return chunks
    .map((chunk) => parseKnowledgeGapChunk(chunk))
    .filter((gap): gap is KnowledgeGap => gap !== null);
}

function parseKnowledgeGapChunk(chunk: string): KnowledgeGap | null {
  const titleMatch = chunk.match(/^\s*(.+?)\s*(?:\n|$)/);
  const priorityMatch = chunk.match(/Priority:\s*(high|medium|low)/i);
  const tagsMatch = chunk.match(/Tags:\s*([^\n]+)/i);
  const summaryMatch = chunk.match(/Summary:\s*([^\n]+)/i);
  const whyMatch = chunk.match(/Why:\s*([^\n]+)/i);
  const exampleAnswerMatch = chunk.match(
    /Example\s+Answer:\s*([\s\S]+?)(?=\n[A-Z][a-z]+:|$)/i,
  );

  const title = stripInlineMarkdown(titleMatch?.[1]?.trim() ?? "");
  if (!title) return null;

  const priority = (priorityMatch?.[1]?.toLowerCase() ??
    "medium") as KnowledgeGapPriority;
  const tags = (tagsMatch?.[1] ?? "")
    .split(",")
    .map((t) => normalizeGapTag(t))
    .filter(Boolean);
  const fallbackTags = deriveTagsFromTitle(title);
  const summary = stripInlineMarkdown((summaryMatch?.[1] ?? "").trim());
  const why = stripInlineMarkdown((whyMatch?.[1] ?? "").trim());
  const exampleAnswer = (exampleAnswerMatch?.[1] ?? "").trim();

  return {
    title,
    priority,
    tags: tags.length > 0 ? tags : fallbackTags,
    ...(summary.length > 0 ? { summary } : {}),
    why,
    ...(exampleAnswer.length > 0 ? { exampleAnswer } : {}),
    resources: [],
  };
}

function deriveTagsFromTitle(title: string): string[] {
  const primary = toKebabCase(title);
  const tags: string[] = [];
  if (primary) tags.push(primary);

  const reactMatch = /\breact\b/i.test(title);
  if (reactMatch && !tags.includes("react")) tags.push("react");

  return tags;
}

function toKebabCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
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

  return categoryParts.join("\n\n---\n\n");
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
    /Score:\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/i,
    /Score:\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/i,
    /score[:\s]+(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*points?/i,
  ];

  for (const pattern of patterns) {
    const match = scoreText.match(pattern);
    if (!match) continue;

    const raw = Number.parseFloat(match[1] ?? "");
    if (!Number.isFinite(raw)) continue;

    const rawDenominator = match[2];
    const denominator = rawDenominator
      ? Number.parseFloat(rawDenominator)
      : null;

    const normalized = (() => {
      if (denominator && Number.isFinite(denominator) && denominator > 0) {
        return Math.round((raw / denominator) * 100);
      }
      if (raw >= 0 && raw <= 1) {
        return Math.round(raw * 100);
      }
      return Math.round(raw);
    })();

    if (isValidScore(normalized)) return normalized;
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

  const isLowValueNarrative = (value: string): boolean => {
    const compact = value.trim().replace(/\s+/g, " ").toLowerCase();
    if (compact.length < 60) return true;
    if (compact.includes("analysis parsing failed")) return true;
    if (
      compact.includes("final score") &&
      compact.includes("passing threshold")
    ) {
      return true;
    }
    return false;
  };

  if (sections.strengths.length === 0) {
    fallback.strengths = [
      "No significant strengths demonstrated in this interview",
    ];
  }

  if (sections.improvements.length === 0) {
    fallback.improvements = generateDefaultImprovements(config);
  }

  if (
    !sections.whyDecision.trim() ||
    isLowValueNarrative(sections.whyDecision)
  ) {
    const s = sections.strengths[0]?.trim() ?? "";
    const i = sections.improvements[0]?.trim() ?? "";
    fallback.whyDecision = [
      s ? `One clear strength was: ${s}.` : "",
      i ? `The biggest growth lever is: ${i}.` : "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (
    !sections.overallScore.trim() ||
    isLowValueNarrative(sections.overallScore)
  ) {
    fallback.overallScore = fallback.whyDecision ?? sections.overallScore;
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

  const technologyScores = (() => {
    const selected = (config.technologies ?? []).filter(Boolean);
    if (selected.length === 0) return undefined;

    const fromModel = sections.technologyScores ?? {};
    const next: Record<string, number> = {};
    for (const tech of selected) {
      const raw = fromModel[tech];
      const n = typeof raw === "number" ? raw : Number(raw);
      next[tech] = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
    }

    return next;
  })();

  return {
    decision,
    overallScore: sections.overallScore,
    categoryScores: sections.categoryScores ?? undefined,
    technologyScores,
    strengths: sections.strengths,
    improvements: sections.improvements,
    detailedAnalysis: sections.detailedAnalysis,
    recommendations: sections.recommendations,
    nextSteps: sections.nextSteps,
    whyDecision: sections.whyDecision,
    knowledgeGaps: sections.knowledgeGaps,
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
  const { substantiveResponses, effectiveResponseRate, noAnswerResponses } =
    responseAnalysis;

  if (substantiveResponses === 0) {
    return "No substantive responses were provided in this interview. Most answers were 'I don't know', skipped, or off-topic, so it was not possible to reliably assess readiness for this role.";
  }

  if (effectiveResponseRate < RESPONSE_RATE_THRESHOLDS.CRITICAL) {
    return `Most responses were not substantive. This performance highlights significant gaps in core knowledge for a ${config.seniority}-level position.`;
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
  const { substantiveResponses, noAnswerResponses, skippedQuestions } =
    responseAnalysis;

  const scoreLine = `Score: ${score}/100 (target: ${passingThreshold.score}/100).`;
  const roleLine = `For a ${config.seniority}-level ${config.position} role, we look for clear fundamentals and consistent reasoning.`;

  if (!passed) {
    const reliabilityLine = (() => {
      if (substantiveResponses === 0) {
        return "Most answers were skipped, 'I don't know', or off-topic, so it was hard to demonstrate competency.";
      }
      if (noAnswerResponses + skippedQuestions > 0) {
        return "Several answers were skipped or non-answers, which reduced the signal in the strongest topics.";
      }
      return "The answers showed some understanding, but the depth and consistency weren’t at the expected level.";
    })();

    return [
      "Needs practice before being job-ready.",
      reliabilityLine,
      roleLine,
      scoreLine,
    ].join(" ");
  }

  const strengthsLine =
    substantiveResponses > 0
      ? "You showed enough signal across the key topics to meet the bar."
      : "You showed enough signal to meet the bar.";

  return [
    "Almost there — keep iterating.",
    strengthsLine,
    roleLine,
    scoreLine,
  ].join(" ");
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

  const knowledgeGaps = generateMockKnowledgeGaps(config, passed);
  const technologyScores = (config.technologies ?? []).filter(Boolean);
  const technologyScoresBlock =
    technologyScores.length > 0
      ? `\n## TECHNOLOGY SCORES\n${technologyScores.map((t) => `- ${t}: ${Math.max(0, Math.min(100, Math.round(score * 0.7)))}/100`).join("\n")}\n`
      : "";

  const strengthsOrNone = (threshold: number, text: string) =>
    categoryScores.technical > threshold ? text : "- None demonstrated";

  return `## INTERVIEW RESULT
**DECISION: ${decision}**
Score: ${score} (Passing threshold: ${passingThreshold})
Performance Level: ${performanceLevel}

${executiveSummary}

## TECHNICAL COMPETENCY (${categoryScores.technical} pts)
**Strengths:**
${strengthsOrNone(15, "- Attempted to engage with technical questions when knowledgeable")}

**Critical Weaknesses:**
- Significant gaps in fundamental knowledge
- Unable to explain core concepts in depth

## PROBLEM SOLVING (${categoryScores.problemSolving} pts)
**Strengths:**
${categoryScores.problemSolving > 12 ? "- Attempted systematic approaches when comfortable with topics" : "- None demonstrated"}

**Critical Weaknesses:**
- Unable to work through problems when faced with unknowns
- Gave up quickly instead of attempting logical reasoning

## COMMUNICATION (${categoryScores.communication} pts)
**Strengths:**
${categoryScores.communication > 12 ? "- Communicated clearly on familiar topics\n- Honest about knowledge gaps" : "- None demonstrated"}

**Critical Weaknesses:**
- Could not articulate technical concepts effectively
- Failed to elaborate or provide examples

## PROFESSIONAL READINESS (${categoryScores.professional} pts)
**Strengths:**
${categoryScores.professional > 10 ? "- Showed up and participated in the interview process" : "- None demonstrated"}

**Critical Weaknesses:**
- Knowledge gaps suggest insufficient experience
- Not ready for ${config.seniority}-level responsibilities

${technologyScoresBlock}

## KNOWLEDGE GAPS
${knowledgeGaps}

## WHY THIS DECISION
${whyDecision}

## RECOMMENDATIONS
${recommendations}

**Note**: This analysis reflects your performance in this interview. ${!passed ? "A non-passing score means your current level of readiness does not yet meet the bar for this position." : "Even with a passing score, continuing to work on the areas highlighted above will strengthen your readiness for this role."}`;
}

function generateMockKnowledgeGaps(
  config: InterviewConfig,
  passed: boolean,
): string {
  const priority = passed ? "medium" : "high";

  switch (config.interviewType) {
    case "technical":
    case "coding":
      return `- Title: Data structures fundamentals
  Priority: ${priority}
  Tags: data-structures, algorithms
  Summary: Practice core data structure operations and explain time/space trade-offs clearly.
  Why: Your answers did not show consistent correctness and depth in core problem-solving fundamentals.

- Title: JavaScript/TypeScript fundamentals
  Priority: ${priority}
  Tags: javascript-fundamentals, typescript-basics
  Summary: Strengthen language fundamentals so you can reason about runtime behavior and types with confidence.
  Why: Several responses suggested gaps in language fundamentals expected for this role.`;
    case "system-design":
      return `- Title: Scalability fundamentals
  Priority: ${priority}
  Tags: scalability, caching
  Summary: Improve your ability to reason about load, latency, and bottlenecks using concrete trade-offs.
  Why: Your responses did not consistently connect design choices to measurable performance and reliability outcomes.

- Title: Data storage trade-offs
  Priority: ${priority}
  Tags: sql-indexes, database-design
  Summary: Practice selecting storage and indexing strategies by comparing concrete trade-offs.
  Why: Key trade-offs around storage and indexing were missing or unclear.`;
    case "situational":
    case "mixed":
    case "bullet":
      return `- Title: Incident debugging process
  Priority: ${priority}
  Tags: debugging, incident-response
  Summary: Practice describing a concrete end-to-end debugging workflow using logs, metrics, and validation steps.
  Why: Your answers did not consistently demonstrate a realistic cause-and-effect investigation path.

- Title: Communication structure
  Priority: ${priority}
  Tags: communication, storytelling
  Summary: Use a consistent structure (context → action → outcome) so your answers are easy to follow and verify.
  Why: Your answers were not consistently structured and outcome-focused.

- Title: Behavioral examples
  Priority: ${priority}
  Tags: star-method, behavioral-interview
  Summary: Prepare 2 to 3 concrete stories with measurable impact you can adapt to common questions.
  Why: Several answers lacked concrete examples and measurable results.`;
  }

  const _never: never = config.interviewType;
  throw new Error(`Unhandled interview type: ${_never}`);
}
