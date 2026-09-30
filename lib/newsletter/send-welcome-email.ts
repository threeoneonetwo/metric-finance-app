import { sendEmail } from "./ses";

const fromEmail = process.env.SES_FROM_EMAIL ?? "briefing@metricfinance.app";

export async function sendWelcomeEmail(input: {
  to: string;
  name?: string;
  tickers: string[];
  manageUrl: string;
  briefUrl: string;
}) {
  const displayName = input.name || input.to.split("@")[0];
  const tickersText = input.tickers.join(", ");
  
  const subject = `Welcome to Metric Finance, ${displayName} — your first brief is ready`;
  const preheader = `Your five: ${tickersText}. One step to make sure every brief lands in your inbox.`;

  const html = buildWelcomeEmailHTML({
    displayName,
    tickers: input.tickers,
    tickersText,
    preheader,
    briefUrl: input.briefUrl,
    manageUrl: input.manageUrl,
    email: input.to,
  });

  const text = buildWelcomeEmailText({
    displayName,
    tickersText,
    briefUrl: input.briefUrl,
    manageUrl: input.manageUrl,
  });

  await sendEmail({
    to: input.to,
    subject,
    html,
    text,
  });
}

function buildWelcomeEmailHTML(input: {
  displayName: string;
  tickers: string[];
  tickersText: string;
  preheader: string;
  briefUrl: string;
  manageUrl: string;
  email: string;
}): string {
  const tickerCells = input.tickers
    .map(ticker => `<td width="19%" valign="top" bgcolor="#141c33" style="width:19%;background-color:#141c33;border:1px solid #1a2540;padding:14px 12px;"><p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:bold;letter-spacing:0.3px;color:#f2f5fa;">${ticker}</p></td><td width="1%" style="width:1%;font-size:0;line-height:0;">&nbsp;</td>`)
    .join("");
  
  const tickerRow = tickerCells.slice(0, -1);

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Welcome to Metric Finance, ${input.displayName} — your first brief is ready</title>
<style>
  body { margin:0 !important; padding:0 !important; width:100% !important; }
  a { color:#8fa8fa; text-decoration:none; }
  a:hover { text-decoration:underline !important; }
  @media only screen and (max-width:620px) {
    .outer { padding:0 !important; }
    .wrap { width:100% !important; }
    .card { border-left:0 !important; border-right:0 !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .h1 { font-size:32px !important; line-height:36px !important; }
    .body { font-size:15px !important; line-height:24px !important; }
    .stack { display:block !important; width:100% !important; box-sizing:border-box; }
    .stack-gap { display:none !important; }
    .stack-tile { margin-bottom:8px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0f1526;">
<span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;">${input.preheader}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0f1526" style="background-color:#0f1526;">
<tr><td class="outer" align="center" style="padding:32px 12px;">
<table role="presentation" class="wrap card" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#0f1526" style="width:600px;max-width:600px;background-color:#0f1526;border:1px solid #1a2540;">

<tr><td class="px" style="padding:24px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td valign="middle"><a href="https://metricfinance.app" style="text-decoration:none;color:#f2f5fa;"><span style="font-family:Arial,Helvetica,sans-serif;font-size:23px;line-height:24px;font-weight:bold;letter-spacing:-0.6px;color:#f2f5fa;">Metric Finance</span></a></td>
<td valign="middle" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.8px;color:#8798b4;">WELCOME</td>
</tr>
</table>
</td></tr>

<tr><td class="px" style="padding:44px 32px 36px;border-top:1px solid #1a2540;">
<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.8px;color:#8fa8fa;">YOU'RE IN</p>
<h1 class="h1" style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:42px;line-height:44px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:-1.6px;color:#f2f5fa;">Welcome, ${input.displayName}.</h1>
<p class="body" style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:27px;mso-line-height-rule:exactly;color:#f2f5fa;">From today, you finish each trading day knowing what moved your five stocks, why, and what to watch next. <span style="color:#8798b4;">Nothing on companies you don't own.</span></p>
</td></tr>

<tr><td class="px" style="padding:0 32px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#141c33" style="background-color:#141c33;border:1px solid #2b3a66;">
<tr><td style="padding:22px 22px 8px;">
<p style="margin:12px 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:26px;mso-line-height-rule:exactly;font-weight:bold;letter-spacing:-0.2px;color:#f2f5fa;">Add <strong>${fromEmail}</strong> to your contacts so your brief never lands in spam.</p>
</td></tr>
<tr><td style="padding:0 22px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td width="96" valign="top" style="width:96px;padding:12px 0;border-top:1px solid #2b3a66;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;font-weight:bold;letter-spacing:1.2px;color:#f2f5fa;">GMAIL</td><td valign="top" style="padding:12px 0;border-top:1px solid #2b3a66;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#b9c6dc;">Drag this email to your Primary tab, or star it.</td></tr>
<tr><td width="96" valign="top" style="width:96px;padding:12px 0;border-top:1px solid #2b3a66;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;font-weight:bold;letter-spacing:1.2px;color:#f2f5fa;">OUTLOOK</td><td valign="top" style="padding:12px 0;border-top:1px solid #2b3a66;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#b9c6dc;">Right-click our address, then Add to Safe Senders.</td></tr>
<tr><td width="96" valign="top" style="width:96px;padding:12px 0;border-top:1px solid #2b3a66;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:20px;font-weight:bold;letter-spacing:1.2px;color:#f2f5fa;">APPLE MAIL</td><td valign="top" style="padding:12px 0;border-top:1px solid #2b3a66;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#b9c6dc;">Tap our name at the top, then Add to VIPs.</td></tr>
</table>
</td></tr>
</table>
</td></tr>

<tr><td class="px" style="padding:36px 32px 32px;border-top:1px solid #1a2540;">
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.8px;color:#8798b4;">YOUR FIVE</p>
<h2 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:28px;font-weight:bold;letter-spacing:-0.5px;color:#f2f5fa;">Every brief is written around these.</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>${tickerRow}</tr>
</table>
<p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#8798b4;">Market setup, the numbers that matter, a read on each stock and on all five together, what's coming, and one clear take.</p>
</td></tr>

<tr><td class="px" style="padding:0 32px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" bgcolor="#8fa8fa" style="background-color:#8fa8fa;"><a href="${input.briefUrl}" style="display:block;padding:16px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;color:#ffffff;text-decoration:none;">See a sample brief →</a></td></tr>
</table>
<p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#8798b4;text-align:center;">Your first one is already waiting · 7 min read</p>
</td></tr>

<tr><td class="px" style="padding:36px 32px;border-top:1px solid #1a2540;">
<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.8px;color:#8798b4;">WHEN IT ARRIVES</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td class="stack stack-tile" width="32%" valign="top" style="width:32%;border-top:2px solid #8fa8fa;padding:14px 0 0;">
<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;font-weight:bold;letter-spacing:-0.5px;color:#f2f5fa;">Every morning</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#8798b4;">Weekdays, before the US market opens</p>
</td>
<td class="stack-gap" width="2%" style="width:2%;font-size:0;line-height:0;">&nbsp;</td>
<td class="stack stack-tile" width="32%" valign="top" style="width:32%;border-top:2px solid #1a2540;padding:14px 0 0;">
<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;font-weight:bold;letter-spacing:-0.5px;color:#f2f5fa;">One email</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#8798b4;">A day, and nothing else</p>
</td>
<td class="stack-gap" width="2%" style="width:2%;font-size:0;line-height:0;">&nbsp;</td>
<td class="stack stack-tile" width="32%" valign="top" style="width:32%;border-top:2px solid #1a2540;padding:14px 0 0;">
<p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;font-weight:bold;letter-spacing:-0.5px;color:#f2f5fa;">Next brief</p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#8798b4;">Picks up any watchlist changes</p>
</td>
</tr>
</table>
</td></tr>

<tr><td class="px" style="padding:28px 32px;border-top:1px solid #1a2540;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td class="stack stack-tile" width="49%" valign="top" style="width:49%;">
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#8798b4;">Want to swap a stock?</p>
<a href="${input.manageUrl}" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;font-weight:bold;color:#8fa8fa;text-decoration:none;">Manage your watchlist →</a>
</td>
<td class="stack-gap" width="2%" style="width:2%;font-size:0;line-height:0;">&nbsp;</td>
<td class="stack" width="49%" valign="top" style="width:49%;">
<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#8798b4;">Questions? Write to Vansh directly.</p>
<a href="mailto:vanshpandita11@gmail.com" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;font-weight:bold;color:#8fa8fa;text-decoration:none;">vanshpandita11@gmail.com</a>
</td>
</tr>
</table>
</td></tr>

<tr><td class="px" bgcolor="#0c1120" style="background-color:#0c1120;padding:24px 32px;border-top:1px solid #1a2540;">
<p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#8798b4;">You're getting this because you signed up for Metric Finance as ${input.email}. <a href="https://metricfinance.app/manage" style="color:#8fa8fa;text-decoration:underline;">Manage preferences</a></p>
<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#8798b4;">&copy; 2026 Metric Finance · Built by Yashna &amp; Vansh · Not investment advice<br>Not investment advice · Market data may be delayed</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function buildWelcomeEmailText(input: {
  displayName: string;
  tickersText: string;
  briefUrl: string;
  manageUrl: string;
}): string {
  return `Welcome to Metric Finance, ${input.displayName}

You're now set to receive daily briefings about ${input.tickersText}.

ADD US TO YOUR CONTACTS
To make sure our emails land in your inbox, please add ${fromEmail} to your contacts:
- Gmail: Drag this email to "Primary" tab
- Outlook: Right-click our address, then Add to Safe Senders
- Apple Mail: Tap our name at the top, then Add to VIPs

WHAT YOU'RE GETTING
Every trading day, you'll get a personalized analysis of your five stocks—just the insights you need to make informed decisions. No noise. No spam. Just context.

YOUR STOCKS
${input.tickersText}

WHEN YOU'LL HEAR FROM US
• One email per trading day
• Sent weekday mornings, before the US market opens
• Weekends and holidays: no email

SEE A SAMPLE BRIEF
${input.briefUrl}

MANAGE YOUR WATCHLIST
${input.manageUrl}

Questions? Email vanshpandita11@gmail.com

© 2026 Metric Finance · Built by Yashna & Vansh
Not investment advice · Market data may be delayed`;
}
