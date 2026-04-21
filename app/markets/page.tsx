import Image from "next/image";
import Link from "next/link";
import { launchMarkets } from "@/lib/markets";

export default function MarketsPage() {
  return (
    <>
      <div className="pageHero">
        <div className="container">
          <p className="eyebrow">Launch markets</p>
          <h1>Guided support in select Southwest Riverside County markets.</h1>
          <p className="sectionIntro">
            Phase 1 is focused on five hospital-centered regions. Each market uses a vetted facility
            subset and a concierge-style intake flow — not a broad, unfiltered directory.
          </p>
        </div>
      </div>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(73, 97, 88, 0.1)", marginBottom: "2.5rem" }}>
            <Image
              src="/images/markets-garden.png"
              alt="A garden bench in a quiet outdoor setting."
              width={1160}
              height={390}
              style={{ display: "block", width: "100%", aspectRatio: "3/1", objectFit: "cover" }}
            />
          </div>

          <div className="marketsGrid">
            {launchMarkets.map((market) => (
              <article key={market.slug} className="infoCard">
                <p className="marketAnchor">{market.hospitalAnchor}</p>
                <h2>{market.name}</h2>
                <p>{market.summary}</p>
                <ul className="tagList">
                  {market.cities.map((city) => (
                    <li key={city}>{city}</li>
                  ))}
                </ul>
                <Link className="inlineTextLink" href={`/markets/${market.slug}`}>
                  Open market page →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
