import Image from "next/image";
import Link from "next/link";
import { launchMarkets } from "@/lib/markets";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="homeHero">
        <div className="container heroGrid">
          <div className="heroLeft">
            <p className="softEyebrow">
              Serving Temecula, Murrieta, Menifee, Inland Valley, and nearby markets
            </p>
            <h1>Guided assisted living support for families who need clarity fast.</h1>
            <p className="heroLead">
              {siteConfig.name} helps families understand their options, narrow a vetted local
              shortlist, and move toward calls or tours with more confidence and less friction.
            </p>
            <div className="heroActions">
              <Link className="primaryButton" href="/get-help">
                Start the intake
              </Link>
              <Link className="secondaryButton" href="/markets">
                See our markets
              </Link>
            </div>
            <p className="heroMicrocopy">
              Takes just a few minutes. We'll confirm what happens next right away.
            </p>
            <div className="heroTrustStrip">
              <div className="heroTrustPill">
                <strong>Local focus</strong>
                <span>SW Riverside County markets</span>
              </div>
              <div className="heroTrustPill">
                <strong>Human support</strong>
                <span>Matching and scheduling guidance</span>
              </div>
              <div className="heroTrustPill">
                <strong>Vetted facilities</strong>
                <span>Licensed records, Phase 1 subset</span>
              </div>
            </div>
          </div>

          <div className="heroImageFrame">
            <Image
              src="/images/hero-care.png"
              alt="A caregiver holding hands with an older adult in a warm, bright room."
              className="heroImageFrameImg"
              width={768}
              height={768}
              priority
              style={{ display: "block", width: "100%", aspectRatio: "4/5", objectFit: "cover", objectPosition: "center 18%" }}
            />
            <div className="heroImageBadge">
              <strong>Guided concierge service</strong>
              <span>Local shortlist, real scheduling support</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div className="sectionHeaderCentered">
            <p className="softEyebrow">How we help</p>
            <h2>A simpler path from first question to scheduled conversation.</h2>
          </div>
          <div className="stepsRow">
            <article className="stepCard">
              <span className="stepBadge">1</span>
              <h3>Tell us your needs</h3>
              <p>
                Location, timing, care category, and how you prefer to be contacted. A short intake
                that takes just a few minutes.
              </p>
            </article>
            <article className="stepCard">
              <span className="stepBadge">2</span>
              <h3>Get a vetted local shortlist</h3>
              <p>
                Matched to the Phase 1 facility subset in your market — not a broad, unfiltered
                directory.
              </p>
            </article>
            <article className="stepCard">
              <span className="stepBadge">3</span>
              <h3>We coordinate calls and tours</h3>
              <p>
                Real scheduling support from a real team. We help reduce friction between inquiry
                and a scheduled next conversation.
              </p>
            </article>
          </div>
          <div className="stepsImageBand">
            <Image
              src="/images/family-support.png"
              alt="An older adult sitting with two children on a couch."
              width={1160}
              height={560}
              style={{ display: "block", width: "100%", aspectRatio: "16/8", objectFit: "cover", objectPosition: "center 18%" }}
            />
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="section altSection">
        <div className="container">
          <div className="sectionHeaderCentered">
            <p className="softEyebrow">Our services</p>
            <h2>Local matching with real coordination behind it.</h2>
          </div>
          <div className="serviceCardsGrid">
            <article className="imgCard">
              <Image
                src="/images/guided-room.png"
                alt="A calm living room with natural light and soft seating."
                className="imgCardImage"
                width={560}
                height={373}
                style={{ display: "block", width: "100%", aspectRatio: "3/2", objectFit: "cover" }}
              />
              <div className="imgCardBody">
                <h3>Short guided intake</h3>
                <p>
                  A few practical questions about location, timing, care category, and how you
                  prefer to be contacted.
                </p>
                <Link className="imgCardLink" href="/get-help">
                  Start the intake →
                </Link>
              </div>
            </article>
            <article className="imgCard">
              <Image
                src="/images/hero-support.png"
                alt="Two older adults holding hands for reassurance."
                className="imgCardImage"
                width={560}
                height={373}
                style={{ display: "block", width: "100%", aspectRatio: "3/2", objectFit: "cover" }}
              />
              <div className="imgCardBody">
                <h3>Vetted local shortlist</h3>
                <p>
                  We work from a scoped facility subset in our launch markets, not a broad
                  unfiltered directory.
                </p>
                <Link className="imgCardLink" href="/markets">
                  See supported markets →
                </Link>
              </div>
            </article>
            <article className="imgCard">
              <Image
                src="/images/intake-support.png"
                alt="An older adult smiling with a younger family member nearby."
                className="imgCardImage"
                width={560}
                height={373}
                style={{ display: "block", width: "100%", aspectRatio: "3/2", objectFit: "cover" }}
              />
              <div className="imgCardBody">
                <h3>Call and tour coordination</h3>
                <p>
                  We help coordinate next steps and scheduling conversations with facilities when
                  families need support.
                </p>
                <Link className="imgCardLink" href="/get-help">
                  Get matched →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Trust Band */}
      <section className="editorialBand">
        <div className="container editorialBandGrid">
          <div className="trustBandCopy">
            <p className="softEyebrow">Why families choose a guided process</p>
            <h2>
              High-trust support matters when timelines, health changes, and family decisions
              collide.
            </h2>
            <p className="sectionIntro">
              Families often need a path that feels calmer, more personal, and easier to act on.
              The experience is designed to support that reality while still matching the operating
              model: intake, matching, coordination, and careful communication.
            </p>
            <div className="trustMetrics">
              <div className="trustMetricRow">
                <span className="trustMetricValue">5 markets</span>
                <span className="trustMetricLabel">
                  SW Riverside County hospital-centered launch markets
                </span>
              </div>
              <div className="trustMetricRow">
                <span className="trustMetricValue">Concierge-first</span>
                <span className="trustMetricLabel">
                  Human guidance and scheduling support, not just a directory
                </span>
              </div>
              <div className="trustMetricRow">
                <span className="trustMetricValue">Consent-based</span>
                <span className="trustMetricLabel">
                  Careful information handling and permissions at every step
                </span>
              </div>
            </div>
          </div>
          <div className="trustBandImage">
            <Image
              src="/images/trust-consult.png"
              alt="An advisor speaking with an older adult and a family member in a living room."
              width={580}
              height={768}
              style={{ display: "block", width: "100%", aspectRatio: "1/1", objectFit: "cover", objectPosition: "center 22%" }}
            />
          </div>
        </div>
      </section>

      {/* Launch Markets */}
      <section className="section">
        <div className="container">
          <div className="sectionHeaderSplit">
            <div>
              <p className="softEyebrow">Launch markets</p>
              <h2>Intentionally local from day one.</h2>
            </div>
          </div>
          <div className="marketsGrid">
            {launchMarkets.map((market) => (
              <article key={market.slug} className="infoCard">
                <p className="marketAnchor">{market.hospitalAnchor}</p>
                <h3>{market.name}</h3>
                <p>{market.summary}</p>
                <ul className="tagList">
                  {market.cities.map((city) => (
                    <li key={city}>{city}</li>
                  ))}
                </ul>
                <Link className="inlineTextLink" href={`/markets/${market.slug}`}>
                  View market details →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Image Mosaic */}
      <section className="section altSection">
        <div className="container">
          <div className="sectionHeaderCentered">
            <p className="softEyebrow">Real families. Real support.</p>
            <p className="sectionIntro">
              Guided matching and coordination built for real decisions, not just browsing.
            </p>
          </div>
          <div className="mosaicGrid">
            <div className="mosaicCell mosaicCellWide mosaicAspectLandscape">
              <Image
                src="/images/hero-guidance.png"
                alt="An older adult speaking with two care advisors."
                width={760}
                height={428}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="mosaicCell mosaicAspectPortrait mosaicCellHideMobile">
              <Image
                src="/images/markets-garden.png"
                alt="A garden bench in a quiet outdoor setting."
                width={380}
                height={475}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="mosaicCell mosaicAspectPortrait mosaicCellHideMobile">
              <Image
                src="/images/intake-support.png"
                alt="An older adult smiling with a family member."
                width={380}
                height={475}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div className="mosaicCell mosaicCellWideRight mosaicAspectLandscape">
              <Image
                src="/images/family-support.png"
                alt="An older adult sitting with two children on a couch."
                width={760}
                height={532}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 14%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Voices of Support */}
      <section className="section">
        <div className="container">
          <div className="sectionHeaderCentered">
            <p className="softEyebrow">Voices of support</p>
            <h2>Built around calmer, more personal guidance.</h2>
          </div>
          <div className="voicesGrid">
            <article className="quoteCard">
              <p>
                You should not have to decode the next step alone. We help bring structure,
                clarity, and follow-through to the search process.
              </p>
              <span>Assisted Living Help approach</span>
            </article>
            <article className="quoteCard">
              <p>
                Our role is to help families move from uncertainty to real conversations with
                communities that may fit their needs and timing.
              </p>
              <span>Local concierge workflow</span>
            </article>
            <article className="quoteCard">
              <p>
                We stay with families through the process — from first conversation to scheduled
                tour. That kind of follow-through is built into how we operate.
              </p>
              <span>Coordination workflow</span>
            </article>
          </div>
        </div>
      </section>

      {/* CTA Ribbon */}
      <section className="ctaRibbonSection">
        <div className="container ctaRibbon">
          <div>
            <p className="softEyebrow">Get help</p>
            <h2>Start with a short intake and we'll help shape the next step.</h2>
            <p>
              Families can begin with a few practical questions about location, timing, care
              category, and communication preferences. No commitment required.
            </p>
          </div>
          <div className="ctaRibbonActions">
            <Link className="primaryButton" href="/get-help">
              Get matched today
            </Link>
            <Link className="secondaryButton" href="/markets">
              See our markets
            </Link>
          </div>
        </div>
      </section>

      {/* Partner Band */}
      <section className="section partnerSection">
        <div className="container partnerBand">
          <div>
            <p className="softEyebrow">For assisted living communities</p>
            <h2>Assisted living facilities can join the local matching network.</h2>
            <p>
              Starter, Growth, and Concierge add-on packages available for SW Riverside County
              communities. Any featured placement is clearly disclosed.
            </p>
          </div>
          <Link className="secondaryButton" href="/partners">
            Learn about partnership →
          </Link>
        </div>
      </section>
    </>
  );
}
