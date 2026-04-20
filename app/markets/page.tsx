import Image from "next/image";
import Link from "next/link";
import { launchMarkets } from "@/lib/markets";

export default function MarketsPage() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Markets</p>
        <h1>Supported launch markets</h1>
        <p className="sectionIntro">
          Phase 1 is focused on five hospital-centered regions. Each market will use a vetted facility
          subset and a concierge-style intake flow.
        </p>
        <div className="marketIntroBand">
          <div className="marketIntroCopy">
            <p className="softEyebrow">Thoughtful local coverage</p>
            <h2>We launch narrowly so families get clearer guidance and more realistic next steps.</h2>
            <p className="sectionSideCopy">
              Every market starts with scoped coverage, vetted facilities, and a concierge workflow designed
              to reduce noise during a stressful decision.
            </p>
          </div>
          <article className="marketIntroImage">
            <Image
              src="/images/markets-garden.png"
              alt="A garden bench in a quiet outdoor setting."
              width={512}
              height={512}
              className="asideMediaImage"
            />
          </article>
        </div>
        <div className="marketGrid refinedMarketGrid">
          {launchMarkets.map((market) => (
            <article key={market.slug} className="marketCard">
              <p className="marketAnchor">{market.hospitalAnchor}</p>
              <h2>{market.name}</h2>
              <p>{market.summary}</p>
              <ul className="tagList">
                {market.cities.map((city) => (
                  <li key={city}>{city}</li>
                ))}
              </ul>
              <Link href={`/markets/${market.slug}`}>Open market page</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
