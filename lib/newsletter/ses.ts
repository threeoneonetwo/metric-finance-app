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
  const html = `<!doctype html><html><body style="background:#08080a;color:#fff;font-family:Arial,Helvetica,sans-serif;padding:32px;">
    <div style="max-width:480px;margin:0 auto;">
      <h1 style="font-size:20px;">Confirm your Metric Finance briefing</h1>
      <p style="color:#c4c4cc;">Click below to confirm your email and start receiving your daily briefing.</p>
      <p><a href="${input.verifyUrl}" style="display:inline-block;background:#fff;color:#08080a;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Confirm my email</a></p>
      <p style="color:#8a8a92;font-size:13px;">If you didn't request this, you can ignore this email.</p>
    </div>
  </body></html>`;
  const text = `Confirm your Metric Finance briefing\n\nClick to confirm your email: ${input.verifyUrl}\n\nIf you didn't request this, you can ignore this email.`;

  await sendEmail({ to: input.to, subject: "Confirm your Metric Finance briefing", html, text });
}

export async function sendEmail(input: { to: string; subject: string; html: string; text: string }) {
  const fromEmail = process.env.SES_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error("SES_FROM_EMAIL is not configured");
  }

  await getClient().send(
    new SendEmailCommand({
      FromEmailAddress: fromEmail,
      Destination: { ToAddresses: [input.to] },
      Content: {
        Simple: {
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
