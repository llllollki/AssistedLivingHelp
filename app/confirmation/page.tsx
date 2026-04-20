type ConfirmationPageProps = {
  searchParams?: Promise<{ lead?: string; market?: string }>;
};

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <section className="section">
      <div className="container narrow">
        <p className="eyebrow">Confirmation</p>
        <h1>Your request has been received</h1>
        <p className="sectionIntro">
          Assisted Living Help will use the details you shared to identify likely-fit facilities and
          coordinate next steps. In the live MVP, this page will also reflect confirmation by email or
          SMS when consent exists.
        </p>
        <div className="infoPanel">
          <h2>Expected next actions</h2>
          <ul className="checkList">
            <li>Lead record created or updated</li>
            <li>Consent and attribution logged</li>
            <li>Initial matches generated for staff review</li>
            <li>Follow-up queued for outreach or scheduling support</li>
          </ul>
        </div>
        {resolvedSearchParams?.lead ? (
          <p className="confirmationMeta">
            Reference ID: <strong>{resolvedSearchParams.lead}</strong>
          </p>
        ) : null}
      </div>
    </section>
  );
}
