import { type NextRequest, NextResponse } from "next/server";
import {
  determineQuestionType,
  generateSystemPrompt,
  generateUserPrompt,
  getDatabaseQuestionsPrompt,
  getInterviewerForCompanyAndRole,
  getInterviewerForRole,
  type InterviewConfig,
  validateInterviewConfig,
} from "@/lib/interview";
import { getServerAuth } from "@/lib/server-auth";
import {
  aiClient,
  generateInterviewResponse,
  getFallbackResponse,
} from "@/lib/services/ai/ai-client";
import { validateAIResponse } from "@/lib/services/ai/response-validator";
import { checkAndIncrementUsage } from "@/lib/services/users/usage-limits.server";

const MAX_SEED_QUESTION_LENGTH = 400;
const MAX_SEED_ANSWER_LENGTH = 2000;
const GUEST_DEMO_COOKIE_NAME = "guest-demo-used";
const GUEST_DEMO_COOKIE_VALUE = "1";

function normalizeSeedInput(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewConfig, seedQuestion, seedAnswer } = body as {
      interviewConfig?: unknown;
      seedQuestion?: unknown;
      seedAnswer?: unknown;
      userId?: unknown;
    };

    const { user: authenticatedUser } = await getServerAuth();
    const authenticatedUserId = authenticatedUser?.uid ?? null;

    const guestDemoUsed =
      request.cookies.get(GUEST_DEMO_COOKIE_NAME)?.value ===
      GUEST_DEMO_COOKIE_VALUE;
    const isGuest = !authenticatedUserId;

    if (isGuest && guestDemoUsed) {
      return NextResponse.json(
        {
          success: false,
          error: "Guest demo already used. Create an account to continue.",
          code: "GUEST_DEMO_USED",
        },
        { status: 403 },
      );
    }

    if (!interviewConfig || typeof interviewConfig !== "object") {
      return NextResponse.json(
        { success: false, error: "Interview configuration is required" },
        { status: 400 },
      );
    }

    const typedInterviewConfig = interviewConfig as InterviewConfig;

    if (authenticatedUserId) {
      try {
        console.log(
          "🔍 Checking usage limits for authenticatedUserId:",
          authenticatedUserId,
        );
        const allowed = await checkAndIncrementUsage(authenticatedUserId);
        console.log("🔍 Usage check result:", {
          authenticatedUserId,
          allowed,
        });
        if (!allowed) {
          console.log("🚫 User hit hourly limit, blocking interview start");
          return NextResponse.json(
            {
              success: false,
              error:
                "Hourly interview limit reached (2/2). Upgrade to Pro for unlimited access.",
              code: "LIMIT_EXCEEDED",
            },
            { status: 403 },
          );
        }
      } catch (error) {
        console.error("❌ Failed to check usage limits:", error);
        // Fail closed - if we can't verify limits, don't allow the interview
        return NextResponse.json(
          {
            success: false,
            error: "Unable to verify usage limits. Please try again.",
          },
          { status: 500 },
        );
      }
    } else {
      console.log("⚠️ No userId provided, skipping usage check");
    }

    const effectiveInterviewConfig: InterviewConfig = isGuest
      ? {
          ...typedInterviewConfig,
          isDemoMode: true,
          interviewMode: "flash",
        }
      : typedInterviewConfig;

    const configValidation = validateInterviewConfig(effectiveInterviewConfig);
    if (!configValidation.isValid) {
      console.error("❌ Interview configuration validation failed:", {
        errors: configValidation.errors,
        config: effectiveInterviewConfig,
      });
      return NextResponse.json(
        {
          success: false,
          error: `Invalid configuration: ${configValidation.errors.join(", ")}`,
          details: configValidation.errors,
        },
        { status: 400 },
      );
    }

    const interviewer = effectiveInterviewConfig.specificCompany
      ? getInterviewerForCompanyAndRole(
          effectiveInterviewConfig.specificCompany,
          effectiveInterviewConfig.position,
        )
      : getInterviewerForRole(effectiveInterviewConfig.position);

    const { getQuestionCountForMode } = await import("@/lib/interview");
    const totalQuestions = getQuestionCountForMode(
      effectiveInterviewConfig.interviewMode,
      effectiveInterviewConfig.isDemoMode,
    );

    const baseUrl = request.nextUrl.origin;

    const shouldUseQuestionBank =
      effectiveInterviewConfig.interviewType !== "situational";
    const { prompt: questionsPrompt, questionIds } = shouldUseQuestionBank
      ? await getDatabaseQuestionsPrompt(
          effectiveInterviewConfig,
          totalQuestions,
          baseUrl,
        )
      : { prompt: "", questionIds: [] };

    console.log("📚 Loaded questions from database:", {
      totalQuestions,
      loadedQuestions: questionIds.length,
      interviewMode: effectiveInterviewConfig.interviewMode,
    });

    const systemPrompt =
      generateSystemPrompt(effectiveInterviewConfig, interviewer) +
      questionsPrompt;

    let firstQuestionPrompt: string | undefined;

    if (
      Array.isArray(questionIds) &&
      questionIds.length > 0 &&
      !effectiveInterviewConfig.isDemoMode
    ) {
      try {
        const { getQuestionById } = await import(
          "@/lib/services/questions/neon-question-repository"
        );
        const firstQuestion = await getQuestionById(questionIds[0]);
        firstQuestionPrompt = firstQuestion?.prompt;
      } catch (error) {
        console.error(
          "Failed to load first Neon question for interview start:",
          {
            error,
          },
        );
      }
    }

    const normalizedSeedQuestion = normalizeSeedInput(
      seedQuestion,
      MAX_SEED_QUESTION_LENGTH,
    );
    const normalizedSeedAnswer = normalizeSeedInput(
      seedAnswer,
      MAX_SEED_ANSWER_LENGTH,
    );

    const hasSeed = !!(
      normalizedSeedQuestion &&
      normalizedSeedAnswer &&
      !effectiveInterviewConfig.isDemoMode
    );

    const initialQuestionIndex = hasSeed ? 1 : 0;

    const userPrompt = hasSeed
      ? generateUserPrompt(
          normalizedSeedAnswer,
          [
            {
              id: "seed-ai",
              type: "ai",
              content: normalizedSeedQuestion,
              timestamp: new Date(),
            },
            {
              id: "seed-user",
              type: "user",
              content: normalizedSeedAnswer,
              timestamp: new Date(),
            },
          ],
          effectiveInterviewConfig,
          1,
          false,
          interviewer,
          firstQuestionPrompt,
        )
      : generateUserPrompt(
          "",
          [],
          effectiveInterviewConfig,
          0,
          false,
          interviewer,
          firstQuestionPrompt,
        );

    const aiResponse = await generateInterviewResponse(
      aiClient,
      systemPrompt,
      userPrompt,
      effectiveInterviewConfig.interviewType,
    );

    let finalMessage = aiResponse.content;

    if (!aiResponse.success) {
      console.warn(`AI response failed: ${aiResponse.error}`);
      finalMessage = getFallbackResponse(effectiveInterviewConfig, false);
    }

    if (typeof finalMessage === "string" && finalMessage.trim().length > 0) {
      const validation = validateAIResponse(
        finalMessage,
        effectiveInterviewConfig,
        false,
      );
      if (validation.isValid && validation.sanitized) {
        finalMessage = validation.sanitized;
      }
    }

    if (finalMessage) {
      finalMessage = finalMessage
        .replace(/\s*\[BANK_QUESTION_INDEX:\s*\d+\]\s*$/gi, "")
        .trim();
    }

    const questionType = determineQuestionType(
      effectiveInterviewConfig.interviewType,
      initialQuestionIndex,
    );

    const response = NextResponse.json({
      success: true,
      message: finalMessage,
      questionType,
      currentQuestionCount: hasSeed ? 2 : 1,
      validated: aiResponse.success,
      interviewer: {
        id: interviewer.id,
        name: interviewer.name,
        avatarConfig: interviewer.avatarConfig,
      },
      questionIds,
      usage: aiResponse.usage,
    });

    if (isGuest) {
      const shouldUseSecureCookie = request.nextUrl.protocol === "https:";
      response.cookies.set({
        name: GUEST_DEMO_COOKIE_NAME,
        value: GUEST_DEMO_COOKIE_VALUE,
        httpOnly: true,
        sameSite: "strict",
        secure: shouldUseSecureCookie,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch (error) {
    console.error("Interview start API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start interview. Please try again.",
      },
      { status: 500 },
    );
  }
}
