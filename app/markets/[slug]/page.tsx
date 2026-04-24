import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getMarketBySlug } from "@/lib/markets";

type MarketPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MarketPage({ params }: MarketPageProps) {
  const { slug } = await params;
  const market = getMarketBySlug(slug);

  if (!market) {
    notFound();
  }

  return (
    <>
      <div className="pageHero">
        <div className="container">
          <p className="eyebrow">{market.hospitalAnchor}</p>
          <h1>{market.name}</h1>
          <p className="sectionIntro">{market.summary}</p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container narrow">
          <div className="infoCard" style={{ marginBottom: "1.25rem" }}>
            <h2>Initial market coverage</h2>
            <ul className="checkList">
              {market.cities.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </div>

          <div className="infoCard" style={{ marginBottom: "2rem" }}>
            <h2>How to get started in this market</h2>
            <ul className="checkList">
              <li>Submit an intake specifying this area and your care needs.</li>
              <li>Receive a vetted shortlist from the Phase 1 facility subset in this region.</li>
              <li>Get scheduling support from our team to coordinate calls or tours.</li>
            </ul>
          </div>

          <div style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(73, 97, 88, 0.1)", marginBottom: "2rem" }}>
            <Image
              src="/images/process-walk.png"
              alt="A caregiver walking beside an older adult in a bright community space."
              width={760}
              height={380}
              style={{ display: "block", width: "100%", aspectRatio: "2/1", objectFit: "cover", objectPosition: "center top" }}
            />
          </div>

          <div className="heroActions">
            <Link className="primaryButton" href="/get-help">
              Start the intake
            </Link>
            <Link className="secondaryButton" href="/partners">
              Facility partnership info
            </Link>
          </div>

          <p className="trustNote">
            We do not guarantee placement, availability, or admissions. Assisted Living Help is a
            matching and coordination service.
          </p>
        </div>
      </section>
    </>
  );
}
