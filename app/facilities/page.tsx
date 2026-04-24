import { createSupabaseServerClient } from "@/lib/supabase-server";
import { toTitleCase } from "@/lib/format";
import Link from "next/link";

type SearchParams = Promise<{
  city?: string;
  zip?: string;
  size?: string;
  q?: string;
}>;

export default async function FacilitiesPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("alh_facilities")
    .select("id, name, city, state, zip, county, care_category, capacity, phone, license_status")
    .eq("public_visibility", true)
    .order("name");

  if (params.city) query = query.ilike("city", params.city);
  if (params.zip) query = query.eq("zip", params.zip);
  if (params.q) query = query.ilike("name", `%${params.q}%`);
  if (params.size === "small") query = query.lte("capacity", 15);
  else if (params.size === "medium") query = query.gte("capacity", 16).lte("capacity", 50);
  else if (params.size === "large") query = query.gte("capacity", 51);

  const { data: rawFacilities, error } = await query;

  const { data: allFacilities } = await supabase
    .from("alh_facilities")
    .select("city, zip")
    .eq("public_visibility", true);

  const cities = [...new Set((allFacilities ?? []).map((facility) => facility.city).filter(Boolean).sort())];
  const zips = [...new Set((allFacilities ?? []).map((facility) => facility.zip).filter(Boolean).sort())];

  const seen = new Set<string>();
  const facilities = (rawFacilities ?? []).filter((facility) => {
    const key = `${facility.name}|${facility.city}|${facility.zip}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  const hasFilters = params.city || params.zip || params.size || params.q;

  return (
    <>
      <div className="pageHero">
        <div className="container">
          <p className="eyebrow">Facility search</p>
          <h1>Browse assisted living facilities.</h1>
          <p className="sectionIntro">
            Vetted facilities in our supported Southwest Riverside County markets. This is a
            research view for signed-in families, while our concierge workflow still starts with
            intake and staff review.
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="filterPanel">
            <form method="GET" className="filterForm">
              <div className="filterField filterFieldWide">
                <label htmlFor="q">Search by name</label>
                <input
                  id="q"
                  name="q"
                  type="search"
                  placeholder="e.g. Sunrise, Valley..."
                  defaultValue={params.q ?? ""}
                />
              </div>
              <div className="filterField">
                <label htmlFor="city">City</label>
                <select id="city" name="city" defaultValue={params.city ?? ""}>
                  <option value="">All cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {toTitleCase(city)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filterField">
                <label htmlFor="zip">ZIP code</label>
                <select id="zip" name="zip" defaultValue={params.zip ?? ""}>
                  <option value="">All ZIPs</option>
                  {zips.map((zip) => (
                    <option key={zip} value={zip}>
                      {zip}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filterField">
                <label htmlFor="size">Size</label>
                <select id="size" name="size" defaultValue={params.size ?? ""}>
                  <option value="">Any size</option>
                  <option value="small">Small (1-15 beds)</option>
                  <option value="medium">Medium (16-50 beds)</option>
                  <option value="large">Large (51+ beds)</option>
                </select>
              </div>
              <div className="filterActions">
                <button type="submit" className="filterSubmit">
                  Apply filters
                </button>
                {hasFilters && (
                  <Link href="/facilities" className="filterClear">
                    Clear
                  </Link>
                )}
              </div>
            </form>
          </div>

          {error && <p className="errorBanner">Unable to load facilities at this time.</p>}

          {!error && (
            <p className="facilityResultCount">
              {facilities.length === 0
                ? "No facilities match your filters."
                : `Showing ${facilities.length} facilit${facilities.length === 1 ? "y" : "ies"}`}
            </p>
          )}

          {facilities.length === 0 && !error ? (
            <div className="infoCard">
              <h2>No results found</h2>
              <p>
                Try different filters, or{" "}
                <Link href="/get-help" className="inlineTextLink">
                  submit your intake
                </Link>{" "}
                so our staff can review your situation and suggest next steps.
              </p>
            </div>
          ) : (
            <div className="facilityGrid">
              {facilities.map((facility) => (
                <Link key={facility.id} href={`/facilities/${facility.id}`} className="facilityCardLink">
                  <article className="facilityCard">
                    <h2 className="facilityCardName">{toTitleCase(facility.name)}</h2>
                    {(facility.city || facility.state) && (
                      <p className="facilityCardLocation">
                        {[facility.city ? toTitleCase(facility.city) : null, facility.state, facility.zip]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                    <div className="facilityCardMeta">
                      {facility.capacity != null && (
                        <span className="facilityTag">{facility.capacity} beds</span>
                      )}
                    </div>
                    {facility.phone && <span className="facilityCardPhone">{facility.phone}</span>}
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="facilitiesHelpBand">
        <div className="container">
          <p className="facilitiesHelpText">Not sure which facility fits your situation?</p>
          <Link href="/get-help" className="primaryButton">
            Start an intake
          </Link>
        </div>
      </div>
    </>
  );
}
