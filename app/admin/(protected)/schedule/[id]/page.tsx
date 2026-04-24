import { createSupabaseServerClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toTitleCase } from "@/lib/format";
import {
  updateAppointmentStatusAction,
  addAppointmentNoteAction,
} from "../actions";

const APPT_STATUS_LABELS: Record<string, string> = {
  not_started: "Not started",
  requested: "Requested",
  options_received: "Options received",
  proposed_to_family: "Proposed to family",
  confirmed: "Confirmed",
  reschedule_requested: "Reschedule requested",
  cancelled: "Cancelled",
  completed: "Completed",
  no_show: "No show",
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

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: appt } = await supabase
    .from("alh_appointments")
    .select(
      `id, appointment_type, status,
       proposed_at, scheduled_for, confirmed_at, cancelled_at,
       created_at, updated_at,
       leads!lead_id(id, first_name, last_name, email, phone, status),
       alh_facilities!facility_id(id, name, city, phone)`
    )
    .eq("id", id)
    .single();

  if (!appt) notFound();

  const lead = appt.leads as unknown as {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    status: string;
  } | null;

  const facility = appt.alh_facilities as unknown as {
    id: string;
    name: string;
    city: string | null;
    phone: string | null;
  } | null;

  // Interactions scoped to this lead+facility — best proxy for appointment context
  const { data: interactions } = await supabase
    .from("alh_interactions")
    .select(
      `id, interaction_type, body_summary, outcome, created_at,
       staff_users!created_by_staff_user_id(display_name)`
    )
    .eq("lead_id", lead?.id ?? "")
    .eq("facility_id", facility?.id ?? "")
    .order("created_at", { ascending: false })
    .limit(50);

  const updateStatus = updateAppointmentStatusAction.bind(null, id);
  const addNote = addAppointmentNoteAction.bind(
    null,
    id,
    lead?.id ?? "",
    facility?.id ?? ""
  );

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin/schedule" className="backLink">
          ← Back to schedule
        </Link>

        <div className="adminPageHeader" style={{ marginTop: "1.25rem" }}>
          <div>
            <p className="eyebrow">Admin / Schedule</p>
            <h1>{appt.appointment_type}</h1>
            <p style={{ color: "var(--muted)", marginTop: "0.25rem" }}>
              {lead
                ? `${lead.first_name} ${lead.last_name}`
                : "Unknown lead"}{" "}
              &mdash;{" "}
              {facility ? toTitleCase(facility.name) : "Unknown facility"}
              {facility?.city ? `, ${toTitleCase(facility.city)}` : ""}
            </p>
          </div>
          <span className={`statusBadge statusBadge--${appt.status}`}>
            {APPT_STATUS_LABELS[appt.status] ?? appt.status}
          </span>
        </div>

        <div className="leadDetailGrid">
          {/* ── Left: details + status update ───────────────── */}
          <div>
            <div className="adminCard">
              <h2>Appointment details</h2>
              <dl className="adminDl">
                <dt>Type</dt>
                <dd>{appt.appointment_type}</dd>
                <dt>Scheduled for</dt>
                <dd>{fmt(appt.scheduled_for)}</dd>
                {appt.proposed_at && (
                  <>
                    <dt>Proposed at</dt>
                    <dd>{fmt(appt.proposed_at)}</dd>
                  </>
                )}
                {appt.confirmed_at && (
                  <>
                    <dt>Confirmed at</dt>
                    <dd>{fmt(appt.confirmed_at)}</dd>
                  </>
                )}
                {appt.cancelled_at && (
                  <>
                    <dt>Cancelled at</dt>
                    <dd>{fmt(appt.cancelled_at)}</dd>
                  </>
                )}
                <dt>Created</dt>
                <dd>{fmt(appt.created_at)}</dd>
              </dl>
            </div>

            <div className="adminCard">
              <h2>Lead</h2>
              {lead ? (
                <dl className="adminDl">
                  <dt>Name</dt>
                  <dd>
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="tableRowLink"
                    >
                      {lead.first_name} {lead.last_name}
                    </Link>
                  </dd>
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
                  <dt>Lead status</dt>
                  <dd>
                    <span className={`statusBadge statusBadge--${lead.status}`}>
                      {lead.status}
                    </span>
                  </dd>
                </dl>
              ) : (
                <p className="tableSecondary">Lead not found.</p>
              )}
            </div>

            <div className="adminCard">
              <h2>Facility</h2>
              {facility ? (
                <dl className="adminDl">
                  <dt>Name</dt>
                  <dd>
                    <Link
                      href={`/admin/facilities/${facility.id}`}
                      className="tableRowLink"
                    >
                      {toTitleCase(facility.name)}
                    </Link>
                  </dd>
                  {facility.city && (
                    <>
                      <dt>City</dt>
                      <dd>{toTitleCase(facility.city)}</dd>
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
                </dl>
              ) : (
                <p className="tableSecondary">Facility not found.</p>
              )}
            </div>

            <div className="adminCard">
              <h2>Update status</h2>
              <form action={updateStatus} className="adminInlineForm">
                <select name="status" defaultValue={appt.status}>
                  {Object.entries(APPT_STATUS_LABELS).map(([val, label]) => (
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

          {/* ── Right: notes + interaction history ──────────── */}
          <div>
            <div className="adminCard">
              <h2>Add note</h2>
              {lead && facility ? (
                <form action={addNote}>
                  <div
                    className="adminInlineForm"
                    style={{ flexDirection: "column", alignItems: "stretch" }}
                  >
                    <textarea
                      name="body"
                      placeholder="Call notes, scheduling updates, next steps…"
                      required
                    />
                    <button
                      type="submit"
                      className="adminSmallBtn"
                      style={{ alignSelf: "flex-start" }}
                    >
                      Save note
                    </button>
                  </div>
                </form>
              ) : (
                <p className="tableSecondary">
                  Cannot add notes — lead or facility is missing.
                </p>
              )}
            </div>

            <div className="adminCard">
              <h2>Activity</h2>
              <p
                className="tableSecondary"
                style={{ fontSize: "0.8rem", marginBottom: "1rem" }}
              >
                Showing all notes and interactions between this lead and
                facility.
              </p>
              {!interactions || interactions.length === 0 ? (
                <p className="tableSecondary">No activity yet.</p>
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
