import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TwinContext } from "@/lib/query/twin-context";

const createMock = vi.fn();
vi.mock("@/lib/query/anthropic", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/query/anthropic")>(
      "@/lib/query/anthropic",
    );
  return {
    ...actual,
    getAnthropicClient: () => ({
      messages: { create: createMock },
    }),
  };
});

beforeEach(() => {
  createMock.mockReset();
});

function llm(text: string) {
  return { content: [{ type: "text", text }] };
}

const indieContext: TwinContext = {
  meanConfidence: 0.85,
  skills: [
    {
      domain: "music_taste",
      confidence: 0.9,
      facts: [
        { text: "Loves indie and shoegaze", confidence: 0.9 },
        { text: "Goes to small venues weekly", confidence: 0.8 },
      ],
    },
  ],
};

describe("evaluateEvent", () => {
  it("strong_match path with capped confidence", async () => {
    createMock.mockResolvedValueOnce(
      llm(
        JSON.stringify({
          answer: "strong_match",
          confidence: 0.95,
          reasons: ["Matches indie taste", "Small venue fits preferences"],
        }),
      ),
    );
    const { evaluateEvent } = await import(
      "@/lib/query/intents/event-recommendation"
    );
    const result = await evaluateEvent(indieContext, {
      artist: "Some indie band",
      genres: ["indie"],
      venue_size: "club",
    });
    expect(result.answer).toBe("strong_match");
    // capped by mean twin confidence
    expect(result.confidence).toBeLessThanOrEqual(0.85);
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
  });

  it("weak_match for mismatched genre", async () => {
    createMock.mockResolvedValueOnce(
      llm(
        JSON.stringify({
          answer: "weak_match",
          confidence: 0.4,
          reasons: ["Mostly different genre"],
        }),
      ),
    );
    const { evaluateEvent } = await import(
      "@/lib/query/intents/event-recommendation"
    );
    const result = await evaluateEvent(indieContext, {
      artist: "Pop star",
      genres: ["pop"],
    });
    expect(result.answer).toBe("weak_match");
  });

  it("falls back to no_match when LLM throws", async () => {
    createMock.mockRejectedValueOnce(new Error("LLM down"));
    const { evaluateEvent } = await import(
      "@/lib/query/intents/event-recommendation"
    );
    const result = await evaluateEvent(indieContext, { artist: "X" });
    expect(result.answer).toBe("no_match");
    expect(result.confidence).toBe(0);
  });

  it("falls back when LLM returns invalid label", async () => {
    createMock.mockResolvedValueOnce(
      llm(JSON.stringify({ answer: "??", confidence: 0.5, reasons: ["x"] })),
    );
    const { evaluateEvent } = await import(
      "@/lib/query/intents/event-recommendation"
    );
    const result = await evaluateEvent(indieContext, { artist: "X" });
    // invalid label collapses to no_match
    expect(result.answer).toBe("no_match");
  });

  it("clamps confidence to [0,1]", async () => {
    createMock.mockResolvedValueOnce(
      llm(JSON.stringify({ answer: "strong_match", confidence: 5, reasons: ["x", "y"] })),
    );
    const { evaluateEvent } = await import(
      "@/lib/query/intents/event-recommendation"
    );
    const result = await evaluateEvent(indieContext, { artist: "X" });
    expect(result.confidence).toBeLessThanOrEqual(1);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
  });
});
