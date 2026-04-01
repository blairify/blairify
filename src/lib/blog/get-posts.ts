import { prisma } from "@/lib/prisma";
import {
  getMockPostBySlug,
  getMockPostSlugs,
  getMockPosts,
  MOCK_TAGS_WITH_COUNTS,
} from "./mock-data";
import type { BlogPostCard, BlogPostFull } from "./types";

const BLOG_POST_CARD_SELECT = {
  slug: true,
  title: true,
  description: true,
  coverImage: true,
  authorName: true,
  authorAvatar: true,
  readTimeMinutes: true,
  publishedAt: true,
  tags: {
    select: {
      name: true,
      slug: true,
    },
  },
} as const;

export async function getPublishedPosts(
  tagSlug?: string,
): Promise<BlogPostCard[]> {
  try {
    return await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { not: null },
        ...(tagSlug ? { tags: { some: { slug: tagSlug } } } : {}),
      },
      select: BLOG_POST_CARD_SELECT,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    console.warn("[blog] DB unavailable, using mock data");
    return getMockPosts(tagSlug);
  }
}

export async function getPostBySlug(
  slug: string,
): Promise<BlogPostFull | null> {
  try {
    return await prisma.blogPost.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        publishedAt: { not: null },
      },
      include: { tags: true },
    });
  } catch {
    console.warn("[blog] DB unavailable, using mock data");
    return getMockPostBySlug(slug);
  }
}

export async function getAllTags() {
  try {
    return await prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
                publishedAt: { not: null },
              },
            },
          },
        },
      },
    });
  } catch {
    console.warn("[blog] DB unavailable, using mock tags");
    return MOCK_TAGS_WITH_COUNTS;
  }
}

export async function getPublishedPostSlugs(): Promise<string[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { not: null },
      },
      select: { slug: true },
    });
    return posts.map((post: { slug: string }) => post.slug);
  } catch {
    console.warn("[blog] DB unavailable, using mock slugs");
    return getMockPostSlugs();
  }
}
