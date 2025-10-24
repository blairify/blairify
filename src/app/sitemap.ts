import { PrismaClient } from "@prisma/client";
import type { MetadataRoute } from "next";

const prisma = new PrismaClient();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://blairify.com"; // Update with your actual domain
  const currentDate = new Date().toISOString();

  // Get recent job listings for dynamic sitemap entries
  let jobEntries: MetadataRoute.Sitemap = [];

  try {
    const recentJobs = await prisma.job.findMany({
      where: {
        title: { not: null },
        company: { not: null },
        datePosted: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        id: true,
        datePosted: true,
        updatedAt: true,
      },
      take: 100, // Limit for main sitemap
      orderBy: {
        datePosted: "desc",
      },
    });

    jobEntries = recentJobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.updatedAt.toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error fetching jobs for sitemap:", error);
  } finally {
    await prisma.$disconnect();
  }

  const staticPages: MetadataRoute.Sitemap = [
    // Main pages - highest priority
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: currentDate,
      changeFrequency: "hourly", // Job listings change frequently
      priority: 0.9,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Legal pages - important for compliance, lower priority
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/legal-notice`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/gdpr-rights`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: `${baseUrl}/data-processing-agreement`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  // Combine static pages with dynamic job entries
  return [...staticPages, ...jobEntries];
}
