import {
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import React from "react";
import { getServerAuth } from "@/lib/server-auth";
import type { InterviewSession } from "@/types/firestore";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

type ExportBody = {
  session: InterviewSession;
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 44,
    paddingHorizontal: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111827",
    lineHeight: 1.45,
  },
  header: {
    marginBottom: 22,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: "#6B7280",
  },
  subtitleRow: {
    marginBottom: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 14,
  },
  card: {
    flexGrow: 1,
    flexBasis: 0,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    color: "#111827",
  },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  kvKey: {
    color: "#6B7280",
    width: 140,
  },
  kvValue: {
    color: "#111827",
    fontWeight: 600,
    textAlign: "right",
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 8,
    color: "#111827",
  },
  muted: {
    color: "#6B7280",
  },
  small: {
    fontSize: 10,
    color: "#6B7280",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 10,
    marginBottom: 14,
  },
  questionBlock: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  metaLine: {
    fontSize: 10,
    color: "#6B7280",
    marginBottom: 6,
  },
  questionText: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 8,
  },
  blockLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: "#6B7280",
    marginBottom: 4,
  },
  codeBlock: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 8,
  },
  codeText: {
    fontFamily: "Courier",
    fontSize: 9,
    color: "#111827",
    lineHeight: 1.35,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 10,
  },
  footer: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    fontSize: 9,
    color: "#6B7280",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

function formatDate(value: unknown): string {
  const maybe = value as {
    toDate?: () => Date;
    seconds?: number;
    nanoseconds?: number;
  };
  const d = (() => {
    if (typeof maybe?.toDate === "function") return maybe.toDate();
    if (typeof maybe?.seconds === "number") {
      const ms = maybe.seconds * 1000 + (maybe.nanoseconds ?? 0) / 1e6;
      return new Date(ms);
    }
    if (typeof value === "string") {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    return null;
  })();
  if (!d) return "-";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function normalizeText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\t/g, "  ").trim();
}

function hardWrapToken(token: string, maxLen: number): string {
  if (token.length <= maxLen) return token;
  const chunks: string[] = [];
  for (let i = 0; i < token.length; i += maxLen) {
    chunks.push(token.slice(i, i + maxLen));
  }
  return chunks.join("\u200B");
}

function hardWrapText(value: string, maxTokenLen: number): string {
  if (!value) return value;
  return value
    .split(/(\s+)/g)
    .map((part) =>
      part.trim().length === 0 ? part : hardWrapToken(part, maxTokenLen),
    )
    .join("");
}

function hardWrapCode(value: string, maxLineLen: number): string {
  if (!value) return value;
  const lines = value.split("\n");
  const wrapped: string[] = [];
  for (const line of lines) {
    if (line.length <= maxLineLen) {
      wrapped.push(line);
      continue;
    }

    for (let i = 0; i < line.length; i += maxLineLen) {
      wrapped.push(line.slice(i, i + maxLineLen));
    }
  }
  return wrapped.join("\n");
}

function safeTruncate(value: string, maxChars: number): string {
  if (!value) return value;
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n\n[truncated]`;
}

function chunkString(value: string, chunkSize: number): string[] {
  if (!value) return [];
  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.slice(i, i + chunkSize));
  }
  return chunks;
}

function stripTrailingSeparators(value: string): string {
  return value.replace(/(\n\s*---\s*)+$/g, "").trim();
}

function normalizeSeparators(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*---\s*\n(\s*\n)*\s*---\s*\n/g, "\n\n---\n\n")
    .replace(/(\n\s*---\s*\n){2,}/g, "\n\n---\n\n")
    .trim();
}

function stripEmphasisMarkersOutsideCode(value: string): string {
  const parts = value.split(/(`[^`]*`)/g);
  return parts
    .map((part) => {
      if (part.startsWith("`") && part.endsWith("`")) return part;
      return part
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1");
    })
    .join("");
}

function renderInlineMarkdown(
  el: typeof React.createElement,
  value: string,
): React.ReactNode[] {
  const cleaned = stripEmphasisMarkersOutsideCode(value);
  const wrapped = hardWrapText(cleaned, 42);
  const parts = wrapped.split(/(`[^`]+`)/g);

  return parts
    .filter((p) => p.length > 0)
    .map((part, idx) => {
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
        return el(
          Text,
          {
            key: `c-${idx}`,
            style: {
              fontFamily: "Courier",
              fontSize: 10,
            },
          },
          part.slice(1, -1),
        ) as React.ReactNode;
      }

      return part;
    });
}

function splitParagraphs(value: string): string[] {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  return normalized
    .split(/\n{2,}/g)
    .map((p) =>
      p
        .replace(/\n/g, " ")
        .replace(/\s{2,}/g, " ")
        .trim(),
    )
    .filter(Boolean);
}

function splitCodeFences(
  value: string,
): Array<{ kind: "text" | "code"; value: string }> {
  const normalized = normalizeText(value);
  if (!normalized) return [];
  const parts = normalized.split(/```/g);
  return parts
    .map((part, index) => {
      const kind = index % 2 === 1 ? "code" : "text";
      return { kind, value: part.trim() } as const;
    })
    .filter((p) => p.value.length > 0);
}

function formatKeyLabel(value: string): string {
  return value
    .split(/(?=[A-Z])/)
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : ""))
    .join(" ")
    .trim();
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1).toLowerCase() : ""))
    .join(" ")
    .trim();
}

function makeFileName(session: InterviewSession): string {
  const position = titleCase(session.config.position || "interview").replace(
    /[^A-Za-z0-9_-]+/g,
    "-",
  );
  const date = formatDate(session.createdAt).replace(/[^A-Za-z0-9_-]+/g, "-");
  return `blairify-${position}-${date}.pdf`;
}

function buildPdfDocument(session: InterviewSession) {
  const el = React.createElement;
  const score = session.scores?.overall ?? 0;
  const summary = safeText(session.analysis?.summary);
  const detailedAnalysis = safeText(session.analysis?.detailedAnalysis);
  const responses = Array.isArray(session.responses) ? session.responses : [];
  const questions = Array.isArray(session.questions) ? session.questions : [];

  const subtitle = `${session.config.interviewType} • ${session.config.seniority} • ${formatDate(session.createdAt)}`;
  const title = `${titleCase(session.config.position)} interview report`;

  const renderRichText = (value: string): React.ReactNode[] => {
    const normalized = normalizeSeparators(stripTrailingSeparators(value));
    const parts = splitCodeFences(safeTruncate(normalized, 80_000));
    const nodes: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!;
      if (part.kind === "code") {
        const lines = part.value
          .split("\n")
          .map((l) => l.replace(/\s+$/g, ""))
          .join("\n")
          .trim();
        const wrapped = hardWrapCode(safeTruncate(lines, 40_000), 92);
        nodes.push(
          el(
            View,
            { key: `code-${i}`, style: styles.codeBlock },
            el(
              Text,
              { style: styles.codeText },
              wrapped.length > 0 ? wrapped : "-",
            ),
          ),
        );
        continue;
      }

      const textValue = part.value.trim();
      if (textValue === "---") {
        nodes.push(el(View, { key: `sep-${i}`, style: styles.divider }));
        continue;
      }

      const paragraphs = splitParagraphs(textValue);
      for (let j = 0; j < paragraphs.length; j++) {
        const base = stripTrailingSeparators(
          safeTruncate(paragraphs[j]!, 20_000),
        );
        const chunks = chunkString(base, 1200);
        if (chunks.length === 0) {
          nodes.push(
            el(Text, { key: `p-${i}-${j}`, style: styles.paragraph }, "-"),
          );
          continue;
        }
        for (let k = 0; k < chunks.length; k++) {
          nodes.push(
            el(
              Text,
              { key: `p-${i}-${j}-${k}`, style: styles.paragraph },
              ...renderInlineMarkdown(el, chunks[k]!),
            ),
          );
        }
      }
    }

    if (nodes.length === 0) {
      return [
        el(Text, { key: "-", style: styles.paragraph }, "-") as React.ReactNode,
      ];
    }
    return nodes.map((n) => n as React.ReactNode);
  };

  const summarySection =
    summary.length > 0
      ? el(
          View,
          { style: styles.section },
          el(Text, { style: styles.sectionTitle }, "Summary"),
          ...renderRichText(summary),
        )
      : null;

  const aiFeedback = (() => {
    if (detailedAnalysis.length > 0)
      return stripTrailingSeparators(detailedAnalysis);

    const unique = new Set(
      responses
        .map((r) => safeText(r.feedback))
        .filter((v) => v.length > 0 && v !== "Analysis pending"),
    );
    const list = Array.from(unique);
    return stripTrailingSeparators(list[0] ?? "");
  })();

  const performanceItems = (() => {
    const scores = session.scores;
    if (!scores) return [];
    return Object.entries(scores)
      .filter(([k, v]) => k !== "overall" && typeof v === "number" && v > 0)
      .map(([k, v]) => {
        const label = formatKeyLabel(k);
        return el(
          View,
          { key: k, style: styles.kvRow },
          el(Text, { style: styles.kvKey }, label),
          el(Text, { style: styles.kvValue }, `${v}%`),
        );
      });
  })();

  const configItems = [
    { label: "Position", value: titleCase(session.config.position) },
    { label: "Seniority", value: session.config.seniority },
    { label: "Interview Type", value: session.config.interviewType },
    { label: "Mode", value: session.config.interviewMode },
    {
      label: "Duration",
      value: `${session.config.duration} minutes`,
    },
    { label: "Status", value: session.status },
  ].filter((x) => safeText(x.value).length > 0);

  const visibleQuestions = questions.filter((q) => {
    const r = responses.find((x) => x.questionId === q.id);
    if (!r) return false;
    if (safeText(r.response).length > 0) return true;
    return (r.score ?? 0) > 0;
  });

  const questionBlocks = visibleQuestions
    .map((q, idx) => {
      const r = responses.find((x) => x.questionId === q.id);
      if (!r) return null;

      const answer = safeText(r.response) || "-";
      const durationSeconds =
        typeof r.duration === "number" ? r.duration : null;
      const durationText =
        durationSeconds && durationSeconds > 0
          ? `${Math.round(durationSeconds)}s`
          : "-";
      const confidenceText =
        typeof r.confidence === "number" && r.confidence > 0
          ? `${r.confidence}/10`
          : "-";
      const scoreText =
        typeof r.score === "number" && r.score > 0 ? `${r.score}%` : "-";

      const metaLine = hardWrapText(
        `Question ${idx + 1} • Type: ${q.type} • Score: ${scoreText} • Confidence: ${confidenceText} • Duration: ${durationText}`,
        42,
      );

      const isLast = idx === visibleQuestions.length - 1;
      const questionStyle = isLast
        ? { ...styles.questionBlock, borderBottomWidth: 0, paddingBottom: 0 }
        : styles.questionBlock;

      return el(
        View,
        { key: q.id, style: questionStyle },
        el(Text, { style: styles.metaLine }, metaLine),
        el(Text, { style: styles.questionText }, safeText(q.question) || "-"),
        el(Text, { style: styles.blockLabel }, "YOUR ANSWER"),
        el(View, null, ...renderRichText(answer)),
      );
    })
    .filter((x) => x != null) as React.ReactNode[];

  const createdAt = formatDate(session.createdAt);
  const companyLine = session.config.specificCompany
    ? session.config.specificCompany
    : "";

  return el(
    Document,
    null,
    el(
      Page,
      { size: "A4", style: styles.page },
      el(
        View,
        { style: styles.header },
        el(Text, { style: styles.title }, title),
        companyLine.length > 0
          ? el(
              Text,
              { style: [styles.subtitle, styles.subtitleRow] },
              companyLine,
            )
          : null,
        el(Text, { style: [styles.subtitle, styles.subtitleRow] }, subtitle),
        el(
          Text,
          { style: [styles.subtitle, styles.subtitleRow] },
          `Session: ${session.sessionId}`,
        ),
        el(Text, { style: [styles.subtitle, styles.subtitleRow] }, createdAt),
      ),
      el(
        View,
        { style: styles.row },
        el(
          View,
          { style: [styles.card, { marginRight: 12 }] },
          el(Text, { style: styles.cardTitle }, "Overview"),
          el(
            View,
            { style: styles.kvRow },
            el(Text, { style: styles.kvKey }, "Score"),
            el(Text, { style: styles.kvValue }, `${score}%`),
          ),
          el(
            View,
            { style: styles.kvRow },
            el(Text, { style: styles.kvKey }, "Duration"),
            el(Text, { style: styles.kvValue }, `${session.totalDuration} min`),
          ),
          el(
            View,
            { style: styles.kvRow },
            el(Text, { style: styles.kvKey }, "Questions"),
            el(
              Text,
              { style: styles.kvValue },
              `${session.questions?.length ?? 0}`,
            ),
          ),
        ),
        el(
          View,
          { style: styles.card },
          el(Text, { style: styles.cardTitle }, "Session"),
          el(
            View,
            { style: styles.kvRow },
            el(Text, { style: styles.kvKey }, "Status"),
            el(Text, { style: styles.kvValue }, `${session.status}`),
          ),
          el(
            View,
            { style: styles.kvRow },
            el(Text, { style: styles.kvKey }, "Mode"),
            el(
              Text,
              { style: styles.kvValue },
              `${session.config.interviewMode}`,
            ),
          ),
          el(
            View,
            { style: styles.kvRow },
            el(Text, { style: styles.kvKey }, "Difficulty"),
            el(
              Text,
              { style: styles.kvValue },
              `${session.analysis?.difficulty ?? "-"}`,
            ),
          ),
        ),
      ),
      summarySection,
      summarySection ? el(View, { style: styles.sectionDivider }) : null,
      performanceItems.length > 0
        ? el(
            View,
            { style: styles.section },
            el(Text, { style: styles.sectionTitle }, "Performance breakdown"),
            ...performanceItems,
          )
        : null,
      el(
        View,
        { style: styles.section },
        el(Text, { style: styles.sectionTitle }, "Interview configuration"),
        ...configItems.map((item) =>
          el(
            View,
            { key: item.label, style: styles.kvRow },
            el(Text, { style: styles.kvKey }, item.label),
            el(Text, { style: styles.kvValue }, safeText(item.value) || "-"),
          ),
        ),
      ),
      aiFeedback.length > 0
        ? el(
            View,
            { style: styles.section },
            el(Text, { style: styles.sectionTitle }, "AI feedback"),
            ...renderRichText(aiFeedback),
          )
        : null,
      el(View, { style: styles.divider }),
      el(
        View,
        { style: styles.section },
        el(Text, { style: styles.sectionTitle }, "Questions & responses"),
        ...(questionBlocks.length > 0
          ? questionBlocks
          : [el(Text, { key: "-", style: styles.paragraph }, "-")]),
      ),
      el(
        View,
        { style: styles.footer, fixed: true },
        el(Text, null, "Generated by Blairify"),
        el(Text, {
          render: ({
            pageNumber,
            totalPages,
          }: {
            pageNumber: number;
            totalPages: number;
          }) => `${pageNumber}/${totalPages}`,
        }),
      ),
    ),
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { isAuthenticated } = await getServerAuth();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await context.params;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  let body: ExportBody;
  try {
    body = (await request.json()) as ExportBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const session = body.session;
  if (!session || typeof session !== "object") {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  if (session.sessionId !== sessionId) {
    return NextResponse.json({ error: "Session mismatch" }, { status: 400 });
  }

  const fileName = makeFileName(session);

  const document = buildPdfDocument(session);
  const buffer = (await pdf(document).toBuffer()) as unknown as Uint8Array;

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
