import { Typography } from "@/components/common/atoms/typography";
import type { BlogPostCard } from "@/lib/blog/types";
import { BlogCard } from "../molecules/blog-card";

interface BlogListProps {
  posts: BlogPostCard[];
}

export function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Typography.Heading3>No articles found</Typography.Heading3>
        <Typography.Body color="secondary" className="mt-2">
          Check back later for new content.
        </Typography.Body>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
