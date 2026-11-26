// The daily "why did it move" job. After the 5 PM send it writes explainer pages for the day's biggest movers and the most
// followed stocks, so /why has fresh pages for search engines every trading day, then tells search engines about them.
import { getInstantExplainer } from "./explain";
import { fetchGainers, fetchLosers } from "@/lib/learn/fmp";
import { pingIndexNow } from "@/lib/learn/indexnow";
import { STOCKS } from "@/lib/stocks";
import { US_STOCKS } from "@/lib/stock-lookup";
import { whyHref } from "@/lib/why";

const SITE = "https://metricfinance.app";
const US_SET = new Set(US_STOCKS.map((stock) => stock.symbol));

/** How many of each list to cover. */
const MOVERS_EACH_WAY = 6;
const POPULAR = 12;

export type WhyReport = { written: string[]; failed: string[]; note: string; indexNow: boolean };

/** Writes today's explainer pages, four at a time, stopping at the deadline. */
export async function refreshWhy(deadline = Date.now() + 200_000): Promise<WhyReport> {
  // The biggest movers (two market data calls). Only real US listed stocks at a real price, so no tiny penny stocks.
  const [gainers, losers] = await Promise.all([fetchGainers().catch(() => []), fetchLosers().catch(() => [])]);
  const keep = (moves: Awaited<ReturnType<typeof fetchGainers>>) => moves.filter((move) => US_SET.has(move.symbol) && move.price >= 5).slice(0, MOVERS_EACH_WAY).map((move) => move.symbol);
  const queue = [...new Set([...keep(gainers), ...keep(losers), ...STOCKS.slice(0, POPULAR).map((stock) => stock.symbol)])];

  const written: string[] = [];
  const failed: string[] = [];
  const urls = new Set<string>([`${SITE}/why`]);
  let note = "ok";

  const worker = async () => {
    for (let symbol = queue.shift(); symbol; symbol = queue.shift()) {
      if (Date.now() > deadline) {
        note = "stopped: out of time";
        return;
      }
      try {
        const explainer = await getInstantExplainer(symbol);
        written.push(symbol);
        urls.add(`${SITE}${whyHref(explainer)}`);
      } catch (error) {
        failed.push(`${symbol}:${error instanceof Error ? error.message : "error"}`);
        // When the writer is down every later call fails too, so stop early.
        if (error instanceof Error && error.message === "writer_failed") {
          note = "stopped: writer unavailable";
          queue.length = 0;
        }
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));

  const indexNow = written.length > 0 ? await pingIndexNow([...urls]) : false;
  return { written, failed, note, indexNow };
}
