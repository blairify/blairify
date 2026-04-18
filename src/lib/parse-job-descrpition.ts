export type ParsedSection = {
  title: string;
  content: string[];
};

export function parseJobDescription(raw: string | null | undefined): {
  sections: ParsedSection[];
} {
  if (!raw) return { sections: [] };

  let text = String(raw)
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div)[^>]*>/gi, "\n\n")
    .replace(/<\/?li[^>]*>/gi, "\n- ")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\t+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

  text = text.replace(/[*•·▪]+/g, "-").replace(/-{3,}/g, "");
  text = text.replace(/[ \t]{2,}/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");

  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const headerKeywords = [
    "DESCRIPTION",
    "SUMMARY",
    "RESPONSIBILITIES",
    "REQUIREMENTS",
    "QUALIFICATIONS",
    "BASIC QUALIFICATIONS",
    "PREFERRED QUALIFICATIONS",
    "PREFERRED",
    "BENEFITS",
    "COMPENSATION",
    "ABOUT",
    "EXPERIENCE",
    "EDUCATION",
    "JOB FUNCTION",
    "ABOUT THE COMPANY",
  ] as const;

  function looksLikeHeader(block: string) {
    const singleLine = block.split("\n").length === 1;
    const isAllCaps = /^[A-Z0-9\s'()&.-]+$/.test(block) && /[A-Z]/.test(block);
    const containsKeyword = headerKeywords.some((k) =>
      block.toUpperCase().includes(k.toUpperCase()),
    );
    return singleLine && (isAllCaps || containsKeyword);
  }

  const sections: ParsedSection[] = [];
  let current: ParsedSection = { title: "Job Description", content: [] };
  let hasHeaders = false;

  for (const block of blocks) {
    if (looksLikeHeader(block)) {
      hasHeaders = true;
      if (current.content.length) sections.push(current);
      const cleanTitle = toTitleCase(
        block.replace(/[^A-Za-z0-9\s]/g, "").trim(),
      );
      current = { title: cleanTitle || "Job Details", content: [] };
      continue;
    }

    const lines = block
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const listLikeCount = lines.filter(
      (l) => /^[-\u2022•·]/.test(l) || /^[0-9]+\./.test(l),
    ).length;

    if (listLikeCount >= 1 && listLikeCount >= Math.ceil(lines.length / 2)) {
      for (const ln of lines) {
        const item = ln.replace(/^[-\u2022•·\s]+/, "").trim();
        if (item) current.content.push(`- ${item}`);
      }
    } else {
      const paragraph = lines
        .join(" ")
        .replace(/\s{2,}/g, " ")
        .trim();
      if (paragraph) current.content.push(paragraph);
    }
  }

  if (current.content.length) sections.push(current);

  if (!hasHeaders && sections.length === 0 && blocks.length > 0) {
    const allContent = blocks
      .join("\n\n")
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const finalSection: ParsedSection = {
      title: "Job Description",
      content: [],
    };

    for (const line of allContent) {
      const listLike = /^[-\u2022•·]/.test(line) || /^[0-9]+\./.test(line);
      if (listLike) {
        const item = line.replace(/^[-\u2022•·\s]+/, "").trim();
        if (item) finalSection.content.push(`- ${item}`);
      } else {
        const paragraph = line.replace(/\s{2,}/g, " ").trim();
        if (paragraph) finalSection.content.push(paragraph);
      }
    }

    if (finalSection.content.length > 0) {
      sections.push(finalSection);
    }
  }

  return { sections };
}

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
