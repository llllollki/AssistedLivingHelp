const sampleFacilities = [
  ["Murrieta sample facility", "Murrieta", "Licensed", "Active partner"],
  ["Temecula sample facility", "Temecula", "Licensed", "Prospect"],
  ["Menifee sample facility", "Menifee", "Licensed", "Vetted"]
];

export default function AdminFacilitiesPage() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Admin / Facilities</p>
        <h1>Vetted Phase 1 facilities</h1>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>License status</th>
                <th>Partner status</th>
              </tr>
            </thead>
            <tbody>
              {sampleFacilities.map((row) => (
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
