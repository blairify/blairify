import type {
  CompanyProfileValue,
  PositionValue,
  SeniorityValue,
} from "@/types/global";

const MAX_JOB_TEXT_LENGTH = 50_000;

interface AnalyzeJobParams {
  title?: string | null;
  body: string;
}

export interface JobAnalysisResult {
  technologies: string[];
  position?: PositionValue;
  seniority: SeniorityValue;
  company?: string;
  companyProfile: CompanyProfileValue;
}

export function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeJobText(raw: string): string {
  return String(raw)
    .replace(/\r\n/g, "\n")
    .replace(/\t+/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, MAX_JOB_TEXT_LENGTH);
}

function extractTechnologies(text: string): string[] {
  const normalized = text.toLowerCase();

  const techDictionary: Record<string, string> = {
    react: "React",
    nextjs: "Next.js",
    "next.js": "Next.js",
    vue: "Vue",
    angular: "Angular",
    svelte: "Svelte",
    typescript: "TypeScript",
    javascript: "JavaScript",
    node: "Node.js",
    "node.js": "Node.js",
    express: "Express",
    nest: "NestJS",
    "nest.js": "NestJS",
    python: "Python",
    django: "Django",
    flask: "Flask",
    java: "Java",
    spring: "Spring",
    kotlin: "Kotlin",
    go: "Go",
    golang: "Go",
    rust: "Rust",
    php: "PHP",
    laravel: "Laravel",
    ruby: "Ruby",
    rails: "Rails",
    postgres: "PostgreSQL",
    postgresql: "PostgreSQL",
    mysql: "MySQL",
    mongodb: "MongoDB",
    redis: "Redis",
    graphql: "GraphQL",
    rest: "REST",
    docker: "Docker",
    kubernetes: "Kubernetes",
    k8s: "Kubernetes",
    aws: "AWS",
    gcp: "GCP",
    azure: "Azure",
    terraform: "Terraform",
    "ci/cd": "CI/CD",
    cicd: "CI/CD",
    jest: "Jest",
    playwright: "Playwright",
    cypress: "Cypress",
    tailwind: "Tailwind",
    tailwindcss: "Tailwind",
  };

  const found = new Set<string>();

  for (const [needle, label] of Object.entries(techDictionary)) {
    if (normalized.includes(needle)) {
      found.add(label);
    }
  }

  return [...found].sort((a, b) => a.localeCompare(b));
}

function inferPositionFromText(text: string): PositionValue | undefined {
  const t = text.toLowerCase();

  if (/(product manager|pm\b)/.test(t)) return "product";
  if (/(cybersecurity|security engineer|appsec|infosec)/.test(t))
    return "cybersecurity";
  if (/(data scientist|ml engineer|machine learning)/.test(t))
    return "data-scientist";
  if (/(data engineer|analytics engineer)/.test(t)) return "data-engineer";
  if (/(ios|android|mobile developer|react native|flutter)/.test(t))
    return "mobile";
  if (/(devops|site reliability|sre\b|platform engineer)/.test(t))
    return "devops";

  const hasFrontend = /(frontend|front-end|ui engineer)/.test(t);
  const hasBackend = /(backend|back-end|api engineer)/.test(t);
  const hasFullstack = /(full\s*-?stack)/.test(t);

  if (hasFrontend && !hasBackend) return "frontend";
  if (hasBackend && !hasFrontend) return "backend";
  if (hasFullstack) return "fullstack";

  if (hasFrontend) return "frontend";
  if (hasBackend) return "backend";

  return undefined;
}

function inferSeniorityFromText(text: string): SeniorityValue | undefined {
  const t = text.toLowerCase();

  if (/(senior|sr\b)/.test(t)) return "senior";
  if (/(junior|jr\b)/.test(t)) return "junior";
  if (/(graduate|entry)/.test(t)) return "entry";
  if (/(mid|intermediate)/.test(t)) return "mid";

  const yearsMatch = t.match(
    /(\d{1,2})\s*\+?\s*(?:years|yrs)\s*(?:of)?\s*(?:experience|exp)/,
  );
  if (yearsMatch) {
    const years = Number.parseInt(yearsMatch[1] ?? "", 10);
    if (Number.isFinite(years)) {
      if (years <= 0) return "entry";
      if (years <= 2) return "junior";
      if (years <= 5) return "mid";
      return "senior";
    }
  }

  const rangeMatch = t.match(
    /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(?:years|yrs)\s*(?:of)?\s*(?:experience|exp)/,
  );
  if (rangeMatch) {
    const from = Number.parseInt(rangeMatch[1] ?? "", 10);
    const to = Number.parseInt(rangeMatch[2] ?? "", 10);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      const avg = (from + to) / 2;
      if (avg <= 1) return "entry";
      if (avg <= 2) return "junior";
      if (avg <= 5) return "mid";
      return "senior";
    }
  }

  return undefined;
}

function inferSeniority(
  title: string | undefined,
  bodyText: string,
): SeniorityValue {
  const fromTitle = title ? inferSeniorityFromText(title) : undefined;
  if (fromTitle) return fromTitle;

  const fromBody = inferSeniorityFromText(bodyText);
  if (fromBody) return fromBody;

  return "mid";
}

function inferCompanyProfile(text: string): CompanyProfileValue {
  const t = text.toLowerCase();

  const isFaangLike =
    /(leetcode|data structures|algorithms|ds\s*&\s*a|system design)/.test(t) ||
    /(distributed systems|scalability|scale to millions)/.test(t) ||
    /(faang|big tech)/.test(t);
  if (isFaangLike) return "faang";

  const isStartupLike =
    /(startup|0\s*[-–]?\s*1|seed|series\s*[a-d]|greenfield|wear many hats)/.test(
      t,
    );
  if (isStartupLike) return "startup";

  return "generic";
}

function inferCompanyFromTitle(title?: string | null): string | undefined {
  if (!title) return undefined;

  const cleaned = title.replace(/\s+/g, " ").trim();

  const patterns = [
    /\s+-\s+([^-|]+?)\s+\|/,
    /\s+\|\s+([^-|]+?)\s*$/,
    /\s+at\s+([^|-]+?)\s*$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    const company = match?.[1]?.trim();
    if (company && company.length <= 60) return company;
  }

  return undefined;
}

export function analyzeJobText({
  title,
  body,
}: AnalyzeJobParams): JobAnalysisResult {
  const combined = `${title ?? ""} ${body}`
    .trim()
    .slice(0, MAX_JOB_TEXT_LENGTH);

  const technologies = extractTechnologies(combined);
  const position =
    (title ? inferPositionFromText(title) : undefined) ??
    inferPositionFromText(combined);
  const seniority = inferSeniority(title ?? undefined, combined);
  const company = inferCompanyFromTitle(title);
  const companyProfile = inferCompanyProfile(combined);

  return {
    technologies,
    position,
    seniority,
    company,
    companyProfile,
  };
}

export { MAX_JOB_TEXT_LENGTH };
