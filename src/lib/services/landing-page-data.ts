import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: string;
  datePosted: string;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  isRemote?: boolean;
  companyLogo?: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  companyName: string;
  companyLogo: string;
  topicTags: string[];
}

export async function getFeaturedJobs(
  limit: number = 3,
): Promise<JobListing[]> {
  try {
    const jobs = await prisma.job.findMany({
      take: limit,
      orderBy: {
        datePosted: "desc",
      },
      where: {
        title: {
          not: null,
        },
        company: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        jobType: true,
        datePosted: true,
        minAmount: true,
        maxAmount: true,
        currency: true,
        isRemote: true,
        companyLogo: true,
      },
    });

    return jobs.map((job) => ({
      id: job.id,
      title: job.title || "Software Engineer",
      company: job.company || "Tech Company",
      location: job.location || "Remote",
      jobType: job.jobType || "Full-time",
      datePosted: job.datePosted?.toISOString() || new Date().toISOString(),
      minAmount: job.minAmount ? Number(job.minAmount) : undefined,
      maxAmount: job.maxAmount ? Number(job.maxAmount) : undefined,
      currency: job.currency || undefined,
      isRemote: job.isRemote || false,
      companyLogo: job.companyLogo || undefined,
    }));
  } catch (error) {
    console.error("Error fetching featured jobs:", error);
    // Return mock data as fallback
    return getMockJobs(limit);
  }
}

export async function getFeaturedPracticeQuestions(
  limit: number = 4,
): Promise<PracticeQuestion[]> {
  // Since we don't have a practice questions table in Prisma schema yet,
  // we'll return mock data for now. This can be replaced with actual DB queries later.
  return getMockPracticeQuestions(limit);
}

// Mock data functions for fallback
function getMockJobs(limit: number): JobListing[] {
  const mockJobs: JobListing[] = [
    {
      id: "1",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 120000,
      maxAmount: 180000,
      currency: "USD",
      isRemote: true,
    },
    {
      id: "2",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "New York, NY",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 100000,
      maxAmount: 150000,
      currency: "USD",
      isRemote: false,
    },
    {
      id: "3",
      title: "Software Engineer",
      company: "BigTech Inc",
      location: "Remote",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 140000,
      maxAmount: 200000,
      currency: "USD",
      isRemote: true,
    },
    {
      id: "4",
      title: "Backend Developer",
      company: "CloudCorp",
      location: "Seattle, WA",
      jobType: "Contract",
      datePosted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 80000,
      maxAmount: 120000,
      currency: "USD",
      isRemote: true,
    },
  ];

  return mockJobs.slice(0, limit);
}

function getMockPracticeQuestions(limit: number): PracticeQuestion[] {
  const mockQuestions: PracticeQuestion[] = [
    {
      id: "1",
      question:
        "Design a scalable chat application that can handle millions of users",
      category: "system-design",
      difficulty: "hard",
      companyName: "Meta",
      companyLogo: "SiMeta",
      topicTags: [
        "System Design",
        "Scalability",
        "WebSockets",
        "Microservices",
      ],
    },
    {
      id: "2",
      question:
        "Implement a function that finds two numbers in an array that sum to a target",
      category: "algorithms",
      difficulty: "easy",
      companyName: "Google",
      companyLogo: "SiGoogle",
      topicTags: ["Arrays", "Hash Table", "Two Pointers"],
    },
    {
      id: "3",
      question: "Build a responsive autocomplete search component in React",
      category: "frontend",
      difficulty: "medium",
      companyName: "Airbnb",
      companyLogo: "SiAirbnb",
      topicTags: ["React", "TypeScript", "Debouncing", "Accessibility"],
    },
    {
      id: "4",
      question:
        "Tell me about a time when you had to work with a difficult team member",
      category: "behavioral",
      difficulty: "medium",
      companyName: "Apple",
      companyLogo: "SiApple",
      topicTags: [
        "Communication",
        "Teamwork",
        "Conflict Resolution",
        "STAR Method",
      ],
    },
    {
      id: "5",
      question: "Design a database schema for an e-commerce platform",
      category: "database",
      difficulty: "medium",
      companyName: "Amazon",
      companyLogo: "SiAmazon",
      topicTags: ["Database Design", "SQL", "Normalization", "Indexing"],
    },
    {
      id: "6",
      question: "Implement a rate limiting system for an API",
      category: "backend",
      difficulty: "hard",
      companyName: "Stripe",
      companyLogo: "SiStripe",
      topicTags: [
        "Rate Limiting",
        "Redis",
        "API Design",
        "Distributed Systems",
      ],
    },
  ];

  return mockQuestions.slice(0, limit);
}
