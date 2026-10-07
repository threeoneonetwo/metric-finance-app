import { notFound } from "next/navigation";
import { findStock } from "@/lib/learn/stocks";
import { OG_SIZE, OG_TYPE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Stock explained like you're 5 on Metric Finance";
export const revalidate = 604800;

export default async function Image({ params }: { params: Promise<{ symbol: string }> }) {
  const entry = findStock((await params).symbol);
  if (!entry) notFound();
  return ogCard({ label: `${entry.stock.exchange}: ${entry.stock.symbol}`, title: `${entry.name} stock`, accent: "explained like you're 5", symbols: [entry.stock.symbol] });
}
