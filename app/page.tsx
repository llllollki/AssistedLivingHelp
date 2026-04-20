import Link from "next/link";
import { MetricCard } from "@/components/shell/MetricCard";
import { SectionHeading } from "@/components/shell/SectionHeading";
import { launchMarkets } from "@/lib/markets";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container heroGrid">
          <div>
            <p className="eyebrow">California Launch Markets</p>
            <h1>{siteConfig.name}</h1>
            <p className="heroCopy">
              Guided assisted living matching for families who need help choosing communities,
              coordinating next steps, and getting to real calls or tours faster.
            </p>
            <div className="heroActions">
              <Link className="primaryButton" href="/get-help">
                Start the intake
              </Link>
              <Link className="secondaryButton" href="/markets">
                Explore launch markets
              </Link>
            </div>
          </div>
          <div className="heroPanel">
            <h2>What the MVP includes</h2>
            <ul className="checkList">
              <li>Short guided intake for families</li>
              <li>Immediate confirmation and next-step messaging</li>
              <li>Internal lead, matching, outreach, and scheduling workflow</li>
              <li>Facility partner and business development tracking</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container metricsGrid">
          <MetricCard label="Launch markets" value="5" detail="Hospital-centered regions for Phase 1." />
          <MetricCard label="Operating model" value="Concierge-first" detail="Human-assisted matching and outreach." />
          <MetricCard label="Data source" value="SQLite + Supabase" detail="Vetted facility subset, not a raw directory." />
        </div>
      </section>

      <section className="section altSection">
        <div className="container">
          <SectionHeading
            eyebrow="How it works"
            title="A simpler path from inquiry to tour"
            body="The first release is built around intake, matching, and operations rather than a wide-open directory."
          />
          <div className="stepsGrid">
            <article className="stepCard">
              <span>01</span>
              <h3>Share your needs</h3>
              <p>Families submit a short intake with contact preferences, timing, location, and care category.</p>
            </article>
            <article className="stepCard">
              <span>02</span>
              <h3>Review likely-fit options</h3>
              <p>Staff and matching rules create a shortlist from a vetted local facility subset.</p>
            </article>
            <article className="stepCard">
              <span>03</span>
              <h3>Coordinate next steps</h3>
              <p>We track outreach, responses, and scheduling so families do not get lost in the process.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Phase 1 markets"
            title="Local launch areas"
            body="The initial release stays intentionally narrow around defined hospital-centered markets."
          />
          <div className="marketGrid">
            {launchMarkets.map((market) => (
              <article key={market.slug} className="marketCard">
                <p className="marketAnchor">{market.hospitalAnchor}</p>
                <h3>{market.name}</h3>
                <p>{market.summary}</p>
                <Link href={`/markets/${market.slug}`}>View market details</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
