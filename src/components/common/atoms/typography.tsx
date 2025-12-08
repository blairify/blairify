import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { FC, HTMLAttributes, PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export const COLOR_VALUES = [
  "primary",
  "secondary",
  "gray",
  "darkGray",
  "brand",
  "brandLight",
  "brandDark",
  "disabled",
  "success",
  "error",
  "blue",
] as const;
type Color = (typeof COLOR_VALUES)[number];

export const VARIANT_VALUES = [
  "Heading1",
  "Heading2",
  "Heading3",
  "Body",
  "BodyMedium",
  "BodyBold",
  "Caption",
  "CaptionMedium",
  "CaptionBold",
  "SubCaption",
  "SubCaptionMedium",
  "SubCaptionBold",
] as const;
export type Variant = (typeof VARIANT_VALUES)[number];

type VariantSettings = {
  color: Record<Color, string>;
  variant: Record<Variant, string>;
  clickable: Record<"true" | "false", string>;
  disabled: Record<"true" | "false", string>;
};

export const typographyVariants = /*tw:*/ cva<VariantSettings>(
  {},
  {
    defaultVariants: { color: "primary" },
    variants: {
      color: {
        primary: "text-gray-900 dark:text-gray-50",
        secondary: "text-gray-500 dark:text-gray-300",
        gray: "text-gray-700 dark:text-gray-400",
        brand: "text-primary dark:text-primary",
        brandLight: "text-primary/80 dark:text-primary/80",
        brandDark: "text-primary/90 dark:text-primary/90",
        disabled: "text-gray-400 dark:text-gray-500",
        success: "text-green-700 dark:text-green-500",
        error: "text-red-700 dark:text-red-500",
        darkGray: "text-gray-800 dark:text-gray-200",
        blue: "text-blue-800 dark:text-blue-400",
      },
      variant: {
        Heading1: "font-heading font-bold text-2xl",
        Heading2: "font-heading font-bold text-xl",
        Heading3: "font-heading font-semibold text-lg leading-6",

        Body: "font-sans font-normal text-base",
        BodyMedium: "font-sans font-medium text-base",
        BodyBold: "font-sans font-semibold text-base leading-none",

        Caption: "font-sans font-normal text-sm",
        CaptionMedium: "font-sans font-medium text-sm",
        CaptionBold: "font-sans font-semibold text-sm leading-tight",

        SubCaption: "font-sans font-normal text-xs",
        SubCaptionMedium: "font-sans font-medium text-xs",
        SubCaptionBold: "font-sans font-semibold text-xs leading-tight",
      },
      clickable: {
        true: "cursor-pointer hover:text-primary dark:hover:text-primary",
        false: "",
      },
      disabled: {
        true: "pointer-events-none cursor-default text-gray-400 dark:text-gray-500",
        false: "",
      },
    },
  },
);

export type TypographyVariants = VariantProps<typeof typographyVariants>;

type TypographyVariant<T> = T & {
  color?: Exclude<TypographyVariants["color"], null>;
};

export type TypographyProps = TypographyVariant<
  HTMLAttributes<HTMLElement> & {
    disabled?: boolean;
    // We keep onClick explicit if we want to enforce VoidFunction or just rely on HTMLAttributes
    // HTMLAttributes has onClick?: MouseEventHandler
    // Let's keep it simple and rely on HTMLAttributes for onClick, but we need to check if 'clickable' logic needs it.
    // The component uses `!!props.onClick`.
  }
>;

type TypographyComponent = FC<PropsWithChildren<TypographyProps>>;

const Heading1: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "Heading1",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <h1
      aria-level={1}
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </h1>
  );
};

const Heading2: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "Heading2",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <h2
      aria-level={2}
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </h2>
  );
};

const Heading3: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "Heading3",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <h3
      aria-level={3}
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </h3>
  );
};

const Body: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "Body",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <p className={typographyClass} data-clickable={!!props.onClick} {...props}>
      {children}
    </p>
  );
};

const BodyMedium: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "BodyMedium",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <p className={typographyClass} data-clickable={!!props.onClick} {...props}>
      {children}
    </p>
  );
};

const BodyBold: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "BodyBold",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <p className={typographyClass} data-clickable={!!props.onClick} {...props}>
      {children}
    </p>
  );
};

const Caption: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "Caption",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <span
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </span>
  );
};

const CaptionMedium: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "CaptionMedium",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <span
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </span>
  );
};

const CaptionBold: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "CaptionBold",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <span
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </span>
  );
};

const SubCaption: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "SubCaption",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );
  return (
    <span
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </span>
  );
};

const SubCaptionMedium: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "SubCaptionMedium",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );

  return (
    <span
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </span>
  );
};

const SubCaptionBold: TypographyComponent = ({
  children,
  color,
  className,
  disabled,
  ...props
}) => {
  const typographyClass = twMerge(
    typographyVariants({
      color,
      variant: "SubCaptionBold",
      className,
      clickable: !!props.onClick,
      disabled,
    }),
  );

  return (
    <span
      className={typographyClass}
      data-clickable={!!props.onClick}
      {...props}
    >
      {children}
    </span>
  );
};

const Typography = {
  Heading1,
  Heading2,
  Heading3,
  Body,
  BodyMedium,
  BodyBold,
  Caption,
  CaptionMedium,
  CaptionBold,
  SubCaption,
  SubCaptionMedium,
  SubCaptionBold,
};

export { Typography };
