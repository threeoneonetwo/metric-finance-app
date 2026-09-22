type Series = { points: number[]; color: string; fill?: boolean; name: string };

function toPath(points: number[], min: number, range: number, width: number, height: number, padding: number) {
  const stepX = (width - padding * 2) / (points.length - 1);

  return points
    .map((value, index) => {
      const x = padding + index * stepX;
      const y = padding + (height - padding * 2) * (1 - (value - min) / range);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function formatValue(value: number) {
  return value >= 1000 ? value.toFixed(0) : value.toFixed(1);
}

export function BriefChart({ series, height = 190, label }: { series: Series[]; height?: number; label: string }) {
  const width = 600;
  const padding = 14;
  const plotHeight = height - 32;

  // Same y-domain across every series so a multi-line chart is a real, honest
  // comparison (e.g. two indexed series) rather than each line independently
  // stretched to fill the box.
  const allPoints = series.flatMap((s) => s.points);
  const min = Math.min(...allPoints);
  const max = Math.max(...allPoints);
  const range = max - min || 1;

  return (
    <div style={{ height, padding: "16px 18px", background: "#0a101d", position: "relative" }}>
      {series.length > 1 && (
        <div style={{ position: "absolute", top: "12px", right: "16px", display: "flex", gap: "14px", zIndex: 1 }}>
          {series.map((s) => (
            <span key={s.name} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#8798b4" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color, display: "inline-block" }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${plotHeight}`} width="100%" height="100%" preserveAspectRatio="none" aria-label={label} role="img">
        <line x1={padding} y1={plotHeight / 2} x2={width - padding} y2={plotHeight / 2} stroke="#16203a" strokeWidth={1} />
        {series.map((s, i) => {
          const path = toPath(s.points, min, range, width, plotHeight, padding);
          return (
            <g key={i}>
              {s.fill && (
                <path
                  d={`${path} L${width - padding},${plotHeight - padding} L${padding},${plotHeight - padding} Z`}
                  fill={s.color}
                  opacity={0.08}
                />
              )}
              <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", top: "12px", left: "18px", fontSize: "11px", color: "#5a6b8c" }}>{formatValue(max)}</div>
      <div style={{ position: "absolute", bottom: "6px", left: "18px", fontSize: "11px", color: "#5a6b8c" }}>{formatValue(min)}</div>
    </div>
  );
}
