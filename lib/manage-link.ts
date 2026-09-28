import { createHmac, timingSafeEqual } from "crypto";

const LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function sign(token: string, exp: string) {
  const secret = process.env.MANAGE_LINK_SECRET;
  if (!secret) throw new Error("MANAGE_LINK_SECRET is not set");
  return createHmac("sha256", secret).update(`${token}.${exp}`).digest("hex");
}

export function manageLinkParams(token: string) {
  const exp = String(Date.now() + LINK_TTL_MS);
  return `token=${token}&exp=${exp}&sig=${sign(token, exp)}`;
}

export function manageUrl(baseUrl: string, token: string) {
  return `${baseUrl}/manage?${manageLinkParams(token)}`;
}

export function isValidManageLink(token?: string, exp?: string, sig?: string) {
  if (!token || !exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = Buffer.from(sign(token, exp), "hex");
  const given = Buffer.from(sig, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
