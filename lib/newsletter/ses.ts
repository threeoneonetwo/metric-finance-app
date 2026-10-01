import { brandedEmail } from "./email-template";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";

export function hasSesConfig() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.SES_FROM_EMAIL,
  );
}

let client: SESv2Client | null = null;

function getClient() {
  if (!client) {
    client = new SESv2Client({ region: process.env.AWS_REGION ?? "us-east-1" });
  }
  return client;
}

const STEP_NUMBER = "display:inline-block;width:26px;height:26px;border-radius:13px;background:#8fa8fa;color:#0b1220;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:26px;font-weight:bold;text-align:center;";
const STEP_TITLE = "font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:26px;font-weight:bold;color:#f2f5fa;";
const STEP_BODY = "margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#9aa6c0;";

// One email does both jobs: asks the reader to save our address, then to confirm they are a real person.
export function buildVerificationEmail(input: { verifyUrl: string }) {
  const from = process.env.SES_FROM_EMAIL ?? "briefing@metricfinance.app";
  const steps = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 18px;">
<tr><td width="40" valign="top" style="padding:0 0 18px;"><span style="${STEP_NUMBER}">1</span></td><td valign="top" style="padding:0 0 18px;">
<div style="${STEP_TITLE}">Add us to your contacts</div>
<p style="${STEP_BODY}">Save <strong style="color:#f2f5fa;">${from}</strong> so your briefs reach your main inbox, not spam.</p>
<p style="${STEP_BODY}">Gmail: drag this email to the Primary tab.<br>Outlook: right click our name, then Add to Safe Senders.<br>Apple Mail: tap our name, then Add to VIPs.</p>
</td></tr>
<tr><td width="40" valign="top" style="padding:0;"><span style="${STEP_NUMBER}">2</span></td><td valign="top" style="padding:0;">
<div style="${STEP_TITLE}">Confirm your email</div>
<p style="${STEP_BODY}">One tap tells us you're a real person. You'll land on your dashboard with your first brief on its way.</p>
</td></tr></table>`;
  const html = brandedEmail({
    preheader: "Add us to your contacts, then confirm. It takes 20 seconds.",
    heading: "Two quick steps and you're in",
    paragraphs: ["Do these two things to start getting your daily brief."],
    extraHtml: steps,
    buttonLabel: "Confirm my email",
    buttonUrl: input.verifyUrl,
    footnote: "If you didn't sign up for Metric Finance, ignore this email and nothing happens.",
  });
  const text = [
    "Two quick steps and you're in",
    "",
    `1. Add us to your contacts. Save ${from} so your briefs reach your main inbox, not spam.`,
    "   Gmail: drag this email to the Primary tab. Outlook: right click our name, then Add to Safe Senders. Apple Mail: tap our name, then Add to VIPs.",
    "",
    `2. Confirm your email. One tap tells us you're a real person: ${input.verifyUrl}`,
    "",
    "If you didn't sign up for Metric Finance, ignore this email and nothing happens.",
  ].join("\n");

  return { subject: "Confirm your email to start your Metric Finance briefs", html, text };
}

export async function sendVerificationEmail(input: { to: string; verifyUrl: string }) {
  const email = buildVerificationEmail({ verifyUrl: input.verifyUrl });
  await sendEmail({ to: input.to, ...email });
}

export async function sendEmail(input: { to: string; subject: string; html: string; text: string; headers?: Record<string, string> }) {
  const fromEmail = process.env.SES_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error("SES_FROM_EMAIL is not configured");
  }

  await getClient().send(
    new SendEmailCommand({
      FromEmailAddress: fromEmail,
      ReplyToAddresses: [process.env.REPLY_TO_EMAIL ?? "vanshpandita11@gmail.com"],
      Destination: { ToAddresses: [input.to] },
      Content: {
        Simple: {
          Headers: input.headers ? Object.entries(input.headers).map(([Name, Value]) => ({ Name, Value })) : undefined,
          Subject: { Data: input.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: input.html, Charset: "UTF-8" },
            Text: { Data: input.text, Charset: "UTF-8" },
          },
        },
      },
    }),
  );
}
