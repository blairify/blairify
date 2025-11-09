/**
 * Tests for Jobs API Route - Edge Cases
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

describe("GET /api/jobs - Edge Cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should handle empty results", async () => {
    (prisma.job.count as jest.Mock).mockResolvedValue(0);
    (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/jobs?query=nonexistent",
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.results).toEqual([]);
    expect(data.total).toBe(0);
    expect(data.page_count).toBe(0);
  });

  it("should handle invalid limit values", async () => {
    (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

    const request = new Request("http://localhost:3000/api/jobs?limit=invalid");
    await GET(request);

    // parseInt('invalid', 10) returns NaN, which should be handled
    expect(prisma.job.findMany).toHaveBeenCalled();
  });

  it("should handle negative page numbers", async () => {
    (prisma.job.count as jest.Mock).mockResolvedValue(50);
    (prisma.job.findMany as jest.Mock).mockResolvedValue([]);

    const request = new Request(
      "http://localhost:3000/api/jobs?query=test&page=-1",
    );
    await GET(request);

    // Should still work, skip will be negative but database should handle it
    expect(prisma.job.findMany).toHaveBeenCalled();
  });
});
