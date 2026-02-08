import { and, desc, eq, sql } from "drizzle-orm";
import { practiceDb } from "@/practice-library-db/client";
import { resources } from "@/practice-library-db/schema";
import type {
  ResourceLink,
  ResourceType,
  SeniorityLevel,
} from "@/types/interview";

type ResourceRow = typeof resources.$inferSelect;

function getHost(url: string): string {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}

function isTrustedHost(host: string): boolean {
  if (!host) return false;

  const trusted = [
    "developer.mozilla.org",
    "web.dev",
    "nextjs.org",
    "vercel.com",
    "nodejs.org",
    "www.typescriptlang.org",
    "developer.chrome.com",
    "www.postgresql.org",
    "mariadb.com",
    "redis.io",
    "www.mongodb.com",
    "www.prisma.io",
    "orm.drizzle.team",
    "neon.tech",
    "typeorm.io",
    "firebase.google.com",
    "cloud.google.com",
    "kubernetes.io",
    "docs.docker.com",
    "docs.aws.amazon.com",
    "aws.amazon.com",
    "azure.microsoft.com",
    "learn.microsoft.com",
    "dotnet.microsoft.com",
    "docs.microsoft.com",
    "docs.stripe.com",
    "spring.io",
    "docs.python.org",
    "pypi.org",
    "flask.palletsprojects.com",
    "kotlinlang.org",
    "developer.android.com",
    "docs.flutter.dev",
    "dart.dev",
    "jestjs.io",
    "www.cypress.io",
    "testing-library.com",
    "www.apollographql.com",
    "www.rfc-editor.org",
    "grafana.com",
    "nginx.org",
    "www.cloudflare.com",
    "greensock.com",
    "developer.okta.com",
  ];

  return trusted.some((t) => host === t || host.endsWith(`.${t}`));
}

function toResourceLink(row: ResourceRow): ResourceLink {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    type: row.type as ResourceType,
    tags: row.tags,
    difficulty: (row.difficulty as SeniorityLevel | null) ?? undefined,
  };
}

function normalizeTag(value: string): string {
  const cleaned = value.trim().toLowerCase();
  if (!cleaned) return "";
  return cleaned
    .replace(/[_/]/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countTagMatches(resourceTags: string[], queryTags: string[]): number {
  if (resourceTags.length === 0 || queryTags.length === 0) return 0;
  const set = new Set(resourceTags.map((t) => normalizeTag(t)).filter(Boolean));
  let count = 0;
  for (const t of queryTags.map((x) => normalizeTag(x)).filter(Boolean)) {
    if (set.has(t)) count += 1;
  }
  return count;
}

export async function getResourcesByTags(
  tags: string[],
  limit: number,
): Promise<ResourceLink[]> {
  if (limit <= 0) return [];

  // Normalize tags for robust matching
  const normalizedQueryTags = tags.map((t) => normalizeTag(t)).filter(Boolean);
  if (normalizedQueryTags.length === 0) return [];

  // Use PostgreSQL array overlap operator (&&) to find candidate resources efficiently.
  // This avoids the previous 500-row limit that caused missing matches.
  const rows = await practiceDb
    .select()
    .from(resources)
    .where(
      and(
        eq(resources.isActive, true),
        sql`${resources.tags} && ARRAY[${sql.join(
          normalizedQueryTags.map((t) => sql`${t}`),
          sql`,`,
        )}]::text[]`,
      ),
    )
    .orderBy(desc(resources.updatedAt))
    .limit(200); // Fetch enough candidates for scoring

  if (rows.length === 0) return [];

  const scored = rows
    .map((row) => {
      const host = getHost(row.url);
      const trusted = isTrustedHost(host);
      const tagMatches = countTagMatches(row.tags, normalizedQueryTags);
      const score = tagMatches * 10 + (trusted ? 100 : 0);
      return { row, score };
    })
    .sort((a, b) => b.score - a.score);

  const selected = scored
    .slice(0, Math.min(limit, scored.length))
    .map((s) => s.row);

  if (process.env.NODE_ENV === "development") {
    console.info("[resources] lookup", {
      queryTags: normalizedQueryTags,
      matchedRows: rows.length,
      selectedCount: selected.length,
    });
  }

  return selected.map(toResourceLink);
}
