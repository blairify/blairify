// lib/parseJobDescription.ts
export type ParsedSection = {
  title: string;
  content: string[]; // paragraphs or "- item" for list items
};

export function parseJobDescription(raw: string | null | undefined): {
  sections: ParsedSection[];
} {
  if (!raw) return { sections: [] };

  // 1. Basic HTML -> text normalization
  let text = String(raw)
    .replace(/\r\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div)[^>]*>/gi, "\n\n")
    .replace(/<\/?li[^>]*>/gi, "\n- ")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/<\/?[^>]+>/g, "") // remove remaining tags
    .replace(/\t+/g, " ")
    .replace(/\u00A0/g, " ")
    .trim();

  // 2. Remove weird repeated stars/dashes that often show up
  text = text.replace(/[*•·▪]+/g, "-").replace(/-{3,}/g, ""); // remove long horizontal rules

  // 3. Collapse many spaces, but keep single spaces
  text = text.replace(/[ \t]{2,}/g, " ");

  // 4. Normalize newlines: collapse >3 newlines to 2 (paragraph separator)
  text = text.replace(/\n{3,}/g, "\n\n");

  // 5. Split into blocks by 2+ newlines (paragraph-like blocks)
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  // 6. Recognize section headers and build sections
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
  ];

  // helper to decide if block is a header-like block
  function looksLikeHeader(block: string) {
    const singleLine = block.split("\n").length === 1;
    const isAllCaps = /^[A-Z0-9\s'()&.-]+$/.test(block) && /[A-Z]/.test(block);
    const containsKeyword = headerKeywords.some((k) =>
      block.toUpperCase().includes(k.toUpperCase()),
    );
    // either all-caps short line, or contains a header keyword
    return singleLine && (isAllCaps || containsKeyword);
  }

  // 7. Convert each block into section(s)
  const sections: ParsedSection[] = [];
  let current: ParsedSection = { title: "Job Description", content: [] };

  for (const block of blocks) {
    if (looksLikeHeader(block)) {
      // start a new section
      if (current.content.length) sections.push(current);
      const cleanTitle = toTitleCase(
        block.replace(/[^A-Za-z0-9\s]/g, "").trim(),
      );
      current = { title: cleanTitle || "Job Details", content: [] };
      continue;
    }

    // if the block contains bullet-like lines, split them into individual items
    // we consider lines starting with '-' or lines that look like list items
    const lines = block
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // detect if many lines start with '-' or similar -> treat as list
    const listLikeCount = lines.filter(
      (l) => /^[-\u2022•·]/.test(l) || /^[0-9]+\./.test(l),
    ).length;

    if (listLikeCount >= 1 && listLikeCount >= Math.ceil(lines.length / 2)) {
      // treat as list: normalize each item to start with "- "
      for (const ln of lines) {
        const item = ln.replace(/^[-\u2022•·\s]+/, "").trim();
        if (item) current.content.push(`- ${item}`);
      }
    } else {
      // treat as a paragraph — but preserve internal sentence breaks if they are long by keeping as one string
      // collapse multiple inner newlines to a single space so paragraphs are intact
      const paragraph = lines
        .join(" ")
        .replace(/\s{2,}/g, " ")
        .trim();
      if (paragraph) current.content.push(paragraph);
    }
  }

  if (current.content.length) sections.push(current);

  return { sections };
}

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
