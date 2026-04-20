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
    <section className="section">
      <div className="container narrow">
        <p className="eyebrow">{market.hospitalAnchor}</p>
        <h1>{market.name}</h1>
        <p className="sectionIntro">{market.summary}</p>
        <div className="infoPanel">
          <h2>Initial market coverage</h2>
          <ul className="checkList">
            {market.cities.map((city) => (
              <li key={city}>{city}</li>
            ))}
          </ul>
        </div>
        <div className="heroActions">
          <Link className="primaryButton" href="/get-help">
            Start the intake
          </Link>
          <Link className="secondaryButton" href="/partners">
            Facility partnership info
          </Link>
        </div>
      </div>
    </section>
  );
}
