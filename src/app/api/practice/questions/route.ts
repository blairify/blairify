import {
  collection,
  type DocumentSnapshot,
  limit as firestoreLimit,
  orderBy as firestoreOrderBy,
  getDocs,
  type QueryConstraint,
  query,
  where,
} from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import type { Question } from "@/types/practice-question";

// Transform Firestore document to Question type
function transformFirestoreDoc(doc: DocumentSnapshot): Question {
  const data = doc.data() || {};

  return {
    ...data,
    id: doc.id,
    createdAt:
      data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt:
      data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as Question;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const topic = searchParams.get("topic") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const companyName = searchParams.get("company") || undefined;
    const status = searchParams.get("status") || "published";

    if (!db) {
      throw new Error("Firestore is not initialized");
    }

    // Build query constraints
    const constraints: QueryConstraint[] = [
      where("status", "==", status),
      firestoreOrderBy("createdAt", "desc"),
      firestoreLimit(limit),
    ];

    if (topic) {
      constraints.push(where("topic", "==", topic));
    }
    if (difficulty) {
      constraints.push(where("difficulty", "==", difficulty));
    }
    if (companyName) {
      constraints.push(
        where("companies", "array-contains", { name: companyName }),
      );
    }

    // Query Firestore directly
    const questionsQuery = query(
      collection(db, "practice_questions"),
      ...constraints,
    );

    const snapshot = await getDocs(questionsQuery);
    const questions = snapshot.docs.map(transformFirestoreDoc);

    return NextResponse.json({
      success: true,
      questions,
      hasMore: snapshot.docs.length === limit,
      count: questions.length,
    });
  } catch (error) {
    console.error("Error fetching practice questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch questions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
