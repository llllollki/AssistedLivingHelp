import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="siteFooter">
      <div className="container siteFooterGrid">
        <div className="siteFooterBrand">
          <p className="softEyebrow">Assisted Living Help</p>
          <p className="siteFooterIntro">
            {siteConfig.tagline} Serving {siteConfig.supportMarketsLabel}.
          </p>
        </div>

        <div className="siteFooterLinks">
          <div>
            <p className="siteFooterHeading">For families</p>
            <nav className="siteFooterNav" aria-label="Footer">
              <Link href="/get-help">Get Help</Link>
              <Link href="/markets">Markets</Link>
              <Link href="/partners">For Facilities</Link>
            </nav>
          </div>

          <div>
            <p className="siteFooterHeading">What to expect</p>
            <p className="siteFooterNote">
              Guidance and coordination support only. Placement, admissions, and availability are never
              guaranteed.
            </p>
          </div>
        </div>
      </div>

      <div className="container siteFooterBottom">
        <p>&copy; {year} {siteConfig.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
