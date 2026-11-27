// A simple one month price line, drawn on the server as SVG (no chart library, no JavaScript in the browser).
// Days that have a "why it moved" page get a dot that links to it, so the chart doubles as a map of the explainers.
import type { DailyClose } from "@/lib/prices";
import styles from "./price-chart.module.css";

type Props = {
  symbol: string;
  history: DailyClose[];
  /** Days with an explainer page, as YYYY-MM-DD to link. */
  marks?: Map<string, string>;
  /** A day to highlight (the /why page's own day). */
  focusDate?: string;
  title?: string;
};

const W = 640;
const H = 190;
const PAD_X = 8;
const PAD_TOP = 14;
const PAD_BOTTOM = 14;

const money = (value: number) => `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortDate = (date: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00Z`));

export function PriceChart({ symbol, history, marks, focusDate, title }: Props) {
  if (history.length < 5) return null;
  const closes = history.map((day) => day.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const x = (index: number) => PAD_X + (index / (history.length - 1)) * (W - PAD_X * 2);
  const y = (close: number) => PAD_TOP + (1 - (close - min) / span) * (H - PAD_TOP - PAD_BOTTOM);

  const first = history[0];
  const last = history[history.length - 1];
  const change = ((last.close - first.close) / first.close) * 100;
  const up = change >= 0;
  const line = history.map((day, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(day.close).toFixed(1)}`).join(" ");
  const area = `${line} L${x(history.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`;
  const gradient = `pc-${symbol.replace(/[^A-Za-z0-9]/g, "")}`;

  return (
    <figure className={styles.chart} aria-label={`${symbol} closing prices from ${shortDate(first.date)} to ${shortDate(last.date)}`}>
      <figcaption className={styles.head}>
        <div>
          <span className={styles.label}>{title ?? `${symbol} over the last month`}</span>
          <strong className={styles.price}>{money(last.close)}</strong>
        </div>
        <div className={styles.changeBox}>
          <span className={up ? styles.up : styles.down}>{up ? "+" : ""}{change.toFixed(1)}%</span>
          <span className={styles.sub}>since {shortDate(first.date)}</span>
        </div>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-hidden="true">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={up ? "#3fd68f" : "#ff7a7a"} stopOpacity="0.28" />
            <stop offset="100%" stopColor={up ? "#3fd68f" : "#ff7a7a"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradient})`} />
        <path d={line} fill="none" stroke={up ? "#3fd68f" : "#ff7a7a"} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        {history.map((day, index) => {
          const href = marks?.get(day.date);
          const focused = day.date === focusDate;
          if (!href && !focused) return null;
          const dot = <circle cx={x(index)} cy={y(day.close)} r={focused ? 6 : 4.5} className={focused ? styles.focusDot : styles.dot}><title>{`${shortDate(day.date)}: ${money(day.close)}`}</title></circle>;
          return href && !focused ? <a key={day.date} href={href} aria-label={`Why ${symbol} moved on ${shortDate(day.date)}`}>{dot}</a> : <g key={day.date}>{dot}</g>;
        })}
      </svg>
      <div className={styles.axis}>
        <span>{shortDate(first.date)}</span>
        <span>Low {money(min)} · High {money(max)}</span>
        <span>{shortDate(last.date)}</span>
      </div>
      {marks && marks.size > 0 && <p className={styles.note}>Dots mark days we explained. Tap one to read why {symbol} moved.</p>}
    </figure>
  );
}

/** A tiny line for lists and cards. */
export function Sparkline({ history, up }: { history: DailyClose[]; up: boolean }) {
  if (history.length < 3) return null;
  const closes = history.map((day) => day.close);
  const min = Math.min(...closes);
  const span = Math.max(...closes) - min || 1;
  const points = history.map((day, index) => `${((index / (history.length - 1)) * 100).toFixed(1)},${(28 - ((day.close - min) / span) * 26).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={styles.spark} aria-hidden="true">
      <polyline points={points} fill="none" stroke={up ? "#3fd68f" : "#ff7a7a"} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
