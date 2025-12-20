import "dotenv/config";
import fs from "fs";
import path from "path";
import { spawnSync } from "node:child_process";

const parseArgs = (argv: string[]) => {
  const args = argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const continueOnError = args.includes("--continue-on-error");

  const fromIndex = args.findIndex((a) => a === "--from");
  const from = fromIndex >= 0 ? (args[fromIndex + 1] ?? null) : null;

  return { dryRun, continueOnError, from };
};

const listPreparedBanks = (dir: string) => {
  const entries = fs.readdirSync(dir);
  return entries
    .filter((name) => name.endsWith(".prepared.json"))
    .filter((name) => !name.endsWith(".prepared.prepared.json"))
    .map((name) => path.join(dir, name))
    .sort((a, b) => a.localeCompare(b));
};

const runImport = (filePath: string, opts: { dryRun: boolean }) => {
  const args = ["import:questions", filePath];
  if (opts.dryRun) args.push("--dry-run");

  const res = spawnSync("pnpm", args, {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });

  if (res.status !== 0) {
    throw new Error(`Import failed for ${filePath} (exit ${res.status ?? "unknown"})`);
  }
};

async function main() {
  const { dryRun, continueOnError, from } = parseArgs(process.argv);

  if (!dryRun && !process.env.PRACTICE_LIBRARY_DATABASE_URL) {
    throw new Error("PRACTICE_LIBRARY_DATABASE_URL is not set");
  }

  const banksDir = path.resolve(process.cwd(), "scripts/questions");
  const allFiles = listPreparedBanks(banksDir);
  const files = (() => {
    if (!from) return allFiles;
    const startIndex = allFiles.findIndex((f) => f.includes(from));
    if (startIndex < 0) {
      throw new Error(`--from did not match any file. Value: ${from}`);
    }
    return allFiles.slice(startIndex);
  })();

  if (files.length === 0) {
    console.log("No *.prepared.json files found in scripts/questions");
    return;
  }

  console.log("Importing prepared question banks:", {
    count: files.length,
    dryRun,
    continueOnError,
    from,
  });

  const failures: Array<{ file: string; error: string }> = [];

  for (const f of files) {
    console.log(`\n--- ${path.relative(process.cwd(), f)} ---`);
    try {
      runImport(f, { dryRun });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      failures.push({ file: f, error: message });
      if (!continueOnError) throw e;
    }
  }

  if (failures.length > 0) {
    const details = failures
      .map((f) => `- ${path.relative(process.cwd(), f.file)}: ${f.error}`)
      .join("\n");
    throw new Error(`Bulk import finished with ${failures.length} failure(s):\n${details}`);
  }

  console.log("\n✅ Done importing all prepared question banks");
}

main().catch((e) => {
  console.error("❌ Bulk import failed:", e);
  process.exit(1);
});
