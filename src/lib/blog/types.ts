export type BlogPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImage: string | null;
  authorName: string;
  authorAvatar: string | null;
  readTimeMinutes: number;
  status: BlogPostStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BlogPostWithTags = BlogPost & {
  tags: BlogTag[];
};

export interface BlogPostCard {
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  authorName: string;
  authorAvatar: string | null;
  readTimeMinutes: number;
  publishedAt: Date | null;
  tags: Pick<BlogTag, "name" | "slug">[];
}

export type BlogPostFull = BlogPostWithTags;
