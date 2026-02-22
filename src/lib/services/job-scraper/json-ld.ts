import { stripHtml } from "./assemble";

export function extractJsonLd(html: string): Record<string, unknown> | null {
  const scriptRegex =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null = scriptRegex.exec(html);

  while (match) {
    try {
      const parsed = JSON.parse(match[1]);

      if (isJobPosting(parsed)) return parsed;

      if (Array.isArray(parsed)) {
        const posting = parsed.find(isJobPosting);
        if (posting) return posting;
      }

      if (parsed?.["@graph"] && Array.isArray(parsed["@graph"])) {
        const posting = parsed["@graph"].find(isJobPosting);
        if (posting) return posting;
      }
    } catch {
      // invalid JSON block — skip
    }

    match = scriptRegex.exec(html);
  }

  return null;
}

function isJobPosting(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== "object" || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    record["@type"] === "JobPosting" ||
    (Array.isArray(record["@type"]) &&
      (record["@type"] as string[]).includes("JobPosting"))
  );
}

export function isJobPostingSufficient(
  jsonLd: Record<string, unknown>,
): boolean {
  const title = typeof jsonLd.title === "string" ? jsonLd.title.trim() : "";
  const description =
    typeof jsonLd.description === "string" ? jsonLd.description.trim() : "";
  return title.length > 0 && description.length > 20;
}

export function assembleFromJsonLd(jsonLd: Record<string, unknown>): string {
  const parts: string[] = [];

  const title = str(jsonLd.title);
  if (title) parts.push(`Position: ${title}`);

  const org = jsonLd.hiringOrganization;
  if (typeof org === "object" && org !== null) {
    const name = str((org as Record<string, unknown>).name);
    if (name) parts.push(`Company: ${name}`);
  } else if (typeof org === "string" && org.trim()) {
    parts.push(`Company: ${org.trim()}`);
  }

  const location = extractLocation(jsonLd.jobLocation);
  if (location) parts.push(`Location: ${location}`);

  const employment = jsonLd.employmentType;
  if (typeof employment === "string" && employment.trim()) {
    parts.push(`Employment Type: ${employment.trim()}`);
  } else if (Array.isArray(employment)) {
    parts.push(`Employment Type: ${employment.join(", ")}`);
  }

  const description = str(jsonLd.description);
  if (description) parts.push(`Description:\n${stripHtml(description)}`);

  const qualifications = str(jsonLd.qualifications);
  if (qualifications)
    parts.push(`Qualifications:\n${stripHtml(qualifications)}`);

  const responsibilities = str(jsonLd.responsibilities);
  if (responsibilities)
    parts.push(`Responsibilities:\n${stripHtml(responsibilities)}`);

  const skills = jsonLd.skills;
  if (typeof skills === "string" && skills.trim()) {
    parts.push(`Skills: ${skills.trim()}`);
  } else if (Array.isArray(skills)) {
    parts.push(`Skills: ${skills.join(", ")}`);
  }

  return parts.join("\n\n").slice(0, 8000);
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function extractLocation(loc: unknown): string {
  if (!loc) return "";

  if (typeof loc === "string") return loc.trim();

  if (Array.isArray(loc)) {
    return loc.map(extractLocation).filter(Boolean).join("; ");
  }

  if (typeof loc === "object" && loc !== null) {
    const record = loc as Record<string, unknown>;
    const address = record.address;

    if (typeof address === "object" && address !== null) {
      const addr = address as Record<string, unknown>;
      const parts = [
        str(addr.addressLocality),
        str(addr.addressRegion),
        str(addr.addressCountry),
      ].filter(Boolean);
      return parts.join(", ");
    }

    if (typeof address === "string") return address.trim();

    const name = str(record.name);
    if (name) return name;
  }

  return "";
}
