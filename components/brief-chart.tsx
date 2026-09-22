type Series = { points: number[]; color: string; fill?: boolean };

function toPath(points: number[], width: number, height: number, padding: number) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (points.length - 1);

  return points
    .map((value, index) => {
      const x = padding + index * stepX;
      const y = padding + (height - padding * 2) * (1 - (value - min) / range);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function BriefChart({ series, height = 190, label }: { series: Series[]; height?: number; label: string }) {
  const width = 600;
  const padding = 14;

  return (
    <div style={{ height, padding: "16px 18px", background: "#0a101d", position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height - 32}`} width="100%" height="100%" preserveAspectRatio="none" aria-label={label} role="img">
        <line x1={padding} y1={(height - 32) / 2} x2={width - padding} y2={(height - 32) / 2} stroke="#16203a" strokeWidth={1} />
        {series.map((s, i) => {
          const path = toPath(s.points, width, height - 32, padding);
          return (
            <g key={i}>
              {s.fill && (
                <path
                  d={`${path} L${width - padding},${height - 32 - padding} L${padding},${height - 32 - padding} Z`}
                  fill={s.color}
                  opacity={0.08}
                />
              )}
              <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
