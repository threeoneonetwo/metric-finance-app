import { notFound } from "next/navigation";
import { getLearnArticle } from "@/db/learn";
import { findGuide } from "@/lib/learn/guides";
import { OG_SIZE, OG_TYPE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Beginner investing guide on Metric Finance";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const title = findGuide(slug)?.title ?? (await getLearnArticle(slug))?.title;
  if (!title) notFound();
  const [main, rest] = title.split(/:\s+|\?\s+/);
  return ogCard({ label: "Guide", title: title.includes("?") && !title.includes(":") ? `${main}?` : main, accent: rest ? rest.replace(/[?]$/, "") : undefined, footer: "Free beginner guides to the stock market" });
}
