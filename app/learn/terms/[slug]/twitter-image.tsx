import { notFound } from "next/navigation";
import { findTerm } from "@/lib/learn/terms";
import { OG_SIZE, OG_TYPE, ogCard } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_TYPE;
export const alt = "Investing term explained like you're 5 on Metric Finance";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const term = findTerm((await params).slug);
  if (!term) notFound();
  return ogCard({ label: "Glossary", title: `What is ${term.term}?`, accent: "Explained like you're 5", footer: "Free stock market glossary in simple words" });
}
