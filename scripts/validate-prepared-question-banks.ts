import fs from "fs";
import path from "path";

type Question = {
  id?: string;
  tags?: string[];
  primaryTechStack?: string[];
};

type PreparedBank = {
  mcq_questions: Question[];
  open_questions: Question[];
  truefalse_questions: Question[];
  matching_questions: Question[];
  system_design_questions: Question[];
};

type CanonicalTag = string;

const canonicalTagFromFilename = (filePath: string): CanonicalTag | null => {
  const filename = path.basename(filePath);
  if (!filename.endsWith(".prepared.json")) return null;

  const baseRaw = filename
    .replace(/\.prepared\.json$/i, "")
    .replace(/-questions-bank$/i, "")
    .toLowerCase();

  const base = baseRaw.replace(/_/g, "-");

  switch (base) {
    default:
      break;
  }

  const aliases: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    golang: "go",
    "c#": "csharp",
    "c++": "cpp",
    "dev-ops": "devops",
    "dev-ops-questions-bank": "devops",
  };

  return aliases[base] ?? base;
};

const listPreparedBanks = (dir: string) => {
  const entries = fs.readdirSync(dir);
  return entries
    .filter((name) => name.endsWith(".prepared.json"))
    .filter((name) => !name.endsWith(".prepared.prepared.json"))
    .map((name) => path.join(dir, name))
    .sort((a, b) => a.localeCompare(b));
};

const normalizeArray = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return values.filter((v) => typeof v === "string").map((v) => v.trim());
};

const hasValue = (values: string[] | undefined, expected: string) => {
  const normalized = normalizeArray(values).map((v) => v.toLowerCase());
  return normalized.includes(expected.toLowerCase());
};

async function main() {
  const banksDir = path.resolve(process.cwd(), "scripts/questions");
  const files = listPreparedBanks(banksDir);

  const errors: string[] = [];

  for (const filePath of files) {
    const canonicalTech = canonicalTagFromFilename(filePath);
    if (!canonicalTech) continue;

    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as PreparedBank;

    const questions: Question[] = [
      ...(data.mcq_questions ?? []),
      ...(data.open_questions ?? []),
      ...(data.truefalse_questions ?? []),
      ...(data.matching_questions ?? []),
      ...(data.system_design_questions ?? []),
    ];

    for (const q of questions) {
      const hasTag = hasValue(q.tags, canonicalTech);
      const hasTech = hasValue(q.primaryTechStack, canonicalTech);

      if (hasTag && hasTech) continue;

      errors.push(
        `${path.relative(process.cwd(), filePath)}: ${q.id ?? "<no-id>"} missing ${
          !hasTag && !hasTech
            ? `tag+primaryTechStack(${canonicalTech})`
            : !hasTag
              ? `tag(${canonicalTech})`
              : `primaryTechStack(${canonicalTech})`
        }`,
      );
    }
  }

  if (errors.length > 0) {
    const details = errors.slice(0, 200).join("\n");
    throw new Error(
      `Prepared bank validation failed (showing ${Math.min(200, errors.length)}/${errors.length}):\n${details}`,
    );
  }

  console.log("✅ Prepared bank validation OK");
}

main().catch((e) => {
  console.error("❌ Validation failed:", e);
  process.exit(1);
});
