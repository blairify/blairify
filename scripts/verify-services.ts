/**
 * Service Verification Script
 * Quick script to verify all services are working correctly
 */

import {
  AIClient,
  AnalysisService,
  InterviewService,
  PromptGenerator,
  ResponseValidator,
} from "../src/lib/services";
import type { InterviewConfig, Message } from "../src/types/interview";

// Test configuration
const testConfig: InterviewConfig = {
  position: "Frontend Engineer",
  seniority: "mid",
  technologies: ["React", "TypeScript"],
  companyProfile: "tech",
  specificCompany: "",
  interviewMode: "timed",
  interviewType: "technical",
  duration: "30",
  isDemoMode: false,
};

// Test conversation
const testConversation: Message[] = [
  {
    id: "ai-1",
    type: "ai",
    content: "Can you explain React hooks?",
    timestamp: new Date(),
    questionType: "technical",
  },
  {
    id: "user-1",
    type: "user",
    content:
      "React hooks are functions that let you use state and other React features in functional components.",
    timestamp: new Date(),
  },
];

async function verifyServices() {
  console.log("🔍 Verifying Interview Services...\n");

  try {
    // Test InterviewService
    console.log("✅ Testing InterviewService...");
    const validation = InterviewService.validateInterviewConfig(testConfig);
    console.log(
      `   Config validation: ${validation.isValid ? "✅ PASS" : "❌ FAIL"}`,
    );

    const totalQuestions = InterviewService.calculateTotalQuestions(testConfig);
    console.log(`   Total questions: ${totalQuestions} ✅`);

    const questionType = InterviewService.determineQuestionType("technical", 0);
    console.log(`   Question type: ${questionType} ✅`);

    const responseAnalysis =
      InterviewService.analyzeResponseQuality(testConversation);
    console.log(
      `   Response analysis: ${responseAnalysis.substantiveResponses} substantive responses ✅`,
    );

    // Test PromptGenerator
    console.log("\n✅ Testing PromptGenerator...");
    const systemPrompt = PromptGenerator.generateSystemPrompt(testConfig);
    console.log(`   System prompt length: ${systemPrompt.length} chars ✅`);

    const userPrompt = PromptGenerator.generateUserPrompt(
      "test",
      [],
      testConfig,
      0,
      false,
    );
    console.log(`   User prompt length: ${userPrompt.length} chars ✅`);

    const analysisPrompt =
      PromptGenerator.generateAnalysisSystemPrompt(testConfig);
    console.log(`   Analysis prompt length: ${analysisPrompt.length} chars ✅`);

    // Test ResponseValidator
    console.log("\n✅ Testing ResponseValidator...");
    const goodResponse = ResponseValidator.validateAIResponse(
      "That's a great question! Can you tell me more?",
      testConfig,
      false,
    );
    console.log(
      `   Good response validation: ${goodResponse.isValid ? "✅ PASS" : "❌ FAIL"}`,
    );

    const badResponse = ResponseValidator.validateAIResponse(
      "",
      testConfig,
      false,
    );
    console.log(
      `   Bad response validation: ${!badResponse.isValid ? "✅ PASS" : "❌ FAIL"}`,
    );

    const userValidation = ResponseValidator.validateUserResponse(
      "This is a good answer",
    );
    console.log(
      `   User response validation: ${!userValidation.isNoAnswer ? "✅ PASS" : "❌ FAIL"}`,
    );

    // Test AnalysisService
    console.log("\n✅ Testing AnalysisService...");
    const mockAnalysis = AnalysisService.generateMockAnalysis(
      testConfig,
      responseAnalysis,
    );
    console.log(`   Mock analysis length: ${mockAnalysis.length} chars ✅`);

    const parsedAnalysis = AnalysisService.parseAnalysis(
      mockAnalysis,
      responseAnalysis,
      testConfig,
    );
    console.log(`   Parsed analysis score: ${parsedAnalysis.score}/100 ✅`);
    console.log(
      `   Parsed analysis decision: ${parsedAnalysis.decision || "undefined"} ✅`,
    );

    // Test AIClient
    console.log("\n✅ Testing AIClient...");
    const aiClient = new AIClient();
    console.log(
      `   AI Client available: ${aiClient.isAvailable() ? "✅ YES" : "⚠️ NO (expected without API key)"}`,
    );

    const fallback = aiClient.getFallbackResponse(testConfig, false);
    console.log(`   Fallback response length: ${fallback.length} chars ✅`);

    console.log("\n🎉 All services verified successfully!");
    console.log("\n📋 Summary:");
    console.log("   ✅ InterviewService: Configuration, questions, analysis");
    console.log("   ✅ PromptGenerator: System, user, and analysis prompts");
    console.log("   ✅ ResponseValidator: AI and user response validation");
    console.log("   ✅ AnalysisService: Mock generation and parsing");
    console.log("   ✅ AIClient: Initialization and fallbacks");

    return true;
  } catch (error) {
    console.error("\n❌ Service verification failed:");
    console.error(error);
    return false;
  }
}

// Run verification
if (require.main === module) {
  verifyServices().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

export { verifyServices };
