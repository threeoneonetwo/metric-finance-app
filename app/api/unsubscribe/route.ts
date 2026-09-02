import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/db/subscribers";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return new NextResponse("Missing unsubscribe token.", { status: 400 });
  }

  const subscriber = await unsubscribeByToken(token);
  if (!subscriber) {
    return new NextResponse("We couldn't find that subscription.", { status: 404 });
  }

  return new NextResponse(
    `<!doctype html><html><body style="background:#08080a;color:#fff;font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
      <div style="text-align:center;padding:24px;">
        <h1 style="font-size:22px;">You're unsubscribed</h1>
        <p style="color:#8a8a92;">${subscriber.email} will no longer receive Metric Finance briefings.</p>
        <a href="/" style="color:#fff;">Back to Metric Finance</a>
      </div>
    </body></html>`,
    { status: 200, headers: { "content-type": "text/html" } },
  );
}
