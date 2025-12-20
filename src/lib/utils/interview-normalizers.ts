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
