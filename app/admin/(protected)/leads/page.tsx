import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  intake_in_progress: "Intake",
  qualified: "Qualified",
  assigned: "Assigned",
  matching_in_progress: "Matching",
  matched: "Matched",
  closed_won: "Won",
  closed_lost: "Lost",
};

const STATUS_ORDER = Object.keys(STATUS_LABELS);

type SearchParams = Promise<{ status?: string }>;

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("leads")
    .select(
      "id, first_name, last_name, email, phone, status, move_in_timeframe, created_at, launch_markets(name)"
    )
    .order("created_at", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data: leads } = await query;

  return (
    <section className="section">
      <div className="container">
        <div className="adminPageHeader">
          <div>
            <p className="eyebrow">Admin / Leads</p>
            <h1>Lead queue</h1>
          </div>
          <Link href="/admin/leads/new" className="primaryButton">
            + New lead
          </Link>
        </div>

        <div className="statusFilters">
          <Link
            href="/admin/leads"
            className={`statusFilter${!params.status ? " statusFilter--active" : ""}`}
          >
            All
          </Link>
          {STATUS_ORDER.map((s) => (
            <Link
              key={s}
              href={`/admin/leads?status=${s}`}
              className={`statusFilter${params.status === s ? " statusFilter--active" : ""}`}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {!leads || leads.length === 0 ? (
          <div className="infoCard">
            <p>
              No leads found
              {params.status
                ? ` with status "${STATUS_LABELS[params.status] ?? params.status}"`
                : ""}
              .{" "}
              <Link href="/admin/leads/new" className="inlineTextLink">
                Create one manually
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Market</th>
                  <th>Move-in</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="tableRowLink"
                      >
                        {lead.first_name} {lead.last_name}
                      </Link>
                    </td>
                    <td>
                      <span className="tableSecondary">
                        {lead.email ?? lead.phone ?? "—"}
                      </span>
                    </td>
                    <td>
                      <span className={`statusBadge statusBadge--${lead.status}`}>
                        {STATUS_LABELS[lead.status] ?? lead.status}
                      </span>
                    </td>
                    <td>
                      {(lead.launch_markets as unknown as { name: string } | null)?.name ??
                        "—"}
                    </td>
                    <td className="tableSecondary">
                      {lead.move_in_timeframe ?? "—"}
                    </td>
                    <td className="tableSecondary">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
