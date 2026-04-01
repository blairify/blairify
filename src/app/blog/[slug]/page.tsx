import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogPostContent } from "@/components/blog/organisms/blog-post-content";
import { Typography } from "@/components/common/atoms/typography";
import { getPostBySlug, getPublishedPostSlugs } from "@/lib/blog/get-posts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPublishedPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found — Blairify Blog",
    };
  }

  return {
    title: `${post.title} — Blairify Blog`,
    description: post.description,
    openGraph: {
      title: `${post.title} — Blairify Blog`,
      description: post.description,
      url: `https://blairify.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Blairify Blog`,
      description: post.description,
      ...(post.coverImage ? { images: [post.coverImage] } : {}),
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Blairify",
      url: "https://blairify.com",
    },
    ...(post.coverImage
      ? {
          image: post.coverImage,
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 mb-8 rounded-md px-3 py-2 transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Back to all articles"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <Typography.CaptionMedium color="secondary">
            All articles
          </Typography.CaptionMedium>
        </Link>

        <BlogPostContent post={post} />
      </div>
    </>
  );
}
