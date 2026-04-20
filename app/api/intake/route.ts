import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { parseIntakeForm, validateIntakePayload } from "@/lib/validation";

const CONSENT_TEXT_VERSION = "mvp-v1";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const payload = parseIntakeForm(formData);
  const errors = validateIntakePayload(payload);

  if (errors.length > 0) {
    const params = new URLSearchParams({ error: errors[0] });
    return NextResponse.redirect(new URL(`/get-help?${params.toString()}`, request.url));
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    const params = new URLSearchParams({ error: "Supabase is not configured yet." });
    return NextResponse.redirect(new URL(`/get-help?${params.toString()}`, request.url));
  }

  const { data: market, error: marketError } = await supabase
    .from("launch_markets")
    .select("id, slug")
    .eq("slug", payload.launchMarketSlug)
    .single();

  if (marketError || !market) {
    const params = new URLSearchParams({ error: "Selected market could not be found." });
    return NextResponse.redirect(new URL(`/get-help?${params.toString()}`, request.url));
  }

  const leadInsert = {
    launch_market_id: market.id,
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email || null,
    phone: payload.phone || null,
    preferred_contact_method: payload.preferredContactMethod || null,
    relationship_to_resident: payload.relationshipToResident,
    desired_city: payload.desiredCity || null,
    move_in_timeframe: payload.moveInTimeframe,
    general_care_category: payload.generalCareCategory,
    budget_min: payload.budgetMin ? Number(payload.budgetMin) : null,
    budget_max: payload.budgetMax ? Number(payload.budgetMax) : null,
    wants_scheduling_help: payload.wantsSchedulingHelp,
    attribution_channel: request.nextUrl.searchParams.get("utm_source") ?? "website",
    attribution_campaign: request.nextUrl.searchParams.get("utm_campaign"),
    attribution_ad_set: request.nextUrl.searchParams.get("utm_adset"),
    attribution_ad: request.nextUrl.searchParams.get("utm_ad"),
    landing_page_variant: request.nextUrl.searchParams.get("variant")
  };

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert(leadInsert)
    .select("id")
    .single();

  if (leadError || !lead) {
    const params = new URLSearchParams({ error: "Lead could not be created." });
    return NextResponse.redirect(new URL(`/get-help?${params.toString()}`, request.url));
  }

  const consentRows = [
    {
      lead_id: lead.id,
      consent_type: "contact_support",
      channel: "all",
      consent_state: payload.consentContactSupport ? "granted" : "denied",
      consent_text_version: CONSENT_TEXT_VERSION,
      sharing_scope: "matching_and_scheduling_support",
      granted_at: payload.consentContactSupport ? new Date().toISOString() : null,
      source_page: "/get-help",
      ip_address: request.headers.get("x-forwarded-for"),
      user_agent: request.headers.get("user-agent")
    },
    {
      lead_id: lead.id,
      consent_type: "email",
      channel: "email",
      consent_state: payload.consentEmail ? "granted" : "not_granted",
      consent_text_version: CONSENT_TEXT_VERSION,
      sharing_scope: "direct_updates",
      granted_at: payload.consentEmail ? new Date().toISOString() : null,
      source_page: "/get-help",
      ip_address: request.headers.get("x-forwarded-for"),
      user_agent: request.headers.get("user-agent")
    },
    {
      lead_id: lead.id,
      consent_type: "sms",
      channel: "sms",
      consent_state: payload.consentSms ? "granted" : "not_granted",
      consent_text_version: CONSENT_TEXT_VERSION,
      sharing_scope: "direct_updates",
      granted_at: payload.consentSms ? new Date().toISOString() : null,
      source_page: "/get-help",
      ip_address: request.headers.get("x-forwarded-for"),
      user_agent: request.headers.get("user-agent")
    },
    {
      lead_id: lead.id,
      consent_type: "phone_call",
      channel: "phone",
      consent_state: payload.consentPhone ? "granted" : "not_granted",
      consent_text_version: CONSENT_TEXT_VERSION,
      sharing_scope: "direct_updates",
      granted_at: payload.consentPhone ? new Date().toISOString() : null,
      source_page: "/get-help",
      ip_address: request.headers.get("x-forwarded-for"),
      user_agent: request.headers.get("user-agent")
    }
  ];

  await supabase.from("consents").insert(consentRows);

  await supabase.from("alh_interactions").insert({
    lead_id: lead.id,
    interaction_type: "status_change",
    outcome: "Lead created from intake flow",
    body_summary: "Initial intake submitted through public website."
  });

  const params = new URLSearchParams({ lead: lead.id, market: market.slug });
  return NextResponse.redirect(new URL(`/confirmation?${params.toString()}`, request.url));
}
