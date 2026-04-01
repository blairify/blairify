import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Typography } from "@/components/common/atoms/typography";
import type { BlogPostFull } from "@/lib/blog/types";
import { BlogMetadata } from "../molecules/blog-metadata";

interface BlogPostContentProps {
  post: BlogPostFull;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <article className="mx-auto max-w-3xl">
      {post.coverImage && (
        <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.coverImage}
            alt={`Cover image for ${post.title}`}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <Typography.Heading1 className="mb-4">{post.title}</Typography.Heading1>

      <Typography.Body color="secondary" className="mb-6">
        {post.description}
      </Typography.Body>

      <BlogMetadata
        authorName={post.authorName}
        authorAvatar={post.authorAvatar}
        publishedAt={post.publishedAt}
        readTimeMinutes={post.readTimeMinutes}
        tags={post.tags}
      />

      <hr className="my-8 border-border" />

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
      </div>
    </article>
  );
}
