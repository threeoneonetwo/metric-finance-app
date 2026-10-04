// Small helper for the Learn writers: one forced tool call to Claude, with every string scrubbed of dashes.
const URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.LEARN_MODEL ?? process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";

export const RULES = `You write for Metric Finance, a free daily brief that explains stocks like you're 5 to young adults who are new to investing. Write like a smart, warm friend: short sentences, plain words, no jargon without explaining it, never cringe, no emojis.

Hard rules:
- NEVER use dashes of any kind: no em dashes, no en dashes and no hyphens. Write "self driving", "52 week", "long term". Use commas or full stops instead.
- Use ONLY the facts provided plus well known, stable general knowledge about how a business model works. Never invent numbers, dates, product names, customers or events.
- Never tell the reader to buy, sell or hold. No predictions or price targets. This is education, not advice.
- Be specific to the subject. Mention real products, segments and details that appear in the facts. Do not write filler that could apply to any company.
- Explain any finance term in plain words the first time you use it.`;

/** Removes every dash from model output, even if the model slips. */
export function scrub<T>(value: T): T {
  if (typeof value === "string") {
    return value
      .replace(/\s*[—–]\s*/g, ", ")
      .replace(/\s+-\s+/g, ", ")
      .replace(/(?<=[A-Za-z])-(?=[A-Za-z])/g, " ")
      .replace(/(?<=\d)-(?=\d)/g, " to ") as T;
  }
  if (Array.isArray(value)) return value.map((item) => scrub(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, scrub(item)])) as T;
  }
  return value;
}

export function hasWriter() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function writeWithTool<T>(input: { tool: string; description: string; schema: object; prompt: string; maxTokens?: number }): Promise<T | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: input.maxTokens ?? 2500,
        system: RULES,
        tools: [{ name: input.tool, description: input.description, input_schema: input.schema }],
        tool_choice: { type: "tool", name: input.tool },
        messages: [{ role: "user", content: input.prompt }],
      }),
      signal: AbortSignal.timeout(55000),
    });
    if (!response.ok) {
      console.error(`learn writer: Anthropic ${response.status}: ${(await response.text()).slice(0, 200)}`);
      return null;
    }
    const data = (await response.json()) as { content?: Array<{ type: string; input?: unknown }> };
    const result = data.content?.find((block) => block.type === "tool_use")?.input;
    return result ? scrub(result as T) : null;
  } catch (error) {
    console.error("learn writer: request failed", error instanceof Error ? error.message : error);
    return null;
  }
}
