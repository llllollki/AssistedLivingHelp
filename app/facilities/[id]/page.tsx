import { createSupabaseServerClient } from "@/lib/supabase-server";
import { toTitleCase } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FacilityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: f, error } = await supabase
    .from("alh_facilities")
    .select(
      "id, name, address, city, state, zip, county, care_category, capacity, phone, license_status"
    )
    .eq("id", id)
    .eq("public_visibility", true)
    .single();

  if (!f || error) notFound();

  const locationLine = [
    f.address,
    f.city ? toTitleCase(f.city) : null,
    f.state,
    f.zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="pageHero">
        <div className="container">
          <Link href="/facilities" className="backLink">
            ← Back to facilities
          </Link>
          <p className="eyebrow" style={{ marginTop: "1.25rem" }}>
            Facility profile
          </p>
          <h1>{toTitleCase(f.name)}</h1>
          {locationLine && <p className="sectionIntro">{locationLine}</p>}
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="facilityProfileGrid">
            <div className="facilityProfileCard">
              <h2>Facility details</h2>
              <dl className="facilityDl">
                {f.city && (
                  <>
                    <dt>City</dt>
                    <dd>{toTitleCase(f.city)}</dd>
                  </>
                )}
                {f.county && (
                  <>
                    <dt>County</dt>
                    <dd>{toTitleCase(f.county)}</dd>
                  </>
                )}
                {f.zip && (
                  <>
                    <dt>ZIP code</dt>
                    <dd>{f.zip}</dd>
                  </>
                )}
                {f.state && (
                  <>
                    <dt>State</dt>
                    <dd>{f.state}</dd>
                  </>
                )}
                {f.care_category && (
                  <>
                    <dt>Care type</dt>
                    <dd>{toTitleCase(f.care_category)}</dd>
                  </>
                )}
                {f.capacity != null && (
                  <>
                    <dt>Capacity</dt>
                    <dd>{f.capacity} beds</dd>
                  </>
                )}
                {f.license_status && (
                  <>
                    <dt>License status</dt>
                    <dd>{toTitleCase(f.license_status)}</dd>
                  </>
                )}
                {f.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${f.phone}`} className="facilityCardPhone">
                        {f.phone}
                      </a>
                    </dd>
                  </>
                )}
              </dl>
            </div>

            <div className="facilitiesCta">
              <h2>Need help finding the right fit?</h2>
              <p>
                Our team reviews your care needs, budget, and location
                preferences to build a personalized shortlist and help schedule
                calls or tours. The service is free for families.
              </p>
              <Link href="/get-help" className="primaryButton">
                Get matched — it&apos;s free
              </Link>
              <p className="ctaSubtext">
                Questions? We&apos;re happy to help over the phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="facilitiesHelpBand">
        <div className="container">
          <p className="facilitiesHelpText">
            Compare this facility with others in the same market.
          </p>
          <Link href="/facilities" className="primaryButton">
            Browse all facilities
          </Link>
        </div>
      </div>
    </>
  );
}
