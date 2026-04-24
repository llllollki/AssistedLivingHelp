import Image from "next/image";
import Link from "next/link";

export default function PartnersPage() {
  return (
    <>
      <div className="pageHero">
        <div className="container">
          <p className="eyebrow">For facilities</p>
          <h1>Partner with Assisted Living Help.</h1>
          <p className="sectionIntro">
            The MVP includes a conservative partnership workflow for communities that want
            stronger local visibility and support around calls and tours in the SW Riverside
            County launch markets.
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <article className="infoCard">
              <p className="softEyebrow">Tier 1</p>
              <h2>Starter</h2>
              <p>
                Paid local presence, basic profile, and eligibility for local matching consideration.
              </p>
              <ul className="checkList" style={{ marginTop: "1rem" }}>
                <li>Standard listing profile</li>
                <li>Eligibility for local matching</li>
                <li>Basic lead reporting</li>
              </ul>
            </article>
            <article className="infoCard">
              <p className="softEyebrow">Tier 2</p>
              <h2>Growth</h2>
              <p>
                Enhanced profile presentation and clearly disclosed featured placement
                opportunities.
              </p>
              <ul className="checkList" style={{ marginTop: "1rem" }}>
                <li>Everything in Starter</li>
                <li>Stronger profile visibility</li>
                <li>Priority in approved placements</li>
                <li>Expanded reporting</li>
              </ul>
            </article>
            <article className="infoCard">
              <p className="softEyebrow">Add-on</p>
              <h2>Concierge</h2>
              <p>
                Scheduling and coordination support to reduce operational friction after interest
                is generated.
              </p>
              <ul className="checkList" style={{ marginTop: "1rem" }}>
                <li>Scheduling support for calls and visits</li>
                <li>Active coordination follow-up</li>
                <li>Stronger operational support</li>
              </ul>
            </article>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "2.5rem", alignItems: "center", marginBottom: "2.5rem" }}>
            <div>
              <p className="softEyebrow">Why partner with us</p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 2.5vw, 2.5rem)", letterSpacing: "-0.03em", margin: "0 0 1rem" }}>
                Concierge-first, not pay-to-rank.
              </h2>
              <p className="sectionIntro">
                We help families who are actively looking for care in your area. Instead of cold
                directory traffic, we qualify families, understand their needs, and help coordinate
                the next step. Our goal is to connect your community with better-fit families and
                support manual coordination where it makes sense.
              </p>
              <div className="heroActions">
                <Link className="primaryButton" href="/get-help">
                  Contact us about partnership
                </Link>
              </div>
            </div>
            <div style={{ borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(73, 97, 88, 0.12)", boxShadow: "0 14px 30px rgba(27, 45, 37, 0.05)" }}>
              <Image
                src="/images/guided-room.png"
                alt="A calm, well-appointed assisted living community room."
                width={580}
                height={435}
                style={{ display: "block", width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
              />
            </div>
          </div>

          <div className="infoCard">
            <h2>Disclosure</h2>
            <p>
              Featured and priority placement options are clearly disclosed to families. Partner
              status does not override family fit, care needs, or compliance requirements. We do
              not guarantee occupancy or move-ins. Placement is never guaranteed.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
