import { createVerify } from "crypto";
import { NextResponse } from "next/server";
import { deactivateSubscriberByEmail, findSubscriberByEmail } from "@/db/subscribers";
import { isInternalEmail, trackServerNow } from "@/lib/analytics-server";

// Amazon SNS delivers Amazon SES events here (delivered, bounced, complaint). Each one is checked against
// Amazon's signature, so nobody else can post fake events.
const TOPIC_ARN = "arn:aws:sns:us-east-1:809668424139:metric-finance-email-events";
const SNS_HOST = /^sns\.[a-z0-9-]+\.amazonaws\.com$/;

type SnsMessage = Record<string, string> & { Type: string; Message: string; TopicArn: string };

async function isGenuine(message: SnsMessage) {
  try {
    const certUrl = new URL(message.SigningCertURL);
    if (certUrl.protocol !== "https:" || !SNS_HOST.test(certUrl.hostname) || !certUrl.pathname.endsWith(".pem")) return false;
    const pem = await (await fetch(certUrl, { signal: AbortSignal.timeout(4000) })).text();
    const fields =
      message.Type === "Notification"
        ? ["Message", "MessageId", "Subject", "Timestamp", "TopicArn", "Type"]
        : ["Message", "MessageId", "SubscribeURL", "Timestamp", "Token", "TopicArn", "Type"];
    const signed = fields.filter((field) => message[field] !== undefined).map((field) => `${field}\n${message[field]}\n`).join("");
    const verifier = createVerify(message.SignatureVersion === "2" ? "RSA-SHA256" : "RSA-SHA1");
    verifier.update(signed, "utf8");
    return verifier.verify(pem, message.Signature, "base64");
  } catch {
    return false;
  }
}

type SesEvent = {
  eventType?: string;
  mail?: { destination?: string[]; tags?: Record<string, string[]> };
  bounce?: { bounceType?: string; bounceSubType?: string };
  complaint?: { complaintFeedbackType?: string };
};

const EVENT_NAMES: Record<string, string> = {
  Delivery: "email_delivered",
  Bounce: "email_bounced",
  Complaint: "email_complaint",
  Reject: "email_rejected",
};

export async function POST(request: Request) {
  let message: SnsMessage;
  try {
    message = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  if (message.TopicArn !== TOPIC_ARN || !(await isGenuine(message))) {
    return NextResponse.json({ error: "Not accepted" }, { status: 403 });
  }

  // First step when the subscription is created: visit Amazon's confirmation link.
  if (message.Type === "SubscriptionConfirmation") {
    const link = new URL(message.SubscribeURL);
    if (link.protocol === "https:" && SNS_HOST.test(link.hostname)) await fetch(link);
    return NextResponse.json({ ok: true });
  }

  if (message.Type !== "Notification") return NextResponse.json({ ok: true });

  let event: SesEvent;
  try {
    event = JSON.parse(message.Message);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const eventName = EVENT_NAMES[event.eventType ?? ""];
  if (!eventName) return NextResponse.json({ ok: true });

  const mailType = event.mail?.tags?.mail_type?.[0] ?? "other";
  for (const recipient of event.mail?.destination ?? []) {
    const subscriber = await findSubscriberByEmail(recipient);
    await trackServerNow({
      event: eventName,
      distinctId: subscriber?.id ?? "system",
      properties: {
        ...(subscriber ? {} : { $process_person_profile: false }),
        internal: isInternalEmail(recipient),
        mail_type: mailType,
        bounce_type: event.bounce?.bounceType,
        bounce_subtype: event.bounce?.bounceSubType,
        complaint_type: event.complaint?.complaintFeedbackType,
      },
    });

    // Stop mailing someone whose address bounced for good or who marked us as spam.
    const hardBounce = event.eventType === "Bounce" && event.bounce?.bounceType === "Permanent";
    if (hardBounce || event.eventType === "Complaint") await deactivateSubscriberByEmail(recipient);
  }

  return NextResponse.json({ ok: true });
}
