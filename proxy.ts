// This file runs before certain pages load ("/" for signed in readers, "/manage", "/brief/:id" and comparisons, see the matcher at the bottom).
// It sends returning members from the homepage to their dashboard, keeps readers signed in when they open a valid
// emailed link, and sends comparisons typed in the other order to their real address.
import { NextResponse, type NextRequest } from "next/server";
import { isValidManageLink } from "@/lib/manage-link";
import { SESSION_COOKIE, createSessionValue, readSession, sessionCookie } from "@/lib/session";

function hasValidLink(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = params.get("token") ?? undefined;
  try {
    return token && isValidManageLink(token, params.get("exp") ?? undefined, params.get("sig") ?? undefined) ? token : null;
  } catch {
    return null;
  }
}

const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 730;

// `?owner=1` marks this device as the owner's, so it is never tracked. Set server side so Safari keeps it.
function withOwnerFlag(request: NextRequest, response: NextResponse) {
  const flag = request.nextUrl.searchParams.get("owner");
  if (flag === "1") response.cookies.set({ name: "mf_owner", value: "1", maxAge: OWNER_COOKIE_MAX_AGE, path: "/", sameSite: "lax", secure: true });
  if (flag === "0") response.cookies.delete("mf_owner");
  return response;
}

export function proxy(request: NextRequest) {
  const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);

  // Someone who has signed up before lands on their dashboard instead of the signup page.
  if (request.nextUrl.pathname === "/") {
    if (!session) return withOwnerFlag(request, NextResponse.next());
    const response = NextResponse.redirect(new URL("/manage", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return withOwnerFlag(request, response);
  }

  // Comparisons live at one address with the two stocks in alphabetical order (aapl-vs-nvda). Someone who types or
  // searches the other order (nvda-vs-aapl) is sent there instead of seeing a "not found" page.
  if (request.nextUrl.pathname.startsWith("/learn/compare/")) {
    const [first, second] = request.nextUrl.pathname.slice("/learn/compare/".length).split("-vs-");
    if (first && second && second.localeCompare(first) < 0) return NextResponse.redirect(new URL(`/learn/compare/${second}-vs-${first}`, request.url), 301);
    return NextResponse.next();
  }

  // Opening a valid emailed link (or any dashboard visit) keeps this device signed in.
  const response = NextResponse.next();
  const token = hasValidLink(request) ?? session?.token;
  const value = token ? createSessionValue(token) : null;
  if (value) response.cookies.set(sessionCookie(value));
  return withOwnerFlag(request, response);
}

export const config = {
  // The homepage only needs this file for signed in readers (cookie) or the owner flag, so everyone else gets the
  // plain cached page without a server run.
  matcher: [
    { source: "/", has: [{ type: "cookie", key: "mf_session" }] },
    { source: "/", has: [{ type: "query", key: "owner" }] },
    "/manage",
    "/brief/:id",
    "/learn/compare/:pair",
  ],
};
