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
    getAnthropicClient: () => ({ messages: { create: createMock } }),
  };
});

beforeEach(() => {
  createMock.mockReset();
});

function llm(text: string) {
  return { content: [{ type: "text", text }] };
}

const ctx: TwinContext = {
  meanConfidence: 0.7,
  skills: [
    {
      domain: "music_taste",
      confidence: 0.8,
      facts: [{ text: "indie rock", confidence: 0.9 }],
    },
  ],
};

describe("rankWithContext", () => {
  it("returns one ranking per input event", async () => {
    createMock.mockResolvedValueOnce(
      llm(
        JSON.stringify({
          ranking: [
            { id: "e0", score: 0.9, match: "strong_match", reasons: ["a"] },
            { id: "e1", score: 0.3, match: "weak_match", reasons: ["b"] },
            { id: "e2", score: 0.05, match: "no_match", reasons: ["c"] },
          ],
        }),
      ),
    );
    const { rankWithContext } = await import(
      "@/lib/query/intents/event-ranking"
    );
    const result = await rankWithContext(ctx, [
      { id: "e0", artist: "A" },
      { id: "e1", artist: "B" },
      { id: "e2", artist: "C" },
    ]);
    expect(result.ranking).toHaveLength(3);
    expect(result.ranking[0].id).toBe("e0");
    expect(result.ranking[0].match).toBe("strong_match");
  });

  it("fills missing entries with score=0 + 'Not evaluated' reason", async () => {
    createMock.mockResolvedValueOnce(
      llm(
        JSON.stringify({
          ranking: [
            { id: "e0", score: 0.9, match: "strong_match", reasons: ["a"] },
          ],
        }),
      ),
    );
    const { rankWithContext } = await import(
      "@/lib/query/intents/event-ranking"
    );
    const result = await rankWithContext(ctx, [
      { id: "e0", artist: "A" },
      { id: "e1", artist: "B" },
    ]);
    expect(result.ranking).toHaveLength(2);
    expect(result.ranking[1]).toEqual({
      id: "e1",
      score: 0,
      match: "no_match",
      reasons: ["Not evaluated"],
    });
  });

  it("auto-generates ids when input events lack id", async () => {
    createMock.mockResolvedValueOnce(
      llm(
        JSON.stringify({
          ranking: [
            { id: "e0", score: 0.5, match: "weak_match", reasons: ["x"] },
            { id: "e1", score: 0.5, match: "weak_match", reasons: ["y"] },
          ],
        }),
      ),
    );
    const { rankWithContext } = await import(
      "@/lib/query/intents/event-ranking"
    );
    const result = await rankWithContext(ctx, [
      { artist: "A" },
      { artist: "B" },
    ]);
    expect(result.ranking.map((r) => r.id)).toEqual(["e0", "e1"]);
  });

  it("batches when array > 10", async () => {
    const batch1 = Array.from({ length: 10 }, (_, i) => ({
      id: `e${i}`,
      score: 0.5,
      match: "weak_match",
      reasons: ["x"],
    }));
    const batch2 = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i + 10}`,
      score: 0.4,
      match: "weak_match",
      reasons: ["y"],
    }));
    createMock.mockResolvedValueOnce(llm(JSON.stringify({ ranking: batch1 })));
    createMock.mockResolvedValueOnce(llm(JSON.stringify({ ranking: batch2 })));
    const events = Array.from({ length: 15 }, (_, i) => ({
      id: `e${i}`,
      artist: `A${i}`,
    }));
    const { rankWithContext } = await import(
      "@/lib/query/intents/event-ranking"
    );
    const result = await rankWithContext(ctx, events);
    expect(result.ranking).toHaveLength(15);
    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it("falls back when LLM returns no JSON", async () => {
    createMock.mockResolvedValueOnce(llm("absolutely not json"));
    const { rankWithContext } = await import(
      "@/lib/query/intents/event-ranking"
    );
    const result = await rankWithContext(ctx, [
      { id: "e0", artist: "A" },
      { id: "e1", artist: "B" },
    ]);
    expect(result.ranking).toEqual([
      { id: "e0", score: 0, match: "no_match", reasons: ["Not evaluated"] },
      { id: "e1", score: 0, match: "no_match", reasons: ["Not evaluated"] },
    ]);
  });
});

describe("handleEventRanking", () => {
  it("rejects > MAX_EVENTS", async () => {
    const { handleEventRanking, MAX_EVENTS } = await import(
      "@/lib/query/intents/event-ranking"
    );
    const events = Array.from({ length: MAX_EVENTS + 1 }, (_, i) => ({
      id: `e${i}`,
    }));
    await expect(
      handleEventRanking({ twin_id: "tw1", events }),
    ).rejects.toThrow(/Too many events/);
  });

  it("returns empty for empty input", async () => {
    const { handleEventRanking } = await import(
      "@/lib/query/intents/event-ranking"
    );
    const result = await handleEventRanking({ twin_id: "tw1", events: [] });
    expect(result).toEqual({ ranking: [] });
  });
});
