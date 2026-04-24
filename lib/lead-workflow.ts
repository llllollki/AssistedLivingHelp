import type { SupabaseClient } from "@supabase/supabase-js";

export const CONSENT_TEXT_VERSION = "mvp-v2";

type ConsentState = "granted" | "not_granted" | "missing";

export type ConsentRecord = {
  id?: string;
  consent_type: string;
  channel: string | null;
  consent_state: string;
  consent_text_version: string | null;
  source_page: string | null;
  consent_source?: string | null;
  consent_basis?: string | null;
  granted_at?: string | null;
  revoked_at?: string | null;
  created_at?: string;
};

type BuildConsentRowsInput = {
  leadId: string;
  sourcePage: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  capturedByStaffUserId?: string | null;
  consentSource?: string | null;
  consentBasis?: string | null;
  privacyNoticeAcknowledged: boolean;
  serviceContact: boolean;
  email: boolean;
  sms: boolean;
  phone: boolean;
  facilitySharing: boolean;
};

type LeadMatchSeedInput = {
  leadId: string;
  launchMarketId: string | null;
  desiredCity?: string | null;
  generalCareCategory?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
};

export type LeadConsentSummary = {
  privacyNotice: ConsentState;
  serviceContact: ConsentState;
  facilitySharing: ConsentState;
  email: ConsentState;
  sms: ConsentState;
  phone: ConsentState;
  source: string | null;
  basis: string | null;
  version: string | null;
};

function normalizeConsentState(value: string | null | undefined): ConsentState {
  if (value === "granted") {
    return "granted";
  }

  if (value === "not_granted") {
    return "not_granted";
  }

  return "missing";
}

function getConsentRow(
  rows: ConsentRecord[],
  consentType: string,
  channel?: string | null
) {
  return rows.find((row) => {
    if (row.consent_type !== consentType) {
      return false;
    }

    if (channel === undefined) {
      return true;
    }

    return row.channel === channel;
  });
}

function buildConsentRow(
  input: BuildConsentRowsInput,
  consentType: string,
  channel: string | null,
  granted: boolean,
  fallbackState: ConsentState
) {
  return {
    lead_id: input.leadId,
    consent_type: consentType,
    channel,
    consent_state: granted ? "granted" : fallbackState,
    consent_text_version: CONSENT_TEXT_VERSION,
    sharing_scope:
      consentType === "facility_sharing"
        ? "selected_facility_coordination"
        : "matching_and_support",
    granted_at: granted ? new Date().toISOString() : null,
    source_page: input.sourcePage,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    captured_by_staff_user_id: input.capturedByStaffUserId ?? null,
    consent_source: input.consentSource ?? null,
    consent_basis: input.consentBasis ?? null
  };
}

export function buildConsentRows(input: BuildConsentRowsInput) {
  return [
    buildConsentRow(
      input,
      "privacy_notice_acknowledgment",
      null,
      input.privacyNoticeAcknowledged,
      "missing"
    ),
    buildConsentRow(
      input,
      "service_contact",
      "all",
      input.serviceContact,
      input.capturedByStaffUserId ? "missing" : "not_granted"
    ),
    buildConsentRow(
      input,
      "email",
      "email",
      input.email,
      input.capturedByStaffUserId ? "missing" : "not_granted"
    ),
    buildConsentRow(
      input,
      "sms",
      "sms",
      input.sms,
      input.capturedByStaffUserId ? "missing" : "not_granted"
    ),
    buildConsentRow(
      input,
      "phone_call",
      "phone",
      input.phone,
      input.capturedByStaffUserId ? "missing" : "not_granted"
    ),
    buildConsentRow(
      input,
      "facility_sharing",
      null,
      input.facilitySharing,
      input.capturedByStaffUserId ? "missing" : "not_granted"
    )
  ];
}

export function summarizeLeadConsents(rows: ConsentRecord[]): LeadConsentSummary {
  const privacy = getConsentRow(rows, "privacy_notice_acknowledgment");
  const serviceContact = getConsentRow(rows, "service_contact", "all");
  const facilitySharing = getConsentRow(rows, "facility_sharing");
  const email = getConsentRow(rows, "email", "email");
  const sms = getConsentRow(rows, "sms", "sms");
  const phone = getConsentRow(rows, "phone_call", "phone");

  return {
    privacyNotice: normalizeConsentState(privacy?.consent_state),
    serviceContact: normalizeConsentState(serviceContact?.consent_state),
    facilitySharing: normalizeConsentState(facilitySharing?.consent_state),
    email: normalizeConsentState(email?.consent_state),
    sms: normalizeConsentState(sms?.consent_state),
    phone: normalizeConsentState(phone?.consent_state),
    source:
      facilitySharing?.consent_source ??
      serviceContact?.consent_source ??
      privacy?.consent_source ??
      null,
    basis:
      facilitySharing?.consent_basis ??
      serviceContact?.consent_basis ??
      privacy?.consent_basis ??
      null,
    version:
      facilitySharing?.consent_text_version ??
      serviceContact?.consent_text_version ??
      privacy?.consent_text_version ??
      null
  };
}

export function hasGrantedFacilitySharingConsent(rows: ConsentRecord[]) {
  return getConsentRow(rows, "facility_sharing")?.consent_state === "granted";
}

function scoreFacilityMatch(params: {
  facilityCity: string | null;
  facilityCareCategory: string | null;
  leadDesiredCity?: string | null;
  leadCareCategory?: string | null;
  leadBudgetMin?: number | null;
  leadBudgetMax?: number | null;
  facilityCapacity?: number | null;
}) {
  let score = 50;
  const reasons: string[] = ["Same launch market"];

  if (
    params.leadDesiredCity &&
    params.facilityCity &&
    params.facilityCity.toLowerCase() === params.leadDesiredCity.toLowerCase()
  ) {
    score += 20;
    reasons.push("desired city match");
  }

  if (
    params.leadCareCategory &&
    params.facilityCareCategory &&
    params.leadCareCategory.toLowerCase() !== "unsure" &&
    params.facilityCareCategory.toLowerCase().includes(params.leadCareCategory.toLowerCase())
  ) {
    score += 15;
    reasons.push("care category aligned");
  }

  if (params.leadBudgetMax && params.leadBudgetMax > 0) {
    score += 5;
    reasons.push("budget noted for staff review");
  }

  if (params.facilityCapacity && params.facilityCapacity > 0) {
    score += 3;
    reasons.push("licensed capacity available");
  }

  return {
    score,
    reasonSummary: `${reasons.join("; ")}. Automated suggestion only until staff review.`
  };
}

export async function seedLeadMatchesForStaff(
  supabase: SupabaseClient,
  input: LeadMatchSeedInput
) {
  if (!input.launchMarketId) {
    return [];
  }

  let query = supabase
    .from("alh_facilities")
    .select("id, name, city, care_category, capacity")
    .eq("launch_market_id", input.launchMarketId)
    .eq("public_visibility", true)
    .order("name")
    .limit(25);

  if (input.generalCareCategory && input.generalCareCategory.toLowerCase() !== "unsure") {
    query = query.ilike("care_category", `%${input.generalCareCategory}%`);
  }

  const { data: facilities, error } = await query;

  if (error || !facilities || facilities.length === 0) {
    return [];
  }

  const scoredFacilities = facilities
    .map((facility) => ({
      facility,
      ...scoreFacilityMatch({
        facilityCity: facility.city,
        facilityCareCategory: facility.care_category,
        leadDesiredCity: input.desiredCity,
        leadCareCategory: input.generalCareCategory,
        leadBudgetMin: input.budgetMin,
        leadBudgetMax: input.budgetMax,
        facilityCapacity: facility.capacity
      })
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  if (scoredFacilities.length === 0) {
    return [];
  }

  const { error: insertError } = await supabase.from("alh_matches").upsert(
    scoredFacilities.map(({ facility, score, reasonSummary }) => ({
      lead_id: input.leadId,
      facility_id: facility.id,
      score,
      reason_summary: reasonSummary,
      status: "suggested",
      manually_overridden: false,
      overridden_by_staff_user_id: null
    })),
    { onConflict: "lead_id,facility_id", ignoreDuplicates: true }
  );

  if (insertError) {
    return [];
  }

  return scoredFacilities;
}
