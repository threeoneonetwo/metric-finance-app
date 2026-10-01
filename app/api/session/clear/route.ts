import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Signs this device out. Only two safe destinations are allowed.
export async function GET(request: Request) {
  const to = new URL(request.url).searchParams.get("to");
  const destination = to === "/manage" ? "/manage" : "/";
  const response = NextResponse.redirect(new URL(destination, request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
