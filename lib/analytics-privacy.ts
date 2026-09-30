// Private links carry secrets in the address. Analytics must never see them.
const SENSITIVE_PARAMS = ["token", "exp", "sig", "email"];

export function stripSensitiveParams(url: string) {
  try {
    const absolute = /^https?:\/\//i.test(url);
    const parsed = new URL(url, "https://metricfinance.app");
    for (const key of SENSITIVE_PARAMS) parsed.searchParams.delete(key);
    return absolute ? parsed.toString() : `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}
