import Link from "next/link";
import { Logo } from "@/components/shell/Logo";

export function TopNav() {
  return (
    <header className="topNav">
      <div className="container topNavInner">
        <Link href="/" aria-label="Assisted Living Help home">
          <Logo size={36} />
        </Link>
        <nav className="topLinks" aria-label="Main navigation">
          <Link href="/markets">Markets</Link>
          <Link href="/get-help">How It Works</Link>
          <Link href="/partners">For Facilities</Link>
        </nav>
        <Link href="/get-help" className="navCta">
          Get Help
        </Link>
      </div>
    </header>
  );
}
