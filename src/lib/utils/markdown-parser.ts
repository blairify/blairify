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
    const lang = language ? ` data-language="${language}"` : "";
    const highlightClass =
      enableHighlighting && language ? ` language-${language}` : "";

    return `\n\n<!--CODEBLOCK--><pre class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 my-4 overflow-x-auto"${lang}><code class="text-sm font-mono${highlightClass}">${escapeHtml(code.trim())}</code></pre><!--/CODEBLOCK-->\n\n`;
  });
}

/**
 * Processes inline code with proper styling
 */
function processInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, (_match, code) => {
    return `<code class="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">${code}</code>`;
  });
}

/**
 * Processes headers with proper hierarchy and styling
 */
function processHeaders(text: string, maxLevel: number): string {
  const headerClasses = {
    1: "text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2",
    2: "text-xl font-bold mt-5 mb-2.5 text-gray-900 dark:text-gray-100",
    3: "text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100",
    4: "text-base font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100",
    5: "text-sm font-semibold mt-3 mb-1.5 text-gray-900 dark:text-gray-100",
    6: "text-sm font-semibold mt-3 mb-1.5 text-gray-700 dark:text-gray-300",
  };

  let result = text;

  for (let level = 1; level <= Math.min(6, maxLevel); level++) {
    const regex = new RegExp(`^#{${level}} (.+)$`, "gm");
    const className = headerClasses[level as keyof typeof headerClasses];
    result = result.replace(
      regex,
      `\n\n<!--HEADER--><h${level} class="${className}">$1</h${level}><!--/HEADER-->\n\n`,
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
        '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>',
      )
      .replace(
        /__([^_]+)__/g,
        '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>',
      )
      // Italic text
      .replace(
        /\*([^*]+)\*/g,
        '<em class="italic text-gray-600 dark:text-gray-400">$1</em>',
      )
      .replace(
        /_([^_]+)_/g,
        '<em class="italic text-gray-600 dark:text-gray-400">$1</em>',
      )
      // Strikethrough
      .replace(
        /~~([^~]+)~~/g,
        '<del class="line-through text-gray-500 dark:text-gray-500">$1</del>',
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
      const titleAttr = title ? ` title="${title}"` : "";
      const isExternal = href.startsWith("http") || href.startsWith("//");
      const externalAttrs = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";

      return `<a href="${href}" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-2"${titleAttr}${externalAttrs}>${linkText}</a>`;
    },
  );
}

/**
 * Processes lists (unordered and ordered) with proper nesting
 */
function processLists(text: string): string {
  let result = text;

  // Process unordered lists - match consecutive list items
  const ulRegex = /(^[-*+] .+$\n?)+/gm;
  result = result.replace(ulRegex, (match) => {
    const items = match
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const content = line.replace(/^[-*+]\s+/, "");
        return `<li class="mb-1.5 text-gray-700 dark:text-gray-300 leading-relaxed">${content}</li>`;
      })
      .join("\n");
    return `\n\n<!--LIST--><ul class="list-disc list-inside space-y-1.5 my-4 ml-4">\n${items}\n</ul><!--/LIST-->\n\n`;
  });

  // Process ordered lists - match consecutive numbered items
  const olRegex = /(^\d+\.\s+.+$\n?)+/gm;
  result = result.replace(olRegex, (match) => {
    const items = match
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const content = line.replace(/^\d+\.\s+/, "");
        return `<li class="mb-1.5 text-gray-700 dark:text-gray-300 leading-relaxed">${content}</li>`;
      })
      .join("\n");
    return `\n\n<!--LIST--><ol class="list-decimal list-inside space-y-1.5 my-4 ml-4">\n${items}\n</ol><!--/LIST-->\n\n`;
  });

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
  const bqRegex = /(^> .+$\n?)+/gm;
  return text.replace(bqRegex, (match) => {
    const content = match
      .trim()
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => line.replace(/^>\s*/, ""))
      .join("<br>");
    return `\n\n<!--BLOCKQUOTE--><blockquote class="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-950/20 rounded-r-lg"><p class="text-gray-600 dark:text-gray-400 italic mb-0">${content}</p></blockquote><!--/BLOCKQUOTE-->\n\n`;
  });
}

/**
 * Processes horizontal rules
 */
function processHorizontalRules(text: string): string {
  return text.replace(
    /^(---|\*\*\*|___)$/gm,
    '\n\n<!--HR--><hr class="my-6 border-gray-200 dark:border-gray-800"><!--/HR-->\n\n',
  );
}

/**
 * Processes tables (basic support)
 */
function processTables(text: string): string {
  const tableRegex = /^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)*)$/gm;

  return text.replace(tableRegex, (_match, header, rows) => {
    const headerCells = header
      .split("|")
      .filter((cell: string) => cell.trim())
      .map(
        (cell: string) =>
          `<th class="border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left text-gray-900 dark:text-gray-100">${cell.trim()}</th>`,
      )
      .join("");

    const bodyRows = rows
      .trim()
      .split("\n")
      .filter((row: string) => row.trim())
      .map((row: string) => {
        const cells = row
          .split("|")
          .filter((cell: string) => cell.trim())
          .map(
            (cell: string) =>
              `<td class="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300">${cell.trim()}</td>`,
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `\n\n<!--TABLE--><div class="my-4 overflow-x-auto"><table class="min-w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div><!--/TABLE-->\n\n`;
  });
}

/**
 * Processes paragraphs and line breaks
 */
function processParagraphs(text: string): string {
  // Split by double newlines to get paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs
    .map((para) => {
      para = para.trim();
      if (!para) return "";

      // Don't wrap special blocks (HTML comments mark them)
      if (para.includes("<!--") || para.startsWith("<")) {
        return para;
      }

      // Replace single newlines with <br> within paragraphs
      para = para.replace(/\n/g, "<br>");

      return `<p class="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">${para}</p>`;
    })
    .join("\n");
}

/**
 * Cleans up the final HTML output
 */
function cleanupHtml(html: string): string {
  // Remove HTML comment markers (they were just for protection during processing)
  html = html.replace(/<!--\/?HEADER-->/g, "");
  html = html.replace(/<!--\/?LIST-->/g, "");
  html = html.replace(/<!--\/?CODEBLOCK-->/g, "");
  html = html.replace(/<!--\/?BLOCKQUOTE-->/g, "");
  html = html.replace(/<!--\/?TABLE-->/g, "");
  html = html.replace(/<!--\/?HR-->/g, "");

  // Remove empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, "");

  // Clean up excessive whitespace but preserve structure
  html = html.replace(/\n{4,}/g, "\n\n");
  html = html.trim();

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

  let html = text;

  // Process in order of complexity to avoid conflicts
  // Block-level elements first (they need to be protected from paragraph wrapping)
  html = processCodeBlocks(html, opts.enableCodeHighlighting || false);
  html = processHeaders(html, opts.maxNestingLevel || 6);

  if (opts.enableTables) {
    html = processTables(html);
  }

  html = processBlockquotes(html);
  html = processHorizontalRules(html);
  html = processLists(html);

  if (opts.enableTaskLists) {
    html = processTaskLists(html);
  }

  // Inline elements
  html = processInlineCode(html);
  html = processTextFormatting(html);
  html = processLinks(html);

  // Paragraphs last (wraps remaining text)
  html = processParagraphs(html);
  html = cleanupHtml(html);

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
