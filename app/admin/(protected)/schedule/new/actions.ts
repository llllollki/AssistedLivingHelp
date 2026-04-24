"use server";

import { hasGrantedFacilitySharingConsent, type ConsentRecord } from "@/lib/lead-workflow";
import { logInteraction } from "@/lib/log-interaction";
import { requireActiveStaffUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

async function getLeadConsents(leadId: string) {
  const { supabase } = await requireActiveStaffUser();
  const { data } = await supabase
    .from("consents")
    .select(
      "id, consent_type, channel, consent_state, consent_text_version, source_page, consent_source, consent_basis, granted_at, revoked_at, created_at"
    )
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  return (data ?? []) as ConsentRecord[];
}

export async function createAppointmentAction(formData: FormData) {
  const { supabase, user } = await requireActiveStaffUser();

  const leadId = (formData.get("leadId") as string)?.trim();
  const facilityId = (formData.get("facilityId") as string)?.trim();
  const appointmentType = (formData.get("appointmentType") as string)?.trim();
  const scheduledFor = (formData.get("scheduledFor") as string)?.trim() || null;

  if (!leadId || !facilityId || !appointmentType) {
    redirect("/admin/schedule/new?error=Lead%2C+facility%2C+and+appointment+type+are+required");
  }

  const leadConsents = await getLeadConsents(leadId);
  if (!hasGrantedFacilitySharingConsent(leadConsents)) {
    redirect(`/admin/schedule/new?leadId=${leadId}&error=Facility-sharing+consent+is+required`);
  }

  const [{ data: lead }, { data: existingMatch }, { data: facility }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, first_name, last_name, status, launch_market_id")
      .eq("id", leadId)
      .single(),
    supabase
      .from("alh_matches")
      .select("id, status")
      .eq("lead_id", leadId)
      .eq("facility_id", facilityId)
      .maybeSingle(),
    supabase
      .from("alh_facilities")
      .select("id, name, launch_market_id")
      .eq("id", facilityId)
      .single()
  ]);

  if (!lead) {
    redirect("/admin/schedule/new?error=Lead+not+found");
  }

  if (!facility) {
    redirect(`/admin/schedule/new?leadId=${leadId}&error=Facility+not+found`);
  }

  if (!existingMatch && !lead.launch_market_id) {
    redirect(
      `/admin/schedule/new?leadId=${leadId}&error=Lead+must+have+a+launch+market+before+approving+a+facility+for+scheduling`
    );
  }

  if (lead.launch_market_id && facility.launch_market_id !== lead.launch_market_id) {
    redirect(
      `/admin/schedule/new?leadId=${leadId}&error=Facility+must+be+in+the+lead%27s+launch+market`
    );
  }

  let matchId = existingMatch?.id ?? null;
  let matchStatus = existingMatch?.status ?? null;

  if (!matchId) {
    const { data: createdMatch, error: matchInsertError } = await supabase
      .from("alh_matches")
      .insert({
        lead_id: leadId,
        facility_id: facilityId,
        reason_summary: "Approved for scheduling by staff.",
        status: "reviewed",
        manually_overridden: true,
        overridden_by_staff_user_id: user.id
      })
      .select("id, status")
      .single();

    if (matchInsertError || !createdMatch) {
      redirect(
        `/admin/schedule/new?leadId=${leadId}&error=${encodeURIComponent(matchInsertError?.message ?? "Failed to approve facility for scheduling")}`
      );
    }

    matchId = createdMatch.id;
    matchStatus = createdMatch.status;
  } else if (matchStatus !== "reviewed" && matchStatus !== "shared") {
    const { data: upgradedMatch, error: matchUpdateError } = await supabase
      .from("alh_matches")
      .update({
        status: "reviewed",
        manually_overridden: true,
        overridden_by_staff_user_id: user.id
      })
      .eq("id", matchId)
      .select("id, status")
      .single();

    if (matchUpdateError || !upgradedMatch) {
      redirect(
        `/admin/schedule/new?leadId=${leadId}&error=${encodeURIComponent(matchUpdateError?.message ?? "Failed to approve suggested match")}`
      );
    }

    matchStatus = upgradedMatch.status;
  }

  const scheduledForIso = scheduledFor ? new Date(scheduledFor).toISOString() : null;

  const { data: appointment, error } = await supabase
    .from("alh_appointments")
    .insert({
      lead_id: leadId,
      facility_id: facilityId,
      appointment_type: appointmentType,
      status: "requested",
      proposed_at: new Date().toISOString(),
      scheduled_for: scheduledForIso
    })
    .select("id")
    .single();

  if (error || !appointment) {
    redirect(
      `/admin/schedule/new?leadId=${leadId}&error=${encodeURIComponent(error?.message ?? "Failed to create appointment")}`
    );
  }

  await supabase
    .from("alh_matches")
    .update({
      status: "shared",
      manually_overridden: true,
      overridden_by_staff_user_id: user.id
    })
    .eq("id", matchId);

  await supabase
    .from("leads")
    .update({ status: "matched", updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if (matchStatus !== "shared") {
    await logInteraction(supabase, {
      lead_id: leadId,
      facility_id: facilityId,
      staff_user_id: user.id,
      interaction_type: "status_change",
      outcome: "Facility approved for scheduling",
      body_summary: `${facility.name} was approved as a reviewed match during appointment creation.`
    });
  }

  await logInteraction(supabase, {
    lead_id: leadId,
    facility_id: facilityId,
    staff_user_id: user.id,
    interaction_type: "share",
    outcome: "Appointment requested with matched facility",
    body_summary: `${appointmentType} requested with ${facility.name} for ${lead.first_name} ${lead.last_name}${scheduledForIso ? ` on ${new Date(scheduledForIso).toLocaleString()}` : ""}.`
  });

  redirect(`/admin/schedule/${appointment.id}`);
}
