import type { EventDescriptor, MatchLabel, RankedEvent } from "@/types/api";
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

export const MAX_EVENTS = 50;
const BATCH_SIZE = 10;

export interface EventRankingInput {
  twin_id: string;
  events: EventDescriptor[];
}

export interface EventRankingOutput {
  ranking: RankedEvent[];
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

function ensureId(event: EventDescriptor, idx: number): string {
  return event.id ?? `e${idx}`;
}

function formatEvent(event: EventDescriptor, id: string): string {
  const lines: string[] = [`id: ${id}`];
  if (event.artist) lines.push(`artist: ${event.artist}`);
  if (event.venue) lines.push(`venue: ${event.venue}`);
  if (event.city) lines.push(`city: ${event.city}`);
  if (event.date) lines.push(`date: ${event.date}`);
  if (event.genres && event.genres.length > 0)
    lines.push(`genres: ${event.genres.join(", ")}`);
  if (event.venue_size) lines.push(`venue_size: ${event.venue_size}`);
  if (event.price !== undefined && event.price !== null)
    lines.push(`price: ${event.price}`);
  return lines.join(" | ");
}

interface RankedRaw {
  id?: string;
  score?: number;
  match?: string;
  reasons?: unknown;
}

function normalizeRanked(raw: RankedRaw, fallbackId: string): RankedEvent {
  const id = typeof raw.id === "string" && raw.id.length > 0 ? raw.id : fallbackId;
  const score = clamp01(Number(raw.score ?? 0));
  const match: MatchLabel = (() => {
    const m = raw.match as MatchLabel | undefined;
    if (m && VALID_LABELS.has(m)) return m;
    if (score >= 0.7) return "strong_match";
    if (score >= 0.35) return "weak_match";
    return "no_match";
  })();
  const reasons = Array.isArray(raw.reasons)
    ? raw.reasons
        .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
        .slice(0, 3)
    : [];
  return { id, score, match, reasons };
}

async function rankBatch(
  context: TwinContext,
  batch: { id: string; event: EventDescriptor }[],
): Promise<RankedEvent[]> {
  const formatted = batch
    .map((b, i) => `${i + 1}. ${formatEvent(b.event, b.id)}`)
    .join("\n");

  const prompt = `Rank live music events for a single user.

User Twin profile (facts from training sessions):
${formatSkillsForPrompt(context)}

Events to rank:
${formatted}

For each event, output a score in [0,1], a match label and 1-3 short reasons.
Output ONLY a JSON object exactly in this shape, no markdown fences, no commentary:

{
  "ranking": [
    { "id": "<id>", "score": 0.0..1.0, "match": "strong_match" | "weak_match" | "no_match", "reasons": ["...", "..."] }
  ]
}

Rules:
- Use the same id strings provided in the input.
- If you don't know, prefer "no_match" with a low score, do not invent facts.`;

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: ANTHROPIC_RECO_MODEL,
      max_tokens: 1500,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });
    const text = extractText(message);
    const parsed = extractFirstJson<{ ranking?: RankedRaw[] }>(text);
    if (!parsed || !Array.isArray(parsed.ranking)) {
      console.warn("[event_ranking] could not parse LLM output", text);
      return batch.map((b) => emptyEntry(b.id));
    }
    const byId = new Map<string, RankedRaw>();
    for (const entry of parsed.ranking) {
      if (entry && typeof entry === "object") {
        const id = typeof entry.id === "string" ? entry.id : null;
        if (id) byId.set(id, entry);
      }
    }
    return batch.map((b) => {
      const raw = byId.get(b.id);
      if (!raw) return emptyEntry(b.id);
      return normalizeRanked(raw, b.id);
    });
  } catch (err) {
    console.error("[event_ranking] LLM call failed", err);
    return batch.map((b) => emptyEntry(b.id));
  }
}

function emptyEntry(id: string): RankedEvent {
  return { id, score: 0, match: "no_match", reasons: ["Not evaluated"] };
}

export async function handleEventRanking({
  twin_id,
  events,
}: EventRankingInput): Promise<EventRankingOutput> {
  if (events.length === 0) return { ranking: [] };
  if (events.length > MAX_EVENTS) {
    throw new Error(`Too many events: ${events.length} > ${MAX_EVENTS}`);
  }

  const context = await loadTwinContext(twin_id);
  return rankWithContext(context, events);
}

export async function rankWithContext(
  context: TwinContext,
  events: EventDescriptor[],
): Promise<EventRankingOutput> {
  const tagged = events.map((e, i) => ({ id: ensureId(e, i), event: e }));

  const batches: { id: string; event: EventDescriptor }[][] = [];
  for (let i = 0; i < tagged.length; i += BATCH_SIZE) {
    batches.push(tagged.slice(i, i + BATCH_SIZE));
  }

  const results: RankedEvent[] = [];
  for (const batch of batches) {
    const batchResult = await rankBatch(context, batch);
    results.push(...batchResult);
  }

  return { ranking: results };
}
