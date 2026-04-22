"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function updateLeadStatusAction(
  leadId: string,
  formData: FormData
) {
  const newStatus = formData.get("status") as string;
  if (!newStatus) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("leads")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  await supabase.from("alh_interactions").insert({
    lead_id: leadId,
    created_by_staff_user_id: user.id,
    interaction_type: "status_change",
    outcome: `Status updated to: ${newStatus}`,
    body_summary: `Status changed to ${newStatus} by staff.`,
  });

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
}

export async function addNoteAction(leadId: string, formData: FormData) {
  const body = (formData.get("body") as string)?.trim();
  if (!body) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("alh_interactions").insert({
    lead_id: leadId,
    created_by_staff_user_id: user.id,
    interaction_type: "note",
    body_summary: body,
  });

  revalidatePath(`/admin/leads/${leadId}`);
}
