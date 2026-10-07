import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoredArticlePage } from "@/components/learn-article";
import { SITE } from "@/components/learn-shell";
import { getLearnArticle } from "@/db/learn";

type Props = { params: Promise<{ date: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const article = await getLearnArticle(`market-today-${date}`);
  if (!article) return {};
  return {
    title: `${article.title} | Metric Finance`,
    description: article.description,
    alternates: { canonical: `/learn/market-today/${date}` },
    openGraph: { title: article.title, description: article.description, url: `${SITE}/learn/market-today/${date}`, type: "article", siteName: "Metric Finance" },
    twitter: { card: "summary_large_image", title: article.title, description: article.description },
  };
}

export default async function MarketTodayPage({ params }: Props) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const article = await getLearnArticle(`market-today-${date}`);
  if (!article) notFound();
  return <StoredArticlePage article={article} base={{ name: "Market today", href: "/learn/market-today" }} />;
}
