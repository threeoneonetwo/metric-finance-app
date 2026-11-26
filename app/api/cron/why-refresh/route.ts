// A way to run the daily "why did it move" job by hand (it also runs automatically after the 5 PM send).
// Example: GET /api/cron/why-refresh   with   Authorization: Bearer $CRON_SECRET
import { NextResponse } from "next/server";
import { refreshWhy } from "@/lib/instant/refresh-why";

export const maxDuration = 300;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await refreshWhy(Date.now() + 240_000));
}
