/**
 * Interview Sessions Database Operations
 */

import {
  collection,
  type DocumentData,
  doc,
  limit,
  orderBy,
  type Query,
  type QueryDocumentSnapshot,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import {
  safeDeleteDoc,
  safeGetDoc,
  safeGetDocs,
  safeSetDoc,
  safeUpdateDoc,
} from "@/lib/firestore-utils";
import {
  analyzeResponseCharacteristics,
  validateUserResponse,
} from "@/lib/services/ai/response-validator";
import { getPracticeQuestionById } from "@/lib/services/practice-questions/practice-questions-service";
import type {
  InterviewQuestion,
  InterviewResponse,
  InterviewSession,
  InterviewType,
  SeniorityLevel,
  SessionStatus,
} from "@/types/firestore";
import type { InterviewResults } from "@/types/interview";
import { COLLECTIONS, ensureDatabase } from "../common/database-common";

const SENIORITY_LEVELS: SeniorityLevel[] = ["entry", "junior", "mid", "senior"];

function hasMeaningfulResponses(session: InterviewSession): boolean {
  const responses = Array.isArray(session.responses) ? session.responses : [];
  return responses.some((r) => {
    if (typeof r.response === "string" && r.response.trim().length > 0)
      return true;
    return (r.score ?? 0) > 0;
  });
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function computeResponseSubscores(response: string): {
  overall: number;
  technical: number;
  communication: number;
  problemSolving: number;
} {
  const trimmed = response.trim();
  if (!trimmed) {
    return { overall: 0, technical: 0, communication: 0, problemSolving: 0 };
  }

  const user = validateUserResponse(trimmed);
  if (user.isNoAnswer || user.isGibberish) {
    return { overall: 0, technical: 0, communication: 0, problemSolving: 0 };
  }

  const analysis = analyzeResponseCharacteristics(trimmed);

  const communicationBase =
    (analysis.hasExplanation ? 45 : 15) +
    (analysis.responseLength >= 80
      ? 25
      : analysis.responseLength >= 30
        ? 15
        : 5);

  const technicalBase =
    (analysis.mentionsTechnology ? 35 : 10) +
    (analysis.hasCodeExample ? 35 : 0) +
    (analysis.hasExplanation ? 20 : 10);

  const problemSolvingBase =
    (analysis.hasExplanation ? 40 : 10) +
    (analysis.hasCodeExample ? 35 : 0) +
    (analysis.responseLength >= 120
      ? 25
      : analysis.responseLength >= 60
        ? 15
        : 5);

  const penalty = user.isVeryShort ? 25 : 0;

  let communication = clampScore(communicationBase - penalty);
  let technical = clampScore(technicalBase - penalty);
  let problemSolving = clampScore(problemSolvingBase - penalty);

  if (communication === technical && technical === problemSolving) {
    if (analysis.hasCodeExample) {
      communication = clampScore(communication + 2);
      technical = clampScore(technical + 1);
      problemSolving = clampScore(problemSolving - 3);
    } else if (analysis.hasExplanation) {
      communication = clampScore(communication + 1);
      technical = clampScore(technical + 2);
      problemSolving = clampScore(problemSolving - 3);
    } else {
      communication = clampScore(communication + 1);
      technical = clampScore(technical - 1);
    }
  }

  const overall = clampScore((technical + communication + problemSolving) / 3);
  return { overall, technical, communication, problemSolving };
}

function shouldPersistScores(interviewMode: string | undefined): boolean {
  return interviewMode !== "teacher";
}

function parseSeniorityLevel(value: string): SeniorityLevel {
  const normalized = value.toLowerCase() as SeniorityLevel;
  return SENIORITY_LEVELS.includes(normalized) ? normalized : "mid";
}

function mapDifficultyLevelToScore(level: "easy" | "medium" | "hard"): number {
  switch (level) {
    case "easy":
      return 3;
    case "medium":
      return 5;
    case "hard":
      return 7;
    default: {
      const _never: never = level;
      throw new Error(`Unhandled difficulty level: ${_never}`);
    }
  }
}

function mapSeniorityToDifficultyScore(level: SeniorityLevel): number {
  switch (level) {
    case "entry":
      return 3;
    case "junior":
      return 5;
    case "mid":
      return 7;
    case "senior":
      return 9;
    default: {
      const _never: never = level;
      throw new Error(`Unhandled seniority level: ${_never}`);
    }
  }
}

// ================================
// INTERVIEW SESSIONS OPERATIONS
// ================================

export async function createSession(
  userId: string,
  sessionData: Omit<InterviewSession, "sessionId" | "createdAt" | "updatedAt">,
): Promise<string> {
  try {
    const database = ensureDatabase();
    const sessionsRef = collection(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
    );
    const sessionDoc = doc(sessionsRef);

    const session: InterviewSession = {
      ...sessionData,
      sessionId: sessionDoc.id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await safeSetDoc(sessionDoc, session);
    return sessionDoc.id;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

export async function getSession(
  userId: string,
  sessionId: string,
): Promise<InterviewSession | null> {
  try {
    const database = ensureDatabase();
    const sessionRef = doc(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
      sessionId,
    );
    const sessionDoc = await safeGetDoc(sessionRef);

    if (sessionDoc.exists()) {
      return sessionDoc.data() as InterviewSession;
    }
    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    throw error;
  }
}

export async function getUserSessions(
  userId: string,
  limitCount: number = 10,
  status?: SessionStatus,
): Promise<InterviewSession[]> {
  try {
    const database = ensureDatabase();
    const sessionsRef = collection(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
    );

    let q: Query<DocumentData, DocumentData>;
    // Add status filter if provided
    if (status) {
      q = query(
        sessionsRef,
        where("status", "==", status),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );
    } else {
      q = query(sessionsRef, orderBy("createdAt", "desc"), limit(limitCount));
    }

    const snapshot = await safeGetDocs(q);

    // Handle empty collection gracefully
    if (snapshot.empty) {
      return [];
    }

    const sessions = snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) =>
        doc.data() as InterviewSession,
    );

    return sessions.filter(hasMeaningfulResponses);
  } catch (error) {
    console.error("Error getting user sessions:", error);
    // Return empty array for new users rather than throwing
    if (error instanceof Error && error.message.includes("collection")) {
      return [];
    }
    throw error;
  }
}

export async function updateSession(
  userId: string,
  sessionId: string,
  updates: Partial<InterviewSession>,
): Promise<InterviewSession | null> {
  try {
    const database = ensureDatabase();
    const sessionRef = doc(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
      sessionId,
    );
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await safeUpdateDoc(sessionRef, updateData);

    // Get and return the updated session
    const updatedDoc = await safeGetDoc(sessionRef);
    if (updatedDoc.exists()) {
      return updatedDoc.data() as InterviewSession;
    }
    return null;
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
}

export async function deleteSession(
  userId: string,
  sessionId: string,
): Promise<void> {
  try {
    const database = ensureDatabase();
    const sessionRef = doc(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
      sessionId,
    );

    await safeDeleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
}

export async function saveInterviewResults(
  userId: string,
  sessionData: {
    messages: Array<{
      type: string;
      content: string;
      timestamp?: Date | string;
      isFollowUp?: boolean;
    }>;
    questionIds?: string[];
    exampleAnswers?: string[];
    followUpExampleAnswers?: string[];
    isComplete: boolean;
    startTime?: Date | string;
    endTime?: Date | string;
    endedEarly?: boolean;
    termination?: {
      reason: "language" | "profanity" | "inappropriate-behavior";
      message: string;
      at?: Date | string;
    };
    tokenUsage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  },
  config: {
    position: string;
    seniority: string;
    interviewType: string;
    interviewMode: string;
    duration: number;
    specificCompany?: string;
  },
  analysis: InterviewResults,
  existingSessionId?: string | null,
): Promise<string> {
  try {
    const database = ensureDatabase();
    const sessionsRef = collection(
      database,
      COLLECTIONS.USERS,
      userId,
      COLLECTIONS.SESSIONS,
    );

    const startedAtTimestamp = sessionData.startTime
      ? Timestamp.fromDate(new Date(sessionData.startTime))
      : Timestamp.now();

    const completedAtTimestamp = sessionData.endTime
      ? Timestamp.fromDate(new Date(sessionData.endTime))
      : Timestamp.now();

    const resolvedExistingSessionId = await (async (): Promise<
      string | null
    > => {
      if (existingSessionId != null && existingSessionId !== "") {
        return existingSessionId;
      }

      if (!sessionData.startTime) return null;

      const candidateQuery = query(
        sessionsRef,
        where("startedAt", "==", startedAtTimestamp),
        where("config.position", "==", config.position),
        where("config.seniority", "==", parseSeniorityLevel(config.seniority)),
        where("config.interviewType", "==", config.interviewType),
        limit(1),
      );

      const snapshot = await safeGetDocs(candidateQuery);
      const match = snapshot.docs[0];
      if (!match) return null;
      return match.id;
    })();

    const existingCreatedAt = await (async (): Promise<Timestamp | null> => {
      if (!resolvedExistingSessionId) return null;
      const ref = doc(sessionsRef, resolvedExistingSessionId);
      const existing = await safeGetDoc(ref);
      if (!existing.exists()) return null;
      const data = existing.data() as Partial<InterviewSession>;
      return data.createdAt ?? null;
    })();

    const sessionDoc = resolvedExistingSessionId
      ? doc(sessionsRef, resolvedExistingSessionId)
      : doc(sessionsRef);

    // Convert messages to interview questions and responses
    const questions: InterviewQuestion[] = [];
    const responses: InterviewResponse[] = [];

    const resolvedScore = analysis.score > 0 ? analysis.score : 0;
    const resolvedFeedback =
      analysis.detailedAnalysis.trim().length > 0
        ? analysis.detailedAnalysis
        : analysis.overallScore.trim().length > 0
          ? analysis.overallScore
          : "";

    const practiceQuestionIds = (sessionData.questionIds ?? []).filter(Boolean);

    const difficultyByQuestionId = new Map<string, number>();
    await Promise.all(
      practiceQuestionIds.map(async (id) => {
        const q = await getPracticeQuestionById(id);
        if (!q) return;
        difficultyByQuestionId.set(id, mapDifficultyLevelToScore(q.difficulty));
      }),
    );

    const sessionDifficulty = mapSeniorityToDifficultyScore(
      parseSeniorityLevel(config.seniority),
    );

    let mainQuestionIndex = 0;
    let cursor = 0;
    let followUpIndex = 0;

    while (cursor < sessionData.messages.length) {
      const aiMessage = sessionData.messages[cursor];
      const userMessage = sessionData.messages[cursor + 1];

      if (!aiMessage || aiMessage.type !== "ai") {
        cursor += 1;
        continue;
      }

      const aiContent = (aiMessage.content ?? "").trim();
      if (!aiContent) {
        cursor += 1;
        continue;
      }

      const explicitFollowUp = aiMessage.isFollowUp === true;
      const inferredFollowUp =
        !explicitFollowUp &&
        practiceQuestionIds.length > 0 &&
        mainQuestionIndex >= practiceQuestionIds.length &&
        userMessage?.type === "user";

      const isFollowUp = explicitFollowUp || inferredFollowUp;

      if (isFollowUp) {
        const current = questions[questions.length - 1];
        if (!current) {
          cursor += 1;
          continue;
        }

        const followUpResponse =
          userMessage?.type === "user"
            ? (userMessage.content ?? "").trim()
            : "";

        const followUps = Array.isArray(current.followUps)
          ? current.followUps
          : [];

        const followUpExample = (() => {
          const raw = sessionData.followUpExampleAnswers?.[followUpIndex];
          if (typeof raw !== "string") return undefined;
          const trimmed = raw.trim();
          return trimmed.length > 0 ? trimmed : undefined;
        })();

        followUps.push({
          question: aiContent,
          response: followUpResponse,
          ...(followUpExample ? { aiExampleAnswer: followUpExample } : {}),
        });

        followUpIndex += 1;

        current.followUps = followUps;
        cursor += userMessage?.type === "user" ? 2 : 1;
        continue;
      }

      if (!userMessage || userMessage.type !== "user") {
        cursor += 1;
        continue;
      }

      const practiceQuestionId = practiceQuestionIds[mainQuestionIndex];
      const questionId =
        typeof practiceQuestionId === "string" && practiceQuestionId.length > 0
          ? practiceQuestionId
          : `q_${mainQuestionIndex + 1}`;

      const aiExampleAnswer = (() => {
        const raw = sessionData.exampleAnswers?.[mainQuestionIndex];
        if (typeof raw !== "string") return undefined;
        const trimmed = raw.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      })();

      const subscores = computeResponseSubscores(userMessage.content);

      questions.push({
        id: questionId,
        type: config.interviewType as InterviewType,
        category: config.interviewType,
        question: aiMessage.content,
        difficulty: difficultyByQuestionId.get(questionId) ?? sessionDifficulty,
        expectedDuration: 3,
        tags: [config.position, config.seniority],
        followUps: [],
        ...(aiExampleAnswer ? { aiExampleAnswer } : {}),
      });

      responses.push({
        questionId,
        response: userMessage.content,
        duration: 180,
        confidence: 0,
        score: subscores.overall,
        feedback: resolvedFeedback,
        keyPoints: [],
        missedPoints: [],
      });

      mainQuestionIndex += 1;
      cursor += 2;
    }

    const termination = sessionData.termination
      ? {
          reason: sessionData.termination.reason,
          message: sessionData.termination.message,
          ...(sessionData.termination.at
            ? { at: Timestamp.fromDate(new Date(sessionData.termination.at)) }
            : {}),
        }
      : undefined;

    if (responses.length === 0 || (termination && responses.length <= 1)) {
      if (resolvedExistingSessionId) {
        try {
          await safeDeleteDoc(sessionDoc);
        } catch (deleteError) {
          console.error("Error deleting empty session:", deleteError);
        }
      }

      return "";
    }

    const status: SessionStatus = (() => {
      if (termination) return "terminated";
      return sessionData.isComplete ? "completed" : "abandoned";
    })();

    const analysisStatus: InterviewSession["analysisStatus"] = (() => {
      if (analysis.detailedAnalysis.trim().length > 0) return "ready";
      if (analysis.overallScore.trim().length > 0) return "ready";
      return "pending";
    })();

    const sessionBase = {
      sessionId: resolvedExistingSessionId ?? sessionDoc.id,
      config: {
        position: config.position,
        seniority: parseSeniorityLevel(config.seniority),
        interviewMode: config.interviewMode as
          | "regular"
          | "practice"
          | "flash"
          | "play"
          | "competitive"
          | "teacher",
        interviewType: config.interviewType as InterviewType,
        duration: config.duration,
        ...(config.specificCompany && {
          specificCompany: config.specificCompany,
        }),
      },
      status,
      startedAt: startedAtTimestamp,
      completedAt: completedAtTimestamp,
      totalDuration:
        sessionData.endTime && sessionData.startTime
          ? Math.round(
              (new Date(sessionData.endTime).getTime() -
                new Date(sessionData.startTime).getTime()) /
                60000,
            )
          : config.duration,
      ...(termination ? { termination } : {}),
      questions,
      responses,
      analysis: {
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        skillsAssessed: [
          config.position,
          config.seniority,
          config.interviewType,
        ],
        difficulty: sessionDifficulty,
        aiConfidence: 85,
        summary: analysis.overallScore || "",
        detailedAnalysis: analysis.detailedAnalysis?.trim().length
          ? analysis.detailedAnalysis
          : undefined,
        recommendations: analysis.recommendations
          ? analysis.recommendations.split("\n").filter((r) => r.trim())
          : [],
        nextSteps: analysis.nextSteps
          ? analysis.nextSteps.split("\n").filter((s) => s.trim())
          : [],
        ...(typeof analysis.passed === "boolean"
          ? { passed: analysis.passed }
          : {}),
        ...(analysis.decision ? { decision: analysis.decision } : {}),
        ...(typeof analysis.passingThreshold === "number"
          ? { passingThreshold: analysis.passingThreshold }
          : {}),
        ...(analysis.whyDecision?.trim()
          ? { whyDecision: analysis.whyDecision }
          : {}),
        ...(Array.isArray(analysis.knowledgeGaps)
          ? {
              knowledgeGaps: analysis.knowledgeGaps.map((gap) => ({
                title: gap.title,
                priority: gap.priority,
                tags: gap.tags,
                why: gap.why,
                resources: gap.resources?.map((r) => ({
                  id: r.id,
                  title: r.title,
                  url: r.url,
                  type: r.type,
                  tags: r.tags,
                  ...(r.difficulty ? { difficulty: r.difficulty } : {}),
                })),
              })),
            }
          : {}),
      },
      analysisStatus,
      createdAt: existingCreatedAt ?? Timestamp.now(),
      updatedAt: Timestamp.now(),
      tokenUsage: sessionData.tokenUsage,
    };

    const shouldWriteScores = shouldPersistScores(
      (sessionBase.config as any).interviewMode,
    );
    const fallbackScores =
      shouldWriteScores && resolvedScore > 0
        ? {
            overall: resolvedScore,
            technical: clampScore(resolvedScore * 0.92),
            communication: clampScore(resolvedScore * 0.86),
            problemSolving: clampScore(resolvedScore * 0.9),
          }
        : null;

    const nextScores = fallbackScores;
    const session: InterviewSession = nextScores
      ? {
          ...sessionBase,
          scores: nextScores,
        }
      : sessionBase;

    await safeSetDoc(sessionDoc, session);
    return sessionDoc.id;
  } catch (error) {
    console.error("Error saving interview results:", error);
    throw error;
  }
}
