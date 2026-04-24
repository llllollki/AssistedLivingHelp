import { summarizeLeadConsents, type ConsentRecord } from "@/lib/lead-workflow";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toTitleCase } from "@/lib/format";
import {
  updateLeadStatusAction,
  addNoteAction,
  assignLeadAction,
  saveCareProfileAction,
  addMatchAction,
  updateMatchStatusAction
} from "./actions";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  intake_in_progress: "Intake in progress",
  qualified: "Qualified",
  assigned: "Assigned",
  matching_in_progress: "Matching in progress",
  matched: "Matched",
  closed_won: "Closed - won",
  closed_lost: "Closed - lost"
};

const MATCH_STATUS_LABELS: Record<string, string> = {
  suggested: "Suggested",
  reviewed: "Reviewed",
  shared: "Shared",
  suppressed: "Suppressed",
  declined: "Declined"
};

const INTERACTION_TYPE_LABELS: Record<string, string> = {
  note: "Note",
  sms: "SMS",
  email: "Email",
  call: "Call",
  share: "Shared",
  task: "Task",
  status_change: "Status change"
};

const CONSENT_STATE_LABELS: Record<string, string> = {
  granted: "Granted",
  not_granted: "Not granted",
  missing: "Missing"
};

function getSingleRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type SearchParams = Promise<{ error?: string; success?: string }>;

function consentBadgeClass(state: string) {
  if (state === "granted") {
    return "statusBadge statusBadge--matched";
  }

  if (state === "missing") {
    return "statusBadge statusBadge--closed_lost";
  }

  return "statusBadge statusBadge--new";
}

export default async function LeadDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: lead } = await supabase
    .from("leads")
    .select(
      `id, first_name, last_name, email, phone, preferred_contact_method,
       relationship_to_resident, desired_city, move_in_timeframe,
       general_care_category, budget_min, budget_max, wants_scheduling_help,
       status, attribution_channel, attribution_campaign, created_at, updated_at,
       launch_market_id, assigned_staff_user_id,
       launch_markets(name),
       staff_users!assigned_staff_user_id(id, display_name)`
    )
    .eq("id", id)
    .single();

  if (!lead) {
    notFound();
  }

  const [
    { data: interactions },
    { data: staffUsers },
    { data: careProfile },
    { data: matches },
    { data: consents },
    { data: outboundComms }
  ] = await Promise.all([
    supabase
      .from("alh_interactions")
      .select(
        `id, interaction_type, body_summary, outcome, due_at, created_at,
         staff_users!created_by_staff_user_id(display_name)`
      )
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("staff_users")
      .select("id, display_name")
      .eq("is_active", true)
      .order("display_name"),
    supabase.from("lead_profiles").select("*").eq("lead_id", id).maybeSingle(),
    supabase
      .from("alh_matches")
      .select(
        `id, status, score, reason_summary, manually_overridden, created_at,
         alh_facilities!facility_id(id, name, city)`
      )
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("consents")
      .select(
        "id, consent_type, channel, consent_state, consent_text_version, source_page, consent_source, consent_basis, granted_at, revoked_at, created_at"
      )
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("outbound_comms")
      .select(
        "id, channel, recipient, message_type, attempted_at, status, provider_message_id, error_message"
      )
      .eq("lead_id", id)
      .order("attempted_at", { ascending: false })
  ]);

  const matchedFacilityIds = (matches ?? [])
    .map((match) => {
      const facility = getSingleRelation(
        match.alh_facilities as { id: string } | Array<{ id: string }> | null
      );
      return facility?.id ?? null;
    })
    .filter((facilityId): facilityId is string => Boolean(facilityId));

  let facilityQuery = supabase.from("alh_facilities").select("id, name, city").order("name").limit(300);

  if (lead.launch_market_id) {
    facilityQuery = facilityQuery.eq("launch_market_id", lead.launch_market_id);
  }

  const { data: allFacilities } = await facilityQuery;
  const availableFacilities = (allFacilities ?? []).filter(
    (facility) => !matchedFacilityIds.includes(facility.id)
  );

  const updateStatus = updateLeadStatusAction.bind(null, id);
  const addNote = addNoteAction.bind(null, id);
  const assignLead = assignLeadAction.bind(null, id);
  const saveCareProfile = saveCareProfileAction.bind(null, id);
  const addMatch = addMatchAction.bind(null, id);

  const market = getSingleRelation(lead.launch_markets as { name: string } | { name: string }[] | null);
  const assignee = getSingleRelation(
    lead.staff_users as
      | { id: string; display_name: string }
      | Array<{ id: string; display_name: string }>
      | null
  );
  const consentSummary = summarizeLeadConsents((consents ?? []) as ConsentRecord[]);
  const sharingLocked = consentSummary.facilitySharing !== "granted";

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin/leads" className="backLink">
          {"<- "}Back to leads
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

        {sp.error && (
          <p className="errorBanner" style={{ marginBottom: "1rem" }}>
            {sp.error}
          </p>
        )}
        {sp.success && (
          <p className="successBanner" style={{ marginBottom: "1rem" }}>
            {sp.success}
          </p>
        )}

        <div className="leadDetailGrid">
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
                      {lead.budget_min != null ? `$${lead.budget_min.toLocaleString()}` : "-"} to{" "}
                      {lead.budget_max != null ? `$${lead.budget_max.toLocaleString()}` : "-"}
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
                <dd>{new Date(lead.created_at).toLocaleString()}</dd>
              </dl>
            </div>

            <div className="adminCard">
              <h2>Consent &amp; sharing</h2>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>Privacy notice</span>
                  <span className={consentBadgeClass(consentSummary.privacyNotice)}>
                    {CONSENT_STATE_LABELS[consentSummary.privacyNotice]}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>Service contact</span>
                  <span className={consentBadgeClass(consentSummary.serviceContact)}>
                    {CONSENT_STATE_LABELS[consentSummary.serviceContact]}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>Email follow-up</span>
                  <span className={consentBadgeClass(consentSummary.email)}>
                    {CONSENT_STATE_LABELS[consentSummary.email]}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>SMS follow-up</span>
                  <span className={consentBadgeClass(consentSummary.sms)}>
                    {CONSENT_STATE_LABELS[consentSummary.sms]}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>Phone follow-up</span>
                  <span className={consentBadgeClass(consentSummary.phone)}>
                    {CONSENT_STATE_LABELS[consentSummary.phone]}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                  <span>Facility sharing</span>
                  <span className={consentBadgeClass(consentSummary.facilitySharing)}>
                    {CONSENT_STATE_LABELS[consentSummary.facilitySharing]}
                  </span>
                </div>
              </div>
              <dl className="adminDl" style={{ marginTop: "1rem" }}>
                <dt>Consent source</dt>
                <dd>{consentSummary.source ?? "Not recorded"}</dd>
                <dt>Consent basis</dt>
                <dd>{consentSummary.basis ?? "Not recorded"}</dd>
                <dt>Consent version</dt>
                <dd>{consentSummary.version ?? "Not recorded"}</dd>
              </dl>
              {sharingLocked && (
                <p className="errorBanner" style={{ marginTop: "1rem" }}>
                  Facility sharing and appointment creation stay locked until sharing consent is
                  granted.
                </p>
              )}
            </div>

            <div className="adminCard">
              <h2>Assignment</h2>
              {assignee ? (
                <p style={{ fontSize: "0.93rem", marginBottom: "0.75rem" }}>
                  Currently assigned to <strong>{assignee.display_name}</strong>
                </p>
              ) : (
                <p style={{ fontSize: "0.93rem", color: "var(--muted)", marginBottom: "0.75rem" }}>
                  Unassigned
                </p>
              )}
              <form action={assignLead} className="adminInlineForm">
                <select name="assignedStaffUserId" defaultValue={lead.assigned_staff_user_id ?? ""}>
                  <option value="">- Unassigned -</option>
                  {(staffUsers ?? []).map((staffUser) => (
                    <option key={staffUser.id} value={staffUser.id}>
                      {staffUser.display_name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="adminSmallBtn">
                  Save
                </button>
              </form>
            </div>

            <div className="adminCard">
              <h2>Update status</h2>
              <form action={updateStatus} className="adminInlineForm">
                <select name="status" defaultValue={lead.status}>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <button type="submit" className="adminSmallBtn">
                  Save
                </button>
              </form>
            </div>

            <div className="adminCard">
              <h2>Care profile</h2>
              <form action={saveCareProfile}>
                <div className="adminFormGrid">
                  <label>
                    Urgency
                    <select name="urgency" defaultValue={careProfile?.urgency ?? ""}>
                      <option value="">- Not set -</option>
                      <option value="Immediately">Immediately</option>
                      <option value="Within 30 days">Within 30 days</option>
                      <option value="Within 60 days">Within 60 days</option>
                      <option value="Researching">Researching</option>
                    </select>
                  </label>
                  <label>
                    Mobility needs
                    <input
                      type="text"
                      name="mobility_needs"
                      defaultValue={careProfile?.mobility_needs ?? ""}
                      placeholder="e.g. Walker, wheelchair"
                    />
                  </label>
                  <label
                    className="fullWidth"
                    style={{ flexDirection: "row", alignItems: "center", gap: "0.6rem" }}
                  >
                    <input
                      type="checkbox"
                      name="memory_care_needed"
                      defaultChecked={careProfile?.memory_care_needed ?? false}
                    />
                    Memory care needed
                  </label>
                  <label
                    className="fullWidth"
                    style={{ flexDirection: "row", alignItems: "center", gap: "0.6rem" }}
                  >
                    <input
                      type="checkbox"
                      name="medication_support_needed"
                      defaultChecked={careProfile?.medication_support_needed ?? false}
                    />
                    Medication support needed
                  </label>
                  <label className="fullWidth">
                    Preferences &amp; notes
                    <textarea
                      name="freeform_preferences"
                      defaultValue={careProfile?.freeform_preferences ?? ""}
                      placeholder="Additional preferences or notes from the family"
                      style={{ minHeight: 72 }}
                    />
                  </label>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <button type="submit" className="adminSmallBtn">
                    Save care profile
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div>
            <div className="adminCard">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "center",
                  marginBottom: "1rem"
                }}
              >
                <div>
                  <h2 style={{ marginBottom: "0.35rem" }}>Matches</h2>
                  <p className="tableSecondary">
                    Automated suggestions stay internal until staff review. Sharing and scheduling
                    require facility-sharing consent.
                  </p>
                </div>
                <Link href={`/admin/schedule/new?leadId=${id}`} className="adminSmallBtn adminSmallBtn--ghost">
                  Schedule
                </Link>
              </div>

              {!matches || matches.length === 0 ? (
                <p className="tableSecondary" style={{ marginBottom: "1.25rem" }}>
                  No matches yet.
                </p>
              ) : (
                <div style={{ marginBottom: "1.25rem" }}>
                  {matches.map((match) => {
                    const facility = getSingleRelation(
                      match.alh_facilities as
                        | { id: string; name: string; city: string | null }
                        | Array<{ id: string; name: string; city: string | null }>
                        | null
                    );
                    const updateMatchStatus = updateMatchStatusAction.bind(null, match.id, id);

                    return (
                      <div
                        key={match.id}
                        style={{
                          borderBottom: "1px solid var(--line)",
                          paddingBottom: "0.9rem",
                          marginBottom: "0.9rem"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                            marginBottom: "0.35rem"
                          }}
                        >
                          <div>
                            {facility ? (
                              <Link href={`/admin/facilities/${facility.id}`} className="tableRowLink">
                                {toTitleCase(facility.name)}
                              </Link>
                            ) : (
                              <span className="tableSecondary">Unknown facility</span>
                            )}
                            {facility?.city && (
                              <span className="tableSecondary" style={{ marginLeft: "0.5rem" }}>
                                {toTitleCase(facility.city)}
                              </span>
                            )}
                            <div className="tableSecondary" style={{ marginTop: "0.25rem" }}>
                              {match.manually_overridden ? "Staff-reviewed match" : "Automated suggestion"}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            {match.score != null && (
                              <span
                                style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted)" }}
                                title="Match score"
                              >
                                {Number(match.score).toFixed(0)}
                              </span>
                            )}
                            <span className={`statusBadge statusBadge--${match.status}`}>
                              {MATCH_STATUS_LABELS[match.status] ?? match.status}
                            </span>
                          </div>
                        </div>
                        {match.reason_summary && (
                          <p className="tableSecondary" style={{ marginBottom: "0.35rem" }}>
                            {match.reason_summary}
                          </p>
                        )}
                        <form action={updateMatchStatus} className="adminInlineForm" style={{ marginTop: "0.4rem" }}>
                          <select name="status" defaultValue={match.status}>
                            {Object.entries(MATCH_STATUS_LABELS).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                          <button type="submit" className="adminSmallBtn adminSmallBtn--ghost">
                            Update
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}

              {availableFacilities.length > 0 ? (
                <>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.6rem"
                    }}
                  >
                    Add reviewed match
                  </p>
                  <form action={addMatch}>
                    <div className="adminFormGrid">
                      <label className="fullWidth">
                        Facility
                        <select name="facilityId" required>
                          <option value="">- Select facility -</option>
                          {availableFacilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>
                              {toTitleCase(facility.name)}
                              {facility.city ? ` - ${toTitleCase(facility.city)}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="fullWidth">
                        Reason / notes
                        <input
                          type="text"
                          name="reasonSummary"
                          placeholder="Why this facility is a strong operational fit"
                        />
                      </label>
                    </div>
                    <div style={{ marginTop: "0.75rem" }}>
                      <button type="submit" className="adminSmallBtn">
                        Add match
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <p className="tableSecondary" style={{ fontSize: "0.85rem" }}>
                  {matches && matches.length > 0
                    ? "All available facilities in this market are already matched."
                    : "No facilities available for this market yet."}
                </p>
              )}
            </div>

            <div className="adminCard">
              <h2>Outbound communications</h2>
              <p className="tableSecondary" style={{ marginBottom: "0.75rem" }}>
                Email and SMS attempts sent after intake. Status reflects delivery to the provider,
                not confirmed receipt by the family.
              </p>
              {!outboundComms || outboundComms.length === 0 ? (
                <p className="tableSecondary">No outbound communications logged.</p>
              ) : (
                <div className="interactionFeed">
                  {outboundComms.map((comm) => (
                    <div key={comm.id} className="interactionItem">
                      <div className="interactionMeta">
                        <span className="interactionType">{comm.channel.toUpperCase()}</span>
                        <span
                          className={`statusBadge statusBadge--${
                            comm.status === "sent"
                              ? "matched"
                              : comm.status === "failed"
                              ? "closed_lost"
                              : "new"
                          }`}
                        >
                          {comm.status}
                        </span>
                        <span className="interactionDate">
                          {new Date(comm.attempted_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0.2rem 0 0" }}>
                        To: {comm.recipient} &middot; {comm.message_type}
                      </p>
                      {comm.provider_message_id && (
                        <p style={{ fontSize: "0.78rem", color: "var(--muted)", margin: "0.1rem 0 0" }}>
                          Provider ID: {comm.provider_message_id}
                        </p>
                      )}
                      {comm.error_message && (
                        <p style={{ fontSize: "0.78rem", color: "var(--error, #dc2626)", margin: "0.1rem 0 0" }}>
                          Error: {comm.error_message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="adminCard">
              <h2>Add note</h2>
              <form action={addNote}>
                <div className="adminInlineForm" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <textarea
                    name="body"
                    placeholder="Call notes, follow-up reminder, or next step"
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
                    const author = getSingleRelation(
                      item.staff_users as
                        | { display_name: string }
                        | Array<{ display_name: string }>
                        | null
                    )?.display_name;

                    return (
                      <div key={item.id} className="interactionItem">
                        <div className="interactionMeta">
                          <span className="interactionType">
                            {INTERACTION_TYPE_LABELS[item.interaction_type] ?? item.interaction_type}
                          </span>
                          {author && <span className="interactionAuthor">{author}</span>}
                          <span className="interactionDate">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        {item.outcome && (
                          <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 0.2rem" }}>
                            {item.outcome}
                          </p>
                        )}
                        {item.due_at && (
                          <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 0.2rem" }}>
                            Due {new Date(item.due_at).toLocaleString()}
                          </p>
                        )}
                        {item.body_summary && <p className="interactionBody">{item.body_summary}</p>}
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
