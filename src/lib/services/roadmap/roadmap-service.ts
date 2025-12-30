import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  type Timestamp,
  type Unsubscribe,
  where,
} from "firebase/firestore";
import { ensureDatabase } from "../common/database-common";

const ROADMAP_IDEAS_COLLECTION = "roadmapIdeas" as const;

export type RoadmapIdeaAudience = "candidate" | "recruiter";

export type RoadmapIdeaStatus = "planned" | "in_progress";

export interface RoadmapIdea {
  id: string;
  title: string;
  description: string;
  audience: RoadmapIdeaAudience;
  status: RoadmapIdeaStatus;
  voteCount: number;
  createdAt: Timestamp;
  createdByUid: string;
}

export interface RoadmapIdeaCreateInput {
  title: string;
  description: string;
  audience: RoadmapIdeaAudience;
  status: RoadmapIdeaStatus;
  createdByUid: string;
}

function assertValidRoadmapIdeaCreateInput(input: RoadmapIdeaCreateInput) {
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 3) throw new Error("Title must be at least 3 characters");
  if (title.length > 80) throw new Error("Title must be at most 80 characters");
  if (description.length < 10)
    throw new Error("Description must be at least 10 characters");
  if (description.length > 2000)
    throw new Error("Description must be at most 2000 characters");
  if (!input.createdByUid) throw new Error("Missing user");
}

function coerceAudience(value: unknown): RoadmapIdeaAudience | null {
  if (value === "candidate") return "candidate";
  if (value === "recruiter") return "recruiter";
  return null;
}

function coerceStatus(value: unknown): RoadmapIdeaStatus | null {
  if (value === "planned") return "planned";
  if (value === "in_progress") return "in_progress";
  return null;
}

export async function createRoadmapIdea(
  input: RoadmapIdeaCreateInput,
): Promise<string> {
  assertValidRoadmapIdeaCreateInput(input);

  const db = ensureDatabase();
  const ideasRef = collection(db, ROADMAP_IDEAS_COLLECTION);
  const title = input.title.trim();
  const description = input.description.trim();

  const created = await addDoc(ideasRef, {
    title,
    description,
    audience: input.audience satisfies RoadmapIdeaAudience,
    status: input.status satisfies RoadmapIdeaStatus,
    voteCount: 0,
    createdAt: serverTimestamp(),
    createdByUid: input.createdByUid,
  });

  return created.id;
}

export async function listRoadmapIdeas(): Promise<RoadmapIdea[]> {
  const db = ensureDatabase();
  const ideasRef = collection(db, ROADMAP_IDEAS_COLLECTION);

  const q = query(
    ideasRef,
    orderBy("voteCount", "desc"),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((d) => {
      const data = d.data() as Record<string, unknown>;

      const title = typeof data.title === "string" ? data.title : null;
      const description =
        typeof data.description === "string" ? data.description : null;
      const createdByUid =
        typeof data.createdByUid === "string" ? data.createdByUid : null;
      const createdAt = data.createdAt as Timestamp | undefined;
      const audience = coerceAudience(data.audience) ?? "candidate";
      const status = coerceStatus(data.status) ?? "planned";

      if (!title || !description || !createdByUid || !createdAt) return null;

      return {
        id: d.id,
        title,
        description,
        audience,
        status,
        voteCount: (data.voteCount as number | undefined) ?? 0,
        createdAt,
        createdByUid,
      } satisfies RoadmapIdea;
    })
    .filter((x): x is RoadmapIdea => x !== null);
}

export function subscribeRoadmapIdeas(params: {
  onData: (ideas: RoadmapIdea[]) => void;
  onError: (error: unknown) => void;
}): Unsubscribe {
  const db = ensureDatabase();
  const ideasRef = collection(db, ROADMAP_IDEAS_COLLECTION);

  const q = query(
    ideasRef,
    orderBy("voteCount", "desc"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const ideas = snapshot.docs
        .map((d) => {
          const data = d.data() as Record<string, unknown>;

          const title = typeof data.title === "string" ? data.title : null;
          const description =
            typeof data.description === "string" ? data.description : null;
          const createdByUid =
            typeof data.createdByUid === "string" ? data.createdByUid : null;
          const createdAt = data.createdAt as Timestamp | undefined;
          const audience = coerceAudience(data.audience) ?? "candidate";
          const status = coerceStatus(data.status) ?? "planned";

          if (!title || !description || !createdByUid || !createdAt)
            return null;

          return {
            id: d.id,
            title,
            description,
            audience,
            status,
            voteCount: (data.voteCount as number | undefined) ?? 0,
            createdAt,
            createdByUid,
          } satisfies RoadmapIdea;
        })
        .filter((x): x is RoadmapIdea => x !== null);

      params.onData(ideas);
    },
    (error) => {
      params.onError(error);
    },
  );
}

export function subscribeUserRoadmapVotes(params: {
  userId: string;
  onData: (upvotedByIdeaId: Record<string, boolean>) => void;
  onError: (error: unknown) => void;
}): Unsubscribe {
  const db = ensureDatabase();
  const votesGroup = collectionGroup(db, "votes");
  const q = query(votesGroup, where("userId", "==", params.userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs
        .map((d) => {
          const data = d.data() as Record<string, unknown>;
          const ideaId = typeof data.ideaId === "string" ? data.ideaId : null;
          if (!ideaId) return null;
          return [ideaId, true] as const;
        })
        .filter((x): x is readonly [string, true] => x !== null);

      params.onData(Object.fromEntries(entries));
    },
    (error) => {
      params.onError(error);
    },
  );
}

export async function hasUserUpvotedRoadmapIdea(params: {
  ideaId: string;
  userId: string;
}): Promise<boolean> {
  const db = ensureDatabase();
  const voteRef = doc(
    db,
    ROADMAP_IDEAS_COLLECTION,
    params.ideaId,
    "votes",
    params.userId,
  );
  const snap = await getDoc(voteRef);
  return snap.exists();
}

export async function toggleRoadmapIdeaUpvote(params: {
  ideaId: string;
  userId: string;
}): Promise<{ voteCount: number; upvoted: boolean }> {
  const db = ensureDatabase();
  const ideaRef = doc(db, ROADMAP_IDEAS_COLLECTION, params.ideaId);
  const voteRef = doc(
    db,
    ROADMAP_IDEAS_COLLECTION,
    params.ideaId,
    "votes",
    params.userId,
  );

  return runTransaction(db, async (tx) => {
    const [ideaSnap, voteSnap] = await Promise.all([
      tx.get(ideaRef),
      tx.get(voteRef),
    ]);

    if (!ideaSnap.exists()) throw new Error("Idea not found");

    const currentVoteCount =
      (ideaSnap.data()?.voteCount as number | undefined) ?? 0;

    if (voteSnap.exists()) {
      tx.delete(voteRef);
      tx.update(ideaRef, {
        voteCount: increment(-1),
      });
      return { voteCount: Math.max(0, currentVoteCount - 1), upvoted: false };
    }

    tx.set(voteRef, {
      ideaId: params.ideaId,
      userId: params.userId,
      createdAt: serverTimestamp(),
    });

    tx.update(ideaRef, {
      voteCount: increment(1),
    });

    return { voteCount: currentVoteCount + 1, upvoted: true };
  });
}

export async function deleteRoadmapIdea(params: {
  ideaId: string;
}): Promise<void> {
  const db = ensureDatabase();
  const ideaRef = doc(db, ROADMAP_IDEAS_COLLECTION, params.ideaId);
  await deleteDoc(ideaRef);
}
