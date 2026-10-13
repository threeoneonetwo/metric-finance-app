const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'" };

/** The short headline the brief was written with (it is the page title of the saved email), for the dashboard card. */
export function briefTitle(html: string, sentAt: Date) {
  const raw = /<title>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? "";
  const title = raw.replace(/&(?:amp|lt|gt|quot|#39|#x27);/g, (entity) => ENTITIES[entity] ?? entity);
  if (title) return title;
  const day = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" }).format(sentAt);
  return `Your ${day} brief is ready`;
}
