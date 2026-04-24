import { NextRequest, NextResponse } from "next/server";
import { getSupabasePublicClient } from "@/lib/supabase";
import { parseIntakeForm, validateIntakePayload } from "@/lib/validation";
import { checkIntakeRateLimit } from "@/lib/rate-limit";

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
  const params = new URLSearchParams({
    lead: result.lead_id,
    market: result.market_slug
  });
  return NextResponse.redirect(
    new URL(`/confirmation?${params.toString()}`, request.url)
  );
}
