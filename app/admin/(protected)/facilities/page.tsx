import { createSupabaseServerClient } from "@/lib/supabase-server";
import { toTitleCase } from "@/lib/format";
import Link from "next/link";

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

const PARTNER_ORDER = Object.keys(PARTNER_LABELS);

type SearchParams = Promise<{ partner?: string; q?: string }>;

export default async function AdminFacilitiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("alh_facilities")
    .select(
      "id, name, city, state, zip, phone, care_category, capacity, license_status, partner_status, public_visibility"
    )
    .order("name");

  if (params.partner) {
    query = query.eq("partner_status", params.partner);
  }
  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  const { data: facilities } = await query;

  // Deduplicate by name|city|zip (same as public page)
  const seen = new Set<string>();
  const deduped = (facilities ?? []).filter((f) => {
    const key = `${f.name}|${f.city}|${f.zip}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <section className="section">
      <div className="container">
        <div className="adminPageHeader">
          <div>
            <p className="eyebrow">Admin / Facilities</p>
            <h1>Facility directory</h1>
          </div>
          <span className="tableSecondary">{deduped.length} records</span>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <form method="GET" style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            {params.partner && (
              <input type="hidden" name="partner" value={params.partner} />
            )}
            <input
              type="search"
              name="q"
              placeholder="Search by name…"
              defaultValue={params.q ?? ""}
              style={{
                padding: "0.4rem 0.75rem",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                minWidth: 220,
              }}
            />
            <button type="submit" className="adminSmallBtn">
              Search
            </button>
            {(params.q || params.partner) && (
              <Link href="/admin/facilities" className="filterClear">
                Clear
              </Link>
            )}
          </form>
        </div>

        <div className="statusFilters">
          <Link
            href={`/admin/facilities${params.q ? `?q=${params.q}` : ""}`}
            className={`statusFilter${!params.partner ? " statusFilter--active" : ""}`}
          >
            All
          </Link>
          {PARTNER_ORDER.map((s) => (
            <Link
              key={s}
              href={`/admin/facilities?partner=${s}${params.q ? `&q=${params.q}` : ""}`}
              className={`statusFilter${params.partner === s ? " statusFilter--active" : ""}`}
            >
              {PARTNER_LABELS[s]}
            </Link>
          ))}
        </div>

        {deduped.length === 0 ? (
          <div className="infoCard">
            <p>No facilities match the current filters.</p>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Capacity</th>
                  <th>License</th>
                  <th>Partner status</th>
                  <th>Visible</th>
                </tr>
              </thead>
              <tbody>
                {deduped.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <Link
                        href={`/admin/facilities/${f.id}`}
                        className="tableRowLink"
                      >
                        {toTitleCase(f.name)}
                      </Link>
                    </td>
                    <td className="tableSecondary">
                      {f.city ? toTitleCase(f.city) : "—"}
                    </td>
                    <td className="tableSecondary">
                      {f.capacity != null ? `${f.capacity}` : "—"}
                    </td>
                    <td className="tableSecondary">
                      {f.license_status ? toTitleCase(f.license_status) : "—"}
                    </td>
                    <td>
                      <span
                        className={`statusBadge statusBadge--${f.partner_status}`}
                      >
                        {PARTNER_LABELS[f.partner_status] ?? f.partner_status}
                      </span>
                    </td>
                    <td className="tableSecondary">
                      {f.public_visibility ? "Yes" : "No"}
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
