import Link from "next/link";

type ConfirmationPageProps = {
  searchParams?: Promise<{ lead?: string; market?: string }>;
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const leadId = resolvedSearchParams?.lead;

  return (
    <section className="section">
      <div className="container narrow">
        <div className="confirmationHero">
          <div className="confirmationCheck">OK</div>
          <h1>Your request has been received.</h1>
          <p className="sectionIntro">
            Your intake is now in staff triage. We recorded the permissions you selected, and no
            facility will be contacted unless sharing consent is on file.
          </p>
        </div>

        <div className="infoCard" style={{ marginBottom: "1.25rem" }}>
          <h2>What we logged</h2>
          <ul className="checkList">
            <li>Your lead record and attribution details</li>
            <li>Your consent and channel-permission choices</li>
            <li>A staff triage task with a next-step due time</li>
            <li>Optional automated facility suggestions for staff review only</li>
          </ul>
        </div>

        <div className="infoCard" style={{ marginBottom: "1.25rem" }}>
          <h2>What to expect next</h2>
          <p>
            A staff member will review your intake and follow up within 1 business day using the
            contact method you selected. All outreach is handled personally by our team — we do not
            use automated messaging. No facility will be contacted without your consent, and we do
            not claim live availability or automatic placement.
          </p>
        </div>

        {leadId ? (
          <div className="infoCard" style={{ marginBottom: "1.25rem" }}>
            <h2>Track your request</h2>
            <p style={{ marginBottom: "0.75rem" }}>
              You can check the status of your request at any time using your reference ID.
            </p>
            <p className="confirmationMeta" style={{ marginBottom: "0.75rem" }}>
              Reference ID: <strong>{leadId}</strong>
            </p>
            <Link className="secondaryButton" href={`/status?lead=${leadId}`}>
              Check request status
            </Link>
          </div>
        ) : null}

        <div className="heroActions" style={{ marginTop: "2rem" }}>
          <Link className="secondaryButton" href="/markets">
            Explore your market
          </Link>
          <Link className="secondaryButton" href="/">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
