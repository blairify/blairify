import { type NextRequest, NextResponse } from "next/server";
import { peekOtp } from "@/lib/services/student/otp-service";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      code?: string;
    };

    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { valid: false, error: "email and code are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const result = await peekOtp(normalizedEmail, code.trim());

    if (!result.success) {
      const messages: Record<typeof result.reason, string> = {
        not_found: "Verification code not found. Please request a new one.",
        expired: "Verification code has expired. Please request a new one.",
        invalid: "Incorrect verification code. Please try again.",
        locked:
          "Too many incorrect attempts. Please request a new verification code.",
      };
      return NextResponse.json(
        { valid: false, error: messages[result.reason] },
        { status: 400 },
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("[validate-otp] error:", error);
    return NextResponse.json(
      { valid: false, error: "Validation failed. Please try again." },
      { status: 500 },
    );
  }
}
