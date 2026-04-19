export function buildVerificationEmailHtml(
  code: string,
  universityName: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your student account</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0f172a;padding:28px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Blairify</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Verify your student account</p>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6;">
                You're registering as a student from <strong>${universityName}</strong>. Use the code below to confirm your university email address.
              </p>

              <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:10px;padding:28px;text-align:center;margin-bottom:32px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;">Your verification code</p>
                <span style="font-size:44px;font-weight:800;letter-spacing:10px;color:#0f172a;font-variant-numeric:tabular-nums;">${code}</span>
              </div>

              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
                This code expires in <strong>20 minutes</strong>. Do not share it with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
