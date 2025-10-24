import { PrismaClient } from "@prisma/client";
import type { MetadataRoute } from "next";

const prisma = new PrismaClient();

export default async function jobsSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://blairify.com"; // Update with your actual domain

  try {
    // Get recent job listings for sitemap
    const jobs = await prisma.job.findMany({
      where: {
        title: { not: null },
        company: { not: null },
        datePosted: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        id: true,
        datePosted: true,
        updatedAt: true,
      },
      take: 1000, // Limit to prevent sitemap from being too large
      orderBy: {
        datePosted: "desc",
      },
    });

    return jobs.map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.updatedAt.toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Error generating jobs sitemap:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}
