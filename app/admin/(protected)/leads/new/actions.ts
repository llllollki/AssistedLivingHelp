"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function createLeadAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const adminClient = getSupabaseAdminClient();
  if (!adminClient) redirect("/admin/leads/new?error=Server+configuration+error");

  const marketSlug = formData.get("launchMarketSlug") as string;
  let marketId: string | null = null;

  if (marketSlug) {
    const { data: market } = await adminClient
      .from("launch_markets")
      .select("id")
      .eq("slug", marketSlug)
      .single();
    marketId = market?.id ?? null;
  }

  const budgetMin = formData.get("budgetMin") as string;
  const budgetMax = formData.get("budgetMax") as string;

  const { data: lead, error } = await adminClient
    .from("leads")
    .insert({
      launch_market_id: marketId,
      first_name: (formData.get("firstName") as string).trim(),
      last_name: (formData.get("lastName") as string).trim(),
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      preferred_contact_method:
        (formData.get("preferredContactMethod") as string) || null,
      relationship_to_resident:
        (formData.get("relationshipToResident") as string) || null,
      desired_city: (formData.get("desiredCity") as string) || null,
      move_in_timeframe: (formData.get("moveInTimeframe") as string) || null,
      general_care_category:
        (formData.get("generalCareCategory") as string) || null,
      budget_min: budgetMin ? Number(budgetMin) : null,
      budget_max: budgetMax ? Number(budgetMax) : null,
      wants_scheduling_help:
        formData.get("wantsSchedulingHelp") === "on",
      status: "new",
      attribution_channel: "manual_entry",
    })
    .select("id")
    .single();

  if (error || !lead) {
    redirect(
      `/admin/leads/new?error=${encodeURIComponent(error?.message ?? "Lead creation failed")}`
    );
  }

  await adminClient.from("alh_interactions").insert({
    lead_id: lead.id,
    created_by_staff_user_id: user.id,
    interaction_type: "note",
    outcome: "Lead created manually by staff",
    body_summary: "Lead record created manually by staff member.",
  });

  redirect(`/admin/leads/${lead.id}`);
}
