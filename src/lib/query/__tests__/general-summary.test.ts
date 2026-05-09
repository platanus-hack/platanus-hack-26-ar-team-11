import { beforeEach, describe, expect, it, vi } from "vitest";

interface TwinRow {
  summary: string | null;
  completion_score: number;
  profile_json: { summary: string | null } | null;
}

interface SkillRow {
  domain: string;
  confidence: number;
}

const state: { twin: TwinRow | null; skills: SkillRow[] } = {
  twin: null,
  skills: [],
};

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === "twins") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: state.twin, error: null }),
            }),
          }),
        };
      }
      if (table === "twin_skills") {
        return {
          select: () => ({
            eq: async () => ({ data: state.skills, error: null }),
          }),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  }),
}));

beforeEach(() => {
  state.twin = null;
  state.skills = [];
});

describe("handleGeneralSummary", () => {
  it("returns summary, completion and domains with confidence > 0", async () => {
    state.twin = {
      summary: "A music-loving introvert.",
      completion_score: 0.62,
      profile_json: { summary: null },
    };
    state.skills = [
      { domain: "music_taste", confidence: 0.91 },
      { domain: "vibes", confidence: 0.4 },
      { domain: "communication_style", confidence: 0 },
    ];
    const { handleGeneralSummary } = await import(
      "@/lib/query/intents/general-summary"
    );
    const result = await handleGeneralSummary({ twin_id: "tw1" });
    expect(result.summary).toBe("A music-loving introvert.");
    expect(result.completion).toBe(0.62);
    expect(result.domains_available).toEqual(["music_taste", "vibes"]);
  });

  it("falls back to generic message when no summary anywhere", async () => {
    state.twin = {
      summary: null,
      completion_score: 0,
      profile_json: { summary: null },
    };
    state.skills = [];
    const { handleGeneralSummary } = await import(
      "@/lib/query/intents/general-summary"
    );
    const result = await handleGeneralSummary({ twin_id: "tw1" });
    expect(result.summary).toMatch(/hasn't completed/i);
    expect(result.completion).toBe(0);
    expect(result.domains_available).toEqual([]);
  });

  it("prefers profile_json.summary if twins.summary is null", async () => {
    state.twin = {
      summary: null,
      completion_score: 0.3,
      profile_json: { summary: "From profile_json" },
    };
    state.skills = [];
    const { handleGeneralSummary } = await import(
      "@/lib/query/intents/general-summary"
    );
    const result = await handleGeneralSummary({ twin_id: "tw1" });
    expect(result.summary).toBe("From profile_json");
  });
});
