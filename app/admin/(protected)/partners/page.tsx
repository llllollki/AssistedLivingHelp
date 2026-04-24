import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { toTitleCase } from "@/lib/format";
import { updateFacilityAction } from "../facilities/[id]/actions";

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

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("alh_facilities")
    .select(
      "id, name, city, state, partner_status, preferred_contact_method, updated_at"
    )
    .order("name");

  if (params.status) {
    query = query.eq("partner_status", params.status);
  }
  if (params.q) {
    query = query.or(
      `name.ilike.%${params.q}%,city.ilike.%${params.q}%`
    );
  }

  const { data: facilities } = await query;

  // Deduplicate by name|city (same as facilities list)
  const seen = new Set<string>();
  const deduped = (facilities ?? []).filter((f) => {
    const key = `${f.name}|${f.city}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Fetch last interaction per facility via two-query merge (avoids duplicate rows)
  const facilityIds = deduped.map((f) => f.id);
  const interactionMap: Record<string, string> = {};

  if (facilityIds.length > 0) {
    const { data: recentInteractions } = await supabase
      .from("alh_interactions")
      .select("facility_id, created_at")
      .in("facility_id", facilityIds)
      .order("created_at", { ascending: false })
      .limit(facilityIds.length * 3); // generous cap; we only need one per facility

    for (const i of recentInteractions ?? []) {
      if (i.facility_id && !interactionMap[i.facility_id]) {
        interactionMap[i.facility_id] = i.created_at;
      }
    }
  }

  const buildHref = (s?: string, q?: string) => {
    const parts: string[] = [];
    if (s) parts.push(`status=${s}`);
    if (q) parts.push(`q=${encodeURIComponent(q)}`);
    return `/admin/partners${parts.length ? `?${parts.join("&")}` : ""}`;
  };

  return (
    <section className="section">
      <div className="container">
        <div className="adminPageHeader">
          <div>
            <p className="eyebrow">Admin / Partners</p>
            <h1>Partner CRM</h1>
          </div>
          <span className="tableSecondary">{deduped.length} facilities</span>
        </div>

        {/* Search */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <form
            method="GET"
            style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}
          >
            {params.status && (
              <input type="hidden" name="status" value={params.status} />
            )}
            <input
              type="search"
              name="q"
              placeholder="Search by name or city…"
              defaultValue={params.q ?? ""}
              style={{
                padding: "0.4rem 0.75rem",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                minWidth: 240,
              }}
            />
            <button type="submit" className="adminSmallBtn">
              Search
            </button>
            {(params.q || params.status) && (
              <Link href="/admin/partners" className="filterClear">
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Status filter chips */}
        <div className="statusFilters">
          <Link
            href={buildHref(undefined, params.q)}
            className={`statusFilter${!params.status ? " statusFilter--active" : ""}`}
          >
            All
          </Link>
          {PARTNER_ORDER.map((s) => (
            <Link
              key={s}
              href={buildHref(s, params.q)}
              className={`statusFilter${params.status === s ? " statusFilter--active" : ""}`}
            >
              {PARTNER_LABELS[s]}
            </Link>
          ))}
        </div>

        {deduped.length === 0 ? (
          <div className="infoCard">
            <p>
              {params.q || params.status
                ? "No facilities match the current filters."
                : "No facility partners yet. Add facilities in the directory and set their partner status."}
            </p>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Facility</th>
                  <th>Partner status</th>
                  <th>Preferred contact</th>
                  <th>Last interaction</th>
                  <th>Quick update</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {deduped.map((f) => {
                  const lastAt = interactionMap[f.id];
                  const updateStatus = updateFacilityAction.bind(null, f.id);

                  return (
                    <tr key={f.id}>
                      <td>
                        <Link
                          href={`/admin/facilities/${f.id}`}
                          className="tableRowLink"
                        >
                          {toTitleCase(f.name)}
                        </Link>
                        {f.city && (
                          <div className="tableSecondary">
                            {toTitleCase(f.city)}, {f.state}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`statusBadge statusBadge--${f.partner_status}`}
                        >
                          {PARTNER_LABELS[f.partner_status] ?? f.partner_status}
                        </span>
                      </td>
                      <td className="tableSecondary">
                        {f.preferred_contact_method ?? "—"}
                      </td>
                      <td className="tableSecondary">
                        {lastAt
                          ? new Date(lastAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td>
                        {/* Quick partner-status update inline */}
                        <form
                          action={updateStatus}
                          className="adminInlineForm"
                          style={{ margin: 0, flexWrap: "nowrap" }}
                        >
                          {/* Keep preferred_contact_method unchanged */}
                          <input
                            type="hidden"
                            name="preferred_contact_method"
                            value={f.preferred_contact_method ?? ""}
                          />
                          <select
                            name="partner_status"
                            defaultValue={f.partner_status}
                            style={{ minWidth: 130 }}
                          >
                            {PARTNER_ORDER.map((s) => (
                              <option key={s} value={s}>
                                {PARTNER_LABELS[s]}
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
                          href={`/admin/facilities/${f.id}`}
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
