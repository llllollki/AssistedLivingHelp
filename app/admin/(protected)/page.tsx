import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function AdminHomePage() {
  const supabase = await createSupabaseServerClient();

  const [
    { count: totalLeads },
    { count: newLeads },
    { count: activeLeads },
    { count: totalFacilities },
    { count: activePartners },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .not("status", "in", '("closed_won","closed_lost")'),
    supabase
      .from("alh_facilities")
      .select("*", { count: "exact", head: true })
      .eq("public_visibility", true),
    supabase
      .from("alh_facilities")
      .select("*", { count: "exact", head: true })
      .eq("partner_status", "active"),
  ]);

  const stats = [
    { label: "Total leads", value: totalLeads ?? 0, href: "/admin/leads" },
    {
      label: "New leads",
      value: newLeads ?? 0,
      href: "/admin/leads?status=new",
    },
    {
      label: "Active pipeline",
      value: activeLeads ?? 0,
      href: "/admin/leads",
    },
    {
      label: "Visible facilities",
      value: totalFacilities ?? 0,
      href: "/admin/facilities",
    },
    {
      label: "Active partners",
      value: activePartners ?? 0,
      href: "/admin/facilities?partner=active",
    },
  ];

  const modules = [
    {
      href: "/admin/leads",
      title: "Leads",
      body: "Review the lead queue, update status, add notes, and create leads manually.",
    },
    {
      href: "/admin/facilities",
      title: "Facilities",
      body: "Browse the vetted Phase 1 facility directory and track partner status.",
    },
    {
      href: "/admin/partners",
      title: "Partners",
      body: "Manage facility prospects, packages, and the business development pipeline.",
    },
    {
      href: "/admin/schedule",
      title: "Schedule",
      body: "Track outreach, appointments, and tour coordination.",
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Internal operations</p>
        <h1>Admin dashboard</h1>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1rem",
            margin: "2rem 0 3rem",
          }}
        >
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              style={{ textDecoration: "none" }}
            >
              <div className="adminCard" style={{ textAlign: "center", padding: "1.25rem" }}>
                <div
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    color: "var(--accent-dark)",
                    lineHeight: 1,
                    marginBottom: "0.4rem",
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Module cards */}
        <div className="marketGrid">
          {modules.map((card) => (
            <article className="marketCard" key={card.href}>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
              <Link href={card.href}>Open module</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
