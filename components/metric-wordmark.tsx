export function MetricWordmark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        whiteSpace: "nowrap",
        color: "#ffffff",
        ...style,
      }}
    >
      Metric Finance
    </span>
  );
}
