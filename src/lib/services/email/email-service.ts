import { Resend } from "resend";
import { buildVerificationEmailHtml } from "./templates/verification-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@blairify.com";

export async function sendVerificationEmail(
  to: string,
  code: string,
  universityName: string,
): Promise<void> {
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
