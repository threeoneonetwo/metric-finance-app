import { NextResponse } from "next/server";
import { refreshLearn } from "@/lib/learn/refresh";

export const maxDuration = 300;

// Manual trigger for the daily Learn refresh (it also runs automatically after the 5 PM send).
// Example: GET /api/cron/learn-refresh?only=stocks&limit=5   with   Authorization: Bearer $CRON_SECRET
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = new URL(request.url).searchParams;
  const only = (params.get("only") ?? "").split(",").filter((item): item is "recap" | "guide" | "stocks" => ["recap", "guide", "stocks"].includes(item));
  const limit = Number(params.get("limit"));
  const report = await refreshLearn({ only: only.length ? only : undefined, stockLimit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 40) : undefined });
  return NextResponse.json(report);
}
