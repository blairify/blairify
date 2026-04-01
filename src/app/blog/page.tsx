import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogList } from "@/components/blog/organisms/blog-list";
import { BlogTagFilter } from "@/components/blog/organisms/blog-tag-filter";
import LoadingPage from "@/components/common/atoms/loading-page";
import { Typography } from "@/components/common/atoms/typography";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { getAllTags, getPublishedPosts } from "@/lib/blog/get-posts";

export const metadata: Metadata = {
  title: "Tech News & Blog — Blairify",
  description:
    "Stay up to date with the latest tech news, engineering insights, and career advice from the Blairify team. Tips for developers, architects, and tech leads.",
  openGraph: {
    title: "Tech News & Blog — Blairify",
    description:
      "Stay up to date with the latest tech news, engineering insights, and career advice from the Blairify team.",
    url: "https://blairify.com/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech News & Blog — Blairify",
    description:
      "Stay up to date with the latest tech news, engineering insights, and career advice from the Blairify team.",
  },
  alternates: {
    canonical: "/blog",
  },
};

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;
  const [posts, tags] = await Promise.all([
    getPublishedPosts(tag),
    getAllTags(),
  ]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12">
      <div className="mb-8 space-y-2">
        <Typography.Heading1>Tech News</Typography.Heading1>
        <Typography.Body color="secondary">
          Engineering insights, career advice, and the latest from the tech
          world.
        </Typography.Body>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<LoadingPage message="Loading articles..." />}>
          <div className="space-y-8">
            <BlogTagFilter tags={tags} activeTagSlug={tag} />
            <BlogList posts={posts} />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
