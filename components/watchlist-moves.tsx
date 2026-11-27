// The reader's stocks at the last close, each with its move and a one month line. Shown on the dashboard under the latest brief.
import Link from "next/link";
import { Sparkline } from "./price-chart";
import { StockLogo } from "./stock-logo";
import styles from "./newsletter-landing.module.css";

export type WatchlistMove = { symbol: string; name: string; changePercent: number; date: string; closes: number[] };

const dayLabel = (date: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00Z`));

export function WatchlistMoves({ moves }: { moves: WatchlistMove[] }) {
  if (moves.length === 0) return null;
  return (
    <div className={styles.watchMoves}>
      <div className={styles.watchMovesHead}>
        <h2 className={styles.briefingHeading}>Your stocks at the last close</h2>
        <span>{dayLabel(moves[0].date)}</span>
      </div>
      <ul>
        {moves.map((move) => {
          const up = move.changePercent >= 0;
          return (
            <li key={move.symbol}>
              <Link href={`/learn/stocks/${move.symbol.toLowerCase().replace(/\./g, "-")}`}>
                <StockLogo symbol={move.symbol} />
                <span className={styles.watchMovesName}><strong>{move.symbol}</strong><small>{move.name}</small></span>
                <span className={styles.watchMovesSpark}><Sparkline history={move.closes.map((close, index) => ({ date: String(index), close }))} up={up} /></span>
                <span className={up ? styles.watchUp : styles.watchDown}>{up ? "+" : ""}{move.changePercent.toFixed(1)}%</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
