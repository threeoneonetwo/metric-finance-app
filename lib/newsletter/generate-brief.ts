import type { TickerSnapshot } from "./market-data";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";

export function hasAnthropicConfig() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateTickerBlurbs(snapshots: TickerSnapshot[]): Promise<Map<string, string>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const blurbs = new Map<string, string>();
  if (!apiKey || snapshots.length === 0) return blurbs;

  const results = await Promise.all(snapshots.map((snapshot) => generateOneBlurb(snapshot, apiKey)));

  for (const result of results) {
    if (result) blurbs.set(result.ticker, result.blurb);
  }

  return blurbs;
}

async function generateOneBlurb(snapshot: TickerSnapshot, apiKey: string) {
  const direction = (snapshot.dayChangePercent ?? 0) >= 0 ? "up" : "down";
  const prompt = `Write one short, plain-English sentence (max 25 words) explaining today's price action for ${snapshot.companyName} (${snapshot.ticker}), which is ${direction} ${Math.abs(snapshot.dayChangePercent ?? 0).toFixed(2)}% today at $${snapshot.price ?? "?"}. No jargon, no hype, no financial advice. Just plainly describe the move.`;

  try {
    const response = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = data.content?.find((block) => block.type === "text")?.text?.trim();
    if (!text) return null;

    return { ticker: snapshot.ticker, blurb: text };
  } catch {
    return null;
  }
}

export function buildDigestEmail(input: {
  tickers: string[];
  snapshots: Map<string, TickerSnapshot>;
  blurbs: Map<string, string>;
  unsubscribeUrl: string;
}) {
  const rows = input.tickers
    .map((ticker) => {
      const snapshot = input.snapshots.get(ticker);
      const blurb = input.blurbs.get(ticker);
      if (!snapshot || !blurb) return null;

      const changeColor = (snapshot.dayChangePercent ?? 0) >= 0 ? "#3fae64" : "#c74b4b";
      const changeSign = (snapshot.dayChangePercent ?? 0) >= 0 ? "+" : "";

      return {
        html: `
          <tr>
            <td style="padding:20px 0;border-top:1px solid #232328;">
              <table width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:14px;color:#fff;">${ticker}</td>
                <td align="right" style="font-family:ui-monospace,Menlo,monospace;font-size:13px;color:${changeColor};">${changeSign}${(snapshot.dayChangePercent ?? 0).toFixed(2)}%</td>
              </tr></table>
              <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:#b6b6be;">${blurb}</p>
            </td>
          </tr>`,
        text: `${ticker} (${changeSign}${(snapshot.dayChangePercent ?? 0).toFixed(2)}%): ${blurb}`,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const html = `
    <div style="background:#08080a;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">
        <tr><td style="padding-bottom:24px;color:#fff;font-size:20px;font-weight:800;">Metric Finance</td></tr>
        <tr><td style="color:#8a8a92;font-size:13px;padding-bottom:8px;">Your daily briefing</td></tr>
        <tr><td><table width="100%" cellpadding="0" cellspacing="0">${rows.map((r) => r.html).join("")}</table></td></tr>
        <tr><td style="padding-top:32px;font-size:12px;color:#6c6c74;">
          Not financial advice. <a href="${input.unsubscribeUrl}" style="color:#8a8a92;">Unsubscribe</a>
        </td></tr>
      </table>
    </div>`;

  const text = `Metric Finance — Your daily briefing\n\n${rows.map((r) => r.text).join("\n\n")}\n\nNot financial advice. Unsubscribe: ${input.unsubscribeUrl}`;

  return { html, text, hasContent: rows.length > 0 };
}
