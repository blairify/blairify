/**
 * Tests for Jobs API Route - Error Handling
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

describe("GET /api/jobs - Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Suppress console.error for these tests since we're intentionally triggering errors
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should handle database errors gracefully", async () => {
    (prisma.job.findMany as jest.Mock).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const request = new Request("http://localhost:3000/api/jobs?limit=5");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("Failed to fetch jobs");
    expect(data.details).toBe("Database connection failed");
    expect(data.jobs).toEqual([]);
  });

  it("should handle unknown errors", async () => {
    (prisma.job.findMany as jest.Mock).mockRejectedValue("Unknown error");

    const request = new Request("http://localhost:3000/api/jobs?limit=3");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.details).toBe("Unknown error");
  });
});
