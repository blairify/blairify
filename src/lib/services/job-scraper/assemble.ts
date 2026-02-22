export function assembleJobText(fields: {
  title?: string;
  company?: string;
  location?: string;
  employmentType?: string;
  description?: string;
  requirements?: string;
  technologies?: string;
}): string {
  const parts: string[] = [];

  if (fields.title) parts.push(`Position: ${stripHtml(fields.title)}`);
  if (fields.company) parts.push(`Company: ${stripHtml(fields.company)}`);
  if (fields.location) parts.push(`Location: ${stripHtml(fields.location)}`);
  if (fields.employmentType)
    parts.push(`Employment Type: ${stripHtml(fields.employmentType)}`);
  if (fields.technologies)
    parts.push(`Technologies: ${stripHtml(fields.technologies)}`);
  if (fields.description)
    parts.push(`Description:\n${stripHtml(fields.description)}`);
  if (fields.requirements)
    parts.push(`Requirements:\n${stripHtml(fields.requirements)}`);

  return parts.join("\n\n").slice(0, 8000);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|li|ul|ol|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
