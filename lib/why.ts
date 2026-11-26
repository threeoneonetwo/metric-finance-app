// Small helpers shared by the /why pages, their share images and the sitemap.

/** The page address for an explainer, like /why/nvda/2026-11-25. */
export const whyHref = (page: { symbol: string; sessionDate: string }) => `/why/${page.symbol.toLowerCase().replace(/\./g, "-")}/${page.sessionDate}`;

/** "2026-11-25" as "November 25, 2026". */
export const longDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00Z`));

/** "go up", "go down" or "move", for titles like "Why did Tesla stock go up on November 25, 2026?". */
export const direction = (changePercent: number | null) => (changePercent === null || changePercent === 0 ? "move" : changePercent > 0 ? "go up" : "go down");

/** "+2.91%" style text, or null. */
export const percentText = (value: number | null) => (value === null ? null : `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`);

/** Only real dates like 2026-11-25 are valid page addresses. */
export const isSessionDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T12:00:00Z`));
