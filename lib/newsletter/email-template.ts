function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

// Table based layout with inline styles so it renders the same in Gmail, Outlook and Apple Mail.
export function brandedEmail(input: {
  preheader: string;
  heading: string;
  paragraphs: string[];
  buttonLabel: string;
  buttonUrl: string;
  footnote: string;
}) {
  const paragraphs = input.paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#b9c6dc;">${escapeHtml(text)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><title>${escapeHtml(input.heading)}</title></head>
<body style="margin:0;padding:0;background:#05070d;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#05070d;">${escapeHtml(input.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#05070d;">
<tr><td align="center" style="padding:40px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
    <tr><td style="padding-bottom:28px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;letter-spacing:-0.5px;color:#ffffff;">Metric Finance</td></tr>
    <tr><td style="background:#0c1120;border:1px solid #1a2540;border-radius:16px;padding:36px 32px;">
      <h1 style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;font-weight:bold;letter-spacing:-0.6px;color:#ffffff;">${escapeHtml(input.heading)}</h1>
      ${paragraphs}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 26px;"><tr>
        <td bgcolor="#8fa8fa" style="background:#8fa8fa;border-radius:12px;"><a href="${input.buttonUrl}" style="display:inline-block;border-radius:12px;padding:15px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;font-weight:bold;color:#0b1220;text-decoration:none;">${escapeHtml(input.buttonLabel)}</a></td>
      </tr></table>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#8798b4;">${escapeHtml(input.footnote)}</p>
    </td></tr>
    <tr><td style="padding-top:22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#56668a;">Metric Finance explains your stocks like you're 5. Not investment advice.<br>Button not working? Paste this link into your browser:<br><span style="color:#8798b4;word-break:break-all;">${escapeHtml(input.buttonUrl)}</span></td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}
