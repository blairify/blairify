import { Pool } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
import { universityDomains } from "@/practice-library-db/schema";

export interface UniversityDomain {
  id: string;
  universityName: string;
  domain: string;
  country: string;
  isActive: boolean;
}

const practiceDb = drizzle(
  new Pool({ connectionString: process.env.PRACTICE_LIBRARY_DATABASE_URL! }),
);

function extractDomain(email: string): string {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) return "";
  return email
    .slice(atIndex + 1)
    .toLowerCase()
    .trim();
}

export async function findUniversityByDomain(
  domain: string,
): Promise<UniversityDomain | null> {
  const rows = await practiceDb
    .select()
    .from(universityDomains)
    .where(
      and(
        eq(universityDomains.domain, domain),
        eq(universityDomains.isActive, true),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function findUniversityByEmail(
  email: string,
): Promise<UniversityDomain | null> {
  const domain = extractDomain(email);
  if (!domain) return null;
  return findUniversityByDomain(domain);
}
