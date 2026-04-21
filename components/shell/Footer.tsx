import Link from "next/link";
import { Logo } from "@/components/shell/Logo";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="siteFooter">
      <div className="container siteFooterGrid">
        <div className="siteFooterBrand">
          <Link href="/" aria-label="Assisted Living Help home">
            <Logo size={32} />
          </Link>
          <p className="siteFooterIntro" style={{ marginTop: "1rem" }}>
            {siteConfig.tagline} Serving {siteConfig.supportMarketsLabel}.
          </p>
        </div>

        <div>
          <p className="siteFooterHeading">For families</p>
          <nav className="siteFooterNav" aria-label="Footer families">
            <Link href="/get-help">Get Help</Link>
            <Link href="/markets">Launch Markets</Link>
            <Link href="/confirmation">Confirmation Flow</Link>
          </nav>
        </div>

        <div>
          <p className="siteFooterHeading">For facilities</p>
          <nav className="siteFooterNav" aria-label="Footer facilities">
            <Link href="/partners">Partner Information</Link>
            <Link href="/get-help">Contact Us</Link>
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

      <div className="container siteFooterBottom">
        <p>
          &copy; {year} {siteConfig.name}. All rights reserved. Assisted Living Help is a matching
          and coordination service, not a licensed care provider or placement agency.
        </p>
      </div>
    </footer>
  );
}
