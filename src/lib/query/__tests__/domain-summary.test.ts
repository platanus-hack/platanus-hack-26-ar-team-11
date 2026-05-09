import { beforeEach, describe, expect, it, vi } from "vitest";

interface SkillRow {
  confidence: number;
  facts_json: { text: string; confidence: number }[];
}

const state: { skill: SkillRow | null } = { skill: null };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: state.skill, error: null }),
          }),
        }),
      }),
    }),
  }),
}));

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
  state.skill = null;
  createMock.mockReset();
});

function llmText(text: string) {
  return { content: [{ type: "text", text }] };
}

describe("handleDomainSummary", () => {
  it("returns data: null when skill row missing", async () => {
    state.skill = null;
    const { handleDomainSummary } = await import(
      "@/lib/query/intents/domain-summary"
    );
    const result = await handleDomainSummary({
      twin_id: "tw1",
      domain: "music_taste",
    });
    expect(result.data).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it("returns data: null when no facts but skill exists", async () => {
    state.skill = { confidence: 0.5, facts_json: [] };
    const { handleDomainSummary } = await import(
      "@/lib/query/intents/domain-summary"
    );
    const result = await handleDomainSummary({
      twin_id: "tw1",
      domain: "music_taste",
    });
    expect(result.data).toBeNull();
    expect(result.confidence).toBe(0.5);
  });

  it("maps facts via LLM into shape for music_taste", async () => {
    state.skill = {
      confidence: 0.91,
      facts_json: [
        { text: "Top genres: indie, rock", confidence: 0.9 },
        { text: "Loves Soda Stereo and Tame Impala", confidence: 0.85 },
      ],
    };
    createMock.mockResolvedValueOnce(
      llmText(
        JSON.stringify({
          top_genres: ["indie", "rock"],
          favorite_artists: ["Soda Stereo", "Tame Impala"],
          discovery_style: "active discoverer",
        }),
      ),
    );
    const { handleDomainSummary } = await import(
      "@/lib/query/intents/domain-summary"
    );
    const result = await handleDomainSummary({
      twin_id: "tw1",
      domain: "music_taste",
    });
    expect(result.domain).toBe("music_taste");
    expect(result.confidence).toBe(0.91);
    expect(result.data).toEqual({
      top_genres: ["indie", "rock"],
      favorite_artists: ["Soda Stereo", "Tame Impala"],
      discovery_style: "active discoverer",
    });
  });

  it("falls back to empty shape if LLM throws", async () => {
    state.skill = {
      confidence: 0.5,
      facts_json: [{ text: "Some fact", confidence: 0.7 }],
    };
    createMock.mockRejectedValueOnce(new Error("LLM down"));
    const { handleDomainSummary } = await import(
      "@/lib/query/intents/domain-summary"
    );
    const result = await handleDomainSummary({
      twin_id: "tw1",
      domain: "vibes",
    });
    expect(result.data).toEqual({
      tags: [],
      mood: null,
      social_energy: null,
    });
  });

  it("falls back to empty shape if LLM returns non-JSON", async () => {
    state.skill = {
      confidence: 0.5,
      facts_json: [{ text: "Some fact", confidence: 0.7 }],
    };
    createMock.mockResolvedValueOnce(llmText("not valid json at all"));
    const { handleDomainSummary } = await import(
      "@/lib/query/intents/domain-summary"
    );
    const result = await handleDomainSummary({
      twin_id: "tw1",
      domain: "communication_style",
    });
    expect(result.data).toEqual({
      tone: null,
      verbosity: null,
      formality: null,
      technical_detail: null,
    });
  });
});
