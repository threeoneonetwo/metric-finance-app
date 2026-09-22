/**
 * A "brief day" runs 5pm ET to 5pm ET, not midnight to midnight — before 5pm,
 * "today" still means the previous brief day, since that day's close is the
 * most recent complete one. Used to avoid double-sending a subscriber who
 * already got an immediate send (e.g. right after verifying) when the daily
 * cron later runs for the same brief day.
 */
function partsInET(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour") };
}

export function briefDayKey(date: Date): string {
  const { year, month, day, hour } = partsInET(date);
  const utcMidnight = new Date(Date.UTC(year, month - 1, day));
  if (hour < 17) {
    utcMidnight.setUTCDate(utcMidnight.getUTCDate() - 1);
  }
  return utcMidnight.toISOString().slice(0, 10);
}

export function isSameBriefDay(a: Date, b: Date): boolean {
  return briefDayKey(a) === briefDayKey(b);
}
