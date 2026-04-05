"use client";

import type { Components } from "react-markdown";
import { Typography } from "@/components/common/atoms/typography";
import { getMarkdownText } from "@/lib/utils/results-content-utils";

type MarkdownChildrenProps = {
  children?: React.ReactNode;
};

export const readableMarkdownComponents: Components = {
  h1({ children }: MarkdownChildrenProps) {
    return (
      <Typography.BodyBold className="tracking-tight mb-2">
        {children}
      </Typography.BodyBold>
    );
  },
  h2({ children }: MarkdownChildrenProps) {
    return (
      <Typography.BodyBold className="tracking-tight mb-2">
        {children}
      </Typography.BodyBold>
    );
  },
  h3({ children }: MarkdownChildrenProps) {
    return (
      <div className="pt-3">
        <Typography.BodyBold className="tracking-tight">
          {children}
        </Typography.BodyBold>
      </div>
    );
  },
  h4({ children }: MarkdownChildrenProps) {
    return (
      <div className="pt-2">
        <Typography.BodyMedium className="tracking-tight">
          {children}
        </Typography.BodyMedium>
      </div>
    );
  },
  p({ children }: MarkdownChildrenProps) {
    const text = getMarkdownText(children).trim().replace(/\s+/g, " ");

    const labelMatch = text.match(/^([A-Za-z][A-Za-z\s]{1,40}):\s*(.+)$/);
    if (labelMatch) {
      const [, label, value] = labelMatch;
      return (
        <Typography.Body
          color="secondary"
          className="whitespace-pre-line my-1 first:mt-0 last:mb-0"
        >
          <Typography.BodyBold className="inline">{label}:</Typography.BodyBold>{" "}
          {value}
        </Typography.Body>
      );
    }

    return (
      <Typography.Body
        color="secondary"
        className="whitespace-pre-line my-1 first:mt-0 last:mb-0"
      >
        {children}
      </Typography.Body>
    );
  },
  ul({ children }: MarkdownChildrenProps) {
    return <ul className="space-y-2 list-disc pl-5 mt-1 mb-2">{children}</ul>;
  },
  ol({ children }: MarkdownChildrenProps) {
    return (
      <ol className="space-y-2 list-decimal pl-5 mt-1 mb-2">{children}</ol>
    );
  },
  li({ children }: MarkdownChildrenProps) {
    return (
      <li>
        <Typography.Body color="secondary">{children}</Typography.Body>
      </li>
    );
  },
  pre({ children }: MarkdownChildrenProps) {
    return (
      <pre className="my-2 overflow-x-auto whitespace-pre rounded-md border border-border/60 bg-muted/40 p-3 font-mono text-xs leading-relaxed">
        {children}
      </pre>
    );
  },
  code({ children }: MarkdownChildrenProps) {
    return (
      <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  strong({ children }: MarkdownChildrenProps) {
    return <strong className="font-semibold">{children}</strong>;
  },
  hr() {
    return null;
  },
};

export const qaQuestionMarkdownComponents: Components = {
  ...readableMarkdownComponents,
  p({ children }: MarkdownChildrenProps) {
    return (
      <Typography.Body className="whitespace-pre-line my-2">
        {children}
      </Typography.Body>
    );
  },
  li({ children }: MarkdownChildrenProps) {
    return (
      <li>
        <Typography.Body>{children}</Typography.Body>
      </li>
    );
  },
};

export const qaResponseMarkdownComponents: Components = {
  ...readableMarkdownComponents,
  p({ children }: MarkdownChildrenProps) {
    return (
      <Typography.Body color="secondary" className="whitespace-pre-line my-2">
        {children}
      </Typography.Body>
    );
  },
  li({ children }: MarkdownChildrenProps) {
    return (
      <li>
        <Typography.Body color="secondary">{children}</Typography.Body>
      </li>
    );
  },
};

export const overallSummaryMarkdownComponents: Components = {
  p({ children }: MarkdownChildrenProps) {
    const labelInfo = (() => {
      const text = getMarkdownText(children).trim().replace(/\s+/g, " ");
      const match = /^([A-Za-z][A-Za-z\s/]{2,40}):\s*(.+)$/.exec(text);
      if (!match) return null;
      const [, label, value] = match;
      return { label, value };
    })();

    if (labelInfo) {
      return (
        <Typography.Body className="whitespace-pre-line my-2">
          <Typography.BodyBold className="inline">
            {labelInfo.label}:
          </Typography.BodyBold>{" "}
          {labelInfo.value}
        </Typography.Body>
      );
    }

    return (
      <Typography.Body color="secondary" className="whitespace-pre-line my-2">
        {children}
      </Typography.Body>
    );
  },
  ul({ children }: MarkdownChildrenProps) {
    return <ul className="space-y-2 list-disc pl-5 mt-1 mb-2">{children}</ul>;
  },
  ol({ children }: MarkdownChildrenProps) {
    return (
      <ol className="space-y-2 list-decimal pl-5 mt-1 mb-2">{children}</ol>
    );
  },
  li({ children }: MarkdownChildrenProps) {
    return (
      <li>
        <Typography.Body color="secondary">{children}</Typography.Body>
      </li>
    );
  },
  pre({ children }: MarkdownChildrenProps) {
    return (
      <pre className="my-2 overflow-x-auto whitespace-pre rounded-md border border-border/60 bg-muted/40 p-3 font-mono text-xs leading-relaxed">
        {children}
      </pre>
    );
  },
  code({ children }: MarkdownChildrenProps) {
    return (
      <code className="rounded bg-muted/40 px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  strong({ children }: MarkdownChildrenProps) {
    return <strong className="font-semibold">{children}</strong>;
  },
  hr() {
    return null;
  },
};
