type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="metricCard">
      <p className="metricLabel">{label}</p>
      <strong className="metricValue">{value}</strong>
      <p className="metricDetail">{detail}</p>
    </article>
  );
}
