import type {
  CompanyProfileValue,
  PositionValue,
  SeniorityValue,
} from "@/types/global";

const POSITION_VALUES: readonly PositionValue[] = [
  "frontend",
  "backend",
  "fullstack",
  "devops",
  "mobile",
  "data-engineer",
  "data-scientist",
  "cybersecurity",
  "product",
  "other",
];

const COMPANY_PROFILE_VALUES: readonly CompanyProfileValue[] = [
  "generic",
  "faang",
  "startup",
];

const POSITION_KEYWORDS: Record<PositionValue, string[]> = {
  frontend: [
    "frontend",
    "front-end",
    "ui",
    "web",
    "javascript",
    "react",
    "vue",
    "angular",
  ],
  backend: ["backend", "back-end", "api", "platform", "server"],
  fullstack: [
    "fullstack",
    "full-stack",
    "software engineer",
    "software developer",
    "engineer",
  ],
  devops: ["devops", "sre", "site reliability", "platform"],
  mobile: ["mobile", "ios", "android", "react native", "flutter"],
  "data-engineer": ["data engineer", "analytics engineer"],
  "data-scientist": ["data scientist", "ml", "machine learning"],
  cybersecurity: ["security", "cyber", "appsec", "infosec"],
  product: ["product manager", "pm ", "pm-", "product owner"],
  other: [],
};

function findFromKeywords(value: string): PositionValue | null {
  for (const position of POSITION_VALUES) {
    const keywords = POSITION_KEYWORDS[position];
    if (keywords?.some((keyword) => value.includes(keyword))) {
      return position;
    }
  }
  return null;
}

export function normalizePositionValue(value?: string | null): PositionValue {
  if (!value) return "frontend";
  const normalized = value.trim().toLowerCase();
  if ((POSITION_VALUES as readonly string[]).includes(normalized)) {
    return normalized as PositionValue;
  }

  const inferred = findFromKeywords(normalized);
  if (inferred) {
    return inferred;
  }

  return "frontend";
}

export function normalizeCompanyProfileValue(
  value?: string | null,
): CompanyProfileValue {
  if (!value) return "generic";
  const normalized = value.trim().toLowerCase();
  if ((COMPANY_PROFILE_VALUES as readonly string[]).includes(normalized)) {
    return normalized as CompanyProfileValue;
  }
  return "generic";
}

const SENIORITY_VALUES: readonly SeniorityValue[] = [
  "entry",
  "junior",
  "mid",
  "senior",
];

export function normalizeSeniorityValue(value?: string | null): SeniorityValue {
  if (!value) return "mid";
  const normalized = value.trim().toLowerCase();
  if ((SENIORITY_VALUES as readonly string[]).includes(normalized)) {
    return normalized as SeniorityValue;
  }
  return "mid";
}

function toTopicFromTags(tags: string[] | undefined): string {
  const parts = (Array.isArray(tags) ? tags : [])
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((t) => t.replace(/-/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "";
}

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.*?)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeKnowledgeGapTag(value: string): string {
  const cleaned = stripInlineMarkdown(value)
    .replace(/^tags:\s*/i, "")
    .trim()
    .toLowerCase();
  if (!cleaned) return "";
  return cleaned
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function formatKnowledgeGapTitle(
  rawTitle: string,
  tags?: string[],
): string {
  const rawBase = stripInlineMarkdown(rawTitle)
    .replace(/^\s*\d+\s*[.)]\s*/g, "")
    .replace(/^\s*title\s*:\s*/i, "")
    .replace(/\.{3,}/g, " ")
    .replace(/…/g, " ")
    .replace(/[?!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const base = rawBase
    .replace(/^(?:you\s+have\s+)?you['’]?ve\s+pinpointed\s+/i, "")
    .replace(/^(?:you\s+)?(?:can|could|would)\s+you\s+/i, "")
    .replace(/^(?:you\s+)?(?:explain|describe|define|summarize)\s+/i, "")
    .replace(/^(?:walk\s+me\s+through|talk\s+me\s+through)\s+/i, "")
    .replace(/^(?:in\s+your\s+own\s+words[,\s]*)/i, "")
    .replace(/,?\s*(?:and|then)\s+can\s+you\b[\s\S]*$/i, "")
    .replace(/\s+as\s+the\s+likely\s*$/i, "")
    .replace(/\s+as\s+the\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const lower = base.toLowerCase();
  const looksBad =
    rawTitle.includes("?") ||
    lower.startsWith("let's ") ||
    lower.startsWith("lets ") ||
    lower.startsWith("whether ") ||
    lower.startsWith("thanks") ||
    lower.startsWith("when i asked") ||
    lower.startsWith("you've pinpointed") ||
    lower.startsWith("you’ve pinpointed") ||
    lower.includes("let's try") ||
    lower.includes("different angle") ||
    lower.includes("that's all the questions") ||
    lower.includes("main thread") ||
    lower.includes("when i asked");

  const tagTopic = toTopicFromTags(tags);

  if (/\bpwa\b|\bpwas\b|\bprogressive\s+web\s+app/i.test(base)) {
    return "Progressive Web Apps (PWA)";
  }

  if (lower.includes("jsx") && lower.includes("browser"))
    return "JSX compilation";
  if (lower.includes("react") && lower.includes("immut"))
    return "React state immutability";

  const preferred = looksBad ? tagTopic : base.length > 0 ? base : tagTopic;
  const cleaned = stripInlineMarkdown(preferred).replace(/\s+/g, " ").trim();
  if (!cleaned) return tagTopic || "Knowledge gap";

  const firstClause = cleaned.split(/[:.\n]/)[0]?.trim() ?? cleaned;
  const maxLen = 52;
  if (firstClause.length <= maxLen) return firstClause;

  const slice = firstClause.slice(0, maxLen);
  const cut = slice.lastIndexOf(" ");
  const safe = (cut > 18 ? slice.slice(0, cut) : slice)
    .replace(/[,:;\-–—]+\s*$/g, "")
    .trim();
  return safe.length > 0 ? safe : tagTopic || "Knowledge gap";
}

export function formatKnowledgeGapDescription(params: {
  title: string;
  tags?: string[];
  priority?: "high" | "medium" | "low" | string;
  summary?: string;
}): string {
  const summary = stripInlineMarkdown(params.summary ?? "")
    .replace(/\.{3,}/g, " ")
    .replace(/…/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const cleanDanglingTail = (value: string): string => {
    const v = value.trim();
    if (!v) return "";
    const withoutDanglingEg = v
      .replace(/\(\s*e\.g\.?\s*$/i, "")
      .replace(/\be\.g\.?\s*$/i, "")
      .replace(/[\s\-:,(]+$/g, "")
      .trim();
    if (!withoutDanglingEg) return "";
    if (/[.!?]$/.test(withoutDanglingEg)) return withoutDanglingEg;
    return `${withoutDanglingEg}.`;
  };

  const lower = summary.toLowerCase();
  const summaryLooksBad =
    summary.length < 18 ||
    lower.startsWith("when i asked") ||
    lower.startsWith("during the question") ||
    lower.startsWith("thanks") ||
    lower.startsWith("let's ") ||
    lower.startsWith("lets ") ||
    lower.startsWith("whether ") ||
    lower.includes("that's all the questions") ||
    lower.includes("different angle");

  if (summary && !summaryLooksBad) {
    const firstSentence = summary.split(/(?<=[.!?])\s+/)[0]?.trim() ?? summary;
    const maxLen = 160;
    if (firstSentence.length <= maxLen) return cleanDanglingTail(firstSentence);
    const slice = firstSentence.slice(0, maxLen);
    const cut = slice.lastIndexOf(" ");
    const safe = (cut > 80 ? slice.slice(0, cut) : slice).trimEnd();
    return safe.length > 0 ? cleanDanglingTail(safe) : "";
  }

  const topic = formatKnowledgeGapTitle(params.title, params.tags);

  const prefix = (() => {
    switch (params.priority) {
      case "high":
        return "High priority — ";
      case "medium":
        return "Priority — ";
      case "low":
        return "";
      default:
        return "";
    }
  })();

  const base = topic;
  const templates = [
    `${prefix}Practice a crisp definition, a tiny example, and one trade-off for ${base}.`,
    `${prefix}Explain ${base} end-to-end in under 60 seconds, then add one common pitfall.`,
    `${prefix}Strengthen ${base} by comparing alternatives and when you’d choose each.`,
  ];

  const key = `${topic}|${params.priority ?? ""}`;
  const pick =
    templates[stableHash(key) % templates.length] ?? templates[0] ?? "";
  const maxLen = 170;
  if (pick.length <= maxLen) return pick;
  const slice = pick.slice(0, maxLen);
  const cut = slice.lastIndexOf(" ");
  const safe = (cut > 90 ? slice.slice(0, cut) : slice).trimEnd();
  return safe.length > 0 ? `${safe}.` : "";
}

export function formatKnowledgeGapBlurb(params: {
  title: string;
  tags?: string[];
  priority?: "high" | "medium" | "low" | string;
}): string {
  const topic = formatKnowledgeGapTitle(params.title, params.tags);
  const base = topic;
  const tags = (params.tags ?? [])
    .map((t) => normalizeKnowledgeGapTag(t))
    .filter(Boolean);
  const tagSet = new Set(tags);
  const preferredTagOrder = [
    "react-hooks",
    "react-rules",
    "react",
    "jsx",
    "react-compilation",
    "nextjs",
    "next-js",
    "typescript",
    "javascript",
    "sql",
    "postgresql",
    "nodejs",
    "testing",
    "jest",
    "css",
    "html",
  ] as const;

  const bestTag = preferredTagOrder.find((t) => tagSet.has(t)) ?? tags[0] ?? "";

  const templatesByTag: Partial<Record<string, string[]>> = {
    "react-hooks": [
      `Fix one real snippet: show the correct Hooks pattern for ${base} and why it matters.`,
      `Know the rule, not the slogan: explain when Hooks break in ${base} and how to refactor.`,
      `Walk through a bug: conditional Hooks in ${base} → what breaks → the safe alternative.`,
      `Explain the invariant behind Hooks ordering, using ${base} as the example.`,
      `Give a quick “wrong vs right” example for ${base} that you could do on a whiteboard.`,
    ],
    "react-rules": [
      `Turn this into a rule-of-thumb: ${base} — what React guarantees vs what it doesn’t.`,
      `Explain the constraint behind ${base}, then show a tiny “bad → good” rewrite.`,
      `Give one example where ${base} silently fails and how you’d catch it in review.`,
      `Show the safest default approach for ${base}, then name the common exception.`,
    ],
    jsx: [
      `Explain what JSX becomes, then show one gotcha (scope, fragments, or children) for ${base}.`,
      `Do a 30-second mental model: JSX → function calls → elements, using ${base} as the example.`,
      `Clarify trade-offs: what JSX hides vs what it simplifies in ${base}.`,
      `Show what actually runs for ${base} (roughly), not just what it looks like in JSX.`,
    ],
    "react-compilation": [
      `Describe the pipeline: JSX → compiler → runtime, using ${base} as the anchor.`,
      `Explain why compilation matters for ${base} (dev vs prod behavior, warnings, output).`,
      `Give one “what actually runs” example for ${base} and one trade-off.`,
      `Explain how tooling changes the runtime story for ${base} (transform, dev warnings, output).`,
    ],
    nextjs: [
      `Connect the dots: routing, data fetching, and rendering mode for ${base}.`,
      `Explain what runs where (server vs client) in ${base} and why it matters.`,
      `Give one concrete Next.js gotcha (cache, params, or hydration) for ${base}.`,
      `Describe the “happy path” implementation for ${base}, then one gotcha to avoid.`,
    ],
    typescript: [
      `Add one strong type guard or type-level invariant to your explanation of ${base}.`,
      `Show a tiny TS example for ${base}: types first, then runtime behavior.`,
      `Explain the trade-off: type safety vs complexity, using ${base} as the example.`,
    ],
    javascript: [
      `Explain the runtime behavior behind ${base} with one concrete example.`,
      `Name the pitfall: where ${base} surprises people, and how you avoid it.`,
      `Compare two approaches for ${base} and justify your choice.`,
    ],
    sql: [
      `Practice: write the query for ${base}, then explain indexes or performance trade-offs.`,
      `Explain ${base} with a real table example, not theory.`,
      `Give one performance pitfall for ${base} and how you’d spot it.`,
    ],
    postgresql: [
      `Explain ${base} in Postgres terms: planner/indexes + one real example.`,
      `Show one “why it’s slow” scenario for ${base} and the fix.`,
      `Clarify the trade-off: correctness vs performance for ${base}.`,
    ],
    nodejs: [
      `Explain what happens on the event loop for ${base}, with one real example.`,
      `Name a Node pitfall for ${base} (async, streams, or errors) and the safe pattern.`,
      `Show how you’d structure code for ${base} to keep it robust.`,
    ],
    jest: [
      `Write one good test for ${base}: setup → assertion → edge case.`,
      `Explain the intent of the test for ${base}, then show one mocking pitfall.`,
      `Make it practical: what you’d test (and what you wouldn’t) for ${base}.`,
    ],
    testing: [
      `Pick the right test level for ${base} and justify it with one example.`,
      `Explain what success looks like for ${base}, then show one edge case test.`,
      `Call out one testing anti-pattern that shows up around ${base}.`,
    ],
    css: [
      `Explain the layout/paint mechanics behind ${base} with one concrete example.`,
      `Show one CSS gotcha for ${base} (specificity, stacking, or sizing) and the fix.`,
      `Compare two CSS approaches for ${base} and when you’d use each.`,
    ],
    html: [
      `Explain the semantic choice behind ${base} and why it improves accessibility.`,
      `Give one example of correct HTML structure for ${base} and one common mistake.`,
      `Connect ${base} to real behavior (forms, focus, or DOM) with one example.`,
    ],
  };

  const generic = [
    `Practice a crisp definition, a tiny example, and one trade-off for ${base}.`,
    `Explain ${base} end-to-end in under 60 seconds, then add one common pitfall.`,
    `Strengthen ${base} by comparing alternatives and when you’d choose each.`,
  ];

  const baseTemplates = templatesByTag[bestTag] ?? generic;

  const key = `${topic}|${bestTag}|${params.priority ?? ""}`;
  const pick =
    baseTemplates[stableHash(key) % baseTemplates.length] ??
    baseTemplates[0] ??
    "";
  const maxLen = 170;
  if (pick.length <= maxLen) return pick;

  const slice = pick.slice(0, maxLen);
  const cut = slice.lastIndexOf(" ");
  const safe = (cut > 90 ? slice.slice(0, cut) : slice).trimEnd();
  return safe.length > 0 ? `${safe}.` : "";
}
