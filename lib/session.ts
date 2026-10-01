import { createHmac, timingSafeEqual } from "crypto";

// A device that opened a valid emailed link stays signed in, so the homepage can send members straight to their dashboard.
export const SESSION_COOKIE = "mf_session";
export const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60;

const TOKEN_PATTERN = /^[a-f0-9]{48}$/;

function sign(token: string, exp: string) {
  const secret = process.env.MANAGE_LINK_SECRET;
  if (!secret) return null;
  // "session" keeps these signatures different from the emailed link signatures.
  return createHmac("sha256", secret).update(`session.${token}.${exp}`).digest("hex");
}

export function createSessionValue(token: string): string | null {
  if (!TOKEN_PATTERN.test(token)) return null;
  const exp = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  const sig = sign(token, exp);
  return sig ? `${token}.${exp}.${sig}` : null;
}

export function readSession(value?: string): { token: string } | null {
  if (!value) return null;
  const [token, exp, sig] = value.split(".");
  if (!token || !exp || !sig || !TOKEN_PATTERN.test(token) || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return null;
  const expected = sign(token, exp);
  if (!expected) return null;
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(sig, "hex");
  return a.length === b.length && timingSafeEqual(a, b) ? { token } : null;
}

export function sessionCookie(value: string) {
  return {
    name: SESSION_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
