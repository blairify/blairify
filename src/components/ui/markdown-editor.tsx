"use client";

import {
  Bold,
  Code,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "",
  className = "",
  rows = 6,
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
} & React.HTMLAttributes<HTMLTextAreaElement>) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Insert markdown syntax at cursor position
  const insertMarkdown = (syntax: {
    prefix: string;
    suffix?: string;
    placeholder?: string;
  }) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end, value.length);

    // Create a new event for the textarea change
    const event = {
      target: {
        value: "",
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    // If there's selected text, wrap it with the syntax
    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      newText = `${beforeText}${syntax.prefix}${selectedText}${syntax.suffix || ""}${afterText}`;
      newCursorPos =
        start +
        syntax.prefix.length +
        selectedText.length +
        (syntax.suffix?.length || 0);
    } else {
      const placeholder = syntax.placeholder || "";
      newText = `${beforeText}${syntax.prefix}${placeholder}${syntax.suffix || ""}${afterText}`;
      newCursorPos = start + syntax.prefix.length + placeholder.length;
    }

    // Update the value through the event
    event.target.value = newText;
    onChange(event);

    // Set cursor position after a small delay to ensure the DOM is updated
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);

        // Force a re-render to ensure the cursor position is updated
        const event = new Event("input", { bubbles: true });
        textareaRef.current.dispatchEvent(event);
      }
    }, 10);
  };

  // Simple markdown preview - for now just shows the raw markdown in a pre tag
  const renderPreview = (content: string) => {
    if (!content.trim()) {
      return <span className="text-muted-foreground">Nothing to preview</span>;
    }
    return (
      <pre className="whitespace-pre-wrap break-words font-mono text-sm">
        {content}
      </pre>
    );
  };

  const handleButtonClick =
    (syntax: { prefix: string; suffix?: string; placeholder?: string }) =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      insertMarkdown(syntax);
    };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">
          {isPreview ? "Markdown Preview" : "Markdown Editor"}
        </div>
        <div className="flex items-center gap-1">
          {!isPreview && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0.5 text-muted-foreground hover:text-foreground"
                onClick={handleButtonClick({ prefix: "**", suffix: "**" })}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0.5 text-muted-foreground hover:text-foreground"
                onClick={handleButtonClick({ prefix: "_", suffix: "_" })}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0.5 text-muted-foreground hover:text-foreground"
                onClick={handleButtonClick({ prefix: "`", suffix: "`" })}
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0.5 text-muted-foreground hover:text-foreground"
                onClick={handleButtonClick({ prefix: "> " })}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0.5 text-muted-foreground hover:text-foreground"
                onClick={handleButtonClick({ prefix: "- " })}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0.5 text-muted-foreground hover:text-foreground"
                onClick={handleButtonClick({ prefix: "1. " })}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 p-0.5 text-muted-foreground hover:text-foreground"
                onClick={handleButtonClick({
                  prefix: "[",
                  suffix: "](url)",
                  placeholder: "link text",
                })}
                title="Link"
              >
                <Link className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              setIsPreview(!isPreview);
            }}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {isPreview ? (
        <div
          className="min-h-[120px] p-3 border rounded-md bg-muted/50 overflow-auto"
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          {renderPreview(value)}
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e);
          }}
          onSelect={() => {
            // Force update selection range
            if (textareaRef.current) {
              const { selectionStart, selectionEnd } = textareaRef.current;
              // This forces React to be aware of the current selection
              textareaRef.current.setSelectionRange(
                selectionStart,
                selectionEnd,
              );
            }
          }}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm min-h-[120px] w-full"
          style={{ minHeight: `${rows * 1.5}rem` }}
          {...props}
        />
      )}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Supports markdown formatting</span>
        <span>{value.length} characters</span>
      </div>
    </div>
  );
}
