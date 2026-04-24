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
          {"<- "}Back to leads
        </Link>
        <div style={{ marginTop: "1.25rem" }}>
          <p className="eyebrow">Admin / Leads</p>
          <h1>New lead</h1>
          <p className="sectionIntro">
            Manually create a lead from a phone call, referral, or offline inquiry. The lead will
            start in active triage and attribution is recorded as <em>manual entry</em>.
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
                    <option value="">- Select -</option>
                    <option>Email</option>
                    <option>SMS</option>
                    <option>Phone call</option>
                  </select>
                </label>
                <label>
                  Relationship to resident
                  <select name="relationshipToResident">
                    <option value="">- Select -</option>
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
                    <option value="">- Select -</option>
                    {(markets ?? []).map((market) => (
                      <option key={market.slug} value={market.slug}>
                        {market.name}
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
                    <option value="">- Select -</option>
                    <option>Immediately</option>
                    <option>Within 30 days</option>
                    <option>Within 60 days</option>
                    <option>Researching</option>
                  </select>
                </label>
                <label>
                  General care category
                  <select name="generalCareCategory">
                    <option value="">- Select -</option>
                    <option>Assisted living</option>
                    <option>Memory care</option>
                    <option>Unsure</option>
                  </select>
                </label>
                <label>
                  Budget minimum ($)
                  <input type="number" name="budgetMin" min="0" step="100" placeholder="3000" />
                </label>
                <label>
                  Budget maximum ($)
                  <input type="number" name="budgetMax" min="0" step="100" placeholder="7000" />
                </label>
                <label className="fullWidth inlineCheckbox">
                  <input type="checkbox" name="wantsSchedulingHelp" />
                  Family wants help scheduling calls or tours
                </label>
              </div>
            </div>

            <div className="adminCard">
              <h2>Consent &amp; sharing</h2>
              <p className="tableSecondary" style={{ marginBottom: "1rem" }}>
                Record what was actually captured. If permission is still missing, leave it
                unchecked so staff can follow up before any facility-sharing step.
              </p>
              <div className="adminFormGrid">
                <label>
                  Consent source
                  <select name="consentSource" defaultValue="">
                    <option value="">- Not recorded -</option>
                    <option value="phone_call">Phone call</option>
                    <option value="referral_email">Referral email</option>
                    <option value="in_person">In person</option>
                    <option value="paper_form">Paper form</option>
                    <option value="other_manual">Other manual intake</option>
                  </select>
                </label>
                <label>
                  Consent basis / notes
                  <input
                    type="text"
                    name="consentBasis"
                    placeholder="Family stated permissions verbally"
                  />
                </label>
                <label className="fullWidth consentBox inlineCheckbox">
                  <input type="checkbox" name="consentPrivacyAcknowledgment" />
                  Privacy notice reviewed or acknowledged with the family
                </label>
                <label className="fullWidth consentBox inlineCheckbox">
                  <input type="checkbox" name="consentContactSupport" />
                  Family agreed we may contact them about matching and scheduling support
                </label>
                <label className="fullWidth">
                  Channel permissions
                  <div className="checkboxRow">
                    <label>
                      <input type="checkbox" name="consentEmail" /> Email follow-up allowed
                    </label>
                    <label>
                      <input type="checkbox" name="consentSms" /> SMS follow-up allowed
                    </label>
                    <label>
                      <input type="checkbox" name="consentPhone" /> Phone call follow-up allowed
                    </label>
                  </div>
                </label>
                <label className="fullWidth consentBox inlineCheckbox">
                  <input type="checkbox" name="consentFacilitySharing" />
                  Family agreed we may share their information with facilities for coordination
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
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
