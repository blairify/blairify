import { desc, eq } from "drizzle-orm";
import { practiceDb } from "@/practice-library-db/client";
import { resources } from "@/practice-library-db/schema";
import type {
  ResourceLink,
  ResourceType,
  SeniorityLevel,
} from "@/types/interview";

type ResourceRow = typeof resources.$inferSelect;

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

function hasAnyTag(resourceTags: string[], queryTags: string[]): boolean {
  if (resourceTags.length === 0 || queryTags.length === 0) return false;
  const set = new Set(resourceTags.map((t) => t.toLowerCase()));
  return queryTags.some((t) => set.has(t.toLowerCase()));
}

export async function getResourcesByTags(
  tags: string[],
  limit: number,
): Promise<ResourceLink[]> {
  if (tags.length === 0) return [];

  const rows = await practiceDb
    .select()
    .from(resources)
    .where(eq(resources.isActive, true))
    .orderBy(desc(resources.updatedAt))
    .limit(500);

  const matched = rows.filter((r) => hasAnyTag(r.tags, tags));

  console.info("[resources] lookup", {
    queryTags: tags,
    activeRows: rows.length,
    matchedRows: matched.length,
    sampleRowTags: rows.slice(0, 5).map((r) => r.tags),
  });

  return matched.slice(0, limit).map(toResourceLink);
}
