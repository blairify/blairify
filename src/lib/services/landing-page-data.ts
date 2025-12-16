import { PrismaClient } from "@prisma/client";
import type { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

// Type for the Prisma job query result
type JobQueryResult = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  jobType: string | null;
  jobUrl: string | null;
  jobUrlDirect: string | null;
  datePosted: Date | null;
  minAmount: Decimal | null;
  maxAmount: Decimal | null;
  currency: string | null;
  isRemote: boolean | null;
  companyLogo: string | null;
};

export interface JobListing {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  jobType: string | null;
  jobUrl?: string | null;
  jobUrlDirect?: string | null;
  datePosted: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  currency?: string | null;
  isRemote?: boolean;
  companyLogo?: string | null;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  companyName: string;
  companyLogo: string;
  topicTags: string[];
}

// Helper function to filter for diverse job positions and companies
function filterForDiverseJobs(jobs: JobListing[], limit: number): JobListing[] {
  const selectedJobs: JobListing[] = [];
  const usedCompanies = new Set<string>();
  const usedPositionTypes = new Set<string>();

  // Define position type categories for diversity
  const getPositionType = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("frontend") || titleLower.includes("front-end"))
      return "frontend";
    if (titleLower.includes("backend") || titleLower.includes("back-end"))
      return "backend";
    if (
      titleLower.includes("fullstack") ||
      titleLower.includes("full-stack") ||
      titleLower.includes("full stack")
    )
      return "fullstack";
    if (titleLower.includes("data") || titleLower.includes("analytics"))
      return "data";
    if (titleLower.includes("devops") || titleLower.includes("infrastructure"))
      return "devops";
    if (
      titleLower.includes("mobile") ||
      titleLower.includes("ios") ||
      titleLower.includes("android")
    )
      return "mobile";
    if (
      titleLower.includes("manager") ||
      titleLower.includes("lead") ||
      titleLower.includes("director")
    )
      return "management";
    if (
      titleLower.includes("designer") ||
      titleLower.includes("ux") ||
      titleLower.includes("ui")
    )
      return "design";
    if (titleLower.includes("security") || titleLower.includes("cyber"))
      return "security";
    if (
      titleLower.includes("qa") ||
      titleLower.includes("test") ||
      titleLower.includes("quality")
    )
      return "qa";
    return "general";
  };

  // Sort jobs by salary (highest first) for better selection
  const sortedJobs = jobs.sort((a, b) => {
    const salaryA = Math.max(a.minAmount || 0, a.maxAmount || 0);
    const salaryB = Math.max(b.minAmount || 0, b.maxAmount || 0);
    return salaryB - salaryA;
  });

  // Select diverse jobs
  for (const job of sortedJobs) {
    if (selectedJobs.length >= limit) break;

    const company = job.company?.toLowerCase() || "";
    const positionType = getPositionType(job.title || "");

    // Prioritize jobs from different companies and position types
    const isNewCompany = !usedCompanies.has(company);
    const isNewPositionType = !usedPositionTypes.has(positionType);

    // Add job if it's from a new company or new position type, or if we need to fill remaining slots
    if (isNewCompany || isNewPositionType || selectedJobs.length < limit) {
      selectedJobs.push(job);
      if (company) usedCompanies.add(company);
      usedPositionTypes.add(positionType);
    }
  }

  return selectedJobs.slice(0, limit);
}

export async function getFeaturedJobs(
  limit: number = 3,
): Promise<JobListing[]> {
  try {
    // First, check if we have any jobs at all
    const totalJobs = await prisma.job.count();

    if (totalJobs === 0) {
      return getMockJobs(limit);
    }

    // First, get a larger pool of high-quality jobs with complete data
    const jobs = await prisma.job.findMany({
      take: limit * 10, // Get more jobs to filter from
      orderBy: [
        { maxAmount: "desc" }, // Prioritize high-salary jobs
        { datePosted: "desc" }, // Then by recency
      ],
      where: {
        // Ensure essential fields are present (simplified)
        title: { not: null },
        company: { not: null },
        // Removed strict location and jobType requirements for now
        // Filter for jobs with some salary info (lowered threshold)
        OR: [
          { minAmount: { gte: 30000 } },
          { maxAmount: { gte: 30000 } },
          { minAmount: { not: null } },
          { maxAmount: { not: null } },
        ],
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        jobType: true,
        jobUrl: true,
        jobUrlDirect: true,
        datePosted: true,
        minAmount: true,
        maxAmount: true,
        currency: true,
        isRemote: true,
        companyLogo: true,
      },
    });

    // Transform database results to JobListing format
    const transformedJobs: JobListing[] = jobs.map((job: JobQueryResult) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      jobUrl: job.jobUrl,
      jobUrlDirect: job.jobUrlDirect,
      datePosted: job.datePosted?.toISOString() || new Date().toISOString(),
      minAmount: job.minAmount ? Number(job.minAmount) : null,
      maxAmount: job.maxAmount ? Number(job.maxAmount) : null,
      currency: job.currency,
      isRemote: job.isRemote || false,
      companyLogo: job.companyLogo,
    }));

    // Filter for diverse positions and companies
    const diverseJobs = filterForDiverseJobs(transformedJobs, limit);

    // If no jobs pass the diversity filter, fall back to mock data
    if (diverseJobs.length === 0) return getMockJobs(limit);

    // Apply fallbacks for display
    return diverseJobs.map((job) => ({
      id: job.id,
      title: job.title || "Software Engineer",
      company: job.company || "Tech Company",
      location: job.location || "Remote",
      jobType: job.jobType || "Full-time",
      jobUrl: job.jobUrl,
      jobUrlDirect: job.jobUrlDirect,
      datePosted: job.datePosted,
      minAmount: job.minAmount,
      maxAmount: job.maxAmount,
      currency: job.currency || "USD",
      isRemote: job.isRemote || false,
      companyLogo: job.companyLogo,
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

// Mock data functions for fallback - High-quality, diverse, high-salary jobs
function getMockJobs(limit: number): JobListing[] {
  const mockJobs: JobListing[] = [
    {
      id: "1",
      title: "Senior Frontend Engineer",
      company: "Google",
      location: "Mountain View, CA",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 180000,
      maxAmount: 250000,
      currency: "USD",
      isRemote: false,
    },
    {
      id: "2",
      title: "Data Science Manager",
      company: "Netflix",
      location: "Los Gatos, CA",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 200000,
      maxAmount: 280000,
      currency: "USD",
      isRemote: true,
    },
    {
      id: "3",
      title: "DevOps Engineer",
      company: "Amazon",
      location: "Seattle, WA",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 150000,
      maxAmount: 220000,
      currency: "USD",
      isRemote: true,
    },
    {
      id: "4",
      title: "Mobile iOS Developer",
      company: "Apple",
      location: "Cupertino, CA",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 160000,
      maxAmount: 230000,
      currency: "USD",
      isRemote: false,
    },
    {
      id: "5",
      title: "Backend Software Engineer",
      company: "Meta",
      location: "Menlo Park, CA",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 170000,
      maxAmount: 240000,
      currency: "USD",
      isRemote: true,
    },
    {
      id: "6",
      title: "Security Engineer",
      company: "Microsoft",
      location: "Redmond, WA",
      jobType: "Full-time",
      datePosted: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      minAmount: 140000,
      maxAmount: 200000,
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
      answer:
        "Describe a microservices architecture with WebSocket gateways, message queues, sharding and replication. Explain how you handle presence, fan-out, durability and backpressure.",
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
      answer:
        "Use a hash map from value to index. For each number, compute target - num and check the map. If found, return the pair; otherwise store num in the map. Runs in O(n).",
      category: "algorithms",
      difficulty: "easy",
      companyName: "Google",
      companyLogo: "SiGoogle",
      topicTags: ["Arrays", "Hash Table", "Two Pointers"],
    },
    {
      id: "3",
      question: "Build a responsive autocomplete search component in React",
      answer:
        "Maintain controlled input state, debounce user typing, call a search API, and render a keyboard-accessible listbox. Handle loading, empty state and highlight the active option.",
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
      answer:
        "Use the STAR method: describe the situation, your task, specific actions to address the conflict (listening, expectations, boundaries) and the positive outcome or learning.",
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
      answer:
        "Identify core entities (users, products, orders, order_items, payments), define relationships and indexes for common queries. Consider normalization, inventory consistency and audit fields.",
      category: "database",
      difficulty: "medium",
      companyName: "Amazon",
      companyLogo: "SiAmazon",
      topicTags: ["Database Design", "SQL", "Normalization", "Indexing"],
    },
    {
      id: "6",
      question: "Implement a rate limiting system for an API",
      answer:
        "Explain token bucket or leaky bucket using Redis. Track requests per key, enforce limits per window, return 429 when exceeded and discuss correctness in distributed deployments.",
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
