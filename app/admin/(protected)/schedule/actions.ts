"use server";

import { logInteraction } from "@/lib/log-interaction";
import { requireActiveStaffUser } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

async function syncLeadAndMatchStatus(
  supabase: Awaited<ReturnType<typeof requireActiveStaffUser>>["supabase"],
  userId: string,
  appointmentId: string,
  newStatus: string
) {
  const { data: appointment } = await supabase
    .from("alh_appointments")
    .select("lead_id, facility_id, appointment_type")
    .eq("id", appointmentId)
    .single();

  if (!appointment?.lead_id || !appointment.facility_id) {
    return appointment;
  }

  if (newStatus === "requested" || newStatus === "options_received" || newStatus === "proposed_to_family") {
    await supabase
      .from("alh_matches")
      .update({
        status: "shared",
        manually_overridden: true,
        overridden_by_staff_user_id: userId
      })
      .eq("lead_id", appointment.lead_id)
      .eq("facility_id", appointment.facility_id);

    await supabase
      .from("leads")
      .update({ status: "matched", updated_at: new Date().toISOString() })
      .eq("id", appointment.lead_id);
  }

  if (newStatus === "confirmed") {
    await supabase
      .from("alh_matches")
      .update({
        status: "shared",
        manually_overridden: true,
        overridden_by_staff_user_id: userId
      })
      .eq("lead_id", appointment.lead_id)
      .eq("facility_id", appointment.facility_id);

    await supabase
      .from("leads")
      .update({ status: "matched", updated_at: new Date().toISOString() })
      .eq("id", appointment.lead_id);
  }

  return appointment;
}

export async function updateAppointmentStatusAction(appointmentId: string, formData: FormData) {
  const newStatus = formData.get("status") as string;
  if (!newStatus) return;

  const { supabase, user } = await requireActiveStaffUser();

  const updateData: Record<string, string | null> = {
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (newStatus === "confirmed") {
    updateData.confirmed_at = new Date().toISOString();
  }

  if (newStatus === "cancelled") {
    updateData.cancelled_at = new Date().toISOString();
  }

  await supabase.from("alh_appointments").update(updateData).eq("id", appointmentId);
  const appointment = await syncLeadAndMatchStatus(supabase, user.id, appointmentId, newStatus);

  if (appointment?.lead_id) {
    await logInteraction(supabase, {
      lead_id: appointment.lead_id,
      facility_id: appointment.facility_id,
      staff_user_id: user.id,
      interaction_type: "status_change",
      outcome: `Appointment status: ${newStatus}`,
      body_summary: `${appointment.appointment_type ?? "Appointment"} status updated to ${newStatus}.`
    });
  }

  revalidatePath("/admin/schedule");
  revalidatePath(`/admin/schedule/${appointmentId}`);
}

export async function addAppointmentNoteAction(
  appointmentId: string,
  leadId: string,
  facilityId: string,
  formData: FormData
) {
  const body = (formData.get("body") as string)?.trim();
  if (!body) return;

  const { supabase, user } = await requireActiveStaffUser();

  await logInteraction(supabase, {
    lead_id: leadId,
    facility_id: facilityId,
    staff_user_id: user.id,
    interaction_type: "note",
    body_summary: body
  });

  revalidatePath(`/admin/schedule/${appointmentId}`);
  revalidatePath(`/admin/leads/${leadId}`);
}
