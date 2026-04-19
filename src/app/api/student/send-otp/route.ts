import { type NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/services/email/email-service";
import {
  checkRateLimit,
  generateAndStoreOtp,
} from "@/lib/services/student/otp-service";
import { findUniversityByEmail } from "@/lib/services/student/university-domains";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.toLowerCase().trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 },
      );
    }

    const university = await findUniversityByEmail(email);
    if (!university) {
      return NextResponse.json(
        {
          error: "This email domain is not registered as a partner university.",
        },
        { status: 400 },
      );
    }

    const rateLimitResult = await checkRateLimit(email);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error:
            "Too many verification emails sent. Please wait before requesting another.",
          retryAfterMs: rateLimitResult.retryAfterMs,
        },
        { status: 429 },
      );
    }

    const code = await generateAndStoreOtp(email, university);
    await sendVerificationEmail(email, code, university.universityName);

    return NextResponse.json({
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("[send-otp] error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 },
    );
  }
}
