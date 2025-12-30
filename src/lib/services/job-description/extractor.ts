import { z } from "zod";
import {
  aiClient,
  createAIClient,
  generateAnalysis,
} from "@/lib/services/ai/ai-client";
import {
  normalizeCompanyProfileValue,
  normalizePositionValue,
  normalizeSeniorityValue,
} from "@/lib/utils/interview-normalizers";
import type {
  CompanyProfileValue,
  PositionValue,
  SeniorityValue,
} from "@/types/global";

export interface ExtractedJobDescription {
  jobDescription: string;
  position: PositionValue;
  seniority: SeniorityValue;
  technologies: string[];
  company?: string;
  jobRequirements?: string;
  companyProfile: CompanyProfileValue;
}

const extractionSchema = z.object({
  summary: z.string().default(""),
  position: z.string(),
  seniority: z.string().optional().nullable(),
  technologies: z.array(z.string()).optional(),
  company: z.string().optional(),
  requirements: z.string().optional(),
  companyProfile: z.string().optional(),
});

const KNOWN_TECH_VALUES = [
  "react",
  "reactnative",
  "typescript",
  "javascript",
  "html5",
  "css",
  "java",
  "python",
  "go",
  "csharp",
  "rust",
  "php",
  "docker",
  "kubernetes",
  "terraform",
  "aws",
  "azure",
  "gcp",
  "swift",
  "kotlin",
  "sql",
  "security",
] as const;

const TECH_ALIAS: Record<string, (typeof KNOWN_TECH_VALUES)[number]> = {
  html: "html5",
  html5: "html5",
  css3: "css",
  "c#": "csharp",
  "c-sharp": "csharp",
  "c sharp": "csharp",
  "amazon web services": "aws",
  "google cloud": "gcp",
  "google cloud platform": "gcp",
  "microsoft azure": "azure",
  "react native": "reactnative",
};

export async function extractJobDescriptionData(
  description: string,
): Promise<ExtractedJobDescription> {
  const trimmed = description.trim();
  if (!trimmed) {
    throw new Error("Description cannot be empty.");
  }

  const client = aiClient.client ? aiClient : createAIClient();

  try {
    const aiResult = await extractUsingAI(trimmed, client);
    if (aiResult) {
      return translateFieldsIfNeeded(aiResult, client);
    }
  } catch (error) {
    console.warn("AI extraction failed, using heuristic fallback:", error);
  }

  const fallbackResult = buildFallbackExtraction(trimmed);
  return translateFieldsIfNeeded(fallbackResult, client);
}

async function extractUsingAI(
  description: string,
  client: typeof aiClient,
): Promise<ExtractedJobDescription | null> {
  const systemPrompt = `
You are an expert technical recruiter. Extract structured data from a job description.
Return ONLY JSON that matches this schema:
{
  "summary": "Concise summary of the job (max 120 words).",
  "position": "One of: frontend, backend, fullstack, devops, mobile, data-engineer, data-scientist, cybersecurity, product",
  "seniority": "One of: entry, junior, mid, senior",
  "technologies": ["lowercase technology keywords, max 8"],
  "company": "Company name if available",
  "requirements": "Key requirements bullet summary (max 120 words)",
  "companyProfile": "generic | faang | startup"
}
If a field is unknown, return an empty string. Respond with valid JSON only, no markdown.
`.trim();

  const userPrompt = `Job Description:
"""${description}"""
Return the JSON now.`;

  const response = await generateAnalysis(client, systemPrompt, userPrompt);

  if (!response.success || !response.content) {
    return null;
  }

  try {
    const jsonPayload = extractJsonObject(response.content);
    const parsed = extractionSchema.parse(jsonPayload);

    return {
      jobDescription: parsed.summary.trim(),
      position: normalizePositionValue(parsed.position),
      seniority: normalizeSeniorityValue(parsed.seniority ?? undefined),
      technologies: normalizeTechnologies(parsed.technologies),
      company: parsed.company?.trim() || undefined,
      jobRequirements: parsed.requirements?.trim() || undefined,
      companyProfile: normalizeCompanyProfileValue(parsed.companyProfile),
    };
  } catch (error) {
    console.warn("AI response parsing failed:", error);
    return null;
  }
}

function buildFallbackExtraction(description: string): ExtractedJobDescription {
  const lower = description.toLowerCase();

  const jobDescription = description.split(/\n{2,}/)[0]?.trim() ?? description;

  const technologies = KNOWN_TECH_VALUES.filter((tech) => lower.includes(tech));

  const seniority = detectSeniority(lower);

  const jobRequirements = extractRequirements(description);

  const company = extractCompanyName(description);

  return {
    jobDescription: jobDescription.slice(0, 600),
    position: normalizePositionValue(description),
    seniority,
    technologies,
    company,
    jobRequirements,
    companyProfile: "generic",
  };
}

function extractJsonObject(payload: string) {
  const cleaned = payload
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain valid JSON.");
  }

  const jsonString = cleaned.slice(start, end + 1);

  try {
    return JSON.parse(jsonString);
  } catch {
    const repaired = repairJsonString(jsonString);
    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error("Failed to parse AI response JSON.");
    }
  }
}

function repairJsonString(value: string): string {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00A0/g, " ")
    .replace(/,\s*(?=[\]}])/g, "")
    .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_m, inner) => {
      const escaped = String(inner)
        .replace(/\\"/g, '"')
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
}

function normalizeTechnologies(values?: string[] | null): string[] {
  if (!values?.length) return [];

  const normalized = values
    .map((value) => value.trim().toLowerCase())
    .map((value) => TECH_ALIAS[value] ?? value.replace(/\s+/g, ""))
    .filter(Boolean) as string[];

  const unique: string[] = [];

  for (const tech of normalized) {
    if (
      KNOWN_TECH_VALUES.includes(tech as (typeof KNOWN_TECH_VALUES)[number]) &&
      !unique.includes(tech)
    ) {
      unique.push(tech);
    }
  }

  return unique.slice(0, 8);
}

async function translateFieldsIfNeeded(
  result: ExtractedJobDescription,
  client: typeof aiClient,
): Promise<ExtractedJobDescription> {
  const jobDescription = await translateTextIfNeeded(
    result.jobDescription,
    client,
  );
  const jobRequirements = await translateTextIfNeeded(
    result.jobRequirements,
    client,
  );

  return {
    ...result,
    jobDescription: jobDescription ?? result.jobDescription,
    jobRequirements: jobRequirements ?? result.jobRequirements,
  };
}

async function translateTextIfNeeded(
  text: string | undefined,
  client: typeof aiClient,
): Promise<string | undefined> {
  if (!text) return text;
  if (isLikelyEnglish(text)) return text;
  if (!client.client || !client.config.apiKey) return text;

  const translationPrompt = `Translate the following job description snippet into clear English while preserving meaning. Return only the translated text without extra commentary.
"""
${text}
"""`;

  const response = await generateAnalysis(
    client,
    "You are a professional technical translator. Always respond with English text only.",
    translationPrompt,
  );

  if (response.success && response.content) {
    return response.content.trim();
  }

  return text;
}

function countNonAsciiCharacters(value: string): number {
  let count = 0;
  for (const char of value) {
    if (char.charCodeAt(0) > 0x7f) {
      count += 1;
    }
  }
  return count;
}

function isLikelyEnglish(text: string): boolean {
  const letters = text.match(/[a-zA-Z]/g)?.length ?? 0;
  const nonAscii = countNonAsciiCharacters(text);
  if (letters === 0) return false;
  const ratio = letters / (letters + nonAscii);
  return ratio >= 0.75;
}

function detectSeniority(text: string): SeniorityValue {
  if (text.includes("intern") || text.includes("entry")) return "entry";
  if (text.includes("junior")) return "junior";
  if (text.includes("senior") || text.includes("sr.") || text.includes("lead"))
    return "senior";
  return "mid";
}

function extractRequirements(description: string): string | undefined {
  const requirementSections = description
    .split(/\n+/)
    .filter(
      (line) =>
        line.trim().match(/^[-•+]/) ||
        /requirements|responsibilities|skills/i.test(line),
    );

  if (requirementSections.length > 0) {
    return requirementSections.join("\n").slice(0, 600).trim() || undefined;
  }

  const paragraphs = description.split(/\n{2,}/).map((chunk) => chunk.trim());
  return paragraphs[1]?.slice(0, 600) || undefined;
}

function extractCompanyName(description: string): string | undefined {
  const patterns = [
    /\b(?:at|for)\s+([A-Z][A-Za-z0-9&.\- ]{2,}?)(?=[,.;]| with| within| who| which| that| has| is| and|$)/,
    /company:\s*([A-Z][A-Za-z0-9&.\- ]{2,})/i,
    /employer:\s*([A-Z][A-Za-z0-9&.\- ]{2,})/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      const cleaned = match[1].replace(/[^A-Za-z0-9&.\- ]/g, "").trim();
      if (cleaned.length > 0 && cleaned.length <= 100) {
        return cleaned;
      }
    }
  }

  return undefined;
}
