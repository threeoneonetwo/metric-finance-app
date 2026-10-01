import { brandedEmail, FOOTER_TEXT } from "./email-template";

// The daily email is only a nudge: the brief itself lives on the website.
export function renderBriefNotification(input: {
  headline: string;
  tickers: string[];
  briefUrl: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
  postedAt?: Date;
}) {
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(input.postedAt ?? new Date());
  const tickersText = input.tickers.join(", ");

  const subject = `Your brief is up: ${input.headline}`;
  const html = brandedEmail({
    preheader: `Your ${date} brief on ${tickersText} is posted.`,
    eyebrow: "TODAY'S BRIEF",
    heading: "Your daily brief is up",
    lead: `Your ${date} brief on ${tickersText} has been posted on Metric Finance. It is ready to read now, explained like you're 5.`,
    buttonLabel: "Read today's brief",
    buttonUrl: input.briefUrl,
    footnote: "You can also find every brief on your Metric Finance dashboard.",
    footerLinks: { manageUrl: input.dashboardUrl, unsubscribeUrl: input.unsubscribeUrl },
  });
  const text = [
    "Your daily brief is up",
    "",
    `Your ${date} brief on ${tickersText} has been posted on Metric Finance.`,
    `Read it: ${input.briefUrl}`,
    "",
    `Your dashboard: ${input.dashboardUrl}`,
    `Unsubscribe: ${input.unsubscribeUrl}`,
    "",
    FOOTER_TEXT,
  ].join("\n");

  return { subject, html, text };
}
