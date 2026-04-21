import Link from "next/link";

type ConfirmationPageProps = {
  searchParams?: Promise<{ lead?: string; market?: string }>;
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <section className="section">
      <div className="container narrow">
        <div className="confirmationHero">
          <div className="confirmationCheck">✓</div>
          <h1>Your request has been received.</h1>
          <p className="sectionIntro">
            Assisted Living Help will use the details you shared to identify likely-fit facilities
            and coordinate next steps. You'll hear from us via your preferred contact method.
          </p>
        </div>

        <div className="infoCard" style={{ marginBottom: "1.25rem" }}>
          <h2>Expected next actions</h2>
          <ul className="checkList">
            <li>Lead record created or updated in our system</li>
            <li>Consent and attribution logged</li>
            <li>Initial matches generated for staff review</li>
            <li>Follow-up queued for outreach or scheduling support</li>
          </ul>
        </div>

        <div className="infoCard">
          <h2>What to expect next</h2>
          <p>
            Our team will review your intake, identify likely-fit facilities in your market, and
            follow up within 1 business day. We will confirm the approach via your preferred
            contact method before sharing your details with any facility.
          </p>
        </div>

        {resolvedSearchParams?.lead ? (
          <p className="confirmationMeta">
            Reference ID: <strong>{resolvedSearchParams.lead}</strong>
          </p>
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
