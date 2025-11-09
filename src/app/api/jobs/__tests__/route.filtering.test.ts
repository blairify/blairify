/**
 * Tests for Jobs API Route - Advanced Filtering and Pagination
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

describe("GET /api/jobs - Filtering and Pagination", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Query Filtering", () => {
    it("should filter by query (title, description, company)", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(10);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?query=engineer",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: "engineer", mode: "insensitive" } },
              { description: { contains: "engineer", mode: "insensitive" } },
              { company: { contains: "engineer", mode: "insensitive" } },
            ],
          }),
        }),
      );
    });

    it("should filter by location", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(5);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?location=remote",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            location: { contains: "remote", mode: "insensitive" },
          }),
        }),
      );
    });

    it("should filter by level", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(3);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?level=senior",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            jobLevel: { contains: "senior", mode: "insensitive" },
          }),
        }),
      );
    });

    it("should filter by job type", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(8);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?type=full-time",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            jobType: { contains: "full-time", mode: "insensitive" },
          }),
        }),
      );
    });

    it("should filter by remote status (true)", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(12);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request("http://localhost:3000/api/jobs?remote=true");
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRemote: true,
          }),
        }),
      );
    });

    it("should filter by remote status (false)", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(6);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?remote=false",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRemote: false,
          }),
        }),
      );
    });

    it("should filter by company", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(4);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?company=google",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            company: { contains: "google", mode: "insensitive" },
          }),
        }),
      );
    });

    it("should filter by category", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(7);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?category=engineering",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            jobFunction: { contains: "engineering", mode: "insensitive" },
          }),
        }),
      );
    });

    it("should combine multiple filters", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(2);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?query=engineer&location=remote&level=senior&remote=true",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
            location: { contains: "remote", mode: "insensitive" },
            jobLevel: { contains: "senior", mode: "insensitive" },
            isRemote: true,
          }),
        }),
      );
    });
  });

  describe("Pagination", () => {
    it("should handle pagination with default values", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(50);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request("http://localhost:3000/api/jobs?query=test");
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // (1 - 1) * 20
          take: 20,
        }),
      );
    });

    it("should handle pagination with custom page and per_page", async () => {
      (prisma.job.count as jest.Mock).mockResolvedValue(100);
      (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request(
        "http://localhost:3000/api/jobs?query=test&page=3&per_page=10",
      );
      await GET(request);

      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3 - 1) * 10
          take: 10,
        }),
      );
    });

    it("should return pagination metadata", async () => {
      const mockJobs = Array(10).fill({
        id: "1",
        title: "Test Job",
      });

      (prisma.job.count as jest.Mock).mockResolvedValue(45);
      (prisma.job.findMany as jest.Mock).mockResolvedValue(mockJobs);

      const request = new Request(
        "http://localhost:3000/api/jobs?query=test&page=2&per_page=10",
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.page).toBe(2);
      expect(data.per_page).toBe(10);
      expect(data.total).toBe(45);
      expect(data.page_count).toBe(5); // Math.ceil(45 / 10)
      expect(data.results).toEqual(mockJobs);
      expect(data.jobs).toEqual(mockJobs); // Backward compatibility
    });
  });
});
