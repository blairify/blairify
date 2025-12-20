import fs from "fs";
import path from "path";

type Question = {
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
  return values.filter((v) => typeof v === "string");
};

const ensureContains = (values: string[] | undefined, nextValue: string) => {
  const normalized = normalizeArray(values).map((v) => v.trim()).filter(Boolean);
  const set = new Set(normalized);
  set.add(nextValue);
  return Array.from(set);
};

const normalizeQuestion = (q: Question, canonicalTag: CanonicalTag) => {
  q.tags = ensureContains(q.tags, canonicalTag);
  q.primaryTechStack = ensureContains(q.primaryTechStack, canonicalTag);
};

const parseArgs = (argv: string[]) => {
  const args = argv.slice(2);
  const dryRun = args.includes("--dry-run");
  return { dryRun };
};

async function main() {
  const { dryRun } = parseArgs(process.argv);

  const banksDir = path.resolve(process.cwd(), "scripts/questions");
  const files = listPreparedBanks(banksDir);

  const edits: Array<{ file: string; updated: boolean; canonicalTech: string }> = [];

  for (const filePath of files) {
    const canonicalTag = canonicalTagFromFilename(filePath);
    if (!canonicalTag) continue;

    const raw = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(raw) as PreparedBank;

    const before = raw;

    for (const q of data.mcq_questions ?? []) normalizeQuestion(q, canonicalTag);
    for (const q of data.open_questions ?? []) normalizeQuestion(q, canonicalTag);
    for (const q of data.truefalse_questions ?? []) normalizeQuestion(q, canonicalTag);
    for (const q of data.matching_questions ?? []) normalizeQuestion(q, canonicalTag);
    for (const q of data.system_design_questions ?? [])
      normalizeQuestion(q, canonicalTag);

    const after = `${JSON.stringify(data, null, 2)}\n`;
    const updated = after !== before;

    edits.push({
      file: path.relative(process.cwd(), filePath),
      updated,
      canonicalTech: canonicalTag,
    });

    if (!dryRun && updated) {
      fs.writeFileSync(filePath, after, "utf8");
    }
  }

  const changed = edits.filter((e) => e.updated);

  console.log("✅ Normalize prepared banks:", {
    dryRun,
    scanned: edits.length,
    changed: changed.length,
  });

  if (changed.length > 0) {
    console.log(
      changed
        .slice(0, 50)
        .map((c) => `- ${c.file} (+${c.canonicalTech})`)
        .join("\n"),
    );
  }
}

main().catch((e) => {
  console.error("❌ Normalize failed:", e);
  process.exit(1);
});
