"use server";

import {
  hasGrantedFacilitySharingConsent,
  summarizeLeadConsents,
  type ConsentRecord
} from "@/lib/lead-workflow";
import { logInteraction } from "@/lib/log-interaction";
import { requireActiveStaffUser } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
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

async function moveLeadIntoMatchingIfNeeded(supabase: Awaited<ReturnType<typeof requireActiveStaffUser>>["supabase"], leadId: string) {
  const { data: lead } = await supabase.from("leads").select("status").eq("id", leadId).single();

  if (lead?.status === "new" || lead?.status === "intake_in_progress") {
    await supabase
      .from("leads")
      .update({ status: "matching_in_progress", updated_at: new Date().toISOString() })
      .eq("id", leadId);
  }
}

export async function updateLeadStatusAction(leadId: string, formData: FormData) {
  const newStatus = formData.get("status") as string;
  if (!newStatus) return;

  const { supabase, user } = await requireActiveStaffUser();

  await supabase
    .from("leads")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  await logInteraction(supabase, {
    lead_id: leadId,
    staff_user_id: user.id,
    interaction_type: "status_change",
    outcome: `Status updated to: ${newStatus}`,
    body_summary: `Status changed to ${newStatus} by staff.`
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

export async function addNoteAction(leadId: string, formData: FormData) {
  const body = (formData.get("body") as string)?.trim();
  if (!body) return;

  const { supabase, user } = await requireActiveStaffUser();

  await logInteraction(supabase, {
    lead_id: leadId,
    staff_user_id: user.id,
    interaction_type: "note",
    body_summary: body
  });

  revalidatePath(`/admin/leads/${leadId}`);
}

export async function assignLeadAction(leadId: string, formData: FormData) {
  const staffUserId = ((formData.get("assignedStaffUserId") as string) || "").trim() || null;

  const { supabase, user } = await requireActiveStaffUser();

  let assigneeName = "Unassigned";
  if (staffUserId) {
    const { data: assignee } = await supabase
      .from("staff_users")
      .select("display_name, is_active")
      .eq("id", staffUserId)
      .single();

    if (!assignee || !assignee.is_active) {
      redirect(`/admin/leads/${leadId}?error=Invalid+assignee`);
    }

    assigneeName = assignee.display_name;
  }

  await supabase
    .from("leads")
    .update({
      assigned_staff_user_id: staffUserId,
      updated_at: new Date().toISOString()
    })
    .eq("id", leadId);

  await logInteraction(supabase, {
    lead_id: leadId,
    staff_user_id: user.id,
    interaction_type: "status_change",
    outcome: staffUserId ? `Assigned to: ${assigneeName}` : "Unassigned",
    body_summary: staffUserId ? `Lead assigned to ${assigneeName}.` : "Lead unassigned."
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

export async function saveCareProfileAction(leadId: string, formData: FormData) {
  const { supabase, user } = await requireActiveStaffUser();

  await supabase.from("lead_profiles").upsert(
    {
      lead_id: leadId,
      urgency: ((formData.get("urgency") as string) || "").trim() || null,
      mobility_needs: ((formData.get("mobility_needs") as string) || "").trim() || null,
      memory_care_needed: formData.get("memory_care_needed") === "on",
      medication_support_needed: formData.get("medication_support_needed") === "on",
      freeform_preferences:
        ((formData.get("freeform_preferences") as string) || "").trim() || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "lead_id" }
  );

  await logInteraction(supabase, {
    lead_id: leadId,
    staff_user_id: user.id,
    interaction_type: "note",
    body_summary: "Care profile updated."
  });

  revalidatePath(`/admin/leads/${leadId}`);
}

export async function addMatchAction(leadId: string, formData: FormData) {
  const facilityId = (formData.get("facilityId") as string)?.trim();
  if (!facilityId) return;

  const { supabase, user } = await requireActiveStaffUser();
  const reasonSummary = ((formData.get("reasonSummary") as string) || "").trim() || null;

  const { error } = await supabase.from("alh_matches").insert({
    lead_id: leadId,
    facility_id: facilityId,
    reason_summary: reasonSummary
      ? `${reasonSummary}. Staff-reviewed match.`
      : "Staff-reviewed match.",
    status: "reviewed",
    manually_overridden: true,
    overridden_by_staff_user_id: user.id
  });

  if (error) {
    const message =
      error.code === "23505"
        ? "This facility is already matched to this lead."
        : error.message;
    redirect(`/admin/leads/${leadId}?error=${encodeURIComponent(message)}`);
  }

  await moveLeadIntoMatchingIfNeeded(supabase, leadId);

  const { data: facility } = await supabase
    .from("alh_facilities")
    .select("name")
    .eq("id", facilityId)
    .single();

  await logInteraction(supabase, {
    lead_id: leadId,
    facility_id: facilityId,
    staff_user_id: user.id,
    interaction_type: "note",
    outcome: "Staff-reviewed match added",
    body_summary: `Added ${facility?.name ?? "facility"} as a reviewed match${reasonSummary ? `: ${reasonSummary}` : "."}`
  });

  revalidatePath(`/admin/leads/${leadId}`);
}

export async function updateMatchStatusAction(
  matchId: string,
  leadId: string,
  formData: FormData
) {
  const newStatus = formData.get("status") as string;
  if (!newStatus) return;

  const { supabase, user } = await requireActiveStaffUser();
  const leadConsents = await getLeadConsents(leadId);

  if (newStatus === "shared" && !hasGrantedFacilitySharingConsent(leadConsents)) {
    redirect(`/admin/leads/${leadId}?error=Facility-sharing+consent+is+required+before+sharing`);
  }

  const { data: match } = await supabase
    .from("alh_matches")
    .select("facility_id, alh_facilities!facility_id(name)")
    .eq("id", matchId)
    .single();

  await supabase
    .from("alh_matches")
    .update({
      status: newStatus,
      manually_overridden: true,
      overridden_by_staff_user_id: user.id
    })
    .eq("id", matchId);

  if (newStatus === "reviewed") {
    await moveLeadIntoMatchingIfNeeded(supabase, leadId);
  }

  if (newStatus === "shared") {
    await supabase
      .from("leads")
      .update({ status: "matched", updated_at: new Date().toISOString() })
      .eq("id", leadId);
  }

  const facilityRelation = match?.alh_facilities as
    | { name: string }
    | Array<{ name: string }>
    | null
    | undefined;
  const facilityName = Array.isArray(facilityRelation)
    ? facilityRelation[0]?.name
    : facilityRelation?.name;
  const summary = summarizeLeadConsents(leadConsents);

  await logInteraction(supabase, {
    lead_id: leadId,
    facility_id: match?.facility_id ?? null,
    staff_user_id: user.id,
    interaction_type: newStatus === "shared" ? "share" : "status_change",
    outcome:
      newStatus === "shared"
        ? "Lead shared with facility"
        : `Match status: ${newStatus}`,
    body_summary:
      newStatus === "shared"
        ? `Shared with ${facilityName ?? "facility"} under ${summary.source ?? "recorded"} consent (${summary.basis ?? "basis not documented"}).`
        : `Match with ${facilityName ?? "facility"} updated to ${newStatus}.`
  });

  revalidatePath(`/admin/leads/${leadId}`);
}
