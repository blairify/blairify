import { jsonrepair } from "jsonrepair";
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
  summary: string;
  position: PositionValue;
  seniority: SeniorityValue;
  technologies: string[];
  company?: string;
  requirements?: string;
  companyProfile: CompanyProfileValue;
}

const extractionSchema = z.object({
  summary: z.string().min(10),
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

  const userPrompt = `Job Description:\n"""${trimmed}"""\nReturn the JSON now.`;

  const client = aiClient.client ? aiClient : createAIClient();
  const response = await generateAnalysis(client, systemPrompt, userPrompt);

  if (!response.success || !response.content) {
    throw new Error(
      response.error ?? "Unable to extract information from description.",
    );
  }

  const jsonPayload = extractJsonObject(response.content);
  const parsed = extractionSchema.parse(jsonPayload);

  return {
    summary: parsed.summary.trim(),
    position: normalizePositionValue(parsed.position),
    seniority: normalizeSeniorityValue(parsed.seniority ?? undefined),
    technologies: normalizeTechnologies(parsed.technologies),
    company: parsed.company?.trim() || undefined,
    requirements: parsed.requirements?.trim() || undefined,
    companyProfile: normalizeCompanyProfileValue(parsed.companyProfile),
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
    const repaired = jsonrepair(jsonString);
    try {
      return JSON.parse(repaired);
    } catch {
      throw new Error("Failed to parse AI response JSON.");
    }
  }
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
