import { NextResponse } from "next/server";
import { getBriefingForSubscriber } from "@/db/briefings";
import { hitRateLimit, refundRateLimit } from "@/db/rate-limit";
import { isInternalEmail, trackServer } from "@/lib/analytics-server";
import { answerLooksLikeAdvice, askModel, hasAskConfig, type Turn } from "@/lib/ask/answer";
import { adviceReply, DAILY_QUESTIONS, guardQuestion, normalizeQuestion, outsideReply, scopeReply } from "@/lib/ask/guard";
import { getClientIp } from "@/lib/request-metadata";
import { resolveSubscriber } from "@/lib/session-server";

export const maxDuration = 30;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_QUESTION = 300;
const MAX_TURN = 1500;
const MAX_HISTORY = 6;

type Status = "answered" | "advice" | "outside_watchlist" | "unrelated" | "limited" | "unavailable";

type Body = { briefingId: string; question: string; history?: Turn[]; token?: string; exp?: string; sig?: string };

function parse(value: unknown): Body | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (typeof body.briefingId !== "string" || !UUID.test(body.briefingId)) return null;
  if (typeof body.question !== "string") return null;
  for (const key of ["token", "exp", "sig"] as const) if (body[key] !== undefined && typeof body[key] !== "string") return null;
  const history = body.history ?? [];
  if (!Array.isArray(history) || history.length > MAX_HISTORY) return null;
  // Earlier turns must alternate reader then answer, so the model can't be handed a forged conversation shape.
  const turns: Turn[] = [];
  for (const [index, turn] of history.entries()) {
    if (!turn || typeof turn !== "object") return null;
    const { role, text } = turn as Record<string, unknown>;
    if (role !== (index % 2 === 0 ? "user" : "assistant") || typeof text !== "string" || text.length > MAX_TURN) return null;
    turns.push({ role: role as Turn["role"], text: normalizeQuestion(text) });
  }
  if (turns.length % 2 !== 0) return null;
  return { briefingId: body.briefingId, question: body.question, history: turns, token: body.token as string | undefined, exp: body.exp as string | undefined, sig: body.sig as string | undefined };
}

export async function POST(request: Request) {
  const started = Date.now();
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const body = parse(raw);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const question = normalizeQuestion(body.question);
  if (question.length < 3 || question.length > MAX_QUESTION) {
    return NextResponse.json({ error: `Questions must be between 3 and ${MAX_QUESTION} characters.` }, { status: 400 });
  }

  // Same identity rules as the brief page: the emailed signed link, or this device's sign in cookie.
  const { subscriber } = await resolveSubscriber({ token: body.token, exp: body.exp, sig: body.sig });
  if (!subscriber) return NextResponse.json({ error: "Please open your brief from your email link to ask questions." }, { status: 401 });
  const briefing = await getBriefingForSubscriber(body.briefingId, subscriber.id);
  if (!briefing) return NextResponse.json({ error: "Brief not found" }, { status: 404 });

  const watchlist = briefing.tickers;
  const internal = isInternalEmail(subscriber.email);
  const respond = async (status: Status, answer: string, extra: { followUps?: string[]; remaining?: number } = {}) => {
    await trackServer({
      event: "brief_question_asked",
      distinctId: subscriber.id,
      // Never the text of the question or answer: only its shape, so usage can be measured privately.
      properties: { internal, status, question_chars: question.length, history_turns: body.history!.length / 2, latency_ms: Date.now() - started },
    });
    return NextResponse.json({ status, answer, followUps: extra.followUps ?? [], remaining: extra.remaining ?? null });
  };

  // Policy checks first: free, instant, and independent of the model.
  const guard = guardQuestion(question, watchlist);
  if (!guard.ok) {
    return respond(guard.reason, guard.reason === "advice" ? adviceReply() : outsideReply(guard.symbols, watchlist));
  }

  // Only questions that reach the model count toward the daily allowance.
  let remaining = DAILY_QUESTIONS;
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
  const readerKey = `ask:sub:${subscriber.id}:${day}`;
  try {
    const ip = getClientIp(request.headers) ?? "unknown";
    const [perReader, perIp] = await Promise.all([
      hitRateLimit(readerKey, DAILY_QUESTIONS, 60 * 60 * 26),
      hitRateLimit(`ask:ip:${ip}`, 60, 60 * 60),
    ]);
    if (perReader.limited || perIp.limited) {
      return respond("limited", `You've used today's ${DAILY_QUESTIONS} questions. They reset tomorrow, and your next brief lands at 5 PM ET.`, { remaining: 0 });
    }
    remaining = Math.max(0, DAILY_QUESTIONS - perReader.used);
  } catch (error) {
    console.error("ask: rate limit check failed", error);
  }

  // When we fail to answer, the question is given back so the reader never pays for our outage.
  const refund = async () => {
    await refundRateLimit(readerKey).catch(() => undefined);
    remaining = Math.min(DAILY_QUESTIONS, remaining + 1);
  };
  if (!hasAskConfig()) {
    await refund();
    return respond("unavailable", "Follow up questions are unavailable right now. Please try again later.", { remaining });
  }

  const result = await askModel({
    question,
    history: body.history!,
    watchlist,
    briefText: briefing.text,
    facts: briefing.facts ?? null,
    sentAt: briefing.sentAt,
  });
  if (!result) {
    await refund();
    return respond("unavailable", "I couldn't answer that just now. Please try again in a moment.", { remaining });
  }

  const followUps = result.followUps
    .map((item) => normalizeQuestion(item))
    .filter((item) => item.length > 0 && item.length <= 90 && guardQuestion(item, watchlist).ok)
    .slice(0, 3);

  if (result.verdict === "advice" || answerLooksLikeAdvice(result.answer)) return respond("advice", adviceReply(), { remaining, followUps });
  if (result.verdict === "outside_watchlist") return respond("outside_watchlist", scopeReply(watchlist, true), { remaining, followUps });
  if (result.verdict === "unrelated" || !result.answer) return respond("unrelated", scopeReply(watchlist, false), { remaining, followUps });
  return respond("answered", result.answer.slice(0, 1600), { remaining, followUps });
}
