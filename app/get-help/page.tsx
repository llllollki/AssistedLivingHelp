import Image from "next/image";
import { launchMarkets } from "@/lib/markets";

type GetHelpPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function GetHelpPage({ searchParams }: GetHelpPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const error = resolvedSearchParams?.error;

  return (
    <section className="section">
      <div className="container intakeLayout">
        <div>
          <p className="eyebrow">Family intake</p>
          <h1>Tell us what kind of help you need</h1>
          <p className="sectionIntro">
            This first version is intentionally short. We collect the minimum details needed to start
            matching and follow-up.
          </p>
          {error ? <p className="errorBanner">{error}</p> : null}
          <form className="intakeForm" action="/api/intake" method="post">
            <label>
              First name
              <input type="text" name="firstName" placeholder="Jane" />
            </label>
            <label>
              Last name
              <input type="text" name="lastName" placeholder="Smith" />
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
              <select name="preferredContactMethod" defaultValue="">
                <option value="" disabled>
                  Select one
                </option>
                <option>Email</option>
                <option>SMS</option>
                <option>Phone call</option>
              </select>
            </label>
            <label>
              Relationship to resident
              <select name="relationshipToResident" defaultValue="">
                <option value="" disabled>
                  Select one
                </option>
                <option>Self</option>
                <option>Adult child</option>
                <option>Spouse</option>
                <option>Sibling</option>
                <option>Other family member</option>
              </select>
            </label>
            <label>
              Desired city or area
              <input type="text" name="desiredCity" placeholder="Murrieta" />
            </label>
            <label>
              Launch market
              <select name="launchMarketSlug" defaultValue="">
                <option value="" disabled>
                  Select a market
                </option>
                {launchMarkets.map((market) => (
                  <option key={market.slug} value={market.slug}>
                    {market.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Move-in timeframe
              <select name="moveInTimeframe" defaultValue="">
                <option value="" disabled>
                  Select timing
                </option>
                <option>Immediately</option>
                <option>Within 30 days</option>
                <option>Within 60 days</option>
                <option>Researching</option>
              </select>
            </label>
            <label>
              General care category
              <select name="generalCareCategory" defaultValue="">
                <option value="" disabled>
                  Select one
                </option>
                <option>Assisted living</option>
                <option>Memory care</option>
                <option>Unsure</option>
              </select>
            </label>
            <label>
              Budget minimum
              <input type="number" name="budgetMin" min="0" step="100" placeholder="3000" />
            </label>
            <label>
              Budget maximum
              <input type="number" name="budgetMax" min="0" step="100" placeholder="7000" />
            </label>
            <label className="fullWidth">
              <input type="checkbox" name="wantsSchedulingHelp" /> I want help scheduling calls or tours.
            </label>
            <label className="fullWidth">
              Communication preferences
              <div className="checkboxRow">
                <label><input type="checkbox" name="consentEmail" /> Email updates</label>
                <label><input type="checkbox" name="consentSms" /> SMS updates</label>
                <label><input type="checkbox" name="consentPhone" /> Phone call follow-up</label>
              </div>
            </label>
            <label className="fullWidth consentBox">
              <input type="checkbox" name="consentContactSupport" />
              I agree that Assisted Living Help may contact me about matching and scheduling support.
            </label>
            <div className="fullWidth formActions">
              <button className="primaryButton" type="submit">
                Submit intake
              </button>
            </div>
          </form>
        </div>
        <aside className="infoPanel intakeAside">
          <div className="asideMediaCard">
            <Image
              src="/images/intake-support.png"
              alt="An older adult smiling with a younger family member nearby."
              width={512}
              height={512}
              className="asideMediaImage"
            />
          </div>
          <h2>What happens next</h2>
          <ul className="checkList">
            <li>Your intake is logged for the internal care team.</li>
            <li>Matching rules and staff create a shortlist.</li>
            <li>We track facility outreach and scheduling inside the admin workflow.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
