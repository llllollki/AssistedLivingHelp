import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { createLeadAction } from "./actions";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewLeadPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const supabase = await createSupabaseServerClient();

  const { data: markets } = await supabase
    .from("launch_markets")
    .select("id, slug, name")
    .eq("is_active", true)
    .order("name");

  return (
    <section className="section">
      <div className="container">
        <Link href="/admin/leads" className="backLink">
          ← Back to leads
        </Link>
        <div style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow">Admin / Leads</p>
          <h1>New lead</h1>
          <p className="sectionIntro">
            Manually create a lead from a phone call, referral, or offline
            inquiry. Attribution is recorded as{" "}
            <em>manual entry</em>.
          </p>
        </div>

        {params.error && <p className="errorBanner">{params.error}</p>}

        <div style={{ maxWidth: 760 }}>
          <form action={createLeadAction}>
            <div className="adminCard">
              <h2>Contact information</h2>
              <div className="adminFormGrid">
                <label>
                  First name *
                  <input type="text" name="firstName" required placeholder="Jane" />
                </label>
                <label>
                  Last name *
                  <input type="text" name="lastName" required placeholder="Smith" />
                </label>
                <label>
                  Email
                  <input type="email" name="email" placeholder="jane@example.com" />
                </label>
                <label>
                  Phone
                  <input type="tel" name="phone" placeholder="(555) 555-5555" />
                </label>
                <label>
                  Preferred contact method
                  <select name="preferredContactMethod">
                    <option value="">— Select —</option>
                    <option>Email</option>
                    <option>SMS</option>
                    <option>Phone call</option>
                  </select>
                </label>
                <label>
                  Relationship to resident
                  <select name="relationshipToResident">
                    <option value="">— Select —</option>
                    <option>Self</option>
                    <option>Adult child</option>
                    <option>Spouse</option>
                    <option>Sibling</option>
                    <option>Other family member</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="adminCard">
              <h2>Care &amp; location</h2>
              <div className="adminFormGrid">
                <label>
                  Launch market
                  <select name="launchMarketSlug">
                    <option value="">— Select —</option>
                    {(markets ?? []).map((m) => (
                      <option key={m.slug} value={m.slug}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Desired city
                  <input type="text" name="desiredCity" placeholder="Murrieta" />
                </label>
                <label>
                  Move-in timeframe
                  <select name="moveInTimeframe">
                    <option value="">— Select —</option>
                    <option>Immediately</option>
                    <option>Within 30 days</option>
                    <option>Within 60 days</option>
                    <option>Researching</option>
                  </select>
                </label>
                <label>
                  General care category
                  <select name="generalCareCategory">
                    <option value="">— Select —</option>
                    <option>Assisted living</option>
                    <option>Memory care</option>
                    <option>Unsure</option>
                  </select>
                </label>
                <label>
                  Budget minimum ($)
                  <input
                    type="number"
                    name="budgetMin"
                    min="0"
                    step="100"
                    placeholder="3000"
                  />
                </label>
                <label>
                  Budget maximum ($)
                  <input
                    type="number"
                    name="budgetMax"
                    min="0"
                    step="100"
                    placeholder="7000"
                  />
                </label>
                <label className="fullWidth" style={{ flexDirection: "row", alignItems: "center", gap: "0.6rem" }}>
                  <input type="checkbox" name="wantsSchedulingHelp" />
                  Family wants help scheduling calls or tours
                </label>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "1.5rem",
              }}
            >
              <button type="submit" className="primaryButton">
                Create lead
              </button>
              <Link href="/admin/leads" className="secondaryButton">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
