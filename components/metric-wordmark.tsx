/**
 * The Metric Finance logo: the wordmark, with a custom "M" (a solid top bar
 * with three rounded prongs hanging from it) and a rounded-terminal "F".
 * Both glyphs inherit the surrounding text colour and size.
 */
export function MetricWordmark({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const glyph: React.CSSProperties = {
    height: "0.72em",
    display: "inline-block",
    verticalAlign: "baseline",
    fill: "currentColor",
  };

  return (
    <span className={className} style={{ whiteSpace: "nowrap", color: "#ffffff", ...style }}>
      <svg viewBox="0 0 100 100" style={{ ...glyph, width: "0.72em" }} role="img" aria-label="Metric Finance">
        <path d="M12,0 H88 A12,12 0 0 1 100,12 V35 H0 V12 A12,12 0 0 1 12,0 Z" />
        <path d="M0,25 H23 V88 A11.5,11.5 0 0 1 0,88 Z" />
        <path d="M38.5,25 H61.5 V88 A11.5,11.5 0 0 1 38.5,88 Z" />
        <path d="M77,25 H100 V88 A11.5,11.5 0 0 1 77,88 Z" />
      </svg>
      <span aria-hidden="true">etric </span>
      <svg viewBox="0 0 77 100" style={{ ...glyph, width: "0.554em" }} aria-hidden="true">
        <path d="M0,12 A12,12 0 0 1 12,0 H23 V89 A11,11 0 0 1 0,89 Z" />
        <path d="M12,0 H66 A11.5,11.5 0 0 1 66,23 H12 Z" />
        <path d="M12,41 H64 A9,9 0 0 1 64,59 H12 Z" />
      </svg>
      <span aria-hidden="true">inance</span>
    </span>
  );
}
