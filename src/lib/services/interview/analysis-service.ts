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
import { InterviewService } from "./interview-service";

// biome-ignore lint/complexity/noStaticOnlyClass: Service class pattern for organizing related analysis functions
export class AnalysisService {
  static parseAnalysis(
    analysis: string,
    responseAnalysis: ResponseAnalysis,
    config: InterviewConfig,
  ): InterviewResults {
    const sections = AnalysisService.initializeAnalysisSections();

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

      sections.strengths = AnalysisService.extractListItems(
        analysis,
        "Strengths",
      );

      sections.improvements = AnalysisService.extractListItems(
        analysis,
        "Critical Weaknesses|Areas for Growth",
      );

      const recommendationsMatch = analysis.match(
        /##\s*RECOMMENDATIONS\s*([\s\S]*?)(?=##|$)/i,
      );
      if (recommendationsMatch) {
        sections.recommendations = recommendationsMatch[1].trim();
        sections.nextSteps = recommendationsMatch[1].trim();
      }

      sections.detailedAnalysis = AnalysisService.buildDetailedAnalysis(
        analysis,
        sections.whyDecision,
      );

      // Extract and validate score
      let scoreNumber = AnalysisService.extractScore(sections.overallScore);
      const maxAllowedScore =
        InterviewService.calculateMaxScore(responseAnalysis);

      if (scoreNumber > maxAllowedScore) {
        console.warn(
          `Score ${scoreNumber} exceeds maximum ${maxAllowedScore} for response quality, capping`,
        );
        scoreNumber = maxAllowedScore;
      }

      // Validate pass/fail consistency
      const passingThreshold = SENIORITY_EXPECTATIONS[config.seniority];
      if (
        scoreNumber < passingThreshold.score &&
        sections.decision === "PASS"
      ) {
        sections.decision = "FAIL";
      } else if (
        scoreNumber >= passingThreshold.score &&
        sections.decision === "FAIL"
      ) {
        sections.decision = "PASS";
      }

      // Ensure we have fallback content
      if (sections.strengths.length === 0) {
        sections.strengths.push(
          "No significant strengths demonstrated in this interview",
        );
      }
      if (sections.improvements.length === 0) {
        sections.improvements.push(
          "Fundamental knowledge gaps across all areas",
        );
      }

      return {
        ...sections,
        score: scoreNumber,
        scoreColor: AnalysisService.getScoreColor(scoreNumber),
        passed: sections.decision === "PASS",
        passingThreshold: passingThreshold.score,
        decision:
          sections.decision === "UNKNOWN" ? undefined : sections.decision,
      };
    } catch (error) {
      console.error("Error parsing analysis:", error);
      return AnalysisService.createErrorAnalysis(analysis, config);
    }
  }

  /**
   * Generate mock analysis when AI service is unavailable
   */
  static generateMockAnalysis(
    config: InterviewConfig,
    responseAnalysis: ResponseAnalysis,
  ): string {
    const passingThreshold = SENIORITY_EXPECTATIONS[config.seniority];
    const maxScore = InterviewService.calculateMaxScore(responseAnalysis);
    const baseScore = Math.min(
      maxScore,
      Math.round(responseAnalysis.qualityScore * 0.9),
    );
    const score = Math.max(0, baseScore);

    const passed = score >= passingThreshold.score;
    const decision = passed ? "PASS" : "FAIL";

    const categoryScores = AnalysisService.calculateCategoryScores(score);
    const performanceLevel = AnalysisService.getPerformanceLevel(score);
    const executiveSummary = AnalysisService.generateExecutiveSummary(
      responseAnalysis,
      config,
      passed,
      passingThreshold,
    );
    const whyDecision = AnalysisService.generateWhyDecision(
      responseAnalysis,
      config,
      score,
      passed,
      passingThreshold,
    );
    const recommendations = AnalysisService.generateRecommendations(
      passed,
      config,
      responseAnalysis,
    );

    return AnalysisService.formatMockAnalysis({
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

  // Private helper methods
  private static initializeAnalysisSections() {
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

  private static extractListItems(
    analysis: string,
    sectionPattern: string,
  ): string[] {
    const items: string[] = [];
    const regex = new RegExp(
      `\\*\\*(${sectionPattern}):\\*\\*\\s*([\\s\\S]*?)(?=\\*\\*Critical Weaknesses:|\\*\\*Areas for Growth:|\\*\\*|\\n##|$)`,
      "gi",
    );

    const matches = analysis.matchAll(regex);
    for (const match of matches) {
      const sectionItems = match[2]
        .split("\n")
        .filter((line) => line.trim().match(/^[-•*]\s+/))
        .map((line) => line.replace(/^[-•*]\s+/, "").trim())
        .filter(
          (line) =>
            line.length > 0 &&
            !line.toLowerCase().includes("none demonstrated"),
        );
      items.push(...sectionItems);
    }

    return items;
  }

  private static buildDetailedAnalysis(
    analysis: string,
    whyDecision: string,
  ): string {
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

  private static extractScore(scoreText: string): number {
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

  private static getScoreColor(score: number): string {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  }

  private static createErrorAnalysis(
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

  private static calculateCategoryScores(totalScore: number) {
    return {
      technical: Math.round((totalScore / 100) * 30),
      problemSolving: Math.round((totalScore / 100) * 25),
      communication: Math.round((totalScore / 100) * 25),
      professional: Math.round((totalScore / 100) * 20),
    };
  }

  private static getPerformanceLevel(score: number): string {
    if (score >= 80) return "Exceeds Expectations";
    if (score >= 70) return "Meets Expectations";
    if (score >= 50) return "Below Expectations";
    return "Far Below Expectations";
  }

  private static generateExecutiveSummary(
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

  private static generateWhyDecision(
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

  private static generateRecommendations(
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

  private static formatMockAnalysis(data: {
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
}
