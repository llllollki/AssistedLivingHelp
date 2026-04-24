import { createSupabaseServerClient } from "@/lib/supabase-server";
import { toTitleCase } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function FacilityProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: facility, error } = await supabase
    .from("alh_facilities")
    .select("id, name, address, city, state, zip, county, care_category, capacity, phone, license_status")
    .eq("id", id)
    .eq("public_visibility", true)
    .single();

  if (!facility || error) {
    notFound();
  }

  const locationLine = [facility.address, facility.city ? toTitleCase(facility.city) : null, facility.state, facility.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="pageHero">
        <div className="container">
          <Link href="/facilities" className="backLink">
            {"<- "}Back to facilities
          </Link>
          <p className="eyebrow" style={{ marginTop: "1.25rem" }}>
            Facility profile
          </p>
          <h1>{toTitleCase(facility.name)}</h1>
          {locationLine && <p className="sectionIntro">{locationLine}</p>}
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="facilityProfileGrid">
            <div className="facilityProfileCard">
              <h2>Facility details</h2>
              <dl className="facilityDl">
                {facility.city && (
                  <>
                    <dt>City</dt>
                    <dd>{toTitleCase(facility.city)}</dd>
                  </>
                )}
                {facility.county && (
                  <>
                    <dt>County</dt>
                    <dd>{toTitleCase(facility.county)}</dd>
                  </>
                )}
                {facility.zip && (
                  <>
                    <dt>ZIP code</dt>
                    <dd>{facility.zip}</dd>
                  </>
                )}
                {facility.state && (
                  <>
                    <dt>State</dt>
                    <dd>{facility.state}</dd>
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
                    <dd>{facility.capacity} beds</dd>
                  </>
                )}
                {facility.license_status && (
                  <>
                    <dt>License status</dt>
                    <dd>{toTitleCase(facility.license_status)}</dd>
                  </>
                )}
                {facility.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${facility.phone}`} className="facilityCardPhone">
                        {facility.phone}
                      </a>
                    </dd>
                  </>
                )}
              </dl>
            </div>

            <div className="facilitiesCta">
              <h2>Need help finding the right fit?</h2>
              <p>
                Our staff can review your care needs, budget, and location preferences before
                suggesting next steps or coordinating calls or tours. The service is free for
                families.
              </p>
              <Link href="/get-help" className="primaryButton">
                Start an intake
              </Link>
              <p className="ctaSubtext">Any outreach by email or SMS is handled manually right now.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="facilitiesHelpBand">
        <div className="container">
          <p className="facilitiesHelpText">Compare this facility with others in the same market.</p>
          <Link href="/facilities" className="primaryButton">
            Browse all facilities
          </Link>
        </div>
      </div>
    </>
  );
}
