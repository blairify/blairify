import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import dotenv from "dotenv";

type TrustedSitemapsConfig = {
  sources: Array<{
    host: string;
    baseTags: string[];
    sitemapUrls: string[];
  }>;
};

type CliOptions = {
  configPath: string;
  concurrency: number;
  dryRun: boolean;
  maxUrls?: number;
  maxPerSource?: number;
  onlyHost?: string;
  outFile?: string;
  outFormat?: "json" | "ndjson";
};

function parseArgs(argv: string[]): CliOptions {
  const out: CliOptions = {
    configPath: "scripts/resources/trusted-sitemaps.json",
    concurrency: 8,
    dryRun: false,
  };

  for (const raw of argv) {
    if (!raw.startsWith("--")) continue;
    const [k, v] = raw.slice(2).split("=");
    if (!k) continue;

    switch (k) {
      case "config": {
        if (v) out.configPath = v;
        continue;
      }
      case "concurrency": {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) out.concurrency = Math.floor(n);
        continue;
      }
      case "max-urls": {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) out.maxUrls = Math.floor(n);
        continue;
      }
      case "max-per-source": {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) out.maxPerSource = Math.floor(n);
        continue;
      }
      case "only-host": {
        if (v) out.onlyHost = v.trim();
        continue;
      }
      case "out": {
        if (v) out.outFile = v.trim();
        continue;
      }
      case "out-format": {
        if (v === "json" || v === "ndjson") out.outFormat = v;
        continue;
      }
      case "dry-run": {
        out.dryRun = true;
        continue;
      }
      default:
        continue;
    }
  }

  return out;
}

function decodeXml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function extractLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>\s*([^<]+)\s*<\/loc>/gi;
  for (; ;) {
    const match = re.exec(xml);
    if (!match) break;
    const value = decodeXml(match[1] ?? "").trim();
    if (value) out.push(value);
  }
  return out;
}

function normalizeTag(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeTags(tags: string[]): string[] {
  const tlds = new Set([
    "com",
    "org",
    "net",
    "io",
    "dev",
    "app",
    "ai",
    "co",
    "gov",
    "edu",
    "docs",
  ]);

  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of tags) {
    const t = normalizeTag(raw);
    if (t.length === 0) continue;
    if (t.length > 32) continue;
    if (t.includes("--")) continue;
    if (/^\d+$/.test(t)) continue;
    if (tlds.has(t)) continue;
    const dashCount = (t.match(/-/g) ?? []).length;
    if (dashCount >= 4) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }

  return out;
}

function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/https?:\/\//g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  if (!normalized) return [];

  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "from",
    "by",
    "at",
    "as",
    "is",
    "are",
    "be",
    "this",
    "that",
    "it",
    "your",
    "you",
    "guide",
    "docs",
    "documentation",
    "reference",
    "overview",
    "introduction",
    "getting",
    "started",
  ]);

  const tokens = normalized
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => !stop.has(t))
    .filter((t) => t.length >= 3);

  return tokens;
}

function guessType(url: string): "docs" | "video" {
  const host = (() => {
    try {
      return new URL(url).host.toLowerCase();
    } catch {
      return "";
    }
  })();

  if (host.includes("youtube.com") || host.includes("youtu.be")) return "video";
  return "docs";
}

function computeId(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": "blairify-resource-ingester/1.0",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`fetch failed ${res.status} ${res.statusText}`);
  }

  return await res.text();
}

function extractTitle(html: string): string {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (!match) return "";
  return match[1]
    .replace(/\s+/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .trim();
}

function extractSitemapsFromRobots(robots: string): string[] {
  const out: string[] = [];
  for (const rawLine of robots.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = /^sitemap:\s*(.+)\s*$/i.exec(line);
    if (!match) continue;
    const url = match[1]?.trim();
    if (url) out.push(url);
  }
  return out;
}

async function discoverSitemapsFromRobots(host: string): Promise<string[]> {
  try {
    const robots = await fetchText(`https://${host}/robots.txt`);
    return extractSitemapsFromRobots(robots).filter((u) => isHttpUrl(u));
  } catch {
    return [];
  }
}

function uniqStrings(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const key = v.trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];

  const results: R[] = new Array(items.length);
  let idx = 0;

  const workers = Array.from({ length: Math.min(concurrency, items.length) }).map(
    async () => {
      for (; ;) {
        const next = idx;
        idx += 1;
        if (next >= items.length) return;
        results[next] = await fn(items[next]);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

async function expandSitemaps(
  sitemapUrl: string,
  visited: Set<string>,
): Promise<string[]> {
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  let xml: string;
  try {
    xml = await fetchText(sitemapUrl);
  } catch (error) {
    console.warn("[resources] sitemap fetch failed", {
      sitemapUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
  const locs = extractLocs(xml);

  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  if (!isIndex) return locs;

  const nested = await mapWithConcurrency(
    locs,
    6,
    async (child) => await expandSitemaps(child, visited),
  );

  return nested.flat();
}

async function expandSitemapsLimited(params: {
  sitemapUrl: string;
  visited: Set<string>;
  maxUrls: number;
  expectedHost: string;
}): Promise<string[]> {
  const { sitemapUrl, visited, maxUrls, expectedHost } = params;
  if (maxUrls <= 0) return [];
  if (visited.has(sitemapUrl)) return [];
  visited.add(sitemapUrl);

  let xml: string;
  try {
    xml = await fetchText(sitemapUrl);
  } catch (error) {
    console.warn("[resources] sitemap fetch failed", {
      sitemapUrl,
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }

  const isTxt = sitemapUrl.toLowerCase().endsWith(".txt");
  let locs: string[];

  if (isTxt) {
    locs = xml
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && isHttpUrl(line));
  } else {
    locs = extractLocs(xml);
  }

  const isIndex = !isTxt && /<sitemapindex[\s>]/i.test(xml);

  if (!isIndex) {
    const filtered = locs
      .filter((u) => isHttpUrl(u))
      .filter((u) => hostMatches(u, expectedHost));
    return filtered.slice(0, maxUrls);
  }

  const out: string[] = [];
  for (const child of locs) {
    if (out.length >= maxUrls) break;
    const remaining = maxUrls - out.length;
    const next = await expandSitemapsLimited({
      sitemapUrl: child,
      visited,
      maxUrls: remaining,
      expectedHost,
    });
    for (const u of next) {
      out.push(u);
      if (out.length >= maxUrls) break;
    }
  }

  return out;
}

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function hostMatches(url: string, expectedHost: string): boolean {
  try {
    const host = new URL(url).host.toLowerCase();
    const expected = expectedHost.toLowerCase();
    return host === expected || host.endsWith(`.${expected}`);
  } catch {
    return false;
  }
}

function isEnglishUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    const langParams = [
      parsed.searchParams.get("hl"),
      parsed.searchParams.get("lang"),
      parsed.searchParams.get("locale"),
    ]
      .map((v) => (v ?? "").trim().toLowerCase())
      .filter(Boolean);

    for (const v of langParams) {
      if (v.startsWith("en")) continue;
      return false;
    }

    const segments = parsed.pathname
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);

    if (segments.length === 0) return true;

    const first = segments[0]?.toLowerCase() ?? "";
    const localeLike = /^[a-z]{2}(-[a-z]{2})?$/i.test(first);
    if (localeLike) {
      return first.startsWith("en");
    }

    if (first === "intl") {
      const second = segments[1]?.toLowerCase() ?? "";
      const localeLike2 = /^[a-z]{2}(-[a-z]{2})?$/i.test(second);
      if (localeLike2) return second.startsWith("en");
    }

    return true;
  } catch {
    return true;
  }
}

async function main(): Promise<void> {
  dotenv.config({ path: ".env.local", override: false });
  dotenv.config({ path: ".env", override: false });

  const opts = parseArgs(process.argv.slice(2));
  const configRaw = await readFile(opts.configPath, "utf-8");
  const config = JSON.parse(configRaw) as TrustedSitemapsConfig;

  const shouldWriteToDb = !opts.dryRun && !opts.outFile;
  const db = shouldWriteToDb
    ? await Promise.all([
      import("../../src/practice-library-db/client"),
      import("../../src/practice-library-db/schema"),
    ])
    : null;
  const practiceDb = db?.[0].practiceDb;
  const resources = db?.[1].resources;

  const onlyHost = opts.onlyHost?.toLowerCase();
  const sources = !onlyHost
    ? config.sources
    : config.sources.filter((s) => s.host.toLowerCase() === onlyHost);

  const urlsPerSource = await mapWithConcurrency(
    sources,
    3,
    async (source) => {
      const discovered = await discoverSitemapsFromRobots(source.host);
      const sitemapUrls = uniqStrings([...(source.sitemapUrls ?? []), ...discovered]);
      if (sitemapUrls.length === 0) {
        console.warn("[resources] no sitemaps found", {
          host: source.host,
        });
        return { source, urls: [] as string[] };
      }

      const visited = new Set<string>();
      const perSourceCap = typeof opts.maxPerSource === "number" ? opts.maxPerSource : 10_000;
      const expandedLimited = await mapWithConcurrency(
        sitemapUrls,
        2,
        async (u) =>
          await expandSitemapsLimited({
            sitemapUrl: u,
            visited,
            maxUrls: Math.max(perSourceCap, 1),
            expectedHost: source.host,
          }),
      );

      const limited = expandedLimited.flat().slice(0, perSourceCap);

      console.info("[resources] discovered", {
        host: source.host,
        sitemaps: sitemapUrls.length,
        urls: limited.length,
        selected: limited.length,
      });

      return { source, urls: limited };
    },
  );

  const allUncapped = urlsPerSource.flatMap(({ source, urls }) =>
    urls.map((url) => ({ source, url })),
  );

  const englishOnly = allUncapped.filter((item) => isEnglishUrl(item.url));

  const all =
    typeof opts.maxUrls === "number"
      ? englishOnly.slice(0, opts.maxUrls)
      : englishOnly;

  console.info("[resources] discovered urls", {
    sources: sources.length,
    urls: all.length,
    concurrency: opts.concurrency,
    dryRun: opts.dryRun,
  });

  const now = new Date();

  const fetched = await mapWithConcurrency(all, opts.concurrency, async (item) => {
    try {
      const html = await fetchText(item.url);
      const title = extractTitle(html);
      const type = guessType(item.url);

      const urlTokens = tokenize(item.url);
      const titleTokens = tokenize(title);
      const tags = sanitizeTags([
        ...item.source.baseTags,
        ...urlTokens,
        ...titleTokens,
      ]).slice(0, 10);

      if (!title) return null;
      if (tags.length === 0) return null;

      return {
        id: computeId(item.url),
        title,
        url: item.url,
        type,
        tags,
      };
    } catch {
      return null;
    }
  });

  const rows = fetched.filter((r): r is NonNullable<typeof r> => r !== null);

  console.info("[resources] parsed pages", {
    parsed: rows.length,
    dropped: fetched.length - rows.length,
  });

  if (opts.outFile) {
    const format: NonNullable<CliOptions["outFormat"]> = opts.outFormat ?? "json";
    const content =
      format === "ndjson"
        ? `${rows.map((r) => JSON.stringify(r)).join("\n")}\n`
        : `${JSON.stringify(rows, null, 2)}\n`;
    await writeFile(opts.outFile, content, "utf-8");
    console.info("[resources] wrote preview", {
      outFile: opts.outFile,
      format,
      count: rows.length,
    });
    return;
  }

  if (opts.dryRun) return;

  if (!practiceDb || !resources) {
    throw new Error("DB is not initialized");
  }

  for (const row of rows) {
    await practiceDb
      .insert(resources)
      .values({
        id: row.id,
        title: row.title,
        url: row.url,
        type: row.type,
        tags: row.tags,
        difficulty: null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: resources.id,
        set: {
          title: row.title,
          url: row.url,
          type: row.type,
          tags: row.tags,
          isActive: true,
          updatedAt: now,
        },
      });
  }

  console.info("[resources] upserted", { count: rows.length });
}

main().catch((error) => {
  console.error("[resources] ingest failed", error);
  process.exitCode = 1;
});
