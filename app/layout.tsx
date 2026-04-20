import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/shell/Footer";
import { TopNav } from "@/components/shell/TopNav";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.tagline
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skipLink" href="#main-content">
          Skip to content
        </a>
        <TopNav />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
