// Builds the daily email. It is a short preview of the brief: the headline, how each stock moved, the one sentence
// summary and a button to the full brief on the website. The "why", the company numbers, the rivals and the question box
// stay on the site, so the email answers "what happened" and the brief answers "why".
//
// Built to look right everywhere:
// - Layout is tables with inline styles (Gmail strips <style> in some apps, Outlook ignores most modern CSS).
// - A light design by default, with dark mode styles for apps that support them (Apple Mail, iOS Mail, Outlook.com).
//   Gmail's own dark mode inverts light emails cleanly, which it does badly with dark ones.
// - Moves are shown with a sign, an arrow and a colour, so they read correctly without colour and in screen readers.
// - Small (well under Gmail's 102 KB clipping limit), one column, fluid up to 600px wide, 16px body text on phones.
// - The preview text is padded so the inbox preview shows the summary, not stray body text.
import { MAILING_ADDRESS, SUPPORT_EMAIL } from "@/lib/sender";
import { FOOTER_TEXT } from "./email-template";

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

/** One stock's row: its move today and the short signal line from the brief. */
export type NotificationStock = { ticker: string; changePercent: number | null; signal: string };

// "+3.1%", "-2.4%" (with a real minus sign) or "n/a", plus words for screen readers.
function move(changePercent: number | null) {
  if (changePercent === null || !Number.isFinite(changePercent)) return { text: "n/a", spoken: "no price data", arrow: "", color: "#5b6478", dark: "#9aa6c0", cls: "mf-flat" };
  const rounded = Math.round(changePercent * 10) / 10 || 0;
  if (rounded > 0) return { text: `+${rounded.toFixed(1)}%`, spoken: `up ${rounded.toFixed(1)} percent`, arrow: "&#9650;", color: "#0f7a45", dark: "#4fe0a0", cls: "mf-up" };
  if (rounded < 0) return { text: `&minus;${Math.abs(rounded).toFixed(1)}%`, spoken: `down ${Math.abs(rounded).toFixed(1)} percent`, arrow: "&#9660;", color: "#c0352b", dark: "#ff8a80", cls: "mf-down" };
  return { text: "0.0%", spoken: "unchanged", arrow: "", color: "#5b6478", dark: "#9aa6c0", cls: "mf-flat" };
}

export function renderBriefNotification(input: {
  headline: string;
  summary: string;
  stocks: NotificationStock[];
  briefUrl: string;
  dashboardUrl: string;
  unsubscribeUrl: string;
  postedAt?: Date;
}) {
  const date = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric" }).format(input.postedAt ?? new Date());
  // The subject is the brief's own headline: specific, and different every day, which inboxes and readers both like.
  const subject = input.headline;
  // Inbox preview: the summary, then invisible padding so nothing else leaks into the preview line.
  const preview = `${esc(input.summary)}${"&#847;&zwnj;&nbsp;".repeat(60)}`;

  const rows = input.stocks
    .map((stock, index) => {
      const m = move(stock.changePercent);
      const border = index === 0 ? "" : "border-top:1px solid #e6e9f0;";
      return `<tr>
<td class="mf-row" style="${border}padding:12px 0;width:64px;vertical-align:top;font-family:${MONO};font-size:15px;font-weight:700;color:#0b1220;" ><span class="mf-text">${esc(stock.ticker)}</span></td>
<td class="mf-row" style="${border}padding:12px 12px 12px 0;width:86px;vertical-align:top;font-family:${MONO};font-size:15px;font-weight:700;color:${m.color};white-space:nowrap;"><span class="${m.cls}" aria-label="${m.spoken}"><span aria-hidden="true" style="font-size:11px;">${m.arrow}</span> ${m.text}</span></td>
<td class="mf-row" style="${border}padding:12px 0;vertical-align:top;font-family:${FONT};font-size:15px;line-height:22px;color:#3d4659;"><span class="mf-muted">${esc(stock.signal)}</span></td>
</tr>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${esc(subject)}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  a { text-decoration: none; }
  @media (max-width: 480px) {
    .mf-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .mf-h1 { font-size: 24px !important; line-height: 30px !important; }
  }
  @media (prefers-color-scheme: dark) {
    .mf-bg { background: #05070d !important; }
    .mf-card { background: #0b1120 !important; border-color: #1d2740 !important; }
    .mf-text, .mf-h1 { color: #f2f5fa !important; }
    .mf-muted { color: #b9c6dc !important; }
    .mf-faint { color: #9aa6c0 !important; }
    .mf-row { border-color: #1d2740 !important; }
    .mf-up { color: #4fe0a0 !important; }
    .mf-down { color: #ff8a80 !important; }
    .mf-flat { color: #9aa6c0 !important; }
    .mf-btn { background: #8fa8fa !important; }
    .mf-btn a { color: #05090f !important; }
    .mf-link { color: #9fb6ff !important; }
    .mf-logo { background: #f2f5fa !important; color: #0b1220 !important; }
  }
  [data-ogsc] .mf-text, [data-ogsc] .mf-h1 { color: #f2f5fa !important; }
  [data-ogsc] .mf-muted { color: #b9c6dc !important; }
</style>
</head>
<body class="mf-bg" style="margin:0;padding:0;width:100%;background:#f3f5f9;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:#f3f5f9;">${preview}</div>
<table role="presentation" class="mf-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f5f9;">
<tr><td align="center" style="padding:28px 12px 36px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="mf-card" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e3e7ef;border-radius:16px;">
  <tr><td class="mf-pad" style="padding:28px 32px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="mf-logo" width="30" height="30" style="width:30px;height:30px;background:#0b1220;border-radius:8px;text-align:center;vertical-align:middle;font-family:${FONT};font-size:12px;font-weight:700;color:#ffffff;">MF</td>
      <td style="padding-left:10px;font-family:${FONT};font-size:15px;font-weight:700;color:#0b1220;"><span class="mf-text">Metric Finance</span></td>
    </tr></table>
  </td></tr>
  <tr><td class="mf-pad" style="padding:26px 32px 0;">
    <p style="margin:0 0 8px;font-family:${FONT};font-size:13px;font-weight:600;letter-spacing:.4px;color:#4b5670;"><span class="mf-faint">Your brief for ${esc(date)}</span></p>
    <h1 class="mf-h1" style="margin:0 0 14px;font-family:${FONT};font-size:28px;line-height:34px;font-weight:800;letter-spacing:-0.5px;color:#0b1220;">${esc(input.headline)}</h1>
    <p style="margin:0;font-family:${FONT};font-size:17px;line-height:26px;color:#3d4659;"><span class="mf-muted">${esc(input.summary)}</span></p>
  </td></tr>
  <tr><td class="mf-pad" style="padding:22px 32px 0;">
    <p style="margin:0 0 4px;font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#4b5670;"><span class="mf-faint">Your stocks today</span></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
  </td></tr>
  <tr><td class="mf-pad" style="padding:26px 32px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="mf-btn" align="center" bgcolor="#0b1220" style="background:#0b1220;border-radius:12px;">
        <!--[if mso]><v:roundrect href="${input.briefUrl}" style="height:52px;v-text-anchor:middle;width:536px;" arcsize="20%" fillcolor="#0b1220" stroke="f"><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Read why in your full brief</center></v:roundrect><![endif]-->
        <!--[if !mso]><!-- --><a href="${input.briefUrl}" style="display:block;padding:16px 20px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-align:center;border-radius:12px;">Read why in your full brief &rarr;</a><!--<![endif]-->
      </td>
    </tr></table>
    <p style="margin:12px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:#4b5670;text-align:center;"><span class="mf-faint">Inside: the reasons, each company's latest numbers, how it stacks up against rivals, and a box to ask follow up questions.</span></p>
  </td></tr>
  <tr><td class="mf-pad" style="padding:24px 32px 28px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td class="mf-row" style="border-top:1px solid #e6e9f0;padding-top:18px;font-family:${FONT};font-size:13px;line-height:20px;color:#5b6478;">
      <span class="mf-faint">Questions? Just reply, it reaches a real person. Or write to <a href="mailto:${SUPPORT_EMAIL}" class="mf-link" style="color:#2f55d4;text-decoration:underline;">${SUPPORT_EMAIL}</a>.<br>
      <a href="${input.dashboardUrl}" class="mf-link" style="color:#2f55d4;text-decoration:underline;">Change your stocks</a> &middot; <a href="${input.unsubscribeUrl}" class="mf-link" style="color:#2f55d4;text-decoration:underline;">Unsubscribe</a><br>
      Not investment advice. Prices may be delayed.<br>${esc(MAILING_ADDRESS)}</span>
    </td></tr></table>
  </td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;

  const plainMove = (value: number | null) => {
    if (value === null || !Number.isFinite(value)) return "n/a";
    const rounded = Math.round(value * 10) / 10 || 0;
    return `${rounded > 0 ? "+" : ""}${rounded.toFixed(1)}%`;
  };
  const text = [
    `Your brief for ${date}`,
    "",
    input.headline,
    "",
    input.summary,
    "",
    "YOUR STOCKS TODAY",
    ...input.stocks.map((stock) => `${stock.ticker}  ${plainMove(stock.changePercent)}  ${stock.signal}`),
    "",
    `Read why in your full brief: ${input.briefUrl}`,
    "",
    `Change your stocks: ${input.dashboardUrl}`,
    `Unsubscribe: ${input.unsubscribeUrl}`,
    "Not investment advice. Prices may be delayed.",
    "",
    FOOTER_TEXT,
  ].join("\n");

  return { subject, html, text };
}
