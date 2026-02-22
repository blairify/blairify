import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps, useId } from "react";
import { cn } from "@/lib/utils";

const textAreaStyles = cva(
  "bg-input-background peer min-h-32 w-full rounded-lg text-sm sm:text-xs border px-4 py-3.5 outline-none placeholder:text-input-placeholder-text focus:ring-3 disabled:border-base-100 disabled:bg-background-soft-50 disabled:text-input-disabled-text disabled:placeholder:text-input-disabled-text shadow-[inset_0_-20px_20px_-5px_rgba(43,43,41,0.08)] scrollbar-hide",
  {
    variants: {
      state: {
        default:
          "focus:border-input-primary-focus-border focus:ring-gray-300/20 border-base-300",
        error:
          "border-input-error-focus-border focus:ring-input-error-focus-border/20",
        success:
          "border-input-success-focus-border focus:ring-input-success-focus-border/20",
      },
    },
  },
);

const hintStyles = cva(
  "text-sm font-normal peer-disabled:text-input-disabled-text",
  {
    variants: {
      state: {
        default: "text-text-50",
        error: "text-input-error",
        success: "text-input-success",
      },
    },
  },
);

type PropsType = ComponentProps<"textarea"> &
  VariantProps<typeof textAreaStyles> & {
    label?: string;
    hint?: string;
  };

export function TextArea({
  label,
  state = "default",
  hint,
  className,
  ...textAreaProps
}: PropsType) {
  const id = useId();

  return (
    <div className="grid grid-cols-1 gap-2">
      {label && (
        <label
          htmlFor={id}
          className="max-w-fit text-sm font-medium text-text-50 select-none"
        >
          {label}
        </label>
      )}

      <textarea
        id={id}
        className={cn(textAreaStyles({ state }), className)}
        {...textAreaProps}
      />

      {hint && <p className={hintStyles({ state })}>{hint}</p>}
    </div>
  );
}
