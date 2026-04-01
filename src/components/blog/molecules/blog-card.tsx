import Image from "next/image";
import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";
import type { BlogPostCard } from "@/lib/blog/types";
import { BlogAuthor } from "../atoms/blog-author";
import { BlogReadTime } from "../atoms/blog-read-time";
import { BlogTagBadge } from "../atoms/blog-tag-badge";

interface BlogCardProps {
  post: BlogPostCard;
}

const formatDate = (date: Date | null) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:border-border hover:shadow-md">
      <Link
        href={`/blog/${post.slug}`}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
        aria-label={`Read article: ${post.title}`}
      >
        {post.coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={post.coverImage}
              alt={`Cover image for ${post.title}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-5 space-y-3">
          <Typography.Heading3 className="line-clamp-2 transition-colors group-hover:text-primary">
            {post.title}
          </Typography.Heading3>
          <Typography.Caption color="secondary" className="line-clamp-2">
            {post.description}
          </Typography.Caption>
          <div className="flex items-center justify-between pt-2">
            <BlogAuthor name={post.authorName} avatar={post.authorAvatar} />
            <div className="flex items-center gap-3">
              <Typography.SubCaption color="secondary">
                {formatDate(post.publishedAt)}
              </Typography.SubCaption>
              <BlogReadTime minutes={post.readTimeMinutes} />
            </div>
          </div>
        </div>
      </Link>
      {post.tags.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <BlogTagBadge key={tag.slug} name={tag.name} slug={tag.slug} />
          ))}
        </div>
      )}
    </article>
  );
}
