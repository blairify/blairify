import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";

interface BlogTagBadgeProps {
  name: string;
  slug: string;
  active?: boolean;
}

export function BlogTagBadge({
  name,
  slug,
  active = false,
}: BlogTagBadgeProps) {
  return (
    <Link
      href={active || !slug ? "/blog" : `/blog?tag=${slug}`}
      className={`inline-flex items-center rounded-full px-3 py-1 transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-muted/80 text-foreground"
      }`}
      aria-label={active ? `Remove ${name} filter` : `Filter by ${name}`}
      aria-pressed={active}
    >
      <Typography.SubCaptionMedium
        className={active ? "text-primary-foreground" : ""}
      >
        {name}
      </Typography.SubCaptionMedium>
    </Link>
  );
}
