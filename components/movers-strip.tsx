// "Biggest moves at the last close": a row of popular stocks with their move and a one month line, under the homepage search.
// It shows the site is updated every trading day. Each card opens that day's explainer when one exists, otherwise the stock's guide.
import Link from "next/link";
import { Sparkline } from "./price-chart";
import { StockLogo } from "./stock-logo";
import styles from "./movers-strip.module.css";

export type Mover = { symbol: string; name: string; changePercent: number; date: string; closes: number[]; href: string; explained: boolean };

const dayLabel = (date: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(new Date(`${date}T12:00:00Z`));

export function MoversStrip({ movers }: { movers: Mover[] }) {
  if (movers.length < 3) return null;
  return (
    <section className={styles.wrap} aria-labelledby="movers-title">
      <div className={styles.head}>
        <h2 id="movers-title">Biggest moves at the last close</h2>
        <span>{dayLabel(movers[0].date)}</span>
      </div>
      <ul className={styles.grid}>
        {movers.map((mover) => {
          const up = mover.changePercent >= 0;
          return (
            <li key={mover.symbol}>
              <Link href={mover.href} className={styles.card}>
                <div className={styles.top}>
                  <StockLogo symbol={mover.symbol} />
                  <strong>{mover.symbol}</strong>
                  <span className={up ? styles.up : styles.down}>{up ? "+" : ""}{mover.changePercent.toFixed(1)}%</span>
                </div>
                <span className={styles.name}>{mover.name}</span>
                <Sparkline history={mover.closes.map((close, index) => ({ date: String(index), close }))} up={up} />
                <span className={styles.why}>{mover.explained ? "Why it moved →" : "Explain it →"}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
