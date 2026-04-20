import Image from "next/image";
import Link from "next/link";
import { launchMarkets } from "@/lib/markets";
import { siteConfig } from "@/lib/site";

const serviceCards = [
  {
    title: "Short guided intake",
    body: "A few questions help us understand location, timing, care category, and how you prefer to be contacted.",
    accent: "softMint"
  },
  {
    title: "Curated local shortlist",
    body: "We work from a vetted facility subset in our launch markets rather than a broad, unfiltered directory.",
    accent: "softSand"
  },
  {
    title: "Call and tour coordination",
    body: "We help narrow next steps and coordinate with facilities when families need extra support getting conversations scheduled.",
    accent: "softSky"
  }
];

const trustPoints = [
  {
    label: "Local launch focus",
    value: "5 markets",
    detail: "Serving select Southwest Riverside County hospital-centered markets."
  },
  {
    label: "Human-guided support",
    value: "Concierge-first",
    detail: "Families are not left alone to sort through options without support."
  },
  {
    label: "Careful information handling",
    value: "Consent-based",
    detail: "Lead details and next-step outreach are designed around explicit permissions."
  }
];

const voiceCards = [
  {
    quote:
      "You should not have to decode the next step alone. We help bring structure, clarity, and follow-through to the search process.",
    source: "Assisted Living Help approach"
  },
  {
    quote:
      "Our role is to help families move from uncertainty to real conversations with communities that may fit their needs and timing.",
    source: "Local concierge workflow"
  }
];

const editorialFrames = {
  heroPrimary: "/images/hero-guidance.png",
  heroSecondary: "/images/hero-support.png",
  supportPrimary: "/images/guided-room.png",
  trustImage: "/images/process-walk.png"
};

export default function HomePage() {
  return (
    <>
      <section className="homeHero">
        <div className="container homeHeroGrid">
          <div className="homeHeroCopy">
            <p className="softEyebrow">Serving Temecula, Murrieta, Menifee, Inland Valley, and nearby markets</p>
            <h1>Guided assisted living support for families who need clarity fast.</h1>
            <p className="heroLead">
              {siteConfig.name} helps families understand their options, narrow a vetted local shortlist,
              and move toward calls or tours with more confidence and less friction.
            </p>
            <div className="heroActions">
              <Link className="primaryButton" href="/get-help">
                Start the intake
              </Link>
              <Link className="secondaryButton" href="/markets">
                See supported markets
              </Link>
            </div>
            <p className="heroMicrocopy">Takes just a few minutes. We'll confirm what happens next right away.</p>

            <div className="trustStrip">
              <div>
                <strong>Local focus</strong>
                <span>Southwest Riverside County launch markets</span>
              </div>
              <div>
                <strong>Human support</strong>
                <span>Help with matching, follow-up, and scheduling</span>
              </div>
              <div>
                <strong>Vetted subset</strong>
                <span>Built from licensed facility records and launch-market filtering</span>
              </div>
            </div>
          </div>

          <div className="heroEditorialPanel">
            <article className="heroTrustCard">
              <p className="softEyebrow">What happens after you contact us</p>
              <h2>Support that feels more guided and less overwhelming.</h2>
              <ul className="editorialChecklist">
                <li>Submit a short intake with contact preferences and care basics</li>
                <li>Receive confirmation right away</li>
                <li>Get coordinator follow-up and shortlist review</li>
                <li>Move toward calls or tours with responsive facilities</li>
              </ul>
              <p className="trustNote">
                We help coordinate the next step. We do not promise placement, guaranteed availability, or
                guaranteed admissions.
              </p>
            </article>

            <div className="editorialMediaCluster">
              <article className="editorialMediaCard editorialMediaPrimary">
                <Image
                  src={editorialFrames.heroPrimary}
                  alt="An older adult speaking with two care advisors in a bright living room."
                  className="editorialMediaImage"
                  width={862}
                  height={760}
                  priority
                />
                <div className="editorialMediaScrim" />
                <div className="editorialMediaCaption">
                  <p className="metricLabel">Concierge intake</p>
                  <strong>Families get a guided starting point instead of a wide open directory.</strong>
                  <span>We focus first on fit, timing, contact preferences, and practical next steps.</span>
                </div>
              </article>

              <article className="editorialMediaCard editorialMediaSecondary">
                <Image
                  src={editorialFrames.heroSecondary}
                  alt="Two older adults holding hands for reassurance and support."
                  className="editorialMediaImage"
                  width={790}
                  height={796}
                />
                <div className="editorialMediaChip">Local shortlist support</div>
              </article>

              <article className="editorialProofCard">
                <p className="softEyebrow">What families feel</p>
                <h3>Calmer guidance, clearer follow-through.</h3>
                <ul className="editorialChecklist compactChecklist">
                  <li>One primary intake path</li>
                  <li>Human review before outreach</li>
                  <li>Scheduling help when it matters</li>
                </ul>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHeaderSplit">
            <div>
              <p className="softEyebrow">How we help</p>
              <h2>A more supportive path from first inquiry to next conversation.</h2>
            </div>
            <p className="sectionSideCopy">
              The MVP is intentionally intake-first and concierge-led. Families get structure, trust, and
              scheduling help before they ever need a long browse-heavy experience.
            </p>
          </div>

          <div className="serviceLayout">
            <article className="featureStoryCard">
              <p className="softEyebrow">Concierge workflow</p>
              <h3>We help turn interest into real next steps.</h3>
              <p>
                Instead of dropping families into a wide marketplace, we guide intake, review a vetted local
                subset, and support outreach or scheduling when the path forward feels unclear.
              </p>
              <div className="featureStoryBands">
                <div>
                  <strong>1.</strong>
                  <span>Share needs and timing</span>
                </div>
                <div>
                  <strong>2.</strong>
                  <span>Review a likely-fit shortlist</span>
                </div>
                <div>
                  <strong>3.</strong>
                  <span>Coordinate calls or tours</span>
                </div>
              </div>
            </article>

            <div className="supportCardGrid">
              {serviceCards.map((card) => (
                <article key={card.title} className={`supportMiniCard ${card.accent}`}>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="guidedPreviewBand">
            <div className="guidedPreviewCopy">
              <p className="softEyebrow">Designed for reassurance</p>
              <h3>Families see a calmer path from intake to real conversations.</h3>
              <p>
                The visual language now mirrors the service model: fewer distractions, more breathing room,
                and a guided flow that emphasizes trust, local knowledge, and responsive coordination.
              </p>
            </div>
            <article className="guidedPreviewVisual">
              <Image
                src={editorialFrames.supportPrimary}
                alt="A calm living room with natural light, soft seating, and a welcoming atmosphere."
                className="editorialMediaImage"
                width={530}
                height={395}
              />
              <div className="guidedPreviewBadge">
                <strong>3-step help model</strong>
                <span>Intake, shortlist review, scheduling support</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="editorialBand">
        <div className="container editorialBandGrid">
          <div>
            <p className="softEyebrow">Why families choose a guided process</p>
            <h2>High-trust support matters when timelines, health changes, and family decisions collide.</h2>
            <p className="sectionIntro">
              Families often need a path that feels calmer, more personal, and easier to act on. The
              experience is designed to support that reality while still matching the operating model in the
              business plan: intake, matching, coordination, and careful communication.
            </p>
          </div>
          <div className="trustBandAside">
            <div className="trustPointGrid">
              {trustPoints.map((point) => (
                <article key={point.label} className="trustPointCard">
                  <p className="metricLabel">{point.label}</p>
                  <strong className="metricValue">{point.value}</strong>
                  <p className="metricDetail">{point.detail}</p>
                </article>
              ))}
            </div>

            <article className="trustInsetImage">
              <Image
                src={editorialFrames.trustImage}
                alt="A caregiver walking beside an older adult in a bright community space."
                className="editorialMediaImage"
                width={766}
                height={765}
              />
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionHeaderSplit">
            <div>
              <p className="softEyebrow">Launch markets</p>
              <h2>Intentionally local from day one.</h2>
            </div>
            <p className="sectionSideCopy">
              We are not presenting a statewide directory yet. Phase 1 is built around defined
              hospital-centered markets and a vetted facility subset in those areas.
            </p>
          </div>

          <div className="marketEditorialGrid">
            <article className="marketLeadCard">
              <p className="softEyebrow">Current service area</p>
              <h3>Focused on select Southwest Riverside County markets.</h3>
              <p>
                Launch-market boundaries still matter to matching quality, scheduling realism, and partner
                operations. Starting narrow keeps the experience more trustworthy.
              </p>
              <Link className="inlineTextLink" href="/get-help">
                Start with your area and timing
              </Link>
            </article>

            <div className="marketGrid refinedMarketGrid">
              {launchMarkets.map((market) => (
                <article key={market.slug} className="marketCard refinedMarketCard">
                  <p className="marketAnchor">{market.hospitalAnchor}</p>
                  <h3>{market.name}</h3>
                  <p>{market.summary}</p>
                  <ul className="tagList">
                    {market.cities.map((city) => (
                      <li key={city}>{city}</li>
                    ))}
                  </ul>
                  <Link href={`/markets/${market.slug}`}>View market details</Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section voicesSection">
        <div className="container">
          <div className="sectionHeaderCentered">
            <p className="softEyebrow">Voices of support</p>
            <h2>A calmer, more personal tone without losing business clarity.</h2>
          </div>
          <div className="voicesGrid">
            {voiceCards.map((voice) => (
              <article key={voice.source} className="voiceCard">
                <p>{voice.quote}</p>
                <span>{voice.source}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ctaRibbonSection">
        <div className="container ctaRibbon">
          <div>
            <p className="softEyebrow">Get help</p>
            <h2>Start with a short intake and we'll help shape the next step.</h2>
            <p>
              Families can begin with a few practical questions about location, timing, care category, and
              communication preferences.
            </p>
          </div>
          <div className="ctaRibbonActions">
            <Link className="primaryButton" href="/get-help">
              Begin the intake
            </Link>
            <Link className="secondaryButton" href="/confirmation">
              See confirmation flow
            </Link>
          </div>
        </div>
      </section>

      <section className="section partnerSection">
        <div className="container partnerBand">
          <div>
            <p className="softEyebrow">For assisted living communities</p>
            <h2>Facility partners can participate without turning the site into a pay-to-rank directory.</h2>
            <p>
              The business plan includes listing packages, premium profile options, and scheduling support.
              Any featured or priority placement should remain clearly disclosed and should never override fit,
              trust, or compliance.
            </p>
          </div>
          <Link className="secondaryButton" href="/partners">
            Partner information
          </Link>
        </div>
      </section>
    </>
  );
}
