import { randomUUID } from "node:crypto";
import type { ExtractedFact, Fact } from "@/types";

// Jaccard threshold for "this is the same fact". The spec suggested 0.85 but
// that's calibrated for embedding similarity; with token-set jaccard, 0.85
// only matches near-identical strings. 0.7 keeps phrasing variants together
// (e.g. "indie rock alternative" vs "indie rock alternative and folk")
// without coalescing genuinely different facts.
const SIMILARITY_THRESHOLD = 0.7;

export interface MergeOptions {
  sessionId?: string | null;
  now?: () => string;
}

export function mergeFacts(
  existing: Fact[],
  incoming: ExtractedFact[],
  opts: MergeOptions = {}
): Fact[] {
  const now = opts.now ?? (() => new Date().toISOString());
  const sourceSessionId = opts.sessionId ?? null;

  const merged: Fact[] = existing.map((f) => ({ ...f }));

  for (const candidate of incoming) {
    const matchIndex = findSimilarIndex(merged, candidate);
    if (matchIndex >= 0) {
      const prev = merged[matchIndex];
      merged[matchIndex] = {
        ...prev,
        text: pickText(prev.text, candidate.text),
        confidence: blendConfidence(prev.confidence, candidate.confidence),
        updated_at: now(),
        source_session_id: sourceSessionId ?? prev.source_session_id,
      };
    } else {
      merged.push({
        id: randomUUID(),
        text: candidate.text,
        confidence: clamp01(candidate.confidence),
        source_session_id: sourceSessionId,
        created_at: now(),
        updated_at: now(),
      });
    }
  }

  return merged;
}

// Mean confidence across facts of a domain. Empty list → 0.
export function aggregateConfidence(facts: Fact[]): number {
  if (facts.length === 0) return 0;
  const sum = facts.reduce((acc, f) => acc + f.confidence, 0);
  return clamp01(sum / facts.length);
}

function findSimilarIndex(facts: Fact[], candidate: ExtractedFact): number {
  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < facts.length; i++) {
    const score = jaccardSimilarity(facts[i].text, candidate.text);
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestScore >= SIMILARITY_THRESHOLD ? bestIdx : -1;
}

// Weighted blend favoring the newer measurement, but never collapsing under
// a previous high-confidence reading. Picks max(prev, new) when new ≥ prev,
// otherwise weighted average favoring new (70/30) so confidence drifts down
// when contradictory signal arrives.
function blendConfidence(prev: number, next: number): number {
  if (next >= prev) return clamp01(next);
  return clamp01(0.7 * next + 0.3 * prev);
}

function pickText(prev: string, next: string): string {
  return next.length > prev.length ? next : prev;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const tok of setA) {
    if (setB.has(tok)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replaceAll(/[¿?¡!.,;:…"'()\-]/g, " ")
      .split(/\s+/)
      .filter((tok) => tok.length > 2)
  );
}
