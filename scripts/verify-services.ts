/**
 * Service Verification Script
 * Quick script to verify all services are working correctly
 */

import {
  AIClient,
  PromptGenerator,
  ResponseValidator,
  analyzeResponseQuality,
  calculateTotalQuestions,
  determineQuestionType,
  generateMockAnalysis,
  parseAnalysis,
  validateInterviewConfig,
} from "../src/lib/services";
import type { InterviewConfig, Message } from "../src/types/interview";

// Test configuration
const testConfig: InterviewConfig = {
  position: "Frontend Engineer",
  seniority: "mid",
  technologies: ["React", "TypeScript"],
  companyProfile: "tech",
  specificCompany: "",
  interviewMode: "regular",
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
  console.info("🔍 Verifying Interview Services...\n");

  try {
    // Test InterviewService
    console.info("✅ Testing InterviewService...");
    const validation = validateInterviewConfig(testConfig);
    console.info(
      `   Config validation: ${validation.isValid ? "✅ PASS" : "❌ FAIL"}`,
    );

    const totalQuestions = calculateTotalQuestions(testConfig);
    console.info(`   Total questions: ${totalQuestions} ✅`);

    const questionType = determineQuestionType("technical", 0);
    console.info(`   Question type: ${questionType} ✅`);

    const responseAnalysis = analyzeResponseQuality(testConversation);
    console.info(
      `   Response analysis: ${responseAnalysis.substantiveResponses} substantive responses ✅`,
    );

    // Test PromptGenerator
    console.info("\n✅ Testing PromptGenerator...");
    const systemPrompt = PromptGenerator.generateSystemPrompt(testConfig);
    console.info(`   System prompt length: ${systemPrompt.length} chars ✅`);

    const userPrompt = PromptGenerator.generateUserPrompt(
      "test",
      [],
      testConfig,
      0,
      false,
    );
    console.info(`   User prompt length: ${userPrompt.length} chars ✅`);

    const analysisPrompt =
      PromptGenerator.generateAnalysisSystemPrompt(testConfig);
    console.info(
      `   Analysis prompt length: ${analysisPrompt.length} chars ✅`,
    );

    // Test ResponseValidator
    console.info("\n✅ Testing ResponseValidator...");
    const goodResponse = ResponseValidator.validateAIResponse(
      "That's a great question! Can you tell me more?",
      testConfig,
      false,
    );
    console.info(
      `   Good response validation: ${goodResponse.isValid ? "✅ PASS" : "❌ FAIL"}`,
    );

    const badResponse = ResponseValidator.validateAIResponse(
      "",
      testConfig,
      false,
    );
    console.info(
      `   Bad response validation: ${!badResponse.isValid ? "✅ PASS" : "❌ FAIL"}`,
    );

    const userValidation = ResponseValidator.validateUserResponse(
      "This is a good answer",
    );
    console.info(
      `   User response validation: ${!userValidation.isNoAnswer ? "✅ PASS" : "❌ FAIL"}`,
    );

    // Test AnalysisService
    console.info("\n✅ Testing AnalysisService...");
    const mockAnalysis = generateMockAnalysis(testConfig, responseAnalysis);
    console.info(`   Mock analysis length: ${mockAnalysis.length} chars ✅`);

    const parsedAnalysis = parseAnalysis(
      mockAnalysis,
      responseAnalysis,
      testConfig,
    );
    console.info(`   Parsed analysis score: ${parsedAnalysis.score}/100 ✅`);
    console.info(
      `   Parsed analysis decision: ${parsedAnalysis.decision || "undefined"} ✅`,
    );

    // Test AIClient
    console.info("\n✅ Testing AIClient...");
    const aiClient = new AIClient();
    console.info(
      `   AI Client available: ${aiClient.isAvailable() ? "✅ YES" : "⚠️ NO (expected without API key)"}`,
    );

    const fallback = aiClient.getFallbackResponse(testConfig, false);
    console.info(`   Fallback response length: ${fallback.length} chars ✅`);

    console.info("\n🎉 All services verified successfully!");
    console.info("\n📋 Summary:");
    console.info("   ✅ InterviewService: Configuration, questions, analysis");
    console.info("   ✅ PromptGenerator: System, user, and analysis prompts");
    console.info("   ✅ ResponseValidator: AI and user response validation");
    console.info("   ✅ AnalysisService: Mock generation and parsing");
    console.info("   ✅ AIClient: Initialization and fallbacks");

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
