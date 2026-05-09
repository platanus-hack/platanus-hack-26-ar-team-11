import type { EventDescriptor, MatchLabel } from "@/types/api";
import {
  ANTHROPIC_RECO_MODEL,
  extractFirstJson,
  extractText,
  getAnthropicClient,
} from "@/lib/query/anthropic";
import {
  formatSkillsForPrompt,
  loadTwinContext,
  type TwinContext,
} from "@/lib/query/twin-context";

export interface EventRecommendationInput {
  twin_id: string;
  event: EventDescriptor;
}

export interface EventRecommendationOutput {
  answer: MatchLabel;
  confidence: number;
  reasons: string[];
}

const VALID_LABELS = new Set<MatchLabel>([
  "strong_match",
  "weak_match",
  "no_match",
]);

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function describeEvent(e: EventDescriptor): string {
  const lines: string[] = [];
  if (e.artist) lines.push(`- Artist: ${e.artist}`);
  if (e.venue) lines.push(`- Venue: ${e.venue}`);
  if (e.city) lines.push(`- City: ${e.city}`);
  if (e.date) lines.push(`- Date: ${e.date}`);
  if (e.genres && e.genres.length > 0)
    lines.push(`- Genres: ${e.genres.join(", ")}`);
  if (e.venue_size) lines.push(`- Venue size: ${e.venue_size}`);
  if (e.price !== undefined && e.price !== null)
    lines.push(`- Price: ${e.price}`);
  return lines.join("\n") || "- (no event details)";
}

export async function handleEventRecommendation({
  twin_id,
  event,
}: EventRecommendationInput): Promise<EventRecommendationOutput> {
  const context = await loadTwinContext(twin_id);
  return evaluateEvent(context, event);
}

export async function evaluateEvent(
  context: TwinContext,
  event: EventDescriptor,
): Promise<EventRecommendationOutput> {
  const prompt = `You are scoring a single live music event against a user's Twin profile.

User Twin profile (facts extracted from training sessions):
${formatSkillsForPrompt(context)}

Event being evaluated:
${describeEvent(event)}

Task: classify how well this event matches the user. Output ONLY a JSON object with this exact shape, no commentary:

{
  "answer": "strong_match" | "weak_match" | "no_match",
  "confidence": 0..1,
  "reasons": ["...", "..."]
}

Rules:
- "reasons" must contain 2 to 4 short English bullet strings, each plain text, no markdown.
- If the Twin profile has no relevant facts, prefer "no_match" with low confidence.
- Do not invent facts about the user.`;

  let answer: MatchLabel = "no_match";
  let llmConfidence = 0;
  let reasons: string[] = ["Could not evaluate"];

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: ANTHROPIC_RECO_MODEL,
      max_tokens: 600,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });
    const text = extractText(message);
    const parsed = extractFirstJson<{
      answer?: string;
      confidence?: number;
      reasons?: unknown[];
    }>(text);
    if (parsed) {
      const candidate = parsed.answer as MatchLabel | undefined;
      if (candidate && VALID_LABELS.has(candidate)) {
        answer = candidate;
      }
      llmConfidence = clamp01(Number(parsed.confidence ?? 0));
      if (Array.isArray(parsed.reasons)) {
        reasons = parsed.reasons
          .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
          .slice(0, 4);
        if (reasons.length === 0) reasons = ["No reasons provided by model"];
      }
    } else {
      console.warn("[event_recommendation] could not parse LLM output", text);
    }
  } catch (err) {
    console.error("[event_recommendation] LLM call failed", err);
    return { answer: "no_match", confidence: 0, reasons: ["Could not evaluate"] };
  }

  const confidence = Math.min(llmConfidence, context.meanConfidence || llmConfidence);
  return { answer, confidence: clamp01(confidence), reasons };
}
