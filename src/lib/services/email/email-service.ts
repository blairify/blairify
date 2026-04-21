import { Resend } from "resend";
import { buildVerificationEmailHtml } from "./templates/verification-email";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@blairify.com";

export async function sendVerificationEmail(
  to: string,
  code: string,
  universityName: string,
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (typeof resendApiKey !== "string" || resendApiKey.trim().length === 0) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `${code} - your Blairify student verification code`,
    html: buildVerificationEmailHtml(code, universityName),
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
