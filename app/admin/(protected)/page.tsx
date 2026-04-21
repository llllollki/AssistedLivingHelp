import Link from "next/link";

const cards = [
  { href: "/admin/leads", title: "Leads", body: "Track new inquiries, ownership, intake status, and next actions." },
  { href: "/admin/facilities", title: "Facilities", body: "Review the vetted Phase 1 subset and partner status." },
  { href: "/admin/partners", title: "Partners", body: "Manage facility prospects, packages, and onboarding." },
  { href: "/admin/schedule", title: "Schedule", body: "Track outreach, appointments, and tour coordination." }
];

export default function AdminHomePage() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Internal operations</p>
        <h1>Admin dashboard shell</h1>
        <p className="sectionIntro">
          The first build focuses on operator-assisted matching and coordination, so the admin app is a
          core part of the MVP.
        </p>
        <div className="marketGrid">
          {cards.map((card) => (
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
