// How many stocks and daily follow up questions a reader gets. Indiana University addresses (iu.edu and its
// subdomains, like umail.iu.edu) get the student allowance. Safe to import on the client.
export type ReaderLimits = { stocks: number; questions: number };

export const STANDARD_LIMITS: ReaderLimits = { stocks: 5, questions: 5 };
export const IU_LIMITS: ReaderLimits = { stocks: 15, questions: 15 };

export function isIuEmail(email: string | null | undefined) {
  const domain = (email ?? "").trim().toLowerCase().split("@")[1] ?? "";
  return domain === "iu.edu" || domain.endsWith(".iu.edu");
}

export function limitsFor(email: string | null | undefined): ReaderLimits {
  return isIuEmail(email) ? IU_LIMITS : STANDARD_LIMITS;
}

/** "five" or "fifteen", for copy. */
export function stocksInWords(count: number) {
  return count === 15 ? "fifteen" : count === 5 ? "five" : String(count);
}
