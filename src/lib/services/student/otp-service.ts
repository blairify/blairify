import { getAdminFirestore } from "@/lib/firebase-admin";
import type { UniversityDomain } from "./university-domains";

const OTP_COLLECTION = "pendingStudentOtps";
const OTP_TTL_MS = 20 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

interface PendingStudentOtp {
  email: string;
  codeHash: string;
  universityName: string;
  domain: string;
  expiresAt: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  attempts: number;
  emailSentCount: number;
  lastEmailSentAt: FirebaseFirestore.Timestamp;
}

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateSixDigitCode(): string {
  const digits = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return String(digits).padStart(6, "0");
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "rate_limited"; retryAfterMs: number };

export async function checkRateLimit(email: string): Promise<RateLimitResult> {
  const adminDb = getAdminFirestore();
  const docRef = adminDb.collection(OTP_COLLECTION).doc(email);
  const doc = await docRef.get();

  if (!doc.exists) return { allowed: true };

  const data = doc.data() as PendingStudentOtp;
  const lastSentMs = data.lastEmailSentAt?.toMillis() ?? 0;
  const now = Date.now();

  if (
    now - lastSentMs < RATE_LIMIT_WINDOW_MS &&
    data.emailSentCount >= RATE_LIMIT_MAX
  ) {
    return {
      allowed: false,
      reason: "rate_limited",
      retryAfterMs: RATE_LIMIT_WINDOW_MS - (now - lastSentMs),
    };
  }

  return { allowed: true };
}

export async function generateAndStoreOtp(
  email: string,
  university: UniversityDomain,
): Promise<string> {
  const adminDb = getAdminFirestore();
  const { FieldValue } = await import("firebase-admin/firestore");

  const code = generateSixDigitCode();
  const codeHash = await hashCode(code);
  const docRef = adminDb.collection(OTP_COLLECTION).doc(email);
  const existing = await docRef.get();

  const sentCount = existing.exists
    ? ((existing.data() as PendingStudentOtp).emailSentCount ?? 0) + 1
    : 1;

  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await docRef.set({
    email,
    codeHash,
    universityName: university.universityName,
    domain: university.domain,
    expiresAt,
    createdAt: existing.exists
      ? (existing.data() as PendingStudentOtp).createdAt
      : FieldValue.serverTimestamp(),
    attempts: 0,
    emailSentCount: sentCount,
    lastEmailSentAt: FieldValue.serverTimestamp(),
  });

  return code;
}

export type OtpVerifyResult =
  | { success: true; universityName: string; domain: string }
  | { success: false; reason: "not_found" | "expired" | "invalid" | "locked" };

type OtpDocRef = FirebaseFirestore.DocumentReference;

async function validateOtpRecord(
  docRef: OtpDocRef,
  code: string,
): Promise<OtpVerifyResult> {
  const doc = await docRef.get();

  if (!doc.exists) return { success: false, reason: "not_found" };

  const data = doc.data() as PendingStudentOtp;

  const expiresAtMs =
    typeof data.expiresAt?.toMillis === "function"
      ? data.expiresAt.toMillis()
      : new Date(data.expiresAt as unknown as string).getTime();

  if (Date.now() > expiresAtMs) {
    await docRef.delete();
    return { success: false, reason: "expired" };
  }

  if (data.attempts >= MAX_ATTEMPTS) {
    await docRef.delete();
    return { success: false, reason: "locked" };
  }

  const incomingHash = await hashCode(code);

  if (incomingHash !== data.codeHash) {
    await docRef.update({ attempts: data.attempts + 1 });
    return { success: false, reason: "invalid" };
  }

  return {
    success: true,
    universityName: data.universityName,
    domain: data.domain,
  };
}

export async function peekOtp(
  email: string,
  code: string,
): Promise<OtpVerifyResult> {
  const docRef = getAdminFirestore().collection(OTP_COLLECTION).doc(email);
  return validateOtpRecord(docRef, code);
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<OtpVerifyResult> {
  const docRef = getAdminFirestore().collection(OTP_COLLECTION).doc(email);
  const result = await validateOtpRecord(docRef, code);
  if (result.success) await docRef.delete();
  return result;
}
