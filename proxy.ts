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

export function proxy(request: NextRequest) {
  const session = readSession(request.cookies.get(SESSION_COOKIE)?.value);

  // Someone who has signed up before lands on their dashboard instead of the signup page.
  if (request.nextUrl.pathname === "/") {
    if (!session) return NextResponse.next();
    const response = NextResponse.redirect(new URL("/manage", request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  // Opening a valid emailed link (or any dashboard visit) keeps this device signed in.
  const response = NextResponse.next();
  const token = hasValidLink(request) ?? session?.token;
  const value = token ? createSessionValue(token) : null;
  if (value) response.cookies.set(sessionCookie(value));
  return response;
}

export const config = {
  matcher: ["/", "/manage", "/brief/:id"],
};
