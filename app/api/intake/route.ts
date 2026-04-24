import { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicClient, getSupabaseServiceRoleClient } from "@/lib/supabase";
import { parseIntakeForm, validateIntakePayload } from "@/lib/validation";
import { checkIntakeRateLimit } from "@/lib/rate-limit";
import {
  sendIntakeConfirmationEmail,
  sendIntakeConfirmationSms
} from "@/lib/comms";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Rate limit: 5 submissions per IP per 15-minute window.
  const { limited } = await checkIntakeRateLimit(ip);
  if (limited) {
    const params = new URLSearchParams({
      error:
        "Too many submissions from your location. Please wait 15 minutes and try again, or call us directly."
    });
    return NextResponse.redirect(new URL(`/get-help?${params.toString()}`, request.url));
  }

  const formData = await request.formData();
  const payload = parseIntakeForm(formData);
  const errors = validateIntakePayload(payload);

  if (errors.length > 0) {
    const params = new URLSearchParams({ error: errors[0] });
    return NextResponse.redirect(new URL(`/get-help?${params.toString()}`, request.url));
  }

  const supabase = getSupabasePublicClient();
  if (!supabase) {
    const params = new URLSearchParams({ error: "Supabase is not configured yet." });
    return NextResponse.redirect(new URL(`/get-help?${params.toString()}`, request.url));
  }

  const userAgent = request.headers.get("user-agent");

  const { data, error } = await supabase.rpc("submit_public_intake", {
    p_payload: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email || null,
      phone: payload.phone || null,
      preferredContactMethod: payload.preferredContactMethod || null,
      relationshipToResident: payload.relationshipToResident,
      launchMarketSlug: payload.launchMarketSlug,
      desiredCity: payload.desiredCity || null,
      moveInTimeframe: payload.moveInTimeframe,
      generalCareCategory: payload.generalCareCategory,
      budgetMin: payload.budgetMin ? Number(payload.budgetMin) : null,
      budgetMax: payload.budgetMax ? Number(payload.budgetMax) : null,
      wantsSchedulingHelp: payload.wantsSchedulingHelp,
      consentPrivacyAcknowledgment: payload.consentPrivacyAcknowledgment,
      consentContactSupport: payload.consentContactSupport,
      consentEmail: payload.consentEmail,
      consentSms: payload.consentSms,
      consentPhone: payload.consentPhone,
      consentFacilitySharing: payload.consentFacilitySharing,
      attributionChannel: request.nextUrl.searchParams.get("utm_source") ?? "website",
      attributionCampaign: request.nextUrl.searchParams.get("utm_campaign"),
      attributionAdSet: request.nextUrl.searchParams.get("utm_adset"),
      attributionAd: request.nextUrl.searchParams.get("utm_ad"),
      landingPageVariant: request.nextUrl.searchParams.get("variant")
    },
    p_ip_address: ip,
    p_user_agent: userAgent
  });

  if (error || !data || data.length === 0) {
    const params = new URLSearchParams({
      error: "We could not save your intake. Please try again or call us directly."
    });
    return NextResponse.redirect(new URL(`/get-help?${params.toString()}`, request.url));
  }

  const result = data[0] as { lead_id: string; market_slug: string };

  // Send confirmations. Must complete before the function returns so the
  // serverless runtime doesn't terminate the work mid-flight. Intake
  // success does not depend on send success — all errors are swallowed
  // and logged to outbound_comms.
  await sendConfirmations(result.lead_id);

  const params = new URLSearchParams({
    lead: result.lead_id,
    market: result.market_slug
  });
  return NextResponse.redirect(
    new URL(`/confirmation?${params.toString()}`, request.url)
  );
}

async function sendConfirmations(leadId: string) {
  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) return;

  const [{ data: lead }, { data: consents }] = await Promise.all([
    supabase
      .from("leads")
      .select("first_name, email, phone")
      .eq("id", leadId)
      .single(),
    supabase
      .from("consents")
      .select("consent_type, channel, consent_state, consent_source, consent_basis, consent_text_version")
      .eq("lead_id", leadId)
  ]);

  if (!lead) return;

  const emailConsent = consents?.find(
    (c) => c.consent_type === "email" && c.channel === "email"
  );
  const smsConsent = consents?.find(
    (c) => c.consent_type === "sms" && c.channel === "sms"
  );

  const baseConsent = {
    consentSource:
      emailConsent?.consent_source ?? smsConsent?.consent_source ?? null,
    consentBasis:
      emailConsent?.consent_basis ?? smsConsent?.consent_basis ?? null,
    consentVersion:
      emailConsent?.consent_text_version ??
      smsConsent?.consent_text_version ??
      null
  };

  const sends: Promise<void>[] = [];

  if (lead.email && emailConsent?.consent_state === "granted") {
    sends.push(
      sendIntakeConfirmationEmail({
        leadId,
        email: lead.email,
        firstName: lead.first_name,
        ...baseConsent
      })
    );
  }

  if (lead.phone && smsConsent?.consent_state === "granted") {
    sends.push(
      sendIntakeConfirmationSms({
        leadId,
        phone: lead.phone,
        firstName: lead.first_name,
        ...baseConsent
      })
    );
  }

  await Promise.allSettled(sends);
}
