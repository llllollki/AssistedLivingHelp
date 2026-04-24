import { getSupabaseServiceRoleClient } from "@/lib/supabase";

type CommChannel = "email" | "sms";
type CommStatus = "sent" | "failed" | "skipped";

type LogCommParams = {
  leadId: string;
  channel: CommChannel;
  recipient: string;
  messageType: string;
  status: CommStatus;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  consentSource?: string | null;
  consentBasis?: string | null;
  consentVersion?: string | null;
};

async function logComm(params: LogCommParams) {
  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) return;

  await supabase.from("outbound_comms").insert({
    lead_id: params.leadId,
    channel: params.channel,
    recipient: params.recipient,
    message_type: params.messageType,
    status: params.status,
    provider_message_id: params.providerMessageId ?? null,
    error_message: params.errorMessage ?? null,
    consent_source: params.consentSource ?? null,
    consent_basis: params.consentBasis ?? null,
    consent_version: params.consentVersion ?? null
  });
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain || !local) return "***";
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 4 ? `***${digits.slice(-4)}` : "***";
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

export type IntakeConfirmationParams = {
  leadId: string;
  firstName: string;
  consentSource?: string | null;
  consentBasis?: string | null;
  consentVersion?: string | null;
};

export async function sendIntakeConfirmationEmail(
  params: IntakeConfirmationParams & { email: string }
) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@assistedliving-help.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://assistedliving-help.vercel.app";
  const masked = maskEmail(params.email);

  if (!apiKey) {
    await logComm({
      leadId: params.leadId,
      channel: "email",
      recipient: masked,
      messageType: "intake_confirmation",
      status: "skipped",
      errorMessage: "RESEND_API_KEY not configured",
      consentSource: params.consentSource,
      consentBasis: params.consentBasis,
      consentVersion: params.consentVersion
    });
    return;
  }

  const statusUrl = `${siteUrl}/status?lead=${params.leadId}`;
  const shortId = params.leadId.slice(0, 8).toUpperCase();

  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
  <h1 style="font-size:1.4rem;margin-bottom:0.5rem;">Your request has been received, ${params.firstName}.</h1>
  <p style="color:#444;line-height:1.6;">
    Thank you for reaching out to Assisted Living Help. Your intake has been logged and
    a staff member will follow up within 1 business day using the contact methods you selected.
  </p>
  <div style="background:#f5f7fa;border-radius:8px;padding:1rem 1.25rem;margin:1.25rem 0;">
    <p style="margin:0;font-size:0.9rem;color:#555;">Reference ID</p>
    <p style="margin:0.25rem 0 0;font-size:1.1rem;font-weight:700;font-family:monospace;">${params.leadId}</p>
  </div>
  <p style="line-height:1.6;">
    You can check the status of your request at any time:
    <a href="${statusUrl}" style="color:#2563eb;">Check your request status</a>
  </p>
  <hr style="margin:1.5rem 0;border:none;border-top:1px solid #e5e7eb;" />
  <p style="font-size:0.85rem;color:#6b7280;line-height:1.5;">
    No facility will be contacted unless you have given facility-sharing consent.
    We do not claim live availability or automatic placement.
    If you need to make changes or have questions, reply to this email or call us directly.
  </p>
  <p style="font-size:0.8rem;color:#9ca3af;">Assisted Living Help &mdash; ${shortId}</p>
</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: `Assisted Living Help <${fromEmail}>`,
        to: [params.email],
        subject: "Your assisted living request has been received",
        html
      })
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      await logComm({
        leadId: params.leadId,
        channel: "email",
        recipient: masked,
        messageType: "intake_confirmation",
        status: "failed",
        errorMessage: (body as { message?: string }).message ?? `HTTP ${res.status}`,
        consentSource: params.consentSource,
        consentBasis: params.consentBasis,
        consentVersion: params.consentVersion
      });
      return;
    }

    await logComm({
      leadId: params.leadId,
      channel: "email",
      recipient: masked,
      messageType: "intake_confirmation",
      status: "sent",
      providerMessageId: (body as { id?: string }).id ?? null,
      consentSource: params.consentSource,
      consentBasis: params.consentBasis,
      consentVersion: params.consentVersion
    });
  } catch (err) {
    await logComm({
      leadId: params.leadId,
      channel: "email",
      recipient: masked,
      messageType: "intake_confirmation",
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
      consentSource: params.consentSource,
      consentBasis: params.consentBasis,
      consentVersion: params.consentVersion
    });
  }
}

export async function sendIntakeConfirmationSms(
  params: IntakeConfirmationParams & { phone: string }
) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const masked = maskPhone(params.phone);

  if (!accountSid || !authToken || !fromNumber) {
    await logComm({
      leadId: params.leadId,
      channel: "sms",
      recipient: masked,
      messageType: "intake_confirmation",
      status: "skipped",
      errorMessage: "Twilio not configured",
      consentSource: params.consentSource,
      consentBasis: params.consentBasis,
      consentVersion: params.consentVersion
    });
    return;
  }

  const shortId = params.leadId.slice(0, 8).toUpperCase();
  const messageBody =
    `Hi ${params.firstName}, your assisted living request (ref: ${shortId}) has been received. ` +
    `A staff member will follow up within 1 business day. Reply STOP to opt out.`;

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const formBody = new URLSearchParams({
      From: fromNumber,
      To: normalizePhone(params.phone),
      Body: messageBody
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody.toString()
      }
    );

    const result = await res.json().catch(() => ({}));

    type TwilioResult = { sid?: string; message?: string; error_code?: number };
    const twilio = result as TwilioResult;

    if (!res.ok || twilio.error_code) {
      await logComm({
        leadId: params.leadId,
        channel: "sms",
        recipient: masked,
        messageType: "intake_confirmation",
        status: "failed",
        errorMessage: twilio.message ?? `HTTP ${res.status}`,
        consentSource: params.consentSource,
        consentBasis: params.consentBasis,
        consentVersion: params.consentVersion
      });
      return;
    }

    await logComm({
      leadId: params.leadId,
      channel: "sms",
      recipient: masked,
      messageType: "intake_confirmation",
      status: "sent",
      providerMessageId: twilio.sid ?? null,
      consentSource: params.consentSource,
      consentBasis: params.consentBasis,
      consentVersion: params.consentVersion
    });
  } catch (err) {
    await logComm({
      leadId: params.leadId,
      channel: "sms",
      recipient: masked,
      messageType: "intake_confirmation",
      status: "failed",
      errorMessage: err instanceof Error ? err.message : "Unknown error",
      consentSource: params.consentSource,
      consentBasis: params.consentBasis,
      consentVersion: params.consentVersion
    });
  }
}
