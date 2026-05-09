import { describe, expect, it } from "vitest";
import type { ExtractedFact, Fact } from "@/types";
import { aggregateConfidence, mergeFacts } from "../merge-facts";

function existingFact(over: Partial<Fact> = {}): Fact {
  return {
    id: "f1",
    text: "Top genres: indie, rock, alternative",
    confidence: 0.7,
    source_session_id: "ses_old",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

function ef(text: string, confidence: number): ExtractedFact {
  return { domain: "music_taste", text, confidence };
}

describe("mergeFacts", () => {
  it("inserts a new fact when nothing similar exists", () => {
    const out = mergeFacts(
      [existingFact()],
      [ef("Goes to outdoor festivals once a month", 0.6)],
      { sessionId: "ses_new", now: () => "2026-05-09T00:00:00.000Z" }
    );
    expect(out).toHaveLength(2);
    const inserted = out.find((f) => f.id !== "f1")!;
    expect(inserted.text).toContain("outdoor festivals");
    expect(inserted.confidence).toBe(0.6);
    expect(inserted.source_session_id).toBe("ses_new");
    expect(inserted.created_at).toBe("2026-05-09T00:00:00.000Z");
  });

  it("updates existing fact when incoming text is similar (jaccard > 0.85)", () => {
    const out = mergeFacts(
      [existingFact()],
      [ef("Top genres indie rock alternative", 0.8)],
      { sessionId: "ses_new", now: () => "2026-05-09T00:00:00.000Z" }
    );
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("f1");
    expect(out[0].confidence).toBeGreaterThanOrEqual(0.8);
    expect(out[0].source_session_id).toBe("ses_new");
    expect(out[0].updated_at).toBe("2026-05-09T00:00:00.000Z");
  });

  it("never lowers confidence by less than 30% of the previous reading", () => {
    const out = mergeFacts(
      [existingFact({ confidence: 0.9 })],
      [ef("Top genres indie rock alternative", 0.5)]
    );
    expect(out[0].confidence).toBeCloseTo(0.7 * 0.5 + 0.3 * 0.9, 5);
  });

  it("clamps confidence into [0,1]", () => {
    const out = mergeFacts(
      [],
      [ef("nuevo fact", 1.5), ef("otro nuevo", -0.2)]
    );
    expect(out[0].confidence).toBe(1);
    expect(out[1].confidence).toBe(0);
  });

  it("prefers the longer/more informative text on update", () => {
    const out = mergeFacts(
      [existingFact({ text: "Top genres indie rock alternative" })],
      [ef("Top genres indie rock alternative folk", 0.7)]
    );
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("f1");
    expect(out[0].text).toContain("folk");
  });

  it("returns the existing list verbatim when incoming is empty", () => {
    const existing = [existingFact(), existingFact({ id: "f2" })];
    const out = mergeFacts(existing, []);
    expect(out).toEqual(existing);
  });
});

describe("aggregateConfidence", () => {
  it("returns 0 for an empty list", () => {
    expect(aggregateConfidence([])).toBe(0);
  });

  it("returns the mean confidence", () => {
    expect(
      aggregateConfidence([
        existingFact({ id: "a", confidence: 0.6 }),
        existingFact({ id: "b", confidence: 0.8 }),
      ])
    ).toBeCloseTo(0.7);
  });
});
