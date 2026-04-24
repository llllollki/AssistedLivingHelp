import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { toTitleCase } from "@/lib/format";
import { updateAppointmentStatusAction } from "./actions";

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

const STATUS_ORDER = Object.keys(APPT_STATUS_LABELS);

// Active statuses shown by default (hide terminal states unless filtered)
const ACTIVE_STATUSES = [
  "not_started",
  "requested",
  "options_received",
  "proposed_to_family",
  "confirmed",
  "reschedule_requested",
];

type SearchParams = Promise<{
  status?: string;
  q?: string;
  success?: string;
}>;

export default async function AdminSchedulePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("alh_appointments")
    .select(
      `id, appointment_type, status, scheduled_for, proposed_at, created_at,
       leads!lead_id(id, first_name, last_name),
       alh_facilities!facility_id(id, name, city)`
    )
    .order("scheduled_for", { ascending: true, nullsFirst: false });

  if (params.status) {
    query = query.eq("status", params.status);
  } else {
    // Default: show active statuses only
    query = query.in("status", ACTIVE_STATUSES);
  }

  const { data: appointments } = await query;

  // Count all appointments for the "All" chip label
  const { count: totalCount } = await supabase
    .from("alh_appointments")
    .select("*", { count: "exact", head: true });

  const buildHref = (s?: string) => {
    const base = "/admin/schedule";
    if (!s) return base;
    return `${base}?status=${s}`;
  };

  return (
    <section className="section">
      <div className="container">
        <div className="adminPageHeader">
          <div>
            <p className="eyebrow">Admin / Schedule</p>
            <h1>Outreach &amp; appointments</h1>
          </div>
          <Link href="/admin/schedule/new" className="primaryButton">
            + New appointment
          </Link>
        </div>

        {params.success && (
          <p className="successBanner" style={{ marginBottom: "1rem" }}>
            {params.success}
          </p>
        )}

        <div className="statusFilters">
          <Link
            href={buildHref()}
            className={`statusFilter${!params.status ? " statusFilter--active" : ""}`}
          >
            Active ({(totalCount ?? 0) > 0 ? "open" : "0"})
          </Link>
          {STATUS_ORDER.map((s) => (
            <Link
              key={s}
              href={buildHref(s)}
              className={`statusFilter${params.status === s ? " statusFilter--active" : ""}`}
            >
              {APPT_STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {!appointments || appointments.length === 0 ? (
          <div className="infoCard">
            <p>
              {params.status
                ? `No appointments with status "${APPT_STATUS_LABELS[params.status] ?? params.status}".`
                : "No active appointments. Create one to get started."}
            </p>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Facility</th>
                  <th>Type</th>
                  <th>Scheduled for</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => {
                  const lead = appt.leads as unknown as {
                    id: string;
                    first_name: string;
                    last_name: string;
                  } | null;
                  const facility = appt.alh_facilities as unknown as {
                    id: string;
                    name: string;
                    city: string | null;
                  } | null;

                  const updateStatus = updateAppointmentStatusAction.bind(
                    null,
                    appt.id
                  );

                  return (
                    <tr key={appt.id}>
                      <td>
                        {lead ? (
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="tableRowLink"
                          >
                            {lead.first_name} {lead.last_name}
                          </Link>
                        ) : (
                          <span className="tableSecondary">Unknown lead</span>
                        )}
                      </td>
                      <td>
                        {facility ? (
                          <Link
                            href={`/admin/facilities/${facility.id}`}
                            className="tableRowLink"
                          >
                            {toTitleCase(facility.name)}
                          </Link>
                        ) : (
                          <span className="tableSecondary">
                            Unknown facility
                          </span>
                        )}
                        {facility?.city && (
                          <div className="tableSecondary">
                            {toTitleCase(facility.city)}
                          </div>
                        )}
                      </td>
                      <td className="tableSecondary">
                        {appt.appointment_type}
                      </td>
                      <td className="tableSecondary">
                        {appt.scheduled_for
                          ? new Date(appt.scheduled_for).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`statusBadge statusBadge--${appt.status}`}
                        >
                          {APPT_STATUS_LABELS[appt.status] ?? appt.status}
                        </span>
                      </td>
                      <td>
                        <form
                          action={updateStatus}
                          className="adminInlineForm"
                          style={{ margin: 0, flexWrap: "nowrap" }}
                        >
                          <select
                            name="status"
                            defaultValue={appt.status}
                            style={{ minWidth: 140 }}
                          >
                            {STATUS_ORDER.map((s) => (
                              <option key={s} value={s}>
                                {APPT_STATUS_LABELS[s]}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="adminSmallBtn adminSmallBtn--ghost"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                      <td>
                        <Link
                          href={`/admin/schedule/${appt.id}`}
                          className="adminSmallBtn adminSmallBtn--ghost"
                          style={{
                            display: "inline-block",
                            fontSize: "0.8rem",
                            padding: "0.3rem 0.6rem",
                          }}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
