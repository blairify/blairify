import fs from "fs";
import path from "path";

type Difficulty = "entry" | "junior" | "mid" | "senior";

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

const seniorityLevelsFromDifficulty = (difficulty: Difficulty): Difficulty[] => {
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

const inferDifficultyFromPrompt = (prompt: string): Difficulty | null => {
  const p = prompt.toLowerCase();

  const m = p.match(/evaluating a\s+(entry|junior|mid|senior)[-\s]?level\s+candidate/);
  if (m?.[1]) return normalizeDifficulty(m[1]);

  const m2 = p.match(/you are evaluating a\s+(entry|junior|mid|senior)[-\s]?level\s+candidate/);
  if (m2?.[1]) return normalizeDifficulty(m2[1]);

  return null;
};

const assessDifficultyFromContent = (q: any): Difficulty => {
  const parts: string[] = [];
  if (typeof q?.title === "string") parts.push(q.title);
  if (typeof q?.description === "string") parts.push(q.description);
  const text = parts.join("\n").toLowerCase();

  const tags: string[] = [];
  if (Array.isArray(q?.tags)) tags.push(...q.tags.filter((x: unknown) => typeof x === "string"));
  if (Array.isArray(q?.subtopics)) tags.push(...q.subtopics.filter((x: unknown) => typeof x === "string"));
  if (Array.isArray(q?.primaryTechStack)) tags.push(...q.primaryTechStack.filter((x: unknown) => typeof x === "string"));
  const tagText = tags.join(" ").toLowerCase();

  let score = 0;

  if (/\b(what is|define|basic|basics|syntax|hello world)\b/.test(text)) score -= 2;
  if (/\b(difference between|compare)\b/.test(text)) score -= 1;
  if (/\b(array|string|number|boolean|null|undefined|variable|loop|if statement)\b/.test(text)) score -= 1;

  if (/\b(closure|closures|promise|promises|async\b|await\b|event loop|hoisting|prototype|generics?)\b/.test(text)) score += 2;
  if (/\b(big\s*o|time complexity|space complexity|race condition|deadlock|thread|locking|mutex|semaphore)\b/.test(text))
    score += 3;

  if (
    /\b(system design|distributed|cap theorem|consensus|raft|paxos|sharding|replication|eventual consistency|idempotency)\b/.test(
      text,
    )
  )
    score += 5;
  if (/\b(kubernetes|k8s|terraform|service mesh|istio|observability|slo|sla)\b/.test(text)) score += 5;
  if (/\b(oauth|openid|oidc|jwt|tls|mTLS|encryption|xss|csrf|ssrf)\b/.test(text)) score += 4;
  if (/\b(performance|profiling|throughput|latency|scalability|load balancing|backpressure)\b/.test(text))
    score += 4;

  if (/\b(aws|gcp|azure|docker|redis|kafka|postgres|mysql|mongodb|firestore)\b/.test(tagText)) score += 1;

  if (text.length > 140) score += 1;
  if (text.length > 240) score += 1;

  if (score <= -2) return "entry";
  if (score <= 2) return "junior";
  if (score <= 6) return "mid";
  return "senior";
};

const inferDifficultyFromSeniorityLevels = (levels: unknown): Difficulty | null => {
  if (!Array.isArray(levels)) return null;

  const set = new Set(levels.filter((x) => typeof x === "string"));

  if (set.size === 0) return null;

  if (set.has("senior")) return "senior";
  if (set.has("mid")) return "mid";
  if (set.has("junior")) return "junior";
  if (set.has("entry")) return "entry";

  return null;
};

const inferDifficulty = (q: any, opts: { force: boolean }): Difficulty => {
  if (opts.force) return assessDifficultyFromContent(q);

  if (typeof q?.difficulty === "string" && q.difficulty) return normalizeDifficulty(q.difficulty);

  if (typeof q?.prompt === "string" && q.prompt) {
    const fromPrompt = inferDifficultyFromPrompt(q.prompt);
    if (fromPrompt) return fromPrompt;
  }

  const fromSeniorityLevels = inferDifficultyFromSeniorityLevels(q?.seniorityLevels);
  if (fromSeniorityLevels) return fromSeniorityLevels;

  const id = typeof q?.id === "string" ? q.id : "<unknown-id>";
  throw new Error(`Unable to infer difficulty for question ${id}`);
};

const isQuestionArrayKey = (key: string) =>
  key === "mcq_questions" ||
  key === "open_questions" ||
  key === "truefalse_questions" ||
  key === "matching_questions" ||
  key === "system_design_questions";

const normalizeBatch = (batch: any, opts: { force: boolean }) => {
  if (typeof batch !== "object" || batch === null) throw new Error("Expected JSON object");

  const out: any = { ...batch };

  for (const [key, value] of Object.entries(batch)) {
    if (!isQuestionArrayKey(key)) continue;
    if (!Array.isArray(value)) continue;

    out[key] = value.map((q) => {
      if (typeof q !== "object" || q === null) return q;

      const difficulty = inferDifficulty(q, { force: opts.force });

      return {
        ...q,
        difficulty,
        seniorityLevels: seniorityLevelsFromDifficulty(difficulty),
      };
    });
  }

  return out;
};

const parseArgs = (argv: string[]) => {
  const args = argv.slice(2);

  const inPlace = args.includes("--in-place");
  const onlyPrepared = args.includes("--include-prepared");
  const includeSources = args.includes("--include-sources");
  const force = args.includes("--force");

  return { inPlace, onlyPrepared, includeSources, force };
};

const isJsonFile = (p: string) => p.endsWith(".json");
const isPreparedFile = (p: string) => p.endsWith(".prepared.json");

async function main() {
  const { inPlace, onlyPrepared, includeSources, force } = parseArgs(process.argv);

  const root = path.resolve(process.cwd(), "scripts/questions");
  const entries = fs.readdirSync(root);

  const files = entries
    .filter((name) => isJsonFile(name))
    .filter((name) => {
      if (onlyPrepared) return isPreparedFile(name);
      if (includeSources) return true;
      return !isPreparedFile(name);
    })
    .map((name) => path.join(root, name));

  const failures: Array<{ file: string; error: string }> = [];

  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const json = JSON.parse(raw) as unknown;
      const next = normalizeBatch(json, { force });

      const outPath = (() => {
        if (inPlace) return filePath;
        if (isPreparedFile(filePath)) return filePath;

        const ext = path.extname(filePath);
        const base = ext ? filePath.slice(0, -ext.length) : filePath;
        return `${base}.prepared.json`;
      })();

      fs.writeFileSync(outPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    } catch (e) {
      failures.push({
        file: filePath,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (failures.length > 0) {
    const details = failures.map((f) => `- ${f.file}: ${f.error}`).join("\n");
    throw new Error(`Seniority assessment failed for ${failures.length} file(s):\n${details}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
