// IndexNow tells Bing, Yandex and other search engines about new or updated pages the moment they exist.
// The key file at /public/<key>.txt proves we own the site. (Google does not use IndexNow; it relies on the sitemap.)
export const INDEXNOW_KEY = "22c07e2826d8939d2092fab5b674d91f";

export async function pingIndexNow(urls: string[]) {
  if (urls.length === 0) return false;
  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        host: "metricfinance.app",
        key: INDEXNOW_KEY,
        keyLocation: `https://metricfinance.app/${INDEXNOW_KEY}.txt`,
        urlList: urls.slice(0, 500),
      }),
      signal: AbortSignal.timeout(8000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
