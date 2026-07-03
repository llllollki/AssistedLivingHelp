import nodemailer from "nodemailer";

type SendResult = { sent: boolean; reason?: "not_configured" | "error" };

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const MAIL_FROM =
  process.env.MAIL_FROM ?? "Assisted Living Help <help@assistedlivinghelp.co>";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Assisted Living Help";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter(): ReturnType<typeof nodemailer.createTransport> | null {
  // If SMTP credentials are absent (e.g. local dev), return null so callers no-op
  // instead of throwing. Email is best-effort and must never block intake.
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }
    });
  }
  return transporter;
}

/**
 * Sends a single transactional "we received your request" confirmation to a lead.
 *
 * By contract this never throws — a mail failure returns a result the caller can
 * safely ignore, so it can never break the intake submission.
 *
 * Callers MUST only invoke this when the lead both provided an email address and
 * gave email consent (consentEmail). This function does not re-check consent.
 */
export async function sendIntakeConfirmationEmail(opts: {
  to: string;
  firstName: string;
}): Promise<SendResult> {
  const tx = getTransporter();
  if (!tx) return { sent: false, reason: "not_configured" };

  const firstName = opts.firstName?.trim() || "there";
  const subject = `We received your request — ${SITE_NAME}`;
  const text = [
    `Hi ${firstName},`,
    ``,
    `Thanks for reaching out to ${SITE_NAME}. We've received your request and a`,
    `member of our team will follow up shortly to help you find the right assisted`,
    `living options.`,
    ``,
    `If you need to reach us in the meantime, just reply to this email.`,
    ``,
    `— The ${SITE_NAME} team`
  ].join("\n");

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1a1a1a;">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Thanks for reaching out to ${escapeHtml(SITE_NAME)}. We've received your request and a member of our team will follow up shortly to help you find the right assisted living options.</p>
      <p>If you need to reach us in the meantime, just reply to this email.</p>
      <p>— The ${escapeHtml(SITE_NAME)} team</p>
    </div>
  `;

  try {
    await tx.sendMail({ from: MAIL_FROM, to: opts.to, subject, text, html });
    return { sent: true };
  } catch (err) {
    console.error("[email] intake confirmation send failed:", err);
    return { sent: false, reason: "error" };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
