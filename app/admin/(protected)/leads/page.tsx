const sampleLeads = [
  ["New", "Murrieta Loma Linda", "Adult child", "Within 30 days"],
  ["Matching", "Temecula Valley", "Spouse", "Immediately"],
  ["Follow-up", "Menifee Global", "Self", "Researching"]
];

export default function AdminLeadsPage() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Admin / Leads</p>
        <h1>Lead queue</h1>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Market</th>
                <th>Relationship</th>
                <th>Timeline</th>
              </tr>
            </thead>
            <tbody>
              {sampleLeads.map((row) => (
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
