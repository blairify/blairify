"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export interface PromptInputProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  value?: string;
  onValueChange?: (value: string) => void;
  isLoading?: boolean;
  onSubmit?: () => void;
  children?: React.ReactNode;
  className?: string;
}

function PromptInput({
  className,
  children,
  ref,
  value: _value,
  onValueChange: _onValueChange,
  isLoading: _isLoading,
  onSubmit: _onSubmit,
  ...props
}: PromptInputProps) {
  return (
    <div ref={ref} className={cn("relative w-full", className)} {...props}>
      {children}
    </div>
  );
}

interface PromptInputTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
}

function PromptInputTextarea({
  className,
  ref,
  ...props
}: PromptInputTextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full bg-transparent placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none scrollbar-hide",
        className,
      )}
      {...props}
    />
  );
}

interface PromptInputActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
}

function PromptInputActions({
  className,
  ref,
  ...props
}: PromptInputActionsProps) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  );
}

interface PromptInputActionProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  tooltip?: string;
}

function PromptInputAction({
  className,
  tooltip,
  ref,
  ...props
}: PromptInputActionProps) {
  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      title={tooltip}
      {...props}
    />
  );
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
};
