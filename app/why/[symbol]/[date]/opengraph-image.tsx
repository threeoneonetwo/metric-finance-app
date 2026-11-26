// The share picture for a "why did this stock move" page: the headline, the stock and its move at the close.
import { notFound } from "next/navigation";
import { getWhyPage } from "@/db/why";
import { findStock } from "@/lib/learn/stocks";
import { OG_SIZE, OG_TYPE, ogCard } from "@/lib/og";
import { isSessionDate, percentText } from "@/lib/why";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Why this stock moved, explained like you're 5 on Metric Finance";
export const revalidate = 604800;

export default async function Image({ params }: { params: Promise<{ symbol: string; date: string }> }) {
  const { symbol, date } = await params;
  const entry = findStock(symbol);
  if (!entry || !isSessionDate(date)) notFound();
  const page = await getWhyPage(entry.stock.symbol, date);
  if (!page) notFound();
  const move = percentText(page.explainer.changePercent);
  return ogCard({
    label: `${entry.stock.symbol} · ${page.explainer.sessionLabel}`,
    title: page.explainer.headline,
    accent: move ? `${entry.stock.symbol} ${move} at the close` : undefined,
    symbols: [entry.stock.symbol],
  });
}
