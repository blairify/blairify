import type * as React from "react";

export function BriefcaseIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Briefcase icon"
      {...props}
    >
      <rect width="18" height="12" x="3" y="7" rx="2" />
      <path d="M9 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9zm1 6l.211.106a4 4 0 0 0 3.578 0L14 12" />
    </svg>
  );
}
