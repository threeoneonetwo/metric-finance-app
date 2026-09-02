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
