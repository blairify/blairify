import { Typography } from "@/components/common/atoms/typography";
import { BlogTagBadge } from "../atoms/blog-tag-badge";

interface TagWithCount {
  name: string;
  slug: string;
  _count: { posts: number };
}

interface BlogTagFilterProps {
  tags: TagWithCount[];
  activeTagSlug?: string;
}

export function BlogTagFilter({ tags, activeTagSlug }: BlogTagFilterProps) {
  const visibleTags = tags.filter((tag) => tag._count.posts > 0);

  if (visibleTags.length === 0) return null;

  return (
    <nav aria-label="Filter articles by tag" className="space-y-3">
      <Typography.CaptionMedium color="secondary">
        Filter by topic
      </Typography.CaptionMedium>
      <div className="flex flex-wrap gap-2">
        {activeTagSlug && <BlogTagBadge name="All" slug="" active={false} />}
        {visibleTags.map((tag) => (
          <BlogTagBadge
            key={tag.slug}
            name={`${tag.name} (${tag._count.posts})`}
            slug={tag.slug}
            active={tag.slug === activeTagSlug}
          />
        ))}
      </div>
    </nav>
  );
}
