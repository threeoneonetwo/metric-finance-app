import type { BriefFacts } from "./brief-data";
import type { Brief } from "./brief-schema";

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const FONT = "Arial,Helvetica,sans-serif";
const MONO = "ui-monospace,Menlo,Consolas,monospace";

function move(changePercent: number | null) {
  if (changePercent === null) return { label: "n/a", color: "#8798b4" };
  const sign = changePercent >= 0 ? "+" : "";
  return { label: `${sign}${changePercent.toFixed(1)}%`, color: changePercent >= 0 ? "#3fae64" : "#c74b4b" };
}

function dateLine(asOf: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", month: "short", day: "numeric" }).format(new Date(asOf));
}

const label = (text: string) =>
  `<p style="margin:0 0 12px;font-family:${MONO};font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;color:#6fe0dd;">${esc(text)}</p>`;

const section = (inner: string) =>
  `<tr><td style="padding:24px 0;border-bottom:1px solid #161f35;">${inner}</td></tr>`;

export function shareLinks(brief: Brief, baseUrl: string) {
  const message = `${brief.idea.term} in 30 seconds: ${brief.idea.explanation}\n\nExplained daily by Metric Finance: ${baseUrl}`;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
    email: `mailto:?subject=${encodeURIComponent(`${brief.idea.term} in 30 seconds`)}&body=${encodeURIComponent(message)}`,
  };
}

export function renderBriefEmail(input: {
  brief: Brief;
  facts: BriefFacts;
  tickers: string[];
  baseUrl: string;
  manageUrl: string;
  unsubscribeUrl: string;
}) {
  const { brief, facts, baseUrl } = input;
  const tickers = input.tickers.filter((ticker) => facts.tickers.has(ticker));
  const date = dateLine(facts.asOf);
  const share = shareLinks(brief, baseUrl);
  const pull = (ticker: string) => move(facts.tickers.get(ticker)?.changePercent ?? null);

  const glance = brief.glance
    .map((row) => {
      const m = pull(row.ticker);
      return `<tr>
        <td width="56" style="padding:9px 0;border-top:1px solid #10182b;font-family:${MONO};font-size:14px;font-weight:bold;color:#ffffff;">${esc(row.ticker)}</td>
        <td width="66" style="padding:9px 0;border-top:1px solid #10182b;font-family:${MONO};font-size:13px;font-weight:bold;color:${m.color};">${m.label}</td>
        <td style="padding:9px 0;border-top:1px solid #10182b;font-family:${FONT};font-size:14px;line-height:20px;color:#b6b8be;">${esc(row.signal)}</td>
      </tr>`;
    })
    .join("");

  const leadParts: Array<[string, string]> = [
    ["What happened.", brief.lead.whatHappened],
    ["Why it matters.", brief.lead.whyItMatters],
    ["What it changes.", brief.lead.whatItChanges],
    ["What it doesn't prove.", brief.lead.whatItDoesntProve],
    ["Next checkpoint.", brief.lead.nextCheckpoint],
  ];
  const lead = leadParts
    .map(([head, text]) => `<p style="margin:0 0 10px;font-family:${FONT};font-size:14px;line-height:23px;color:#b6b8be;"><strong style="color:#ffffff;">${esc(head)}</strong> ${esc(text)}</p>`)
    .join("");

  const rest = brief.rest
    .map((row) => {
      const m = pull(row.ticker);
      return `<div style="padding:12px 0;border-top:1px solid #10182b;">
        <span style="font-family:${MONO};font-size:14px;font-weight:bold;color:#ffffff;">${esc(row.ticker)}</span>
        <span style="font-family:${MONO};font-size:13px;font-weight:bold;color:${m.color};padding-left:10px;">${m.label}</span>
        <p style="margin:6px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:#b6b8be;">${esc(row.text)}</p>
      </div>`;
    })
    .join("");

  const watch = brief.watchNext
    .map((row) => `<li style="margin:0 0 10px;font-family:${FONT};font-size:14px;line-height:22px;color:#b6b8be;"><strong style="color:#ffffff;">${esc(row.label)}</strong> ${esc(row.text)}</li>`)
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(brief.subject)}</title></head>
<body style="margin:0;padding:0;background:#05070d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#05070d;">${esc(brief.todayInOneSentence.slice(0, 110))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05070d;"><tr><td align="center" style="padding:28px 16px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
  <tr><td style="padding-bottom:6px;font-family:${MONO};font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7d879f;">Metric Finance &middot; ${esc(date)}</td></tr>
  ${section(`${label("Today in one sentence")}<p style="margin:0;font-family:${FONT};font-size:18px;line-height:27px;font-weight:bold;letter-spacing:-0.2px;color:#f2f5fa;">${esc(brief.todayInOneSentence)}</p>`)}
  ${section(`${label("Your watchlist")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${glance}</table>`)}
  ${section(`${label("The one change worth understanding")}<h2 style="margin:0 0 12px;font-family:${FONT};font-size:19px;line-height:25px;font-weight:bold;letter-spacing:-0.3px;color:#ffffff;">${esc(brief.lead.title)}</h2>${lead}`)}
  ${section(`${label("The rest of your stocks")}${rest}`)}
  <tr><td style="padding:24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#08141a;border:1px solid #1d2f3a;border-radius:14px;padding:20px;">
    ${label("One idea you can use")}
    <h2 style="margin:0 0 8px;font-family:${FONT};font-size:22px;line-height:28px;font-weight:bold;letter-spacing:-0.5px;color:#ffffff;">${esc(brief.idea.term)}</h2>
    <p style="margin:0;font-family:${FONT};font-size:14px;line-height:23px;color:#c4ccd8;">${esc(brief.idea.explanation)}</p>
  </td></tr></table></td></tr>
  ${section(`${label("What to watch next")}<ul style="margin:0;padding-left:18px;">${watch}</ul>`)}
  <tr><td style="padding:24px 0 8px;">
    <p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:22px;font-weight:bold;color:#dfe3ee;">That's the brief. See you tomorrow morning.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px dashed #2b3a66;border-radius:14px;padding:16px;">
      <p style="margin:0 0 12px;font-family:${FONT};font-size:13.5px;line-height:21px;color:#9aa6c0;">Know someone who would like ${esc(brief.idea.term)} explained? Send them today's idea. It shares the explainer only, never your watchlist.</p>
      <a href="${share.whatsapp}" style="display:inline-block;margin:0 8px 8px 0;padding:11px 16px;border-radius:10px;background:#ffffff;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#05070d;text-decoration:none;">Share on WhatsApp</a>
      <a href="${share.email}" style="display:inline-block;margin:0 0 8px 0;padding:10px 16px;border-radius:10px;border:1px solid #2b3a66;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#b3c9ff;text-decoration:none;">Share by email</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding-top:22px;font-family:${FONT};font-size:12px;line-height:18px;color:#56668a;">
    <a href="${input.manageUrl}" style="color:#6fe0dd;text-decoration:none;">Manage your watchlist</a><br><br>
    Not financial advice. Market data may be delayed. <a href="${input.unsubscribeUrl}" style="color:#7d879f;">Unsubscribe</a>
  </td></tr>
</table></td></tr></table>
</body></html>`;

  const text = [
    `Metric Finance, ${date}`,
    "",
    "TODAY IN ONE SENTENCE",
    brief.todayInOneSentence,
    "",
    "YOUR WATCHLIST",
    ...brief.glance.map((row) => `${row.ticker} ${pull(row.ticker).label}  ${row.signal}`),
    "",
    "THE ONE CHANGE WORTH UNDERSTANDING",
    brief.lead.title,
    ...leadParts.map(([head, body]) => `${head} ${body}`),
    "",
    "THE REST OF YOUR STOCKS",
    ...brief.rest.map((row) => `${row.ticker} ${pull(row.ticker).label}: ${row.text}`),
    "",
    `ONE IDEA YOU CAN USE: ${brief.idea.term}`,
    brief.idea.explanation,
    "",
    "WHAT TO WATCH NEXT",
    ...brief.watchNext.map((row) => `- ${row.label} ${row.text}`),
    "",
    "That's the brief. See you tomorrow morning.",
    `Share today's idea (no watchlist attached): ${share.whatsapp}`,
    "",
    `Manage your watchlist: ${input.manageUrl}`,
    `Not financial advice. Unsubscribe: ${input.unsubscribeUrl}`,
  ].join("\n");

  return { subject: brief.subject, html, text, tickers };
}
