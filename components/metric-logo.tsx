export function MetricLogo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      className={className ? `metric-logo-badge ${className}` : "metric-logo-badge"}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="1" y="14" width="5" height="7" rx="2.5" fill="#8fa8fa" />
        <rect x="9.5" y="8" width="5" height="13" rx="2.5" fill="#8fa8fa" />
        <rect x="18" y="2" width="5" height="19" rx="2.5" fill="#8fa8fa" />
      </svg>
    </span>
  );
}
