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

// Money in short form, like "$96.2B" or "$850M".
function money(value: number) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(0)}M`;
  return `${sign}$${abs.toFixed(0)}`;
}

// A growth figure like "+56%", "-3%" or "0%".
const percent = (value: number) => {
  const rounded = Math.round(value) || 0;
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

// A margin like "62%", rounded, never "-0%".
const wholePercent = (value: number) => `${Math.round(value) || 0}%`;

// A report date like "Jul 26, 2026".
const shortDate = (day: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${day}T00:00:00Z`));

function dateLine(asOf: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", month: "short", day: "numeric" }).format(new Date(asOf));
}

const label = (text: string) =>
  `<p style="margin:0 0 12px;font-family:${MONO};font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;color:#6fe0dd;">${esc(text)}</p>`;

const section = (inner: string) =>
  `<tr><td style="padding:24px 0;border-bottom:1px solid #161f35;">${inner}</td></tr>`;

/** Removes the "share today's idea" block from a brief saved before it was taken out (the page has its own share card). */
export function withoutShareBlock(html: string) {
  return html.replace(/<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border:1px dashed #2b3a66;[\s\S]*?<\/td><\/tr><\/table>/, "");
}

export function renderBriefEmail(input: {
  brief: Brief;
  facts: BriefFacts;
  tickers: string[];
  baseUrl: string;
  manageUrl: string;
  unsubscribeUrl: string;
}) {
  const { brief, facts } = input;
  const tickers = input.tickers.filter((ticker) => facts.tickers.has(ticker));
  const date = dateLine(facts.asOf);
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

  // The business behind each stock: the latest report's numbers, then the plain words reading of them.
  const notes = new Map((brief.numbers ?? []).map((row) => [row.ticker, row]));
  const business = tickers
    .flatMap((ticker) => {
      const report = facts.tickers.get(ticker)?.fundamentals;
      const note = notes.get(ticker)?.business;
      if (!report || !note) return [];
      const stats: Array<[string, string]> = [
        ["Sales", money(report.revenue)],
        ["vs a year ago", report.revenueGrowthPercent === null ? "n/a" : percent(report.revenueGrowthPercent)],
        ["Profit margin", report.netMarginPercent === null ? "n/a" : wholePercent(report.netMarginPercent)],
        ["Cash", report.cash === null ? "n/a" : money(report.cash)],
        ["Debt", report.debt === null ? "n/a" : money(report.debt)],
      ];
      const cells = stats
        .map(([name, value]) => `<div style="display:inline-block;margin:8px 20px 0 0;vertical-align:top;"><div style="font-family:${MONO};font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#7d879f;">${esc(name)}</div><div style="font-family:${MONO};font-size:14px;font-weight:bold;color:#ffffff;padding-top:3px;">${esc(value)}</div></div>`)
        .join("");
      return [`<div style="padding:14px 0;border-top:1px solid #10182b;">
        <span style="font-family:${MONO};font-size:14px;font-weight:bold;color:#ffffff;">${esc(ticker)}</span>
        <span style="font-family:${FONT};font-size:12px;color:#7d879f;padding-left:8px;">Quarter ended ${esc(shortDate(report.periodEnd))}</span>
        <div style="margin-top:2px;">${cells}</div>
        <p style="margin:6px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:#b6b8be;">${esc(note)}</p>
      </div>`];
    })
    .join("");

  // How each stock compares with the biggest companies in its industry: today's move, sales growth and margin side by side.
  const rivals = tickers
    .flatMap((ticker) => {
      const item = facts.tickers.get(ticker);
      const note = notes.get(ticker)?.rivals;
      if (!item || !note || !item.peers?.length) return [];
      const rows = [
        { ticker, change: item.changePercent, growth: item.fundamentals?.revenueGrowthPercent ?? null, margin: item.fundamentals?.netMarginPercent ?? null, self: true },
        ...item.peers.map((peer) => ({ ticker: peer.ticker, change: peer.changePercent, growth: peer.revenueGrowthPercent, margin: peer.netMarginPercent, self: false })),
      ];
      const head = ["", "Today", "Sales growth", "Margin"]
        .map((name) => `<td style="padding:0 10px 6px 0;font-family:${MONO};font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#7d879f;">${name}</td>`)
        .join("");
      const body = rows
        .map((row) => {
          const m = move(row.change);
          const weight = row.self ? "bold" : "normal";
          const color = row.self ? "#ffffff" : "#b6b8be";
          return `<tr>
            <td style="padding:3px 14px 3px 0;font-family:${MONO};font-size:13px;font-weight:${weight};color:${color};">${esc(row.ticker)}</td>
            <td style="padding:3px 14px 3px 0;font-family:${MONO};font-size:13px;font-weight:${weight};color:${m.color};">${m.label}</td>
            <td style="padding:3px 14px 3px 0;font-family:${MONO};font-size:13px;font-weight:${weight};color:${color};">${row.growth === null ? "n/a" : percent(row.growth)}</td>
            <td style="padding:3px 0;font-family:${MONO};font-size:13px;font-weight:${weight};color:${color};">${row.margin === null ? "n/a" : wholePercent(row.margin)}</td>
          </tr>`;
        })
        .join("");
      return [`<div style="padding:14px 0;border-top:1px solid #10182b;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${head}</tr>${body}</table>
        <p style="margin:8px 0 0;font-family:${FONT};font-size:14px;line-height:22px;color:#b6b8be;">${esc(note)}</p>
      </div>`];
    })
    .join("");

  const watch = brief.watchNext
    .map((row) => `<li style="margin:0 0 10px;font-family:${FONT};font-size:14px;line-height:22px;color:#b6b8be;"><strong style="color:#ffffff;">${esc(row.label)}</strong> ${esc(row.text)}</li>`)
    .join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${esc(brief.subject)}</title><meta name="mf-hook" content="${esc(brief.hook ?? "")}"></head>
<body style="margin:0;padding:0;background:#05070d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#05070d;">${esc(brief.todayInOneSentence.slice(0, 110))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05070d;"><tr><td align="center" style="padding:28px 16px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
  <tr><td style="padding-bottom:6px;font-family:${MONO};font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7d879f;">Metric Finance &middot; ${esc(date)}</td></tr>
  ${section(`${label("Today in one sentence")}<p style="margin:0;font-family:${FONT};font-size:18px;line-height:27px;font-weight:bold;letter-spacing:-0.2px;color:#f2f5fa;">${esc(brief.todayInOneSentence)}</p>`)}
  ${section(`${label("Your watchlist")}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${glance}</table>`)}
  ${section(`${label("The one change worth understanding")}<h2 style="margin:0 0 12px;font-family:${FONT};font-size:19px;line-height:25px;font-weight:bold;letter-spacing:-0.3px;color:#ffffff;">${esc(brief.lead.title)}</h2>${lead}`)}
  ${section(`${label("The rest of your stocks")}${rest}`)}
  ${business ? section(`${label("The business behind your stocks")}${business}<p style="margin:10px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#56668a;">From each company's latest quarterly report filed with the SEC. Profit margin is profit as a share of sales.</p>`) : ""}
  ${rivals ? section(`${label("How they stack up against rivals")}${rivals}<p style="margin:10px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:#56668a;">Rivals are the biggest listed companies in the same industry. Sales growth compares the latest quarter with a year earlier.</p>`) : ""}
  <tr><td style="padding:24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#08141a;border:1px solid #1d2f3a;border-radius:14px;padding:20px;">
    ${label("One idea you can use")}
    <h2 style="margin:0 0 8px;font-family:${FONT};font-size:22px;line-height:28px;font-weight:bold;letter-spacing:-0.5px;color:#ffffff;">${esc(brief.idea.term)}</h2>
    <p style="margin:0;font-family:${FONT};font-size:14px;line-height:23px;color:#c4ccd8;">${esc(brief.idea.explanation)}</p>
  </td></tr></table></td></tr>
  ${section(`${label("What to watch next")}<ul style="margin:0;padding-left:18px;">${watch}</ul>`)}
  <tr><td style="padding:24px 0 8px;">
    <p style="margin:0;font-family:${FONT};font-size:15px;line-height:22px;font-weight:bold;color:#dfe3ee;">That's the brief. See you tomorrow at 5.</p>
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
    ...(business ? ["THE BUSINESS BEHIND YOUR STOCKS", ...tickers.flatMap((ticker) => (notes.get(ticker)?.business && facts.tickers.get(ticker)?.fundamentals ? [`${ticker}: ${notes.get(ticker)!.business}`] : [])), ""] : []),
    ...(rivals ? ["HOW THEY STACK UP AGAINST RIVALS", ...tickers.flatMap((ticker) => (notes.get(ticker)?.rivals && facts.tickers.get(ticker)?.peers?.length ? [`${ticker} vs ${facts.tickers.get(ticker)!.peers.map((peer) => peer.ticker).join(", ")}: ${notes.get(ticker)!.rivals}`] : [])), ""] : []),
    `ONE IDEA YOU CAN USE: ${brief.idea.term}`,
    brief.idea.explanation,
    "",
    "WHAT TO WATCH NEXT",
    ...brief.watchNext.map((row) => `- ${row.label} ${row.text}`),
    "",
    "That's the brief. See you tomorrow at 5.",
    "",
    `Manage your watchlist: ${input.manageUrl}`,
    `Not financial advice. Unsubscribe: ${input.unsubscribeUrl}`,
  ].join("\n");

  return { subject: brief.subject, html, text, tickers };
}
