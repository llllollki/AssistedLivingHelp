import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { updateLeadStatusAction, addNoteAction } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  intake_in_progress: "Intake in progress",
  qualified: "Qualified",
  assigned: "Assigned",
  matching_in_progress: "Matching in progress",
  matched: "Matched",
  closed_won: "Closed — won",
  closed_lost: "Closed — lost",
};

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  note: "Note",
  sms: "SMS",
  email: "Email",
  call: "Call",
  share: "Shared",
  task: "Task",
  status_change: "Status change",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: lead } = await supabase
    .from("leads")
    .select(
      `id, first_name, last_name, email, phone, preferred_contact_method,
       relationship_to_resident, desired_city, move_in_timeframe,
       general_care_category, budget_min, budget_max, wants_scheduling_help,
       status, attribution_channel, attribution_campaign, created_at, updated_at,
       launch_markets(name)`
    )
    .eq("id", id)
    .single();

  if (!lead) notFound();

  const { data: interactions } = await supabase
    .from("alh_interactions")
    .select(
      `id, interaction_type, body_summary, outcome, created_at,
       staff_users!created_by_staff_user_id(display_name)`
    )
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  const updateStatus = updateLeadStatusAction.bind(null, id);
  const addNote = addNoteAction.bind(null, id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const market = lead.launch_markets as unknown as { name: string } | null;

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin/leads" className="backLink">
          ← Back to leads
        </Link>

        <div className="adminPageHeader" style={{ marginTop: "1.25rem" }}>
          <div>
            <p className="eyebrow">Admin / Leads</p>
            <h1>
              {lead.first_name} {lead.last_name}
            </h1>
          </div>
          <span className={`statusBadge statusBadge--${lead.status}`}>
            {STATUS_LABELS[lead.status] ?? lead.status}
          </span>
        </div>

        <div className="leadDetailGrid">
          {/* Left column: lead info + status update */}
          <div>
            <div className="adminCard">
              <h2>Contact &amp; intake</h2>
              <dl className="adminDl">
                {lead.email && (
                  <>
                    <dt>Email</dt>
                    <dd>
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                    </dd>
                  </>
                )}
                {lead.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                    </dd>
                  </>
                )}
                {lead.preferred_contact_method && (
                  <>
                    <dt>Preferred contact</dt>
                    <dd>{lead.preferred_contact_method}</dd>
                  </>
                )}
                {lead.relationship_to_resident && (
                  <>
                    <dt>Relationship</dt>
                    <dd>{lead.relationship_to_resident}</dd>
                  </>
                )}
                {market?.name && (
                  <>
                    <dt>Market</dt>
                    <dd>{market.name}</dd>
                  </>
                )}
                {lead.desired_city && (
                  <>
                    <dt>Desired city</dt>
                    <dd>{lead.desired_city}</dd>
                  </>
                )}
                {lead.move_in_timeframe && (
                  <>
                    <dt>Move-in</dt>
                    <dd>{lead.move_in_timeframe}</dd>
                  </>
                )}
                {lead.general_care_category && (
                  <>
                    <dt>Care category</dt>
                    <dd>{lead.general_care_category}</dd>
                  </>
                )}
                {(lead.budget_min != null || lead.budget_max != null) && (
                  <>
                    <dt>Budget</dt>
                    <dd>
                      {lead.budget_min != null
                        ? `$${lead.budget_min.toLocaleString()}`
                        : "—"}{" "}
                      –{" "}
                      {lead.budget_max != null
                        ? `$${lead.budget_max.toLocaleString()}`
                        : "—"}
                    </dd>
                  </>
                )}
                <dt>Scheduling help</dt>
                <dd>{lead.wants_scheduling_help ? "Yes" : "No"}</dd>
                {lead.attribution_channel && (
                  <>
                    <dt>Source</dt>
                    <dd>{lead.attribution_channel}</dd>
                  </>
                )}
                {lead.attribution_campaign && (
                  <>
                    <dt>Campaign</dt>
                    <dd>{lead.attribution_campaign}</dd>
                  </>
                )}
                <dt>Created</dt>
                <dd>
                  {new Date(lead.created_at).toLocaleString()}
                </dd>
              </dl>
            </div>

            <div className="adminCard">
              <h2>Update status</h2>
              <form action={updateStatus} className="adminInlineForm">
                <select name="status" defaultValue={lead.status}>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="adminSmallBtn">
                  Save
                </button>
              </form>
            </div>
          </div>

          {/* Right column: add note + interaction feed */}
          <div>
            <div className="adminCard">
              <h2>Add note</h2>
              <form action={addNote}>
                <div className="adminInlineForm" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <textarea
                    name="body"
                    placeholder="Call notes, follow-up reminder, next step…"
                    required
                  />
                  <button type="submit" className="adminSmallBtn" style={{ alignSelf: "flex-start" }}>
                    Save note
                  </button>
                </div>
              </form>
            </div>

            <div className="adminCard">
              <h2>Activity</h2>
              {!interactions || interactions.length === 0 ? (
                <p className="tableSecondary">No activity yet.</p>
              ) : (
                <div className="interactionFeed">
                  {interactions.map((item) => {
                    const author = (
                      item.staff_users as unknown as { display_name: string } | null
                    )?.display_name;
                    return (
                      <div key={item.id} className="interactionItem">
                        <div className="interactionMeta">
                          <span className="interactionType">
                            {INTERACTION_TYPE_LABELS[item.interaction_type] ??
                              item.interaction_type}
                          </span>
                          {author && (
                            <span className="interactionAuthor">{author}</span>
                          )}
                          <span className="interactionDate">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        {item.body_summary && (
                          <p className="interactionBody">{item.body_summary}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
