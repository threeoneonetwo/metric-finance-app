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

export async function sendVerificationEmail(input: { to: string; verifyUrl: string }) {
  const html = brandedEmail({
    preheader: "One click and your daily brief starts.",
    heading: "Confirm your email",
    paragraphs: ["Tap the button to confirm your email. Your first brief follows soon after, then one every weekday morning."],
    buttonLabel: "Confirm my email",
    buttonUrl: input.verifyUrl,
    footnote: "If you didn't sign up for Metric Finance, ignore this email and nothing happens.",
  });
  const text = `Confirm your Metric Finance briefing\n\nClick to confirm your email: ${input.verifyUrl}\n\nIf you didn't request this, you can ignore this email.`;

  await sendEmail({ to: input.to, subject: "Confirm your Metric Finance briefing", html, text });
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
