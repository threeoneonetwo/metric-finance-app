import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/db/subscribers";

const TOKEN_PATTERN = /^[a-f0-9]{48}$/;

// Email scanners open every link in an email, so a GET must never unsubscribe anyone.
// It only shows a confirm page; the POST below does the work.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const destination = new URL("/unsubscribed", request.url);
  if (token && TOKEN_PATTERN.test(token)) {
    destination.searchParams.set("status", "confirm");
    destination.searchParams.set("token", token);
  } else {
    destination.searchParams.set("status", token ? "notfound" : "missing");
  }
  return NextResponse.redirect(destination, 307);
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get("token") ?? new URL(request.url).searchParams.get("token") ?? "");
  const subscriber = TOKEN_PATTERN.test(token) ? await unsubscribeByToken(token) : null;

  // Mail apps with a built in unsubscribe button send this exact field and expect a plain 200.
  if (form?.get("List-Unsubscribe") === "One-Click") {
    return NextResponse.json({ ok: Boolean(subscriber) });
  }

  return NextResponse.redirect(
    new URL(`/unsubscribed?status=${subscriber ? "done" : "notfound"}`, request.url),
    303,
  );
}
