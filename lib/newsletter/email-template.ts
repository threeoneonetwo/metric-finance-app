import { MAILING_ADDRESS, SUPPORT_EMAIL } from "@/lib/sender";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

const FONT = "Arial,Helvetica,sans-serif";

export type EmailStep = {
  title: string;
  // Already escaped html for the paragraph under the title.
  bodyHtml: string;
  // Optional already escaped html shown under the paragraph (for example the contacts table).
  extraHtml?: string;
};

// A numbered step list: filled square on the first step, outlined squares after it.
export function emailSteps(steps: EmailStep[]) {
  const rows = steps
    .map((step, index) => {
      const last = index === steps.length - 1;
      const dot =
        index === 0
          ? `<div style="width:36px;height:36px;line-height:36px;background:#8fa8fa;color:#05090f;text-align:center;font-family:${FONT};font-size:15px;font-weight:700;">${index + 1}</div>`
          : `<div style="width:34px;height:34px;line-height:34px;border:1px solid #8fa8fa;color:#8fa8fa;text-align:center;font-family:${FONT};font-size:15px;font-weight:700;">${index + 1}</div>`;
      return `<tr>
<td style="width:36px;vertical-align:top;padding:0;">${dot}</td>
<td style="vertical-align:top;padding:5px 0 ${last ? 0 : 28}px 20px;">
<div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.16em;color:#8798b4;margin-bottom:6px;">STEP ${String(index + 1).padStart(2, "0")}</div>
<h2 style="margin:0 0 8px;font-family:${FONT};font-size:21px;font-weight:700;letter-spacing:-0.4px;color:#f2f5fa;">${escapeHtml(step.title)}</h2>
<p style="margin:0${step.extraHtml ? " 0 16px" : ""};font-family:${FONT};font-size:15px;line-height:1.6;color:#b9c6dc;">${step.bodyHtml}</p>
${step.extraHtml ?? ""}
</td>
</tr>`;
    })
    .join("\n");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows}</table>`;
}

// How to keep our emails out of spam, one row per mail app.
export function contactTipsTable() {
  const tips = [
    ["Gmail", "Drag this email to the Primary tab."],
    ["Outlook", "Right click our name, then Add to Safe Senders."],
    ["Apple Mail", "Tap our name, then Add to VIPs."],
  ];
  const rows = tips
    .map(([app, tip], index) => {
      const border = index < tips.length - 1 ? "border-bottom:1px solid #1a2540;" : "";
      return `<tr>
<td style="padding:12px 16px;${border}width:96px;font-family:${FONT};font-size:13px;font-weight:700;color:#f2f5fa;vertical-align:top;">${app}</td>
<td style="padding:12px 16px 12px 0;${border}font-family:${FONT};font-size:14px;line-height:1.5;color:#b9c6dc;vertical-align:top;">${tip}</td>
</tr>`;
    })
    .join("\n");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;border:1px solid #1a2540;background:#0f1526;">${rows}</table>`;
}

// Table based layout with inline styles so it renders the same in Gmail, Outlook and Apple Mail.
export function brandedEmail(input: {
  preheader: string;
  eyebrow: string;
  heading: string;
  lead: string;
  // Already escaped html between the lead and the button, usually emailSteps(...).
  stepsHtml?: string;
  buttonLabel: string;
  buttonUrl: string;
  footnote: string;
  // Present only for people who are confirmed subscribers.
  footerLinks?: { manageUrl: string; unsubscribeUrl: string };
}) {
  const links = input.footerLinks
    ? `<a href="${input.footerLinks.manageUrl}" style="color:#c3cfe4;text-decoration:underline;">Manage preferences</a> &middot; <a href="${input.footerLinks.unsubscribeUrl}" style="color:#c3cfe4;text-decoration:underline;">Unsubscribe</a> &middot; `
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escapeHtml(input.heading)}</title></head>
<body style="margin:0;padding:0;background:#04070d;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#04070d;">${escapeHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#04070d;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;border-collapse:collapse;background:#0b1120;border:1px solid #1a2540;">
  <tr><td style="padding:24px 32px;border-bottom:1px solid #1a2540;background:#0f1526;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
      <td width="36" height="36" style="width:36px;height:36px;background:#f2f5fa;border-radius:9px;text-align:center;vertical-align:middle;font-family:${FONT};font-size:15px;font-weight:700;letter-spacing:-0.8px;color:#0f1526;">MF</td>
      <td style="padding-left:12px;font-family:${FONT};font-size:20px;font-weight:700;letter-spacing:-0.4px;color:#f2f5fa;">Metric Finance</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:44px 32px 8px;">
    <div style="font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:0.18em;color:#8fa8fa;margin-bottom:14px;">${escapeHtml(input.eyebrow)}</div>
    <h1 style="margin:0 0 14px;font-family:${FONT};font-size:34px;line-height:1.1;font-weight:700;letter-spacing:-1.2px;color:#f2f5fa;">${escapeHtml(input.heading)}</h1>
    <p style="margin:0;font-family:${FONT};font-size:17px;line-height:1.6;color:#b9c6dc;">${escapeHtml(input.lead)}</p>
  </td></tr>
  ${input.stepsHtml ? `<tr><td style="padding:32px 32px 0;">${input.stepsHtml}</td></tr>` : ""}
  <tr><td style="padding:32px 32px 40px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>
      <td style="background:#8fa8fa;text-align:center;"><a href="${input.buttonUrl}" style="display:block;padding:17px 24px;font-family:${FONT};font-size:16px;font-weight:700;color:#05090f;text-decoration:none;">${escapeHtml(input.buttonLabel)} &rarr;</a></td>
    </tr></table>
    <p style="margin:16px 0 0;font-family:${FONT};font-size:13px;line-height:1.6;color:#8798b4;text-align:center;">${escapeHtml(input.footnote)}</p>
  </td></tr>
  <tr><td style="padding:24px 32px 28px;border-top:1px solid #1a2540;background:#0f1526;">
    <p style="margin:0 0 8px;font-family:${FONT};font-size:13px;line-height:1.6;color:#8798b4;">Questions? Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" style="color:#8fa8fa;text-decoration:underline;">${SUPPORT_EMAIL}</a>.</p>
    <p style="margin:0 0 8px;font-family:${FONT};font-size:12px;line-height:1.6;color:#8798b4;">${MAILING_ADDRESS}</p>
    <p style="margin:0 0 12px;font-family:${FONT};font-size:12px;line-height:1.6;color:#8798b4;">${links}Built by Yashna &amp; Vansh</p>
    <p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.6;color:#56668a;">Not investment advice. Button not working? Paste this link into your browser:<br><span style="color:#8798b4;word-break:break-all;">${escapeHtml(input.buttonUrl)}</span></p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export const FOOTER_TEXT = `Questions? Reply to this email or write to ${SUPPORT_EMAIL}.\n${MAILING_ADDRESS}`;
