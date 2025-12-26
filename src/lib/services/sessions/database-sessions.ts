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
import { COLLECTIONS, ensureDatabase } from "../common/database-common";

const SENIORITY_LEVELS: SeniorityLevel[] = ["entry", "junior", "mid", "senior"];

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

function computeSessionScores(responses: InterviewResponse[]): {
  overall: number;
  technical: number;
  communication: number;
  problemSolving: number;
} | null {
  const totals = {
    overall: 0,
    technical: 0,
    communication: 0,
    problemSolving: 0,
  };
  let count = 0;

  for (const r of responses) {
    if (!r.response?.trim()) continue;
    const subscores = computeResponseSubscores(r.response);
    if (subscores.overall <= 0) continue;
    totals.overall += subscores.overall;
    totals.technical += subscores.technical;
    totals.communication += subscores.communication;
    totals.problemSolving += subscores.problemSolving;
    count += 1;
  }

  if (count === 0) return null;

  return {
    overall: clampScore(totals.overall / count),
    technical: clampScore(totals.technical / count),
    communication: clampScore(totals.communication / count),
    problemSolving: clampScore(totals.problemSolving / count),
  };
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

    return snapshot.docs.map(
      (doc: QueryDocumentSnapshot<DocumentData>) =>
        doc.data() as InterviewSession,
    );
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

export async function saveInterviewResults(
  userId: string,
  sessionData: {
    messages: Array<{
      type: string;
      content: string;
      timestamp?: Date | string;
    }>;
    questionIds?: string[];
    isComplete: boolean;
    startTime?: Date | string;
    endTime?: Date | string;
    endedEarly?: boolean;
  },
  config: {
    position: string;
    seniority: string;
    interviewType: string;
    interviewMode: string;
    duration: number;
    specificCompany?: string;
  },
  analysis: {
    score: number;
    overallScore: string;
    strengths: string[];
    improvements: string[];
    detailedAnalysis: string;
    recommendations: string;
    nextSteps: string;
  },
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
    const sessionDoc =
      existingSessionId != null && existingSessionId !== ""
        ? doc(sessionsRef, existingSessionId)
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
          : "Analysis pending";

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

    for (let i = 0; i < sessionData.messages.length; i += 2) {
      const aiMessage = sessionData.messages[i];
      const userMessage = sessionData.messages[i + 1];

      if (aiMessage?.type === "ai" && userMessage?.type === "user") {
        const questionIndex = i / 2;
        const practiceQuestionId = practiceQuestionIds[questionIndex];
        const questionId =
          typeof practiceQuestionId === "string" &&
          practiceQuestionId.length > 0
            ? practiceQuestionId
            : `q_${questionIndex + 1}`;

        const subscores = computeResponseSubscores(userMessage.content);

        questions.push({
          id: questionId,
          type: config.interviewType as InterviewType,
          category: config.interviewType,
          question: aiMessage.content,
          difficulty:
            difficultyByQuestionId.get(questionId) ?? sessionDifficulty,
          expectedDuration: 3, // Default 3 minutes
          tags: [config.position, config.seniority],
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
      }
    }

    // Build session object without undefined values
    const startedAtTimestamp = sessionData.startTime
      ? Timestamp.fromDate(new Date(sessionData.startTime))
      : Timestamp.now();

    const completedAtTimestamp = sessionData.endTime
      ? Timestamp.fromDate(new Date(sessionData.endTime))
      : Timestamp.now();

    const sessionBase = {
      sessionId: existingSessionId ?? sessionDoc.id,
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
      status: (sessionData.isComplete
        ? "completed"
        : "abandoned") as SessionStatus,
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
        summary: analysis.overallScore || "Analysis pending",
        recommendations: analysis.recommendations
          ? analysis.recommendations.split("\n").filter((r) => r.trim())
          : [],
        nextSteps: analysis.nextSteps
          ? analysis.nextSteps.split("\n").filter((s) => s.trim())
          : [],
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const shouldWriteScores = shouldPersistScores(
      (sessionBase.config as any).interviewMode,
    );
    const derivedScores = shouldWriteScores
      ? computeSessionScores(responses)
      : null;

    const fallbackScores =
      shouldWriteScores && resolvedScore > 0
        ? {
            overall: resolvedScore,
            technical: clampScore(resolvedScore * 0.92),
            communication: clampScore(resolvedScore * 0.86),
            problemSolving: clampScore(resolvedScore * 0.9),
          }
        : null;

    const nextScores = derivedScores ?? fallbackScores;
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
