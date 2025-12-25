import { generateAnalysis } from "@/lib/services/ai/ai-client";
import { extractJobDescriptionData } from "../extractor";

jest.mock("@/lib/services/ai/ai-client", () => {
  const generateAnalysis = jest.fn();
  return {
    aiClient: { client: {} },
    createAIClient: jest.fn(() => ({ client: {} })),
    generateAnalysis,
  };
});

const mockedGenerateAnalysis = generateAnalysis as jest.MockedFunction<
  typeof generateAnalysis
>;

describe("extractJobDescriptionData", () => {
  beforeEach(() => {
    mockedGenerateAnalysis.mockReset();
  });

  it("parses clean JSON output", async () => {
    mockedGenerateAnalysis.mockResolvedValue({
      success: true,
      content: JSON.stringify({
        summary: "Build modern frontend experiences for Acme shoppers.",
        position: "frontend",
        seniority: "mid",
        technologies: ["react", "typescript"],
        company: "Acme",
        requirements: "Deliver UI features",
        companyProfile: "startup",
      }),
    });

    const result = await extractJobDescriptionData("Sample job post");

    expect(result.position).toBe("frontend");
    expect(result.technologies).toEqual(["react", "typescript"]);
    expect(result.company).toBe("Acme");
  });

  it("repairs slightly malformed JSON content", async () => {
    // missing closing quote + trailing comma after array element
    const malformed =
      '{ "summary": "Role building APIs", "position": "backend", "seniority": "senior", "technologies": ["nodejs", ], }';
    mockedGenerateAnalysis.mockResolvedValue({
      success: true,
      content: malformed,
    });

    const result = await extractJobDescriptionData("Another job post");

    expect(result.position).toBe("backend");
    expect(result.seniority).toBe("senior");
    expect(result.technologies).toEqual([]);
  });
});
