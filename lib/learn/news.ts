// Fresh headlines for a stock page, from Google News RSS (free, no quota). Cached for a few hours by Next.
export type Headline = { title: string; source: string | null };

const decode = (text: string) =>
  text.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

export async function latestHeadlines(query: string, limit = 5): Promise<Headline[]> {
  try {
    const response = await fetch(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`, {
      next: { revalidate: 10800 },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return [];
    const xml = await response.text();
    return (xml.match(/<item>[\s\S]*?<\/item>/g) ?? []).slice(0, limit).flatMap((item) => {
      const raw = item.match(/<title>([\s\S]*?)<\/title>/)?.[1];
      if (!raw) return [];
      const title = decode(raw);
      const split = title.lastIndexOf(" - ");
      const clean = (split > 20 ? title.slice(0, split) : title).replace(/\s*[-–—]\s*/g, " ").replace(/(?<=[A-Za-z])-(?=[A-Za-z])/g, " ").trim();
      const source = split > 20 ? title.slice(split + 3).trim() : decode(item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] ?? "") || null;
      return clean ? [{ title: clean, source }] : [];
    });
  } catch {
    return [];
  }
}
