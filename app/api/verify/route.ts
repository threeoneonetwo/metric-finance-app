import { NextResponse } from "next/server";
import { verifySubscriberByToken } from "@/db/subscribers";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return new NextResponse("Missing verification token.", { status: 400 });
  }

  const subscriber = await verifySubscriberByToken(token);
  if (!subscriber) {
    return new NextResponse("That confirmation link is invalid or has already been used.", { status: 404 });
  }

  return NextResponse.redirect(
    new URL(`/welcome?email=${encodeURIComponent(subscriber.email)}&token=${subscriber.unsubscribeToken}`, request.url),
  );
}
