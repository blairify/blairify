"use client";

import {
  addDoc,
  collection,
  limit,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { safeGetDocs } from "@/lib/firestore-utils";
import {
  COLLECTIONS,
  ensureDatabase,
} from "@/lib/services/common/database-common";

export interface PostInterviewSurveyPayload {
  jobMatchScore: number;
  realismScore: number;
  gapInsightScore: number;
  userEmail?: string | null;
}

export async function savePostInterviewSurveyResponse(
  userId: string,
  payload: PostInterviewSurveyPayload,
) {
  const database = ensureDatabase();
  const surveysRef = collection(database, COLLECTIONS.SURVEYS);

  await addDoc(surveysRef, {
    userId,
    userEmail: payload.userEmail ?? null,
    jobMatchScore: payload.jobMatchScore,
    realismScore: payload.realismScore,
    gapInsightScore: payload.gapInsightScore,
    createdAt: Timestamp.now(),
  });
}

export async function hasUserSubmittedSurvey(userId: string): Promise<boolean> {
  const database = ensureDatabase();
  const surveysRef = collection(database, COLLECTIONS.SURVEYS);
  const q = query(surveysRef, where("userId", "==", userId), limit(1));
  const snapshot = await safeGetDocs(q);
  return !snapshot.empty;
}
