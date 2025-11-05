/**
 * Enhanced Markdown Parser with comprehensive support for various markdown elements
 * Includes XSS protection and proper HTML structure handling
 */

export interface MarkdownParserOptions {
  enableCodeHighlighting?: boolean;
  enableTables?: boolean;
  enableTaskLists?: boolean;
  maxNestingLevel?: number;
  sanitizeHtml?: boolean;
}

const DEFAULT_OPTIONS: MarkdownParserOptions = {
  enableCodeHighlighting: true,
  enableTables: true,
  enableTaskLists: true,
  maxNestingLevel: 6,
  sanitizeHtml: true,
};

/**
 * Escapes HTML characters to prevent XSS attacks
 */
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Processes code blocks with optional language detection
 */
function processCodeBlocks(text: string, enableHighlighting: boolean): string {
  return text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, language, code) => {
    const lang = language ? ` data-language="${escapeHtml(language)}"` : "";
    const highlightClass =
      enableHighlighting && language ? ` language-${escapeHtml(language)}` : "";

    return `</p><pre class="bg-muted border border-border rounded-lg p-4 my-4 overflow-x-auto"${lang}><code class="text-sm font-mono${highlightClass}">${escapeHtml(code.trim())}</code></pre><p class="mt-2">`;
  });
}

/**
 * Processes inline code with proper styling
 */
function processInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, (_match, code) => {
    return `<code class="bg-muted border border-border px-2 py-1 rounded text-sm font-mono">${escapeHtml(code)}</code>`;
  });
}

/**
 * Processes headers with proper hierarchy and styling
 */
function processHeaders(text: string, maxLevel: number): string {
  const headerClasses = {
    1: "text-3xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2",
    2: "text-2xl font-bold mt-6 mb-3 text-foreground",
    3: "text-xl font-semibold mt-6 mb-2 text-foreground",
    4: "text-lg font-semibold mt-4 mb-2 text-foreground",
    5: "text-base font-semibold mt-4 mb-2 text-foreground",
    6: "text-sm font-semibold mt-4 mb-2 text-foreground",
  };

  let result = text;

  for (let level = 1; level <= Math.min(6, maxLevel); level++) {
    const regex = new RegExp(`^#{${level}} (.+)$`, "gm");
    const className = headerClasses[level as keyof typeof headerClasses];
    result = result.replace(
      regex,
      `</p><h${level} class="${className}">$1</h${level}><p class="mt-2">`,
    );
  }

  return result;
}

/**
 * Processes text formatting (bold, italic, strikethrough)
 */
function processTextFormatting(text: string): string {
  return (
    text
      // Bold text
      .replace(
        /\*\*([^*]+)\*\*/g,
        '<strong class="font-semibold text-foreground">$1</strong>',
      )
      .replace(
        /__([^_]+)__/g,
        '<strong class="font-semibold text-foreground">$1</strong>',
      )
      // Italic text
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
      .replace(/_([^_]+)_/g, '<em class="italic">$1</em>')
      // Strikethrough
      .replace(
        /~~([^~]+)~~/g,
        '<del class="line-through text-muted-foreground">$1</del>',
      )
  );
}

/**
 * Processes links with security attributes
 */
function processLinks(text: string): string {
  // Standard markdown links [text](url "title")
  return text.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (_match, linkText, href, title) => {
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      const isExternal = href.startsWith("http") || href.startsWith("//");
      const externalAttrs = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";

      return `<a href="${escapeHtml(href)}" class="text-primary hover:text-primary/80 underline underline-offset-2"${titleAttr}${externalAttrs}>${escapeHtml(linkText)}</a>`;
    },
  );
}

/**
 * Processes lists (unordered and ordered) with proper nesting
 */
function processLists(text: string): string {
  let result = text;

  // Unordered lists
  result = result.replace(/^(\s*)[-*+] (.+)$/gm, (_match, indent, content) => {
    const level = Math.floor(indent.length / 2);
    const marginClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : "ml-6";
    return `<li class="${marginClass} list-disc mb-1 text-foreground">${content}</li>`;
  });

  // Ordered lists
  result = result.replace(
    /^(\s*)(\d+)\. (.+)$/gm,
    (_match, indent, _number, content) => {
      const level = Math.floor(indent.length / 2);
      const marginClass = level > 0 ? `ml-${Math.min(level * 4, 12)}` : "ml-6";
      return `<li class="${marginClass} list-decimal mb-1 text-foreground">${content}</li>`;
    },
  );

  return result;
}

/**
 * Processes task lists (checkboxes)
 */
function processTaskLists(text: string): string {
  return text
    .replace(
      /^(\s*)- \[x\] (.+)$/gm,
      '$1<li class="flex items-start gap-2 mb-1"><input type="checkbox" checked disabled class="mt-1 rounded border-border"> <span class="text-foreground">$2</span></li>',
    )
    .replace(
      /^(\s*)- \[ \] (.+)$/gm,
      '$1<li class="flex items-start gap-2 mb-1"><input type="checkbox" disabled class="mt-1 rounded border-border"> <span class="text-foreground">$2</span></li>',
    );
}

/**
 * Processes blockquotes with proper styling
 */
function processBlockquotes(text: string): string {
  return text.replace(/^> (.+)$/gm, (_match, content) => {
    return `</p><blockquote class="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/30 rounded-r-lg"><p class="text-muted-foreground italic mb-0">${content}</p></blockquote><p class="mt-2">`;
  });
}

/**
 * Processes horizontal rules
 */
function processHorizontalRules(text: string): string {
  return text.replace(
    /^(---|\*\*\*|___)$/gm,
    '</p><hr class="my-6 border-border"><p class="mt-2">',
  );
}

/**
 * Processes tables (basic support)
 */
function processTables(text: string): string {
  const tableRegex = /^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm;

  return text.replace(tableRegex, (_match, header, rows) => {
    const headerCells = header
      .split("|")
      .map(
        (cell: string) =>
          `<th class="border border-border px-3 py-2 bg-muted font-semibold text-left">${cell.trim()}</th>`,
      )
      .join("");

    const bodyRows = rows
      .trim()
      .split("\n")
      .map((row: string) => {
        const cells = row
          .split("|")
          .slice(1, -1)
          .map(
            (cell: string) =>
              `<td class="border border-border px-3 py-2">${cell.trim()}</td>`,
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `</p><div class="my-4 overflow-x-auto"><table class="min-w-full border-collapse border border-border rounded-lg"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div><p class="mt-2">`;
  });
}

/**
 * Processes paragraphs and line breaks
 */
function processParagraphs(text: string): string {
  return text.replace(/\n\n+/g, '</p><p class="mb-4">').replace(/\n/g, "<br>");
}

/**
 * Wraps content in proper HTML structure
 */
function wrapContent(html: string): string {
  // Remove empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "");

  // Ensure proper wrapping
  if (
    !html.startsWith("<h") &&
    !html.startsWith("<p>") &&
    !html.startsWith("<ul>") &&
    !html.startsWith("<ol>") &&
    !html.startsWith("<pre>") &&
    !html.startsWith("<blockquote>") &&
    !html.startsWith("<div>") &&
    !html.startsWith("<table>")
  ) {
    html = `<p class="mb-4">${html}`;
  }

  if (
    !html.endsWith("</p>") &&
    !html.endsWith("</h1>") &&
    !html.endsWith("</h2>") &&
    !html.endsWith("</h3>") &&
    !html.endsWith("</h4>") &&
    !html.endsWith("</h5>") &&
    !html.endsWith("</h6>") &&
    !html.endsWith("</ul>") &&
    !html.endsWith("</ol>") &&
    !html.endsWith("</pre>") &&
    !html.endsWith("</blockquote>") &&
    !html.endsWith("</div>") &&
    !html.endsWith("</table>")
  ) {
    html = `${html}</p>`;
  }

  return html;
}

/**
 * Main markdown parsing function
 */
export function parseMarkdown(
  text: string | null | undefined,
  options: MarkdownParserOptions = {},
): { __html: string } {
  if (!text) return { __html: "" };

  const opts = { ...DEFAULT_OPTIONS, ...options };

  let html = opts.sanitizeHtml ? escapeHtml(text) : text;

  // Process in order of complexity to avoid conflicts
  html = processCodeBlocks(html, opts.enableCodeHighlighting || false);
  html = processInlineCode(html);
  html = processHeaders(html, opts.maxNestingLevel || 6);
  html = processTextFormatting(html);
  html = processLinks(html);

  if (opts.enableTables) {
    html = processTables(html);
  }

  if (opts.enableTaskLists) {
    html = processTaskLists(html);
  }

  html = processLists(html);
  html = processBlockquotes(html);
  html = processHorizontalRules(html);
  html = processParagraphs(html);
  html = wrapContent(html);

  return { __html: html };
}

/**
 * Simplified markdown parser for basic content
 */
export function parseSimpleMarkdown(text: string | null | undefined): {
  __html: string;
} {
  return parseMarkdown(text, {
    enableCodeHighlighting: false,
    enableTables: false,
    enableTaskLists: false,
    maxNestingLevel: 3,
    sanitizeHtml: true,
  });
}

/**
 * Full-featured markdown parser for complex content
 */
export function parseFullMarkdown(text: string | null | undefined): {
  __html: string;
} {
  return parseMarkdown(text, {
    enableCodeHighlighting: true,
    enableTables: true,
    enableTaskLists: true,
    maxNestingLevel: 6,
    sanitizeHtml: true,
  });
}
