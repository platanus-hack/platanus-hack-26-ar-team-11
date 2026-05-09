import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY missing");
  }
  client = new Anthropic({ apiKey });
  return client;
}

export const ANTHROPIC_QUERY_MODEL =
  process.env.ANTHROPIC_QUERY_MODEL ?? "claude-haiku-4-5-20251001";

export const ANTHROPIC_RECO_MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

/**
 * Pull the first text content out of a Messages API response.
 */
export function extractText(message: Anthropic.Message): string {
  for (const block of message.content) {
    if (block.type === "text") return block.text;
  }
  return "";
}

/**
 * Extract the first JSON object/array embedded in a string. Returns null on parse failure.
 */
export function extractFirstJson<T>(text: string): T | null {
  if (!text) return null;
  // Try direct parse.
  try {
    return JSON.parse(text) as T;
  } catch {
    // ignore
  }
  const objStart = text.indexOf("{");
  const arrStart = text.indexOf("[");
  let start = -1;
  if (objStart === -1 && arrStart === -1) return null;
  if (objStart === -1) start = arrStart;
  else if (arrStart === -1) start = objStart;
  else start = Math.min(objStart, arrStart);
  const opener = text[start];
  const closer = opener === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === opener) depth++;
    else if (ch === closer) {
      depth--;
      if (depth === 0) {
        const slice = text.slice(start, i + 1);
        try {
          return JSON.parse(slice) as T;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
