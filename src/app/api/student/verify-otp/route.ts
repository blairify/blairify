import { getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { verifyOtp } from "@/lib/services/student/otp-service";

const STUDENT_SUBSCRIPTION = {
  plan: "student" as const,
  status: "active" as const,
  features: ["unlimited_interviews", "advanced_analytics", "skill_roadmaps"],
  limits: {
    sessionsPerMonth: 9999,
    skillsTracking: 9999,
    analyticsRetention: 365,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      code?: string;
      displayName?: string;
      password?: string;
    };

    const { email, code, displayName, password } = body;

    if (!email || !code || !displayName || !password) {
      return NextResponse.json(
        { error: "email, code, displayName, and password are all required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpResult = await verifyOtp(normalizedEmail, code.trim());

    if (!otpResult.success) {
      const messages: Record<typeof otpResult.reason, string> = {
        not_found: "Verification code not found. Please request a new one.",
        expired: "Verification code has expired. Please request a new one.",
        invalid: "Incorrect verification code. Please try again.",
        locked:
          "Too many incorrect attempts. Please request a new verification code.",
      };
      return NextResponse.json(
        { error: messages[otpResult.reason] },
        { status: 400 },
      );
    }

    const adminAuth = getAuth(getApp());
    const adminDb = getAdminFirestore();

    let uid: string;
    try {
      const userRecord = await adminAuth.createUser({
        email: normalizedEmail,
        password,
        displayName: displayName.trim(),
        emailVerified: true,
      });
      uid = userRecord.uid;
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      if (firebaseErr.code === "auth/email-already-exists") {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 },
        );
      }
      throw err;
    }

    const now = new Date();
    await adminDb
      .collection("users")
      .doc(uid)
      .set({
        uid,
        email: normalizedEmail,
        displayName: displayName.trim(),
        role: "student",
        subscription: STUDENT_SUBSCRIPTION,
        studentVerification: {
          universityName: otpResult.universityName,
          domain: otpResult.domain,
          verifiedAt: FieldValue.serverTimestamp(),
        },
        preferences: {
          preferredDifficulty: "intermediate",
          preferredInterviewTypes: ["technical"],
          targetCompanies: [],
          notificationsEnabled: true,
          language: "en",
        },
        usage: {
          interviewCount: 0,
          lastInterviewAt: now,
          periodStart: now,
        },
        isActive: true,
        createdAt: FieldValue.serverTimestamp(),
        lastLoginAt: FieldValue.serverTimestamp(),
        lastActiveAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ uid });
  } catch (error) {
    console.error("[verify-otp] error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
