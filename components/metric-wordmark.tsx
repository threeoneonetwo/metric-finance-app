/** The Metric Finance logo: the wordmark itself. */
export function MetricWordmark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span className={className} style={{ whiteSpace: "nowrap", color: "#ffffff", ...style }}>
      Metric Finance
    </span>
  );
}
