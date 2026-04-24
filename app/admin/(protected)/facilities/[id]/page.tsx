import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toTitleCase } from "@/lib/format";
import {
  updateFacilityAction,
  addFacilityContactAction,
  updateFacilityContactAction,
  setContactPrimaryActionForm,
  deleteFacilityContactActionForm,
  addFacilityOutreachAction,
} from "./actions";

const PARTNER_LABELS: Record<string, string> = {
  prospect: "Prospect",
  contacted: "Contacted",
  interested: "Interested",
  meeting_scheduled: "Meeting scheduled",
  proposal_sent: "Proposal sent",
  negotiating: "Negotiating",
  won: "Won",
  active: "Active",
  at_risk: "At risk",
  churned: "Churned",
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

type SearchParams = Promise<{ error?: string; success?: string }>;

export default async function FacilityAdminDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();

  const { data: facility } = await supabase
    .from("alh_facilities")
    .select(
      `id, name, address, city, state, zip, county, phone,
       care_category, capacity, license_status, public_visibility,
       partner_status, preferred_contact_method,
       launch_markets(name)`
    )
    .eq("id", id)
    .single();

  if (!facility) notFound();

  const [{ data: contacts }, { data: interactions }, { data: matchedLeads }] =
    await Promise.all([
      supabase
        .from("alh_facility_contacts")
        .select("id, contact_name, title, email, phone, is_primary, created_at")
        .eq("facility_id", id)
        .order("is_primary", { ascending: false })
        .order("created_at"),
      supabase
        .from("alh_interactions")
        .select(
          `id, interaction_type, body_summary, outcome, channel, created_at,
           staff_users!created_by_staff_user_id(display_name)`
        )
        .eq("facility_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      // Leads that have been matched to this facility
      supabase
        .from("alh_matches")
        .select("lead_id, leads!lead_id(id, first_name, last_name)")
        .eq("facility_id", id)
        .not("status", "in", '("suppressed","declined")')
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  // Bound server actions
  const updateFacility = updateFacilityAction.bind(null, id);
  const addContact = addFacilityContactAction.bind(null, id);
  const addOutreach = addFacilityOutreachAction.bind(null, id);

  const market = facility.launch_markets as unknown as
    | { name: string }
    | null;

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin/facilities" className="backLink">
          ← Back to facilities
        </Link>

        <div className="adminPageHeader" style={{ marginTop: "1.25rem" }}>
          <div>
            <p className="eyebrow">Admin / Facilities</p>
            <h1>{toTitleCase(facility.name)}</h1>
            {facility.city && (
              <p style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
                {toTitleCase(facility.city)}, {facility.state}{" "}
                {facility.zip ?? ""}
              </p>
            )}
          </div>
          <span
            className={`statusBadge statusBadge--${facility.partner_status}`}
          >
            {PARTNER_LABELS[facility.partner_status] ?? facility.partner_status}
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
          {/* ── Left column ─────────────────────────────────────── */}
          <div>
            {/* Facility summary */}
            <div className="adminCard">
              <h2>Facility details</h2>
              <dl className="adminDl">
                {facility.address && (
                  <>
                    <dt>Address</dt>
                    <dd>{facility.address}</dd>
                  </>
                )}
                {facility.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${facility.phone}`}>{facility.phone}</a>
                    </dd>
                  </>
                )}
                {facility.county && (
                  <>
                    <dt>County</dt>
                    <dd>{toTitleCase(facility.county)}</dd>
                  </>
                )}
                {market?.name && (
                  <>
                    <dt>Market</dt>
                    <dd>{market.name}</dd>
                  </>
                )}
                {facility.care_category && (
                  <>
                    <dt>Care type</dt>
                    <dd>{toTitleCase(facility.care_category)}</dd>
                  </>
                )}
                {facility.capacity != null && (
                  <>
                    <dt>Capacity</dt>
                    <dd>{facility.capacity}</dd>
                  </>
                )}
                {facility.license_status && (
                  <>
                    <dt>License status</dt>
                    <dd>{toTitleCase(facility.license_status)}</dd>
                  </>
                )}
                <dt>Public visibility</dt>
                <dd>{facility.public_visibility ? "Visible" : "Hidden"}</dd>
              </dl>

              <div style={{ marginTop: "1rem" }}>
                <Link
                  href={`/facilities/${id}`}
                  className="adminSmallBtn adminSmallBtn--ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block" }}
                >
                  View public profile ↗
                </Link>
              </div>
            </div>

            {/* Partner info (editable) */}
            <div className="adminCard">
              <h2>Partner status</h2>
              <form action={updateFacility}>
                <div className="adminFormGrid">
                  <label>
                    Partner status
                    <select
                      name="partner_status"
                      defaultValue={facility.partner_status}
                    >
                      {Object.entries(PARTNER_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Preferred contact
                    <select
                      name="preferred_contact_method"
                      defaultValue={facility.preferred_contact_method ?? ""}
                    >
                      <option value="">— Not set —</option>
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </label>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <button type="submit" className="adminSmallBtn">
                    Save
                  </button>
                </div>
              </form>
            </div>

            {/* Contacts */}
            <div className="adminCard">
              <h2>Contacts</h2>

              {!contacts || contacts.length === 0 ? (
                <p
                  className="tableSecondary"
                  style={{ marginBottom: "1.25rem" }}
                >
                  No contacts yet. Add one below.
                </p>
              ) : (
                <div style={{ marginBottom: "1.25rem" }}>
                  {contacts.map((c) => {
                    const setPrimary = setContactPrimaryActionForm.bind(
                      null,
                      c.id,
                      id
                    );
                    const deleteContact = deleteFacilityContactActionForm.bind(
                      null,
                      c.id,
                      id
                    );
                    const updateContact = updateFacilityContactAction.bind(
                      null,
                      c.id,
                      id
                    );
                    return (
                      <div
                        key={c.id}
                        style={{
                          borderBottom: "1px solid var(--line)",
                          paddingBottom: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {/* Read view + primary/delete buttons */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "0.5rem",
                            marginBottom: "0.6rem",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.95rem" }}>
                              {c.contact_name}
                            </strong>
                            {c.is_primary && (
                              <span
                                style={{
                                  marginLeft: "0.5rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  color: "var(--accent)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                Primary
                              </span>
                            )}
                            {c.title && (
                              <div className="tableSecondary">{c.title}</div>
                            )}
                            {c.email && (
                              <div className="tableSecondary">
                                <a href={`mailto:${c.email}`}>{c.email}</a>
                              </div>
                            )}
                            {c.phone && (
                              <div className="tableSecondary">
                                <a href={`tel:${c.phone}`}>{c.phone}</a>
                              </div>
                            )}
                          </div>
                          <div
                            style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}
                          >
                            {!c.is_primary && (
                              <form action={setPrimary}>
                                <button
                                  type="submit"
                                  className="adminSmallBtn adminSmallBtn--ghost"
                                  style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}
                                >
                                  Set primary
                                </button>
                              </form>
                            )}
                            <form action={deleteContact}>
                              <button
                                type="submit"
                                className="adminSmallBtn adminSmallBtn--ghost"
                                style={{
                                  fontSize: "0.8rem",
                                  padding: "0.3rem 0.6rem",
                                  color: "#991b1b",
                                }}
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                        </div>

                        {/* Inline edit form — always visible, pre-filled */}
                        <form action={updateContact}>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gap: "0.5rem",
                            }}
                          >
                            <input
                              type="text"
                              name="contact_name"
                              defaultValue={c.contact_name}
                              placeholder="Name"
                              required
                              style={{
                                padding: "0.35rem 0.6rem",
                                border: "1px solid var(--line)",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            />
                            <input
                              type="text"
                              name="title"
                              defaultValue={c.title ?? ""}
                              placeholder="Title"
                              style={{
                                padding: "0.35rem 0.6rem",
                                border: "1px solid var(--line)",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            />
                            <input
                              type="email"
                              name="email"
                              defaultValue={c.email ?? ""}
                              placeholder="Email"
                              style={{
                                padding: "0.35rem 0.6rem",
                                border: "1px solid var(--line)",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            />
                            <input
                              type="tel"
                              name="phone"
                              defaultValue={c.phone ?? ""}
                              placeholder="Phone"
                              style={{
                                padding: "0.35rem 0.6rem",
                                border: "1px solid var(--line)",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            />
                          </div>
                          <button
                            type="submit"
                            className="adminSmallBtn adminSmallBtn--ghost"
                            style={{
                              marginTop: "0.4rem",
                              fontSize: "0.8rem",
                              padding: "0.3rem 0.7rem",
                            }}
                          >
                            Save changes
                          </button>
                        </form>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add contact form */}
              <p
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.75rem",
                }}
              >
                Add contact
              </p>
              <form action={addContact}>
                <div className="adminFormGrid">
                  <label>
                    Name *
                    <input
                      type="text"
                      name="contact_name"
                      required
                      placeholder="Jane Smith"
                    />
                  </label>
                  <label>
                    Title
                    <input
                      type="text"
                      name="title"
                      placeholder="Director of Sales"
                    />
                  </label>
                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      placeholder="jane@facility.com"
                    />
                  </label>
                  <label>
                    Phone
                    <input
                      type="tel"
                      name="phone"
                      placeholder="(555) 555-5555"
                    />
                  </label>
                  <label
                    className="fullWidth"
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "0.6rem",
                    }}
                  >
                    <input type="checkbox" name="is_primary" />
                    Set as primary contact
                  </label>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <button type="submit" className="adminSmallBtn">
                    Add contact
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Right column ────────────────────────────────────── */}
          <div>
            {/* Log outreach */}
            <div className="adminCard">
              <h2>Log outreach</h2>
              <form action={addOutreach}>
                <div className="adminFormGrid">
                  <label>
                    Type
                    <select name="interaction_type" defaultValue="call">
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="note">Note</option>
                      <option value="task">Task</option>
                    </select>
                  </label>
                  <label>
                    Update partner status after
                    <select name="after_status" defaultValue="">
                      <option value="">— No change —</option>
                      {Object.entries(PARTNER_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {matchedLeads && matchedLeads.length > 0 && (
                    <label className="fullWidth">
                      Related lead (optional)
                      <select name="lead_id" defaultValue="">
                        <option value="">— Not related to a specific lead —</option>
                        {matchedLeads.map((m) => {
                          const l = m.leads as unknown as {
                            id: string;
                            first_name: string;
                            last_name: string;
                          } | null;
                          if (!l) return null;
                          return (
                            <option key={l.id} value={l.id}>
                              {l.first_name} {l.last_name}
                            </option>
                          );
                        })}
                      </select>
                    </label>
                  )}
                  <label>
                    Outcome / subject
                    <input
                      type="text"
                      name="outcome"
                      placeholder="Left voicemail, sent intro email…"
                    />
                  </label>
                  <label className="fullWidth">
                    Notes
                    <textarea
                      name="body_summary"
                      required
                      placeholder="What happened, what was discussed, next steps…"
                      style={{ minHeight: 80 }}
                    />
                  </label>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <button type="submit" className="adminSmallBtn">
                    Save outreach
                  </button>
                </div>
              </form>
            </div>

            {/* Interaction / outreach feed */}
            <div className="adminCard">
              <h2>Outreach history</h2>
              {!interactions || interactions.length === 0 ? (
                <p className="tableSecondary">No outreach logged yet.</p>
              ) : (
                <div className="interactionFeed">
                  {interactions.map((item) => {
                    const author = (
                      item.staff_users as unknown as {
                        display_name: string;
                      } | null
                    )?.display_name;
                    return (
                      <div key={item.id} className="interactionItem">
                        <div className="interactionMeta">
                          <span className="interactionType">
                            {INTERACTION_TYPE_LABELS[item.interaction_type] ??
                              item.interaction_type}
                          </span>
                          {item.channel && (
                            <span className="interactionAuthor">
                              via {item.channel}
                            </span>
                          )}
                          {author && (
                            <span className="interactionAuthor">{author}</span>
                          )}
                          <span className="interactionDate">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        {item.outcome && (
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--muted)",
                              margin: "0 0 0.2rem",
                            }}
                          >
                            {item.outcome}
                          </p>
                        )}
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
