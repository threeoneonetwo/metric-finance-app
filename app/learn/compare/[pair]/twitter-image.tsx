import { notFound } from "next/navigation";
import { findStock } from "@/lib/learn/stocks";
import { OG_SIZE, OG_TYPE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Two stocks compared on Metric Finance";
export const revalidate = 604800;

export default async function Image({ params }: { params: Promise<{ pair: string }> }) {
  const [x, y] = (await params).pair.split("-vs-");
  const a = x ? findStock(x) : null;
  const b = y ? findStock(y) : null;
  if (!a || !b) notFound();
  return ogCard({ label: "Compare", title: `${a.stock.symbol} vs ${b.stock.symbol}`, accent: "explained like you're 5", symbols: [a.stock.symbol, b.stock.symbol] });
}
