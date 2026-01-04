/**
 * New Interview Analysis API Route Handler
 * Clean, thin controller that delegates to service layer
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  aiClient,
  generateAnalysis,
  generateMockAnalysisResponse,
  isAvailable,
} from "@/lib/services/ai/ai-client";
import { generateAnalysisSystemPrompt } from "@/lib/services/ai/prompt-generator";
import { parseAnalysis } from "@/lib/services/interview/analysis-service";
import {
  analyzeResponseQuality,
  validateInterviewConfig,
} from "@/lib/services/interview/interview-service";
import { getResourcesByTags } from "@/lib/services/resources/neon-resource-repository";
import type {
  AnalyzeApiRequest,
  AnalyzeApiResponse,
  InterviewConfig,
  KnowledgeGap,
  Message,
  ResponseAnalysis,
} from "@/types/interview";

function normalizeGapTitle(value: string): string {
  return value
    .trim()
    .replace(/^[-*\s]*title\s*:\s*/i, "")
    .replace(/^[-*\s]*-\s*title\s*:\s*/i, "")
    .replace(/^[-*\s]*\*\*title\*\*\s*:\s*/i, "")
    .replace(/^[-*\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeWhy(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeResourceTitle(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeResourceUrl(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const known = [
    "roadmap.sh",
    "w3schools.com",
    "developer.mozilla.org",
    "freecodecamp.org",
    "youtube.com",
    "www.youtube.com",
  ];

  const lower = trimmed.toLowerCase();
  const isKnown = known.some(
    (d) =>
      lower === d || lower.startsWith(`${d}/`) || lower.startsWith(`www.${d}/`),
  );

  if (lower.startsWith("www.")) return `https://${trimmed}`;
  if (isKnown) return `https://${trimmed}`;

  return "";
}

function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isPreferredDomain(url: string): boolean {
  try {
    const host = new URL(url).host.toLowerCase();
    return (
      host.includes("roadmap.sh") ||
      host.includes("w3schools.com") ||
      host.includes("developer.mozilla.org") ||
      host.includes("freecodecamp.org") ||
      host.includes("youtube.com")
    );
  } catch {
    return false;
  }
}

function getRoadmapKnownRouteUrl(tags: string[]): string | null {
  const normalizedTags = tags.map((t) => t.toLowerCase());
  const knownRoutes: Record<string, string> = {
    frontend: "https://roadmap.sh/frontend",
    backend: "https://roadmap.sh/backend",
    devops: "https://roadmap.sh/devops",
    react: "https://roadmap.sh/react",
    node: "https://roadmap.sh/nodejs",
    nodejs: "https://roadmap.sh/nodejs",
    javascript: "https://roadmap.sh/javascript",
    typescript: "https://roadmap.sh/typescript",
    sql: "https://roadmap.sh/sql",
    docker: "https://roadmap.sh/docker",
    kubernetes: "https://roadmap.sh/kubernetes",
    systemdesign: "https://roadmap.sh/system-design",
    "system-design": "https://roadmap.sh/system-design",
  };

  for (const t of normalizedTags) {
    const hit = knownRoutes[t];
    if (hit) return hit;
  }

  return null;
}

function getW3SchoolsKnownSectionUrl(
  tags: string[],
  title: string,
): string | null {
  const normalizedTags = tags.map((t) => t.toLowerCase());

  const knownSections: Record<string, string> = {
    html: "https://www.w3schools.com/html/",
    css: "https://www.w3schools.com/css/",
    javascript: "https://www.w3schools.com/js/",
    js: "https://www.w3schools.com/js/",
    typescript: "https://www.w3schools.com/js/",
    react: "https://www.w3schools.com/react/",
    sql: "https://www.w3schools.com/sql/",
    node: "https://www.w3schools.com/nodejs/",
    nodejs: "https://www.w3schools.com/nodejs/",
    python: "https://www.w3schools.com/python/",
    java: "https://www.w3schools.com/java/",
    git: "https://www.w3schools.com/git/",
  };

  for (const t of normalizedTags) {
    const hit = knownSections[t];
    if (hit) return hit;
  }

  if (/\btypescript\b/i.test(title)) return "https://www.w3schools.com/js/";
  return null;
}

function buildPreferredResources(
  title: string,
  tags: string[],
): KnowledgeGap["resources"] {
  const topic = encodeURIComponent(normalizeGapTitle(title));
  const tag = tags[0] ?? "";

  const mdn = {
    id: crypto.randomUUID(),
    title: `MDN search: ${title}`,
    url: `https://developer.mozilla.org/en-US/search?q=${topic}`,
    type: "docs" as const,
    tags,
  };

  const youtube = {
    id: crypto.randomUUID(),
    title: `YouTube: ${title}`,
    url: `https://www.youtube.com/results?search_query=${topic}`,
    type: "video" as const,
    tags,
  };

  const roadmapKnown = getRoadmapKnownRouteUrl(tags);
  const w3Known = getW3SchoolsKnownSectionUrl(tags, title);

  const resources: KnowledgeGap["resources"] = [mdn, youtube];

  if (roadmapKnown) {
    resources.push({
      id: crypto.randomUUID(),
      title: `roadmap.sh: ${tag || "learning paths"}`,
      url: roadmapKnown,
      type: "docs",
      tags,
    });
  }

  if (w3Known) {
    resources.push({
      id: crypto.randomUUID(),
      title: "W3Schools",
      url: w3Known,
      type: "docs",
      tags,
    });
  }

  if (resources.length < 3) {
    resources.push({
      id: crypto.randomUUID(),
      title: `freeCodeCamp: ${title}`,
      url: `https://www.freecodecamp.org/news/search/?query=${topic}`,
      type: "course",
      tags,
    });
  }

  return resources;
}

function ensureGapHasMinimumResources(gap: KnowledgeGap): KnowledgeGap {
  const existing = Array.isArray(gap.resources) ? gap.resources : [];
  const sanitized = existing
    .map((r) => {
      const url = normalizeResourceUrl(r.url);
      const title = normalizeResourceTitle(r.title);
      if (!url || !title) return null;
      if (!isValidHttpUrl(url)) return null;
      return { ...r, url, title };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const preferredExisting = sanitized.filter((r) => isPreferredDomain(r.url));
  const nonPreferredExisting = sanitized.filter(
    (r) => !isPreferredDomain(r.url),
  );

  const next: KnowledgeGap["resources"] = [];
  const seen = new Set<string>();
  const push = (r: (typeof sanitized)[number]) => {
    if (!r?.url || !r.title) return;
    if (seen.has(r.url)) return;
    seen.add(r.url);
    next.push(r);
  };

  for (const r of preferredExisting) push(r);

  if (next.length < 2) {
    const preferredFallback = buildPreferredResources(gap.title, gap.tags);
    for (const r of preferredFallback) {
      push(r);
      if (next.length >= 2) break;
    }
  }

  if (next.length < 2) {
    for (const r of nonPreferredExisting) {
      push(r);
      if (next.length >= 2) break;
    }
  }

  return { ...gap, resources: next };
}

function extractInterviewerQuestions(conversationHistory: Message[]): string[] {
  const questions: string[] = [];
  for (const msg of conversationHistory) {
    if (msg.type !== "ai") continue;
    if (msg.isFollowUp === true) continue;
    const lines = msg.content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      if (!line.includes("?")) continue;
      const cleaned = line.replace(/^[-*\d.)\s]+/, "").trim();
      if (isFollowUpQuestionText(cleaned)) continue;
      if (cleaned.length > 0) questions.push(cleaned);
    }
  }
  return questions.slice(0, 12);
}

function isFollowUpQuestionText(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    v.startsWith("why?") ||
    v.startsWith("how?") ||
    v.startsWith("can you") ||
    v.startsWith("could you") ||
    v.startsWith("what do you mean") ||
    v.startsWith("tell me more") ||
    v.startsWith("go deeper") ||
    v.startsWith("elaborate") ||
    v.startsWith("follow up")
  );
}

function normalizeTopicReference(value: string): string {
  return value
    .trim()
    .replace(/^[-*\s\d.)]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/[?]+$/g, "")
    .trim();
}

function questionToTopicReference(question: string | undefined): string {
  const q = normalizeTopicReference(question ?? "");
  if (!q) return "this topic";

  const lower = q.toLowerCase();
  if (lower.includes("alt attribute")) return "the alt attribute in HTML";
  if (lower.includes("javascript") && lower.includes("html")) {
    return "JavaScript placement in HTML";
  }
  if (lower.includes("error boundary")) return "React error boundaries";
  if (lower.includes("functional component"))
    return "React functional components";
  if (lower.includes("testing") && lower.includes("react")) {
    return "Testing React components";
  }
  if (lower.startsWith("what react is") || /\bwhat\s+is\s+react\b/i.test(q)) {
    return "React fundamentals";
  }

  const cleaned = q
    .replace(/^let['’]s\s+start\s+with\s+something\s+fundamental—?/i, "")
    .replace(/^now,\s+let['’]s\s+talk\s+about\s+/i, "")
    .replace(/^let['’]s\s+talk\s+about\s+/i, "")
    .replace(/^if\s+you\s+were\s+working\s+with\s+/i, "")
    .trim();

  if (cleaned.length <= 60) return cleaned;
  return `${cleaned.slice(0, 57).trim()}...`;
}

function normalizeTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeModelTags(tags: string[] | undefined): string[] {
  if (!tags?.length) return [];
  return tags
    .map((t) => normalizeTag(t))
    .filter((t) => {
      if (t.length === 0) return false;
      if (t.length > 32) return false;
      if (t.includes("--")) return false;
      if (t.startsWith("title-")) return false;
      if (t.includes("title-")) return false;
      const dashCount = (t.match(/-/g) ?? []).length;
      if (dashCount >= 4) return false;
      return true;
    })
    .slice(0, 6);
}

function deriveConceptTagsFromQuestion(question: string | undefined): string[] {
  const q = (question ?? "").toLowerCase();
  const tags: string[] = [];

  const push = (t: string) => {
    const v = normalizeTag(t);
    if (!v) return;
    if (!tags.includes(v)) tags.push(v);
  };

  if (q.includes("alt attribute")) {
    push("html");
    push("accessibility");
    push("images");
    return tags;
  }

  if (q.includes("javascript") && q.includes("html")) {
    push("html");
    push("javascript");
    push("script-tag");
    return tags;
  }

  if (q.includes("error boundary")) {
    push("react");
    push("error-boundary");
    push("error-handling");
    return tags;
  }

  if (q.includes("functional component")) {
    push("react");
    push("functional-components");
    push("components");
    return tags;
  }

  if (q.includes("testing") && q.includes("component")) {
    push("react");
    push("testing");
    push("component-testing");

    if (q.includes("jest")) push("jest");
    if (q.includes("vitest")) push("vitest");
    if (q.includes("testing library") || q.includes("testing-library")) {
      push("testing-library");
    }
    if (
      q.includes("react testing library") ||
      q.includes("react-testing-library")
    ) {
      push("react-testing-library");
    }
    if (q.includes("cypress")) push("cypress");
    if (q.includes("playwright")) push("playwright");
    if (q.includes("enzyme")) push("enzyme");

    return tags;
  }

  if (q.includes("react")) push("react");
  if (q.includes("css")) push("css");
  if (q.includes("sql") || q.includes("database")) push("sql");
  if (q.includes("index")) push("indexes");
  if (q.includes("http") || q.includes("api")) push("http");
  if (q.includes("auth") || q.includes("authentication"))
    push("authentication");
  if (q.includes("security")) push("security");
  if (q.includes("testing") || q.includes("test")) push("testing");
  if (q.includes("performance") || q.includes("optimiz")) push("performance");

  if (tags.length > 0) return tags;
  return ["fundamentals"];
}

function normalizeSecondPerson(value: string): string {
  return value
    .replace(/\bthe candidate\b/gi, "you")
    .replace(/\bcandidate\b/gi, "you")
    .replace(/\bthey\b/gi, "you")
    .replace(/\btheir\b/gi, "your")
    .replace(/\bthem\b/gi, "you")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureWhyReferencesTranscript(
  why: string,
  fallbackQuestion: string | undefined,
): string {
  const normalized = normalizeWhy(why);
  const normalizedSecondPerson = normalizeSecondPerson(normalized);
  const alreadySpecific =
    /\bquestion\s*\d+\b/i.test(normalizedSecondPerson) ||
    /\bwhen\s+i\s+asked\b/i.test(normalizedSecondPerson) ||
    /\bduring\s+the\s+question\b/i.test(normalizedSecondPerson);
  if (alreadySpecific) return normalizedSecondPerson;

  const topic = questionToTopicReference(fallbackQuestion);
  const rest = normalizedSecondPerson || "you didn’t demonstrate this clearly.";
  return `When I asked about ${topic}, ${rest}`;
}

function dedupeKnowledgeGaps(gaps: KnowledgeGap[]): KnowledgeGap[] {
  const next: KnowledgeGap[] = [];
  const seen = new Set<string>();
  for (const gap of gaps) {
    const key = normalizeGapTitle(gap.title).toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    next.push(gap);
  }
  return next;
}

type FallbackGapSeed = {
  title: string;
  tags: string[];
  why: string;
};

function deriveFallbackGapsFromQuestion(question: string): FallbackGapSeed[] {
  const q = question.toLowerCase();

  const includesJava =
    q.includes(" java ") || q.startsWith("java ") || q.includes("in java");
  const mentionsMain = q.includes(" main") || q.includes("main(");
  const mentionsBeforeMain = q.includes("before") && mentionsMain;

  if (includesJava && mentionsBeforeMain) {
    return [
      {
        title: "Java class initialization: static initializers & class loading",
        tags: ["java", "class-loading", "static-initializer"],
        why: "you should explain when static blocks/fields run, what triggers initialization, and give a concrete example (e.g., registering a JDBC driver, initializing a singleton).",
      },
      {
        title:
          "Static initialization pitfalls (side effects, order, heavy work)",
        tags: ["java", "static-initializer", "best-practices"],
        why: "a strong answer also warns against heavy IO in static blocks, explains initialization order, and suggests safer patterns (lazy init, explicit bootstrap, DI).",
      },
    ];
  }

  if (includesJava && mentionsMain) {
    return [
      {
        title: "Java application startup flow (JVM → class loading → main)",
        tags: ["java", "jvm", "startup"],
        why: "a strong answer connects JVM startup, class loading/initialization, and what code can run before `main`.",
      },
      {
        title: "Initialization order: static fields vs static blocks",
        tags: ["java", "initialization", "static"],
        why: "you should be able to describe initialization order and how it affects side effects and correctness.",
      },
    ];
  }

  if (q.includes("sql") || q.includes("database") || q.includes("index")) {
    return [
      {
        title: "SQL performance: indexes and query plans",
        tags: ["sql", "indexes", "query-plans"],
        why: "you should explain how indexes affect lookups, when they don’t help, and how to validate with `EXPLAIN`/query plans.",
      },
      {
        title: "Index design basics (selectivity, composite indexes)",
        tags: ["sql", "indexes", "database"],
        why: "a complete answer includes selectivity, composite index ordering, and trade-offs (write cost, storage).",
      },
    ];
  }

  if (q.includes("react") || q.includes("render")) {
    return [
      {
        title: "React rendering: what triggers re-renders",
        tags: ["react", "rendering", "state"],
        why: "you should explain what triggers renders, how state/props changes propagate, and how reconciliation works at a high level.",
      },
      {
        title: "Avoid unnecessary re-renders (memoization, stable props)",
        tags: ["react", "performance", "memoization"],
        why: "a strong answer calls out practical patterns: `memo`, stable callbacks, derived state, and measuring before optimizing.",
      },
    ];
  }

  if (q.includes("http") || q.includes("rest") || q.includes("api")) {
    return [
      {
        title: "HTTP semantics: status codes, idempotency",
        tags: ["http", "rest", "api"],
        why: "you should cover status codes, idempotency, and what guarantees clients can rely on.",
      },
      {
        title: "API error handling patterns (retries, timeouts)",
        tags: ["api", "error-handling", "reliability"],
        why: "a strong answer explains timeouts, retries, backoff, and how to avoid retry storms.",
      },
    ];
  }

  return [
    {
      title: "Answer structure: definition → example → pitfall",
      tags: ["fundamentals", "examples"],
      why: "aim for a crisp definition, then a tiny example, then one pitfall/best practice — this makes answers easy to score.",
    },
    {
      title: "Trade-offs and edge cases",
      tags: ["trade-offs", "edge-cases"],
      why: "add at least one trade-off or edge case to show depth beyond the happy path.",
    },
  ];
}

function buildFallbackKnowledgeGaps(options: {
  conversationHistory: Message[];
  config: InterviewConfig;
  score: number;
  passed?: boolean;
}): KnowledgeGap[] {
  const questions = extractInterviewerQuestions(options.conversationHistory);
  const q1 = questions[0];
  const q2 = questions[1];

  const isPerfectish = options.score >= 95;
  if (isPerfectish) {
    return [
      {
        title: "Optimization: trade-offs and profiling mindset",
        priority: "low",
        tags: ["performance", "profiling", "optimization"],
        why: ensureWhyReferencesTranscript(
          "you can go beyond correct solutions by explaining how you would measure bottlenecks and choose optimizations.",
          q1,
        ),
        resources: [],
      },
      {
        title: "Advanced concepts: edge cases and production hardening",
        priority: "low",
        tags: ["reliability", "testing", "edge-cases"],
        why: ensureWhyReferencesTranscript(
          "a senior-level answer typically calls out failure modes, constraints, and how you’d validate assumptions in production.",
          q2,
        ),
        resources: [],
      },
    ];
  }

  const positionTag = options.config.position
    ? options.config.position.toLowerCase().replace(/\s+/g, "-")
    : "interview";

  const primarySeeds = q1 ? deriveFallbackGapsFromQuestion(q1) : [];
  const secondarySeeds = q2 ? deriveFallbackGapsFromQuestion(q2) : [];

  const candidates: FallbackGapSeed[] = [
    ...primarySeeds,
    ...secondarySeeds,
    ...(q1 || q2
      ? []
      : [
          {
            title: "Answer structure: definition → example → pitfall",
            tags: [positionTag, "fundamentals"],
            why: "answers should define the concept, show a minimal working example, and call out one pitfall or best practice.",
          },
        ]),
  ];

  const selected: FallbackGapSeed[] = [];
  const seenTitles = new Set<string>();
  for (const c of candidates) {
    const key = normalizeGapTitle(c.title).toLowerCase();
    if (!key || seenTitles.has(key)) continue;
    seenTitles.add(key);
    selected.push(c);
    if (selected.length >= 2) break;
  }

  return [
    {
      title:
        selected[0]?.title ??
        "Answer structure: definition → example → pitfall",
      priority: options.passed === false ? "high" : "medium",
      tags: selected[0]?.tags ?? [positionTag, "fundamentals"],
      why: ensureWhyReferencesTranscript(
        selected[0]?.why ??
          "aim for a crisp definition, then a tiny example, then one pitfall/best practice.",
        q1,
      ),
      resources: [],
    },
    {
      title:
        selected[1]?.title ??
        "Clarify reasoning: assumptions → steps → conclusion",
      priority: options.passed === false ? "high" : "medium",
      tags: selected[1]?.tags ?? ["communication", "problem-solving"],
      why: ensureWhyReferencesTranscript(
        selected[1]?.why ??
          "your answer should state assumptions, walk through steps, and then summarize the conclusion so it’s easy to verify.",
        q2 ?? q1,
      ),
      resources: [],
    },
  ];
}

function ensureMinimumKnowledgeGaps(options: {
  knowledgeGaps: KnowledgeGap[];
  conversationHistory: Message[];
  config: InterviewConfig;
  score: number;
  passed?: boolean;
}): KnowledgeGap[] {
  const questions = extractInterviewerQuestions(options.conversationHistory);
  const perQuestion: KnowledgeGap[] = questions.map((question, idx) => {
    const fallbackQuestion = question;
    const topic = questionToTopicReference(fallbackQuestion);

    const fromModel = options.knowledgeGaps[idx];
    const baseTitle = normalizeGapTitle(fromModel?.title ?? "");
    const title =
      baseTitle.length >= 5 &&
      baseTitle.length <= 80 &&
      !baseTitle.includes("?")
        ? baseTitle
        : topic;

    const priority =
      fromModel?.priority ?? (options.passed === false ? "high" : "medium");
    const modelTags = sanitizeModelTags(fromModel?.tags);
    const tags =
      modelTags.length > 0
        ? modelTags
        : deriveConceptTagsFromQuestion(fallbackQuestion);
    const why = ensureWhyReferencesTranscript(
      fromModel?.why ?? "",
      fallbackQuestion,
    );

    return {
      title,
      priority,
      tags,
      why,
      resources: fromModel?.resources ?? [],
    };
  });

  if (perQuestion.length > 0) return perQuestion.slice(0, 12);

  const fallback = buildFallbackKnowledgeGaps({
    conversationHistory: options.conversationHistory,
    config: options.config,
    score: options.score,
    passed: options.passed,
  });

  return dedupeKnowledgeGaps(fallback).slice(0, 5);
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<AnalyzeApiResponse>> {
  try {
    // Parse and validate request
    const body = (await request.json()) as AnalyzeApiRequest;
    const { conversationHistory, interviewConfig } = body;

    // Validate required fields
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

    // Validate interview configuration
    const configValidation = validateInterviewConfig(interviewConfig);
    if (!configValidation.isValid) {
      console.error("❌ Analysis configuration validation failed:", {
        errors: configValidation.errors,
        config: interviewConfig,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Invalid configuration: ${configValidation.errors.join(", ")}`,
          details: configValidation.errors,
        },
        { status: 400 },
      );
    }

    // Analyze response quality
    const responseAnalysis = analyzeResponseQuality(conversationHistory);

    // Generate analysis prompts
    const systemPrompt = generateAnalysisSystemPrompt(interviewConfig);
    const analysisPrompt = generateAnalysisPrompt(
      conversationHistory,
      interviewConfig,
      responseAnalysis,
    );

    let analysisText: string;

    // Try to get AI analysis
    if (isAvailable(aiClient)) {
      const aiResponse = await generateAnalysis(
        aiClient,
        systemPrompt,
        analysisPrompt,
      );

      if (aiResponse.success) {
        analysisText = aiResponse.content;
      } else {
        console.error(
          "AI analysis failed, falling back to mock:",
          aiResponse.error,
        );
        analysisText = generateMockAnalysisResponse(
          interviewConfig,
          responseAnalysis,
        );
      }
    } else {
      console.warn("AI service not available, using mock analysis");
      analysisText = generateMockAnalysisResponse(
        interviewConfig,
        responseAnalysis,
      );
    }

    // Parse analysis into structured feedback
    const feedback = parseAnalysis(
      analysisText,
      responseAnalysis,
      interviewConfig,
    );

    const knowledgeGaps = feedback.knowledgeGaps ?? [];
    const enrichedKnowledgeGapsFromModel: KnowledgeGap[] = await Promise.all(
      knowledgeGaps.map(async (gap) => {
        const resources = await getResourcesByTags(gap.tags, 5);
        return { ...gap, resources };
      }),
    );

    const ensuredKnowledgeGaps = ensureMinimumKnowledgeGaps({
      knowledgeGaps: enrichedKnowledgeGapsFromModel,
      conversationHistory,
      config: interviewConfig,
      score: feedback.score,
      passed: feedback.passed,
    }).map(ensureGapHasMinimumResources);

    const enrichedFeedback = {
      ...feedback,
      ...(ensuredKnowledgeGaps.length > 0
        ? { knowledgeGaps: ensuredKnowledgeGaps }
        : {}),
    };

    return NextResponse.json({
      success: true,
      feedback: enrichedFeedback,
      rawAnalysis: analysisText,
    });
  } catch (error) {
    console.error("❌ Analysis API error:", error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Provide specific error messages
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
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

/**
 * Generate analysis prompt with conversation context
 */
function generateAnalysisPrompt(
  conversationHistory: Message[],
  config: InterviewConfig,
  responseAnalysis: ResponseAnalysis,
): string {
  const conversation = conversationHistory
    .map(
      (msg) =>
        `${msg.type === "ai" ? "INTERVIEWER" : "CANDIDATE"}: ${msg.content}`,
    )
    .join("\n\n");

  const passingThreshold = getPassingThreshold(config.seniority);

  return `Analyze this ${config.interviewType} interview for a ${config.seniority}-level ${config.position} position.

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

function getPassingThreshold(seniority: string) {
  const thresholds = {
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

  return thresholds[seniority as keyof typeof thresholds] || thresholds.mid;
}
