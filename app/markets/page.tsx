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
        <div className="marketGrid">
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
