"use server";

import { buildConsentRows, seedLeadMatchesForStaff } from "@/lib/lead-workflow";
import { logInteraction } from "@/lib/log-interaction";
import { requireActiveStaffUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function createLeadAction(formData: FormData) {
  const { supabase, user, staffUser } = await requireActiveStaffUser();

  const marketSlug = (formData.get("launchMarketSlug") as string) || "";
  let marketId: string | null = null;

  if (marketSlug) {
    const { data: market } = await supabase
      .from("launch_markets")
      .select("id")
      .eq("slug", marketSlug)
      .maybeSingle();

    marketId = market?.id ?? null;
  }

  const firstName = (formData.get("firstName") as string).trim();
  const lastName = (formData.get("lastName") as string).trim();

  if (!firstName || !lastName) {
    redirect("/admin/leads/new?error=First+name+and+last+name+are+required");
  }

  const desiredCity = (formData.get("desiredCity") as string)?.trim() || null;
  const moveInTimeframe = (formData.get("moveInTimeframe") as string)?.trim() || null;
  const generalCareCategory =
    (formData.get("generalCareCategory") as string)?.trim() || null;
  const budgetMinValue = (formData.get("budgetMin") as string)?.trim() || "";
  const budgetMaxValue = (formData.get("budgetMax") as string)?.trim() || "";
  const budgetMin = budgetMinValue ? Number(budgetMinValue) : null;
  const budgetMax = budgetMaxValue ? Number(budgetMaxValue) : null;

  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      launch_market_id: marketId,
      first_name: firstName,
      last_name: lastName,
      email: ((formData.get("email") as string) || "").trim() || null,
      phone: ((formData.get("phone") as string) || "").trim() || null,
      preferred_contact_method:
        ((formData.get("preferredContactMethod") as string) || "").trim() || null,
      relationship_to_resident:
        ((formData.get("relationshipToResident") as string) || "").trim() || null,
      desired_city: desiredCity,
      move_in_timeframe: moveInTimeframe,
      general_care_category: generalCareCategory,
      budget_min: budgetMin,
      budget_max: budgetMax,
      wants_scheduling_help: formData.get("wantsSchedulingHelp") === "on",
      status: "intake_in_progress",
      attribution_channel: "manual_entry"
    })
    .select("id")
    .single();

  if (error || !lead) {
    redirect(
      `/admin/leads/new?error=${encodeURIComponent(error?.message ?? "Lead creation failed")}`
    );
  }

  const consentSource = ((formData.get("consentSource") as string) || "").trim() || null;
  const consentBasis = ((formData.get("consentBasis") as string) || "").trim() || null;

  const { error: consentError } = await supabase.from("consents").insert(
    buildConsentRows({
      leadId: lead.id,
      sourcePage: "/admin/leads/new",
      capturedByStaffUserId: user.id,
      consentSource,
      consentBasis,
      privacyNoticeAcknowledged: formData.get("consentPrivacyAcknowledgment") === "on",
      serviceContact: formData.get("consentContactSupport") === "on",
      email: formData.get("consentEmail") === "on",
      sms: formData.get("consentSms") === "on",
      phone: formData.get("consentPhone") === "on",
      facilitySharing: formData.get("consentFacilitySharing") === "on"
    })
  );

  if (consentError) {
    redirect(`/admin/leads/new?error=${encodeURIComponent(consentError.message)}`);
  }

  await supabase.from("alh_interactions").insert([
    {
      lead_id: lead.id,
      created_by_staff_user_id: user.id,
      interaction_type: "status_change",
      outcome: "Lead created manually by staff",
      body_summary: "Lead moved into intake_in_progress for concierge triage."
    },
    {
      lead_id: lead.id,
      created_by_staff_user_id: user.id,
      interaction_type: "task",
      outcome: "Review manual intake and confirm next step",
      body_summary:
        "Confirm contact permissions, review fit, and decide whether facility sharing is allowed.",
      due_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const seededMatches = await seedLeadMatchesForStaff(supabase, {
    leadId: lead.id,
    launchMarketId: marketId,
    desiredCity,
    generalCareCategory,
    budgetMin,
    budgetMax
  });

  if (seededMatches.length > 0) {
    await logInteraction(supabase, {
      lead_id: lead.id,
      staff_user_id: user.id,
      interaction_type: "note",
      outcome: "Automated suggestions seeded for review",
      body_summary: `${seededMatches.length} initial facility suggestions were seeded for staff review.`
    });
  }

  if (!consentSource || !consentBasis) {
    await logInteraction(supabase, {
      lead_id: lead.id,
      staff_user_id: user.id,
      interaction_type: "note",
      outcome: "Consent source or basis missing",
      body_summary: `Consent source or basis still needs to be documented. Captured by ${staffUser.display_name}.`
    });
  }

  redirect(`/admin/leads/${lead.id}`);
}
