const sampleSchedule = [
  ["Family call", "Temecula sample facility", "Requested", "Needs follow-up"],
  ["Tour", "Murrieta sample facility", "Confirmed", "Tomorrow 2:00 PM"],
  ["Family call", "Menifee sample facility", "Options received", "Waiting on family"]
];

export default function AdminSchedulePage() {
  return (
    <section className="section">
      <div className="container">
        <p className="eyebrow">Admin / Schedule</p>
        <h1>Outreach and appointments</h1>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Facility</th>
                <th>Status</th>
                <th>Next action</th>
              </tr>
            </thead>
            <tbody>
              {sampleSchedule.map((row) => (
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
