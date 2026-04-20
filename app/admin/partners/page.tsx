const samplePartners = [
  ["Prospect community", "Prospect", "Starter", "Follow up this week"],
  ["Growth partner", "Active", "Growth", "Review onboarding assets"],
  ["Concierge partner", "Active", "Growth + Concierge", "Check scheduling cadence"]
];

export default function AdminPartnersPage() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Admin / Partners</p>
        <h1>Partner CRM</h1>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th>Status</th>
                <th>Tier</th>
                <th>Next step</th>
              </tr>
            </thead>
            <tbody>
              {samplePartners.map((row) => (
                <tr key={row.join("-")}>
                  {row.map((cell) => (
                    <td key={cell}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
