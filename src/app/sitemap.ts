import { PrismaClient } from "@prisma/client";
import type { MetadataRoute } from "next";

const BASE_URL = "https://blairify.com";
const MS_PER_DAY = 86_400_000;
const JOB_WINDOW_DAYS = 30;
const JOB_LIMIT = 500;

const prisma = new PrismaClient();

async function fetchBlogEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { not: null },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    return [
      {
        url: `${BASE_URL}/blog`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
      ...posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt.toISOString(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
    return [];
  }
}

async function fetchJobEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const recentJobs = await prisma.job.findMany({
      where: {
        title: { not: null },
        company: { not: null },
        datePosted: {
          gte: new Date(Date.now() - JOB_WINDOW_DAYS * MS_PER_DAY),
        },
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: JOB_LIMIT,
      orderBy: { datePosted: "desc" },
    });

    return recentJobs.map((job) => ({
      url: `${BASE_URL}/jobs/${job.id}`,
      lastModified: job.updatedAt.toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching jobs for sitemap:", error);
    return [];
  }
}

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/jobs", changeFrequency: "hourly", priority: 0.9 },
  { path: "/configure", changeFrequency: "weekly", priority: 0.8 },
  { path: "/auth", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms-of-service", changeFrequency: "monthly", priority: 0.3 },
  { path: "/cookie-policy", changeFrequency: "monthly", priority: 0.2 },
  { path: "/legal-notice", changeFrequency: "monthly", priority: 0.2 },
  { path: "/gdpr-rights", changeFrequency: "monthly", priority: 0.2 },
  {
    path: "/data-processing-agreement",
    changeFrequency: "monthly",
    priority: 0.2,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    lastModified: currentDate,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const [jobEntries, blogEntries] = await Promise.all([
    fetchJobEntries(),
    fetchBlogEntries(),
  ]);

  await prisma.$disconnect();

  return [...staticEntries, ...blogEntries, ...jobEntries];
}
