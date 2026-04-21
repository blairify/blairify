"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const REGEXP_ONLY_DIGITS = /^[0-9]*$/;

const InputOTPContext = React.createContext<{
  maxLength: number;
  pattern?: RegExp;
  value: string;
  onValueChange?: (value: string) => void;
  disabled: boolean;
}>({
  maxLength: 6,
  value: "",
  disabled: false,
});

interface InputOTPProps extends React.ComponentPropsWithoutRef<"div"> {
  maxLength?: number;
  pattern?: RegExp;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  containerRef?: React.Ref<HTMLDivElement>;
}

function InputOTP({
  className,
  maxLength = 6,
  pattern = REGEXP_ONLY_DIGITS,
  value = "",
  onValueChange,
  disabled = false,
  containerRef,
  children,
  ...props
}: InputOTPProps) {
  return (
    <InputOTPContext.Provider
      value={{ maxLength, pattern, value, onValueChange, disabled }}
    >
      <div
        ref={containerRef}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </InputOTPContext.Provider>
  );
}

function InputOTPGroup({
  className,
  groupRef,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  groupRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={groupRef}
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

interface InputOTPSlotProps extends React.ComponentPropsWithoutRef<"div"> {
  index: number;
  slotRef?: React.Ref<HTMLDivElement>;
}

function InputOTPSlot({
  className,
  index,
  slotRef,
  ...props
}: InputOTPSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { maxLength, pattern, value, onValueChange, disabled } =
    React.useContext(InputOTPContext);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value[index] || "";
    }
  }, [value, index]);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const newValue = input.value;

    if (
      pattern &&
      typeof pattern.test === "function" &&
      !pattern.test(newValue)
    ) {
      input.value = value[index] || "";
      return;
    }

    if (newValue.length > 1) {
      input.value = newValue.slice(0, 1);
    }

    const newCode = value.split("");
    newCode[index] = newValue.slice(-1);
    const codeValue = newCode.join("");

    onValueChange?.(codeValue);

    if (newValue.length === 1 && index < maxLength - 1) {
      const nextSlot =
        input.parentElement?.nextElementSibling?.querySelector("input");
      nextSlot?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value && index > 0) {
      const prevSlot =
        inputRef.current?.parentElement?.previousElementSibling?.querySelector(
          "input",
        );
      prevSlot?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .slice(0, maxLength);
    const inputs = Array.from(
      inputRef.current?.parentElement?.parentElement?.querySelectorAll(
        "input",
      ) || [],
    ) as HTMLInputElement[];

    pastedData.split("").forEach((char, i) => {
      if (inputs[i] && pattern?.test(char)) {
        inputs[i].value = char;
      }
    });

    const newCode = value.split("");
    pastedData.split("").forEach((char, i) => {
      if (pattern?.test(char)) {
        newCode[i] = char;
      }
    });
    onValueChange?.(newCode.join(""));

    const lastFilledIndex = Math.min(pastedData.length, maxLength) - 1;
    if (lastFilledIndex >= 0) {
      inputs[lastFilledIndex]?.focus();
    }
  };

  return (
    <div ref={slotRef} className={cn("relative", className)} {...props}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={1}
        disabled={disabled}
        aria-label={`Digit ${index + 1} of ${maxLength}`}
        className="w-10 h-10 sm:w-12 sm:h-12 border-gray-300 text-center text-lg sm:text-xl font-medium border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        autoComplete="one-time-code"
      />
    </div>
  );
}

function InputOTPSeparator(props: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div aria-hidden="true" {...props}>
      <div className="h-0.5 w-2 bg-border" />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
