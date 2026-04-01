import { Calendar } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";
import { BlogAuthor } from "../atoms/blog-author";
import { BlogReadTime } from "../atoms/blog-read-time";
import { BlogTagBadge } from "../atoms/blog-tag-badge";

interface BlogMetadataProps {
  authorName: string;
  authorAvatar?: string | null;
  publishedAt: Date | null;
  readTimeMinutes: number;
  tags: { name: string; slug: string }[];
}

const formatDate = (date: Date | null) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export function BlogMetadata({
  authorName,
  authorAvatar,
  publishedAt,
  readTimeMinutes,
  tags,
}: BlogMetadataProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <BlogAuthor name={authorName} avatar={authorAvatar} />
        <div className="flex items-center gap-1.5">
          <Calendar className="size-3.5" aria-hidden="true" />
          <Typography.SubCaption color="secondary">
            {formatDate(publishedAt)}
          </Typography.SubCaption>
        </div>
        <BlogReadTime minutes={readTimeMinutes} />
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <BlogTagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
