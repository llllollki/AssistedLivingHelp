import type { SupabaseClient } from "@supabase/supabase-js";

type InteractionType =
  | "note"
  | "sms"
  | "email"
  | "call"
  | "share"
  | "task"
  | "status_change";

export async function logInteraction(
  supabase: SupabaseClient,
  params: {
    staff_user_id: string;
    interaction_type: InteractionType;
    lead_id?: string | null;
    facility_id?: string | null;
    outcome?: string | null;
    body_summary?: string | null;
    channel?: string | null;
    direction?: string | null;
  }
) {
  await supabase.from("alh_interactions").insert({
    created_by_staff_user_id: params.staff_user_id,
    interaction_type: params.interaction_type,
    lead_id: params.lead_id ?? null,
    facility_id: params.facility_id ?? null,
    outcome: params.outcome ?? null,
    body_summary: params.body_summary ?? null,
    channel: params.channel ?? null,
    direction: params.direction ?? null,
  });
}
