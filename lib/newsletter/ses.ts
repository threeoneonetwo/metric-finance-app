import { brandedEmail, contactTipsTable, emailSteps, FOOTER_TEXT, type EmailStep } from "./email-template";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { SENDER_EMAIL, SENDER_NAME } from "@/lib/sender";

export function hasSesConfig() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
  );
}

let client: SESv2Client | null = null;

function getClient() {
  if (!client) {
    client = new SESv2Client({ region: process.env.AWS_REGION ?? "us-east-1" });
  }
  return client;
}

function fromAddress() {
  return SENDER_EMAIL;
}

// Step 1 is the same in every onboarding email: save our address so briefs reach the main inbox.
function addToContactsStep(): EmailStep {
  const from = fromAddress();
  return {
    title: "Add us to your contacts",
    bodyHtml: `Save <a href="mailto:${from}" style="color:#8fa8fa;font-weight:700;text-decoration:none;">${from}</a> so your briefs reach your main inbox, not spam.`,
    extraHtml: contactTipsTable(),
  };
}

const CONTACT_TIPS_TEXT =
  "   Gmail: drag this email to the Primary tab. Outlook: right click our name, then Add to Safe Senders. Apple Mail: tap our name, then Add to VIPs.";

// For someone who signs up again with an address that is already subscribed.
export function buildReturningEmail(input: { dashboardUrl: string; unsubscribeUrl?: string }) {
  const from = fromAddress();
  const html = brandedEmail({
    preheader: "Two quick things to keep your daily brief coming.",
    eyebrow: "YOU'RE ALL SET",
    heading: "Welcome back, you're on the list",
    lead: "Two quick things to keep your daily brief coming.",
    stepsHtml: emailSteps([
      addToContactsStep(),
      { title: "Open your dashboard", bodyHtml: "Read your briefs and change your stocks any time. This private link works for 30 days." },
    ]),
    buttonLabel: "Open my dashboard",
    buttonUrl: input.dashboardUrl,
    footnote: "If you didn't ask for this, ignore this email. Only you can use the link.",
    footerLinks: input.unsubscribeUrl ? { manageUrl: input.dashboardUrl, unsubscribeUrl: input.unsubscribeUrl } : undefined,
  });
  const text = [
    "Welcome back, you're on the list",
    "",
    `1. Add us to your contacts. Save ${from} so your briefs reach your main inbox, not spam.`,
    CONTACT_TIPS_TEXT,
    "",
    `2. Open your dashboard (private link, works for 30 days): ${input.dashboardUrl}`,
    "",
    "If you didn't ask for this, ignore this email.",
    "",
    FOOTER_TEXT,
  ].join("\n");
  return { subject: "Your Metric Finance dashboard link", html, text };
}

// One email does both jobs: asks the reader to save our address, then to confirm they are a real person.
export function buildVerificationEmail(input: { verifyUrl: string }) {
  const from = fromAddress();
  const html = brandedEmail({
    preheader: "Add us to your contacts, then confirm. It takes 20 seconds.",
    eyebrow: "ALMOST THERE",
    heading: "Two quick steps and you're in",
    lead: "Do these two things to start getting your daily brief.",
    stepsHtml: emailSteps([
      addToContactsStep(),
      { title: "Confirm your email", bodyHtml: "One tap tells us you're a real person. You'll land on your dashboard with your first brief on its way." },
    ]),
    buttonLabel: "Confirm my email",
    buttonUrl: input.verifyUrl,
    footnote: "If you didn't sign up for Metric Finance, ignore this email and nothing happens.",
  });
  const text = [
    "Two quick steps and you're in",
    "",
    `1. Add us to your contacts. Save ${from} so your briefs reach your main inbox, not spam.`,
    CONTACT_TIPS_TEXT,
    "",
    `2. Confirm your email. One tap tells us you're a real person: ${input.verifyUrl}`,
    "",
    "If you didn't sign up for Metric Finance, ignore this email and nothing happens.",
    "",
    FOOTER_TEXT,
  ].join("\n");

  return { subject: "Confirm your email to start your Metric Finance briefs", html, text };
}

export async function sendVerificationEmail(input: { to: string; verifyUrl: string }) {
  const email = buildVerificationEmail({ verifyUrl: input.verifyUrl });
  await sendEmail({ to: input.to, ...email, type: "confirm" });
}

// Delivery, bounce and complaint events for everything we send are published from this SES configuration set.
const EMAIL_CONFIG_SET = "metric-finance-email-events";

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  // Which kind of email this is, so the dashboard can split delivery by type.
  type?: string;
}) {
  const command = (configurationSetName?: string) =>
    new SendEmailCommand({
      FromEmailAddress: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      ReplyToAddresses: [process.env.REPLY_TO_EMAIL ?? "vanshpandita11@gmail.com"],
      Destination: { ToAddresses: [input.to] },
      ConfigurationSetName: configurationSetName,
      EmailTags: input.type ? [{ Name: "mail_type", Value: input.type }] : undefined,
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
    });

  try {
    await getClient().send(command(EMAIL_CONFIG_SET));
  } catch (error) {
    // Until the configuration set exists in AWS, send normally rather than lose the email.
    if (error instanceof Error && /configuration set/i.test(error.message)) {
      await getClient().send(command());
      return;
    }
    throw error;
  }
}

export async function sendReturningEmail(input: { to: string; dashboardUrl: string; unsubscribeUrl?: string }) {
  const email = buildReturningEmail({ dashboardUrl: input.dashboardUrl, unsubscribeUrl: input.unsubscribeUrl });
  await sendEmail({ to: input.to, ...email, type: "returning" });
}
