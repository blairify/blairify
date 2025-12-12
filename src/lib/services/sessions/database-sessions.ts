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
import type {
  InterviewQuestion,
  InterviewResponse,
  InterviewSession,
  InterviewType,
  SessionStatus,
} from "@/types/firestore";
import { COLLECTIONS, ensureDatabase } from "../common/database-common";

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

    for (let i = 0; i < sessionData.messages.length; i += 2) {
      const aiMessage = sessionData.messages[i];
      const userMessage = sessionData.messages[i + 1];

      if (aiMessage?.type === "ai" && userMessage?.type === "user") {
        const questionId = `q_${i / 2 + 1}`;

        questions.push({
          id: questionId,
          type: config.interviewType as InterviewType,
          category: config.interviewType,
          question: aiMessage.content,
          difficulty: 5, // Default difficulty
          expectedDuration: 3, // Default 3 minutes
          tags: [config.position, config.seniority],
        });

        responses.push({
          questionId,
          response: userMessage.content,
          duration: 180,
          confidence: 7,
          score: 0, // No score without real analysis
          feedback: "Analysis pending",
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
        seniority: config.seniority,
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
        difficulty: 5,
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

    // Only add scores if they exist and are valid
    const session: InterviewSession =
      analysis.score > 0
        ? {
            ...sessionBase,
            scores: {
              overall: analysis.score,
              technical: analysis.score,
              communication: analysis.score,
              problemSolving: analysis.score,
            },
          }
        : sessionBase;

    await safeSetDoc(sessionDoc, session);
    return sessionDoc.id;
  } catch (error) {
    console.error("Error saving interview results:", error);
    throw error;
  }
}
