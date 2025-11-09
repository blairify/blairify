/**
 * Tests for Jobs API Route - Featured Jobs (Simple Mode)
 */

import { prisma } from "@/lib/prisma";
import { GET } from "../route";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("GET /api/jobs - Featured Jobs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return featured jobs with limit", async () => {
    const mockJobs = [
      {
        id: "1",
        title: "Software Engineer",
        company: "Tech Corp",
        location: "Remote",
        datePosted: new Date("2024-01-01"),
      },
      {
        id: "2",
        title: "Frontend Developer",
        company: "Web Inc",
        location: "New York",
        datePosted: new Date("2024-01-02"),
      },
    ];

    (prisma.job.findMany as jest.Mock).mockResolvedValue(mockJobs);

    const request = new Request("http://localhost:3000/api/jobs?limit=2");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobs).toHaveLength(2);
    expect(data.jobs[0].id).toBe("1");
    expect(data.jobs[0].title).toBe("Software Engineer");
    expect(data.jobs[1].id).toBe("2");
    expect(data.jobs[1].title).toBe("Frontend Developer");
    expect(prisma.job.findMany).toHaveBeenCalledWith({
      orderBy: { datePosted: "desc" },
      take: 2,
    });
  });

  it("should parse limit as integer", async () => {
    (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/jobs?limit=5");
    await GET(request);

    expect(prisma.job.findMany).toHaveBeenCalledWith({
      orderBy: { datePosted: "desc" },
      take: 5,
    });
  });
});
