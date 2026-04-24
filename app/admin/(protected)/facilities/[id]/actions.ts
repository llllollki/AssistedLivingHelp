"use server";

import { hasGrantedFacilitySharingConsent, type ConsentRecord } from "@/lib/lead-workflow";
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

export async function updateFacilityAction(facilityId: string, formData: FormData) {
  const { supabase, user } = await requireActiveStaffUser();

  const partnerStatus = ((formData.get("partner_status") as string) || "").trim() || null;
  const preferredContactMethod =
    ((formData.get("preferred_contact_method") as string) || "").trim() || null;

  const { data: before } = await supabase
    .from("alh_facilities")
    .select("partner_status, name")
    .eq("id", facilityId)
    .single();

  await supabase
    .from("alh_facilities")
    .update({
      partner_status: partnerStatus,
      preferred_contact_method: preferredContactMethod,
      updated_at: new Date().toISOString()
    })
    .eq("id", facilityId);

  const statusChanged = before && partnerStatus && before.partner_status !== partnerStatus;

  await logInteraction(supabase, {
    facility_id: facilityId,
    staff_user_id: user.id,
    interaction_type: "status_change",
    outcome: statusChanged
      ? `Partner status: ${before.partner_status} -> ${partnerStatus}`
      : "Facility info updated",
    body_summary: statusChanged
      ? `Partner status changed to ${partnerStatus} for ${before?.name ?? "facility"}.`
      : `Facility contact method updated to ${preferredContactMethod ?? "none"}.`
  });

  revalidatePath(`/admin/facilities/${facilityId}`);
  revalidatePath("/admin/facilities");
  revalidatePath("/admin/partners");
}

export async function addFacilityContactAction(facilityId: string, formData: FormData) {
  const { supabase, user } = await requireActiveStaffUser();

  const contactName = (formData.get("contact_name") as string)?.trim();
  if (!contactName) return;

  const title = ((formData.get("title") as string) || "").trim() || null;
  const email = ((formData.get("email") as string) || "").trim() || null;
  const phone = ((formData.get("phone") as string) || "").trim() || null;
  const isPrimary = formData.get("is_primary") === "on";

  if (isPrimary) {
    await supabase.from("alh_facility_contacts").update({ is_primary: false }).eq("facility_id", facilityId);
  }

  await supabase.from("alh_facility_contacts").insert({
    facility_id: facilityId,
    contact_name: contactName,
    title,
    email,
    phone,
    is_primary: isPrimary
  });

  await logInteraction(supabase, {
    facility_id: facilityId,
    staff_user_id: user.id,
    interaction_type: "note",
    body_summary: `Contact added: ${contactName}${title ? ` (${title})` : ""}.`
  });

  revalidatePath(`/admin/facilities/${facilityId}`);
}

export async function updateFacilityContactAction(
  contactId: string,
  facilityId: string,
  formData: FormData
) {
  const { supabase, user } = await requireActiveStaffUser();

  const contactName = (formData.get("contact_name") as string)?.trim();
  if (!contactName) return;

  const title = ((formData.get("title") as string) || "").trim() || null;
  const email = ((formData.get("email") as string) || "").trim() || null;
  const phone = ((formData.get("phone") as string) || "").trim() || null;

  await supabase
    .from("alh_facility_contacts")
    .update({ contact_name: contactName, title, email, phone })
    .eq("id", contactId);

  await logInteraction(supabase, {
    facility_id: facilityId,
    staff_user_id: user.id,
    interaction_type: "note",
    body_summary: `Contact updated: ${contactName}${title ? ` (${title})` : ""}.`
  });

  revalidatePath(`/admin/facilities/${facilityId}`);
}

export async function setContactPrimaryAction(contactId: string, facilityId: string) {
  const { supabase, user } = await requireActiveStaffUser();

  await supabase.from("alh_facility_contacts").update({ is_primary: false }).eq("facility_id", facilityId);
  await supabase.from("alh_facility_contacts").update({ is_primary: true }).eq("id", contactId);

  const { data: contact } = await supabase
    .from("alh_facility_contacts")
    .select("contact_name")
    .eq("id", contactId)
    .single();

  await logInteraction(supabase, {
    facility_id: facilityId,
    staff_user_id: user.id,
    interaction_type: "note",
    body_summary: `Primary contact set to ${contact?.contact_name ?? "contact"}.`
  });

  revalidatePath(`/admin/facilities/${facilityId}`);
}

export async function deleteFacilityContactAction(contactId: string, facilityId: string) {
  const { supabase, user } = await requireActiveStaffUser();

  const { data: contact } = await supabase
    .from("alh_facility_contacts")
    .select("contact_name")
    .eq("id", contactId)
    .single();

  await supabase.from("alh_facility_contacts").delete().eq("id", contactId);

  await logInteraction(supabase, {
    facility_id: facilityId,
    staff_user_id: user.id,
    interaction_type: "note",
    body_summary: `Contact removed: ${contact?.contact_name ?? "contact"}.`
  });

  revalidatePath(`/admin/facilities/${facilityId}`);
}

export async function addFacilityOutreachAction(facilityId: string, formData: FormData) {
  const { supabase, user } = await requireActiveStaffUser();

  const interactionType = ((formData.get("interaction_type") as string) || "note").trim();
  const bodySummary = (formData.get("body_summary") as string)?.trim();
  const channel = ((formData.get("channel") as string) || "").trim() || null;
  const outcome = ((formData.get("outcome") as string) || "").trim() || null;
  const leadId = ((formData.get("lead_id") as string) || "").trim() || null;

  if (!bodySummary) return;

  if (interactionType === "share" && leadId) {
    const leadConsents = await getLeadConsents(leadId);
    if (!hasGrantedFacilitySharingConsent(leadConsents)) {
      redirect(`/admin/facilities/${facilityId}?error=Facility-sharing+consent+is+required`);
    }
  }

  await logInteraction(supabase, {
    facility_id: facilityId,
    lead_id: leadId,
    staff_user_id: user.id,
    interaction_type: interactionType as
      | "note"
      | "sms"
      | "email"
      | "call"
      | "share"
      | "task"
      | "status_change",
    body_summary: bodySummary,
    channel,
    outcome
  });

  const newPartnerStatus = ((formData.get("after_status") as string) || "").trim() || null;
  if (newPartnerStatus) {
    await supabase
      .from("alh_facilities")
      .update({
        partner_status: newPartnerStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", facilityId);
    revalidatePath("/admin/partners");
  }

  revalidatePath(`/admin/facilities/${facilityId}`);
  if (leadId) {
    revalidatePath(`/admin/leads/${leadId}`);
  }
}

export async function setContactPrimaryActionForm(
  contactId: string,
  facilityId: string,
  _formData: FormData
) {
  await setContactPrimaryAction(contactId, facilityId);
}

export async function deleteFacilityContactActionForm(
  contactId: string,
  facilityId: string,
  _formData: FormData
) {
  const { supabase } = await requireActiveStaffUser();
  const { count } = await supabase
    .from("alh_facility_contacts")
    .select("*", { count: "exact", head: true })
    .eq("facility_id", facilityId);

  if ((count ?? 0) <= 1) {
    redirect(`/admin/facilities/${facilityId}?error=Cannot+remove+the+only+contact`);
  }

  await deleteFacilityContactAction(contactId, facilityId);
}
