import fs from "fs";
import path from "path";
import OpenAI from "openai";

type QuestionStatus = "draft" | "published" | "archived";
type Difficulty = "entry" | "junior" | "mid" | "senior";
type CompanySize = "faang" | "startup" | "enterprise";
type CompanyType = CompanySize;
type RoleTopic =
  | "frontend"
  | "backend"
  | "fullstack"
  | "devops"
  | "mobile"
  | "data-engineer"
  | "data-scientist"
  | "cybersecurity"
  | "product";
type PositionSlug = RoleTopic;
type InterviewType =
  | "regular"
  | "practice"
  | "flash"
  | "play"
  | "competitive"
  | "teacher";
type SeniorityLevel = "entry" | "junior" | "mid" | "senior";

interface JsonCompany {
  name: string;
  logo: string;
  size: CompanySize[];
  description: string;
}

interface JsonReferenceAnswer {
  id: string;
  text: string;
  weight?: number;
  keyPoints: string[];
}

interface JsonCoreQuestion {
  id: string;
  status: QuestionStatus;
  reviewerId: string | null;
  reviewedAt: string | null;

  difficulty: Difficulty;
  isDemoMode: boolean;
  companyType: CompanyType;

  title: string;
  description: string;
  prompt: string;

  topic: RoleTopic;
  subtopics: string[];
  tags: string[];
  estimatedTimeMinutes: number;

  aiEvaluationHint: string | null;

  companies: JsonCompany[] | null;
  positions: PositionSlug[];
  primaryTechStack: string[];

  interviewTypes: InterviewType[];
  seniorityLevels: SeniorityLevel[];

  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface JsonOpenQuestion extends JsonCoreQuestion {
  referenceAnswers: JsonReferenceAnswer[] | null;
}

interface JsonBatch {
  mcq_questions: unknown[];
  open_questions: JsonOpenQuestion[];
  truefalse_questions: unknown[];
  matching_questions: unknown[];
  system_design_questions: unknown[];
}

type LegacyLevel = "Entry" | "Junior" | "Mid" | "Senior";

interface LegacyQuestion {
  id: number;
  level: LegacyLevel;
  title: string;
  answer: string | null;
  isPremium?: boolean;
}

const normalizeDifficulty = (value: string): Difficulty => {
  switch (value) {
    case "entry":
    case "junior":
    case "mid":
    case "senior":
      return value;
    case "middle":
      return "mid";
    default: {
      throw new Error(`Unhandled difficulty: ${value}`);
    }
  }
};

const toDifficultyFromLegacyLevel = (value: LegacyLevel): Difficulty => {
  switch (value) {
    case "Entry":
      return "entry";
    case "Junior":
      return "junior";
    case "Mid":
      return "mid";
    case "Senior":
      return "senior";
    default: {
      const _never: never = value;
      throw new Error(`Unhandled legacy level: ${_never}`);
    }
  }
};

const seniorityLevelsFromDifficulty = (difficulty: Difficulty): SeniorityLevel[] => {
  switch (difficulty) {
    case "entry":
      return ["entry", "junior"];
    case "junior":
      return ["junior", "mid"];
    case "mid":
      return ["mid", "senior"];
    case "senior":
      return ["senior"];
    default: {
      const _never: never = difficulty;
      throw new Error(`Unhandled difficulty: ${_never}`);
    }
  }
};

const minutesByDifficulty = (difficulty: Difficulty): number => {
  switch (difficulty) {
    case "entry":
      return 5;
    case "junior":
      return 7;
    case "mid":
      return 10;
    case "senior":
      return 12;
    default: {
      const _never: never = difficulty;
      throw new Error(`Unhandled difficulty: ${_never}`);
    }
  }
};

const uniq = <T,>(items: T[]): T[] => Array.from(new Set(items));

const hashToIndex = (value: string, mod: number) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
};

const inferCompanyType = (opts: { id: string; difficulty: Difficulty }): CompanyType => {
  const base = (() => {
    switch (opts.difficulty) {
      case "entry":
        return "startup";
      case "junior":
        return "enterprise";
      case "mid":
        return "enterprise";
      case "senior":
        return "faang";
      default: {
        const _never: never = opts.difficulty;
        throw new Error(`Unhandled difficulty: ${_never}`);
      }
    }
  })();

  const pool: CompanyType[] = ["startup", "enterprise", "faang"];
  pool.splice(pool.indexOf(base), 1);
  pool.unshift(base);
  return pool[hashToIndex(opts.id, pool.length)];
};

const normalizeQuestion = (raw: string): string => {
  const trimmed = raw.trim();
  const cleaned = trimmed.replace(/\s+/g, " ").trim();
  return cleaned.endsWith("?") ? cleaned : `${cleaned}?`;
};

const sanitizeAnswerText = (raw: string): string => {
  const s = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n\s*Copy code\s*\n/gi, "\n")
    .replace(/\n\s*(typescript|javascript|ts|js|json|bash|shell)\s*\n/gi, "\n")
    .replace(/[\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return s;
};

const sanitizePromptText = (raw: string): string => {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const assessDifficulty = (opts: { question: string; tags: string[] }): Difficulty => {
  const q = opts.question.toLowerCase();
  const t = new Set(opts.tags);

  let score = 0;

  // Easy fundamentals
  if (/\bwhat is javascript\b/.test(q)) score -= 3;
  if (/\bdata types\b|\bprimitive\b|\bnull\b|\bundefined\b/.test(q)) score -= 2;
  if (/\bvar\b|\blet\b|\bconst\b|\bscope\b/.test(q)) score -= 1;
  if (/\b==\b|\b===\b|\btype coercion\b/.test(q)) score -= 1;

  // Medium
  if (t.has("this") || /\bthis\b/.test(q)) score += 1;
  if (t.has("hoisting") || /\bhoisting\b/.test(q)) score += 1;
  if (t.has("closures") || /\bclosure\b/.test(q)) score += 2;
  if (t.has("promises") || /\bpromise\b/.test(q)) score += 2;
  if (t.has("event-loop") || /\bevent loop\b/.test(q)) score += 3;
  if (t.has("prototypes") || /\bprototype\b/.test(q)) score += 2;

  // Hard
  if (t.has("security") || /\b(xss|csrf|cors)\b/.test(q)) score += 3;
  if (t.has("performance") || /\b(reflow|repaint|performance)\b/.test(q)) score += 3;
  if (/\bmemory\b|\bgarbage\b|\bweakmap\b|\bweakset\b/.test(q)) score += 3;
  if (/\bconcurrency\b|\brace condition\b|\bworker\b/.test(q)) score += 3;

  // Question length is a weak proxy for complexity
  if (opts.question.length > 90) score += 1;
  if (opts.question.length > 140) score += 1;

  if (score <= -2) return "entry";
  if (score <= 1) return "junior";
  if (score <= 4) return "mid";
  return "senior";
};

const classifyFromQuestion = (
  question: string,
  opts: {
    baseTags: string[];
  },
) => {
  const q = question.toLowerCase();
  const tags: string[] = [];
  const subtopics: string[] = [];

  const addTag = (...xs: string[]) => tags.push(...xs);
  const addSub = (...xs: string[]) => subtopics.push(...xs);

  addTag(...opts.baseTags);

  if (/\b(this)\b/.test(q)) addTag("this");
  if (/\b(closure|closures)\b/.test(q)) addTag("closures");
  if (/\b(hoisting)\b/.test(q)) addTag("hoisting");
  if (/\b(var|let|const|tdz|scope)\b/.test(q)) addTag("scope");
  if (/\b(promise|promises)\b/.test(q)) addTag("promises", "async");
  if (/\b(async\/await|async\s+await)\b/.test(q)) addTag("async-await", "async");
  if (/\b(event loop)\b/.test(q)) addTag("event-loop", "async");
  if (/\b(dom|document|window)\b/.test(q)) addTag("dom");
  if (/\b(event delegation|bubbling|capturing|propagation)\b/.test(q))
    addTag("events");
  if (/\b(cors)\b/.test(q)) addTag("cors", "http", "security");
  if (/\b(xss)\b/.test(q)) addTag("xss", "security");
  if (/\b(csrf)\b/.test(q)) addTag("csrf", "security");
  if (/\b(reflow|repaint)\b/.test(q)) addTag("performance");
  if (/\b(prototype|prototypal)\b/.test(q)) addTag("prototypes");
  if (/\b(type coercion)\b/.test(q)) addTag("type-coercion");
  if (/\b(==|===)\b/.test(q)) addTag("equality");
  if (/\b(localstorage|sessionstorage)\b/.test(q)) addTag("web-storage");

  if (tags.includes("async") || tags.includes("event-loop")) addSub("async");
  if (tags.includes("dom") || tags.includes("events")) addSub("dom");
  if (tags.includes("security")) addSub("security");
  if (tags.includes("performance")) addSub("performance");

  if (subtopics.length === 0) addSub("language-fundamentals");

  return {
    tags: uniq(tags),
    subtopics: uniq(subtopics),
  };
};

const CANONICAL_TECH_SLUGS = [
  // Programming languages
  "python",
  "java",
  "javascript",
  "typescript",
  "csharp",
  "go",
  "rust",
  "php",
  "bash",
  "cpp",

  // Front-End & UI Development
  "react",
  "html",
  "css",
  "react-native",
  "swift",
  "kotlin",
  "flutter",
  "xamarin",
  "dotnet-maui",
  "blazor",

  // Back-End & API Development
  "nodejs",
  "rest-api",
  "graphql",
  "spring",
  "firebase",
  "dotnet",
  "aspnet-core",
  "entity-framework-core",

  // Databases & Caching
  "sql",
  "nosql",
  "redis",
  "caching",
  "message-queues",

  // DevOps & Infrastructure
  "devops",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
  "terraform",
  "cdn",
  "microservices",
  "distributed-computing",
  "cloud-computing",
  "monitoring-observability",

  // Systems, OS & Networking
  "linux",
  "operating-systems",
  "networks",
  "computer-architecture",

  // Fundamentals
  "oop",
  "design-principles",
  "design-patterns",
  "git",
  "concurrency",
  "software-testing",
  "functional-programming",
] as const;

const TECH_ALIASES: Record<string, string> = {
  "c#": "csharp",
  csharp: "csharp",
  "c++": "cpp",
  cpp: "cpp",
  golang: "go",
  "node.js": "nodejs",
  node: "nodejs",
  "rest": "rest-api",
  "restapi": "rest-api",
  graphql: "graphql",
  html5: "html",
  "reactnative": "react-native",
  "asp.net": "aspnet-core",
  aspnet: "aspnet-core",
  "aspnetcore": "aspnet-core",
  "entityframework": "entity-framework-core",
  "entityframeworkcore": "entity-framework-core",
  efcore: "entity-framework-core",
  "messagequeue": "message-queues",
  "messagequeues": "message-queues",
  mq: "message-queues",
  "monitoring": "monitoring-observability",
  observability: "monitoring-observability",
  os: "operating-systems",
  networking: "networks",
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\+/g, "pp")
    .replace(/#/g, "sharp")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const tokenizeSourceKey = (sourceKey: string) => {
  const normalized = toSlug(sourceKey);
  return uniq(normalized.split(/[^a-z0-9]+/g).filter(Boolean));
};

const inferBaseTechFromSourceKey = (sourceKey: string) => {
  const normalized = toSlug(sourceKey);
  const tokenSet = new Set(tokenizeSourceKey(sourceKey));
  const canonical = new Set<string>(CANONICAL_TECH_SLUGS);

  const mappedTokens = uniq(
    Array.from(tokenSet).map((t) => TECH_ALIASES[t] ?? t),
  );

  const hits = new Set<string>();
  for (const t of mappedTokens) {
    if (canonical.has(t)) hits.add(t);
  }

  for (const slug of CANONICAL_TECH_SLUGS) {
    if (normalized.includes(slug)) hits.add(slug);
  }

  const primaryTechStack = Array.from(hits);
  return {
    baseTags: primaryTechStack,
    primaryTechStack,
  };
};

const CREATED_BY = "admin";

const inferPositions = (opts: {
  question: string;
  tags: string[];
  subtopics: string[];
  primaryTechStack: string[];
}): PositionSlug[] => {
  const q = opts.question.toLowerCase();
  const t = new Set(opts.tags.map((x) => x.toLowerCase()));
  const s = new Set(opts.subtopics.map((x) => x.toLowerCase()));
  const stack = new Set(opts.primaryTechStack.map((x) => x.toLowerCase()));

  const out = new Set<PositionSlug>();

  const add = (...xs: PositionSlug[]) => {
    for (const x of xs) out.add(x);
  };

  const hasFront =
    /\b(dom|document|window|css|html|browser|react|vue|angular|svelte|next\.js|jsx|tsx)\b/.test(q) ||
    t.has("dom") ||
    t.has("events") ||
    stack.has("react") ||
    stack.has("nextjs") ||
    stack.has("typescript");
  const hasBack =
    /\b(api|rest|graphql|http|server|backend|node\.js|node|express|nestjs|sql|database|orm|cache|redis|queue)\b/.test(q) ||
    t.has("http") ||
    stack.has("php") ||
    stack.has("python") ||
    stack.has("java") ||
    stack.has("go") ||
    stack.has("nodejs");

  const hasDevops =
    /\b(devops|docker|kubernetes|k8s|ci\/?cd|terraform|aws|gcp|azure|deployment|observability|monitoring)\b/.test(q);
  const hasMobile = /\b(android|ios|swift|kotlin|react native|flutter)\b/.test(q);
  const hasDataEng =
    /\b(etl|data pipeline|warehouse|spark|airflow|kafka|bigquery|snowflake)\b/.test(q) ||
    s.has("data") ||
    stack.has("sql");
  const hasDataSci = /\b(machine learning|ml|model|training|regression|classification|statistics)\b/.test(q);
  const hasSecurity = /\b(xss|csrf|cors|oauth|jwt|encryption|hashing|security|vulnerability)\b/.test(q) || t.has("security");
  const hasProduct = /\b(product|roadmap|metrics|kpi|stakeholder|requirement|user story)\b/.test(q);

  if (hasFront) add("frontend");
  if (hasBack) add("backend");
  if (hasDevops) add("devops");
  if (hasMobile) add("mobile");
  if (hasDataEng) add("data-engineer");
  if (hasDataSci) add("data-scientist");
  if (hasSecurity) add("cybersecurity");
  if (hasProduct) add("product");

  if (out.has("frontend") || out.has("backend")) out.add("fullstack");
  if (out.size === 0) {
    if (stack.has("php") || stack.has("python") || stack.has("java") || stack.has("go")) {
      out.add("backend");
      out.add("fullstack");
    } else {
      out.add("fullstack");
    }
  }

  return Array.from(out);
};

const titleFromQuestion = (question: string): string => {
  const q = question.toLowerCase();
  const overrides: Array<[RegExp, string]> = [
    [/\bwhat is javascript\b/, "JavaScript"],
    [/statically typed|dynamically typed/, "Typing model"],
    [/compiled|interpreted|jit/, "Execution model"],
    [/difference between javascript and java/, "JavaScript vs Java"],
    [/\bthis\b/, "this keyword"],
    [/event loop/, "Event loop"],
    [/\bpromise\b|\bpromises\b/, "Promises"],
    [/async\/?await/, "Async/await"],
    [/closure/, "Closures"],
    [/prototype/, "Prototypes"],
    [/hoisting/, "Hoisting"],
    [/\b(dom|document|window)\b/, "DOM"],
    [/cors/, "CORS"],
    [/xss/, "XSS"],
    [/csrf/, "CSRF"],
    [/localstorage|sessionstorage/, "Web storage"],
  ];

  for (const [re, title] of overrides) {
    if (re.test(q)) return title;
  }

  let s = question.replace(/\?$/, "").trim();
  s = s.replace(/^\s*(what|why|how|when|where|which)\b\s*(is|are|do|does|did|can|should|would)?\s*/i, "");
  s = s.replace(/^\s*(explain|describe|define|compare|differentiate)\b\s*/i, "");
  s = s.replace(/\s+/g, " ").trim();

  const words = s.split(" ").filter(Boolean);
  const keep = words.slice(0, Math.min(words.length, 6)).join(" ");
  const out = keep || "JavaScript";
  return out.charAt(0).toUpperCase() + out.slice(1);
};

const keyPointsFromQuestion = (question: string, tags: string[]): string[] => {
  const q = question.toLowerCase();
  const t = new Set(tags);

  const add = (...xs: string[]) => xs;

  if (/\bwhat is javascript\b/.test(q)) {
    return uniq(
      add(
        "Define JavaScript (ECMAScript) as a programming language",
        "Where it runs: browsers and Node.js",
        "Common use cases: interactive web UI, servers, tooling",
        "High-level properties: dynamic typing, multi-paradigm",
        "In browsers it can interact with Web APIs/DOM",
      ),
    );
  }

  if (/statically typed|dynamically typed/.test(q)) {
    return uniq(
      add(
        "Answer directly: JavaScript is dynamically typed",
        "Types are determined at runtime",
        "Variables are not bound to a single type",
        "Mention how TypeScript adds static checking (optional)",
      ),
    );
  }

  if (/compiled|interpreted|jit/.test(q)) {
    return uniq(
      add(
        "Answer directly: JS is executed by an engine that compiles/JITs internally",
        "Explain interpreted vs compiled as a spectrum in modern engines",
        "Mention parse -> bytecode -> JIT optimization (high level)",
        "Practical implication: performance varies, warm-up/optimization",
      ),
    );
  }

  if (/difference between javascript and java/.test(q)) {
    return uniq(
      add(
        "They are different languages despite the name",
        "Typing/runtime model differs (JS dynamic/prototype vs Java static/class)",
        "Typical environments/use cases differ (web + Node vs JVM ecosystem)",
      ),
    );
  }

  const points: string[] = [];

  if (t.has("this"))
    points.push(
      ...add(
        "`this` depends on call-site (how the function is invoked)",
        "Method call vs plain function call",
        "Arrow functions capture lexical `this`",
        "`bind`/`call`/`apply` can set `this`",
      ),
    );

  if (t.has("hoisting"))
    points.push(
      ...add(
        "What gets hoisted (declarations) vs not (initializations)",
        "`let`/`const` have TDZ; `var` is function-scoped",
      ),
    );

  if (t.has("scope"))
    points.push(
      ...add("Function scope vs block scope", "`var` vs `let`/`const` behavior"),
    );

  if (t.has("closures"))
    points.push(
      ...add(
        "Closure = function + captured lexical environment",
        "Practical use cases (privacy, callbacks, factories)",
      ),
    );

  if (t.has("promises"))
    points.push(
      ...add(
        "Promise states: pending/fulfilled/rejected",
        "Chaining and error handling",
        "Relationship to async/await (if relevant)",
      ),
    );

  if (t.has("event-loop"))
    points.push(
      ...add(
        "Call stack + task queue + microtask queue",
        "Why JS is non-blocking despite single-threaded execution",
      ),
    );

  if (t.has("dom") || t.has("events"))
    points.push(
      ...add(
        "Explain in the browser runtime context",
        "Give a practical example",
      ),
    );

  if (t.has("security"))
    points.push(
      ...add(
        "Define the vulnerability and the attack vector",
        "Concrete prevention/mitigation techniques",
      ),
    );

  if (t.has("performance"))
    points.push(
      ...add(
        "Why it impacts performance",
        "Concrete ways to reduce the cost",
      ),
    );

  if (points.length > 0) return uniq(points).slice(0, 7);

  const generic = [
    "Answer the question directly, then explain",
    "Define the concept in your own words",
    "Give a small example",
    "Mention a common pitfall or best practice",
  ];

  return /^is\b/i.test(question.trim()) ? generic : generic.slice(1);
};

const promptFrom = (opts: {
  question: string;
  difficulty: Difficulty;
  keyPoints: string[];
}) => {
  const level = (() => {
    switch (opts.difficulty) {
      case "entry":
        return "entry-level";
      case "junior":
        return "junior-level";
      case "mid":
        return "mid-level";
      case "senior":
        return "senior-level";
      default: {
        const _never: never = opts.difficulty;
        throw new Error(`Unhandled difficulty: ${_never}`);
      }
    }
  })();

  return [
    `You are evaluating a ${level} candidate.`,
    `Answer the question: "${opts.question}"`,
    "",
    "Requirements:",
    ...opts.keyPoints.map((kp) => `- ${kp}`),
    "",
    "Style:",
    "- Clear, structured, concise.",
    "- Use code snippets only if they add clarity.",
    "- Avoid vague statements.",
  ].join("\n");
};

const aiHintFrom = (keyPoints: string[]) => {
  const ks = keyPoints.map((k) => k.replace(/`/g, "")).join("; ");
  return `Expect the answer to address: ${ks}. Penalize answers that miss key requirements.`;
};

const generateAnswer = async (opts: {
  client: OpenAI;
  model: string;
  question: string;
  difficulty: Difficulty;
  keyPoints: string[];
  primaryTechStack: string[];
}) => {
  const kp = opts.keyPoints.map((k) => `- ${k}`).join("\n");
  const stack = opts.primaryTechStack.length > 0 ? opts.primaryTechStack.join(", ") : "unknown";

  const prompt = [
    `Create a high-quality reference answer for an interview practice question.`,
    `Question: ${opts.question}`,
    `Difficulty: ${opts.difficulty}`,
    `Primary tech stack: ${stack}`,
    "",
    "Must include:",
    kp,
    "",
    "Constraints:",
    "- Plain text only (no Markdown headings).",
    "- Be correct, concrete, and practical.",
    "- 6-12 sentences max.",
    "- If helpful, include one small code snippet inline (no fenced blocks).",
  ].join("\n");

  const res = await opts.client.chat.completions.create({
    model: opts.model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_completion_tokens: 450,
  });

  const text = res.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("OpenAI returned empty answer");
  return text;
};

const parseArgs = (argv: string[]) => {
  const args = argv.slice(2);

  const usage =
    "Usage: pnpm prepare:questions <input.json> [--out <output.json>] [--in-place] [--auto-difficulty] [--fill-missing-answers] [--model <model>]";

  const inputArg = args.find((a) => !a.startsWith("--")) ?? null;
  if (!inputArg) throw new Error(usage);

  const inPlace = args.includes("--in-place");
  const autoDifficulty = args.includes("--auto-difficulty");
  const fillMissingAnswers = args.includes("--fill-missing-answers");

  const modelFlagIdx = args.findIndex((a) => a === "--model");
  const model = modelFlagIdx >= 0 ? args[modelFlagIdx + 1] : null;

  const outFlagIdx = args.findIndex((a) => a === "--out");
  const outArg = outFlagIdx >= 0 ? args[outFlagIdx + 1] : null;

  const inputPath = path.isAbsolute(inputArg)
    ? inputArg
    : path.resolve(process.cwd(), inputArg);

  const outPath = (() => {
    if (outArg) return path.isAbsolute(outArg) ? outArg : path.resolve(process.cwd(), outArg);
    if (inPlace) return inputPath;

    const ext = path.extname(inputPath);
    const base = ext ? inputPath.slice(0, -ext.length) : inputPath;
    return `${base}.prepared.json`;
  })();

  return {
    inputPath,
    outPath,
    autoDifficulty,
    fillMissingAnswers,
    model,
  };
};

const normalizeOpenQuestion = (
  q: JsonOpenQuestion,
  opts: {
    autoDifficulty: boolean;
    fillMissingAnswers: boolean;
    client: OpenAI | null;
    model: string;
    sourceKey: string;
    baseTags: string[];
    primaryTechStack: string[];
  },
) => {
  const question = normalizeQuestion(q.description || q.title);
  const { tags, subtopics } = classifyFromQuestion(question, { baseTags: opts.baseTags });
  const keyPoints = keyPointsFromQuestion(question, tags);

  const nextDifficulty = (() => {
    if (opts.autoDifficulty) {
      return assessDifficulty({ question, tags });
    }

    if (q.difficulty) {
      return normalizeDifficulty(q.difficulty);
    }

    return assessDifficulty({ question, tags });
  })();

  const refAnswers = q.referenceAnswers
    ? q.referenceAnswers.map((r, idx) => ({
        id: r.id || `${q.id}-ref-${idx + 1}`,
        text: sanitizeAnswerText(r.text),
        weight: r.weight ?? 1,
        keyPoints,
      }))
    : null;

  const needsAnswer = opts.fillMissingAnswers && (!refAnswers || refAnswers.length === 0);

  const base: JsonOpenQuestion = {
    ...q,
    difficulty: nextDifficulty,
    title: titleFromQuestion(question),
    description: question,
    companyType: inferCompanyType({ id: q.id, difficulty: nextDifficulty }),
    tags,
    subtopics,
    prompt: sanitizePromptText(promptFrom({ question, difficulty: nextDifficulty, keyPoints })),
    aiEvaluationHint: sanitizePromptText(aiHintFrom(keyPoints)),
    estimatedTimeMinutes: minutesByDifficulty(nextDifficulty),
    positions: q.positions?.length
      ? q.positions
      : inferPositions({
          question,
          tags,
          subtopics,
          primaryTechStack: opts.primaryTechStack,
        }),
    topic: q.topic ?? "fullstack",
    primaryTechStack: uniq([...(q.primaryTechStack ?? []), ...opts.primaryTechStack]),
    interviewTypes: q.interviewTypes ?? ["regular", "practice", "flash", "teacher"],
    seniorityLevels: seniorityLevelsFromDifficulty(nextDifficulty),
    createdBy: CREATED_BY,
    referenceAnswers: needsAnswer ? null : refAnswers,
  };

  if (!opts.fillMissingAnswers) return base;

  return {
    ...base,
    __needsAnswer: needsAnswer,
    __question: question,
    __keyPoints: keyPoints,
  } as JsonOpenQuestion & {
    __needsAnswer: boolean;
    __question: string;
    __keyPoints: string[];
  };
};

const maybeFillMissingAnswer = async (q: any, opts: {
  client: OpenAI;
  model: string;
  sourceKey: string;
}) => {
  if (!q.__needsAnswer) {
    const { __needsAnswer, __question, __keyPoints, ...rest } = q;
    return rest as JsonOpenQuestion;
  }

  const text = await generateAnswer({
    client: opts.client,
    model: opts.model,
    question: q.__question,
    difficulty: q.difficulty,
    keyPoints: q.__keyPoints,
    primaryTechStack: q.primaryTechStack ?? [],
  });

  const ref: JsonReferenceAnswer = {
    id: `${opts.sourceKey}-${q.id}-ref-1`,
    text,
    weight: 1,
    keyPoints: q.__keyPoints,
  };

  const { __needsAnswer, __question, __keyPoints, ...rest } = q;
  return {
    ...(rest as JsonOpenQuestion),
    referenceAnswers: [ref],
  };
};

const toJsonBatch = async (
  input: unknown,
  opts: {
    sourceKey: string;
    autoDifficulty: boolean;
    fillMissingAnswers: boolean;
    client: OpenAI | null;
    model: string;
    baseTags: string[];
    primaryTechStack: string[];
  },
) => {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected JSON object");
  }

  const anyInput = input as any;

  if (
    Array.isArray(anyInput.mcq_questions) &&
    Array.isArray(anyInput.open_questions) &&
    Array.isArray(anyInput.truefalse_questions) &&
    Array.isArray(anyInput.matching_questions) &&
    Array.isArray(anyInput.system_design_questions)
  ) {
    const staged = (anyInput.open_questions as JsonOpenQuestion[]).map((q) =>
      normalizeOpenQuestion(q, {
        autoDifficulty: opts.autoDifficulty,
        fillMissingAnswers: opts.fillMissingAnswers,
        client: opts.client,
        model: opts.model,
        sourceKey: opts.sourceKey,
        baseTags: opts.baseTags,
        primaryTechStack: opts.primaryTechStack,
      }),
    );

    const open = opts.fillMissingAnswers
      ? await (async () => {
          if (!opts.client) throw new Error("OPENAI_API_KEY is required for --fill-missing-answers");
          const out: JsonOpenQuestion[] = [];
          for (const q of staged) out.push(await maybeFillMissingAnswer(q, { client: opts.client, model: opts.model, sourceKey: opts.sourceKey }));
          return out;
        })()
      : (staged as unknown as JsonOpenQuestion[]);

    return {
      ...anyInput,
      open_questions: open,
    } as JsonBatch;
  }

  const legacyList: unknown = anyInput.questions ?? anyInput.open_questions;
  if (!Array.isArray(legacyList)) {
    throw new Error("Expected legacy `questions` array or JsonBatch");
  }

  const extractedAt =
    typeof anyInput.extractedAt === "string" && anyInput.extractedAt
      ? anyInput.extractedAt
      : new Date().toISOString();

  const staged = (legacyList as LegacyQuestion[]).map((q) => {
    const difficulty = toDifficultyFromLegacyLevel(q.level);
    const question = normalizeQuestion(q.title);
    const { tags, subtopics } = classifyFromQuestion(question, { baseTags: opts.baseTags });
    const keyPoints = keyPointsFromQuestion(question, tags);

    const hasAnswer = typeof q.answer === "string" && q.answer.trim().length > 0;
    const answerText = hasAnswer ? sanitizeAnswerText(q.answer!) : null;

    return normalizeOpenQuestion({
      id: `${opts.sourceKey}-${q.id}`,
      status: "published",
      reviewerId: null,
      reviewedAt: null,
      difficulty: opts.autoDifficulty ? assessDifficulty({ question, tags }) : difficulty,
      isDemoMode: false,
      companyType: inferCompanyType({
        id: `${opts.sourceKey}-${q.id}`,
        difficulty: opts.autoDifficulty ? assessDifficulty({ question, tags }) : difficulty,
      }),
      title: titleFromQuestion(question),
      description: question,
      prompt: sanitizePromptText(promptFrom({ question, difficulty, keyPoints })),
      topic: "fullstack",
      subtopics,
      tags,
      estimatedTimeMinutes: minutesByDifficulty(difficulty),
      aiEvaluationHint: sanitizePromptText(aiHintFrom(keyPoints)),
      companies: null,
      positions: inferPositions({
        question,
        tags,
        subtopics,
        primaryTechStack: opts.primaryTechStack,
      }),
      primaryTechStack: opts.primaryTechStack,
      interviewTypes: ["regular", "practice", "flash", "teacher"],
      seniorityLevels: seniorityLevelsFromDifficulty(difficulty),
      createdAt: extractedAt,
      updatedAt: extractedAt,
      createdBy: CREATED_BY,
      referenceAnswers: hasAnswer
        ? [
            {
              id: `${opts.sourceKey}-${q.id}-ref-1`,
              text: answerText!,
              weight: 1,
              keyPoints,
            },
          ]
        : null,
    }, {
      autoDifficulty: opts.autoDifficulty,
      fillMissingAnswers: opts.fillMissingAnswers,
      client: opts.client,
      model: opts.model,
      sourceKey: opts.sourceKey,
      baseTags: opts.baseTags,
      primaryTechStack: opts.primaryTechStack,
    });
  });

  const open_questions: JsonOpenQuestion[] = opts.fillMissingAnswers
    ? await (async () => {
        if (!opts.client) throw new Error("OPENAI_API_KEY is required for --fill-missing-answers");
        const out: JsonOpenQuestion[] = [];
        for (const q of staged) out.push(await maybeFillMissingAnswer(q, { client: opts.client, model: opts.model, sourceKey: opts.sourceKey }));
        return out;
      })()
    : (staged as unknown as JsonOpenQuestion[]);

  const batch: JsonBatch = {
    mcq_questions: [],
    open_questions,
    truefalse_questions: [],
    matching_questions: [],
    system_design_questions: [],
  };

  return batch;
};

async function main() {
  const { inputPath, outPath, autoDifficulty, fillMissingAnswers, model } = parseArgs(
    process.argv,
  );
  const raw = fs.readFileSync(inputPath, "utf8");
  const json = JSON.parse(raw);

  const sourceKey = path
    .basename(inputPath)
    .replace(/\.json$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  const baseTech = inferBaseTechFromSourceKey(sourceKey);

  const effectiveModel = model ?? "gpt-4.1-mini";
  const client = fillMissingAnswers
    ? (() => {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error("OPENAI_API_KEY is required for --fill-missing-answers");
        }
        return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      })()
    : null;

  const batch = await toJsonBatch(json, {
    sourceKey,
    autoDifficulty,
    fillMissingAnswers,
    client,
    model: effectiveModel,
    baseTags: baseTech.baseTags,
    primaryTechStack: baseTech.primaryTechStack,
  });

  fs.writeFileSync(outPath, JSON.stringify(batch, null, 2) + "\n");
  console.log("✅ Prepared question bank:", {
    inputPath,
    outPath,
    openQuestions: batch.open_questions.length,
  });
}

main().catch((err) => {
  console.error("❌ Prepare failed:", err);
  process.exit(1);
});
