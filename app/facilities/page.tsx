import { createSupabaseServerClient } from "@/lib/supabase-server";
import { signOutAction } from "@/lib/auth-actions";
import Link from "next/link";

export default async function FacilitiesPage() {
  const supabase = await createSupabaseServerClient();

  const { data: facilities, error } = await supabase
    .from("alh_facilities")
    .select("id, name, city, state, zip, county, care_category, capacity, phone")
    .eq("public_visibility", true)
    .order("name");

  return (
    <>
      <div className="pageHero">
        <div className="container">
          <p className="eyebrow">Facility search</p>
          <h1>Browse assisted living facilities.</h1>
          <p className="sectionIntro">
            Vetted facilities in our supported Southwest Riverside County
            markets. Submit an intake to get a personalized shortlist and
            scheduling help.
          </p>
          <div className="heroActions" style={{ marginTop: "1.5rem" }}>
            <Link href="/get-help" className="primaryButton">
              Get matched
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="secondaryButton">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          {error && (
            <p className="errorBanner">
              Unable to load facilities at this time.
            </p>
          )}

          {!facilities || facilities.length === 0 ? (
            <div className="infoCard">
              <h2>Facilities coming soon</h2>
              <p>
                Our team is building the Phase 1 facility directory for the
                Temecula, Murrieta, and Menifee markets. In the meantime,{" "}
                <Link href="/get-help" className="inlineTextLink">
                  submit your intake
                </Link>{" "}
                and we will match you manually within one business day.
              </p>
            </div>
          ) : (
            <div className="facilityGrid">
              {facilities.map((f) => (
                <article key={f.id} className="facilityCard">
                  <h2 className="facilityCardName">{f.name}</h2>
                  {(f.city || f.state) && (
                    <p className="facilityCardLocation">
                      {[f.city, f.state, f.zip].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <div className="facilityCardMeta">
                    {f.care_category && (
                      <span className="facilityTag">{f.care_category}</span>
                    )}
                    {f.capacity && (
                      <span className="facilityTag">{f.capacity} beds</span>
                    )}
                  </div>
                  {f.phone && (
                    <a
                      href={`tel:${f.phone}`}
                      className="facilityCardPhone"
                    >
                      {f.phone}
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
