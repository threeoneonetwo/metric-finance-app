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

  // Opening a valid emailed link (or any dashboard visit) keeps this device signed in.
  const response = NextResponse.next();
  const token = hasValidLink(request) ?? session?.token;
  const value = token ? createSessionValue(token) : null;
  if (value) response.cookies.set(sessionCookie(value));
  return withOwnerFlag(request, response);
}

export const config = {
  matcher: ["/", "/manage", "/brief/:id"],
};
