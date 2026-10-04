import { NextResponse } from "next/server";
import { searchStocks } from "@/lib/stock-lookup";

// Searches the local list of every Nasdaq and NYSE stock. No external calls, so no rate limit is needed.
export function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  return NextResponse.json({ results: searchStocks(q) }, { headers: { "Cache-Control": "public, max-age=300" } });
}
