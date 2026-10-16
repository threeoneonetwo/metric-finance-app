const GOOGLE_NEWS_RSS_URL = "https://news.google.com/rss/search";

export type NewsHeadline = {
  title: string;
  source: string | null;
  /** ISO time the story was published, so the writer can tell today's news from old news. */
  publishedAt: string | null;
};

// Stories older than this are not today's news.
const MAX_AGE_MS = 36 * 60 * 60 * 1000;

/**
 * Free, no-API-key news lookup via Google News RSS. Returns the top few
 * headlines for a company so the AI writer has real facts to ground on
 * instead of guessing a reason for the day's price move.
 */
export async function getTickerNews(companyName: string, ticker: string): Promise<NewsHeadline[]> {
  const query = encodeURIComponent(`"${companyName}" OR ${ticker} stock when:2d`);
  const url = `${GOOGLE_NEWS_RSS_URL}?q=${query}&hl=en-US&gl=US&ceid=US:en`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/rss+xml" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];

    const xml = await response.text();
    const now = Date.now();
    return parseHeadlines(xml)
      .filter((headline) => headline.publishedAt && now - Date.parse(headline.publishedAt) <= MAX_AGE_MS)
      .sort((a, b) => Date.parse(b.publishedAt!) - Date.parse(a.publishedAt!))
      .slice(0, 3);
  } catch {
    return [];
  }
}

function parseHeadlines(xml: string): NewsHeadline[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

  return items
    .map((item) => {
      const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
      if (!titleMatch) return null;

      const rawTitle = decodeXmlEntities(titleMatch[1].replace(/^<!\[CDATA\[|\]\]>$/g, ""));
      // Google News titles are "Headline - Source"; split those apart.
      const separatorIndex = rawTitle.lastIndexOf(" - ");
      const title = separatorIndex > 0 ? rawTitle.slice(0, separatorIndex) : rawTitle;
      const source = separatorIndex > 0 ? rawTitle.slice(separatorIndex + 3) : null;

      const pub = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
      const time = pub ? Date.parse(pub) : NaN;
      return { title: title.trim(), source: source?.trim() ?? null, publishedAt: Number.isNaN(time) ? null : new Date(time).toISOString() };
    })
    .filter((headline): headline is NewsHeadline => Boolean(headline?.title));
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
