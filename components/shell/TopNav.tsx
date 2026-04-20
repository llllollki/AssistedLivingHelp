import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function TopNav() {
  return (
    <header className="topNav">
      <div className="container topNavInner">
        <Link href="/" className="brand">
          {siteConfig.name}
        </Link>
        <nav className="topLinks">
          <Link href="/markets">Markets</Link>
          <Link href="/get-help">Get Help</Link>
          <Link href="/partners">For Facilities</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
