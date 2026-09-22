export function MetricLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "36%",
        background: "#8fa8fa",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="14" width="4.5" height="8" rx="2.25" fill="#0b1220" />
        <rect x="9.8" y="8" width="4.5" height="14" rx="2.25" fill="#0b1220" />
        <rect x="17.6" y="2" width="4.5" height="20" rx="2.25" fill="#0b1220" />
      </svg>
    </span>
  );
}
