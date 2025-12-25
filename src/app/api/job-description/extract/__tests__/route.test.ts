import { POST } from "../route";

jest.mock("@/lib/services/job-description/extractor", () => ({
  extractJobDescriptionData: jest.fn(),
}));

const { extractJobDescriptionData } = jest.requireMock<
  typeof import("@/lib/services/job-description/extractor")
>("@/lib/services/job-description/extractor");

describe("POST /api/job-description/extract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects requests with short descriptions", async () => {
    const request = new Request(
      "http://localhost:3000/api/job-description/extract",
      {
        method: "POST",
        body: JSON.stringify({ description: "too short" }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error).toMatch(/at least 50 characters/i);
    expect(extractJobDescriptionData).not.toHaveBeenCalled();
  });

  it("returns structured AI extraction results", async () => {
    const mockData = {
      summary: "Great job summary",
      position: "frontend",
      seniority: "mid",
      technologies: ["react", "typescript"],
      company: "Acme",
      requirements: "Do stuff",
      companyProfile: "startup",
    };
    (extractJobDescriptionData as jest.Mock).mockResolvedValue(mockData);

    const request = new Request(
      "http://localhost:3000/api/job-description/extract",
      {
        method: "POST",
        body: JSON.stringify({ description: "A".repeat(200) }),
      },
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data).toEqual(mockData);
    expect(extractJobDescriptionData).toHaveBeenCalledWith("A".repeat(200));
  });

  it("handles extractor failures gracefully", async () => {
    (extractJobDescriptionData as jest.Mock).mockRejectedValue(
      new Error("boom"),
    );

    const request = new Request(
      "http://localhost:3000/api/job-description/extract",
      {
        method: "POST",
        body: JSON.stringify({ description: "A".repeat(200) }),
      },
    );

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const response = await POST(request);
      const payload = await response.json();

      expect(response.status).toBe(500);
      expect(payload.success).toBe(false);
      expect(payload.error).toBe("boom");
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
