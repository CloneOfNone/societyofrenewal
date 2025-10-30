import { Resend } from "resend";

import { env } from "@/lib/env";

const resendClient = env.EMAIL_PROVIDER_API_KEY
  ? new Resend(env.EMAIL_PROVIDER_API_KEY)
  : null;

export interface WaitlistConfirmationPayload {
  email: string;
  token: string;
}

export async function sendWaitlistConfirmationEmail({
  email,
  token,
}: WaitlistConfirmationPayload) {
  const confirmationUrl = new URL("/waitlist/confirm", env.APP_URL);
  confirmationUrl.searchParams.set("token", token);

  const subject = "Confirm your Society of Renewal waitlist spot";
  const html = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background-color:#030711;padding:32px 0;color:#f8fafc;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <tr>
        <td align="center" style="padding:0 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#0f172a;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08);">
            <tr>
              <td>
                <h1 style="margin:0;font-size:24px;font-weight:600;color:#f8fafc;">Confirm your invitation</h1>
                <p style="margin:16px 0 24px;color:#cbd5f5;font-size:16px;line-height:1.6;">
                  Thank you for joining the Society of Renewal waitlist. To ensure fair invitations, we need a quick confirmation from you. Please confirm your email to keep your place.
                </p>
                <p style="margin:0;">
                  <a href="${confirmationUrl.toString()}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:linear-gradient(135deg,#64748b,#d8dee9);color:#030711;text-decoration:none;font-weight:600;">
                    Confirm my invite
                  </a>
                </p>
                <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
                  If you did not request this, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  if (!resendClient) {
    console.info(
      "[waitlist] Resend API key not configured. Confirmation link:",
      confirmationUrl.toString(),
    );
    return;
  }

  await resendClient.emails.send({
    from: "Society of Renewal <waitlist@notifications.societyofrenewal.org>",
    to: email,
    subject,
    html,
  });
}
