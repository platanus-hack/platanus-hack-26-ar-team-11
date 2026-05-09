import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const inserts: unknown[] = [];
let insertError: { message: string } | null = null;

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (_table: string) => ({
      insert: async (payload: unknown) => {
        inserts.push(payload);
        return { error: insertError };
      },
    }),
  }),
}));

beforeEach(() => {
  inserts.length = 0;
  insertError = null;
});

afterEach(() => {
  inserts.length = 0;
  insertError = null;
});

describe("logQuery", () => {
  it("inserts canonical shape with all fields", async () => {
    const { logQuery } = await import("@/lib/query/log");
    await logQuery({
      connection: {
        id: "conn-1",
        user_id: "u1",
        twin_id: "tw1",
        app_id: "app-1",
      },
      intent: "general_summary",
      question: "tell me about the user",
      response_summary: "summary returned",
      allowed: true,
      blocked_reason: null,
      scopes_used: ["persona.read.summary"],
    });
    expect(inserts).toHaveLength(1);
    const row = inserts[0] as Record<string, unknown>;
    expect(row.connection_id).toBe("conn-1");
    expect(row.intent).toBe("general_summary");
    expect(row.allowed).toBe(true);
    expect(row.blocked_reason).toBeNull();
    expect(row.scopes_used_json).toEqual(["persona.read.summary"]);
  });

  it("truncates response_summary to 200 chars", async () => {
    const { logQuery } = await import("@/lib/query/log");
    const longText = "a".repeat(500);
    await logQuery({
      connection: { id: "c", user_id: "u", twin_id: "t", app_id: "a" },
      intent: "general_summary",
      question: null,
      response_summary: longText,
      allowed: true,
      blocked_reason: null,
      scopes_used: [],
    });
    const row = inserts[0] as Record<string, unknown>;
    expect((row.response_summary as string).length).toBeLessThanOrEqual(200);
  });

  it("does not throw when insert fails", async () => {
    insertError = { message: "boom" };
    const { logQuery } = await import("@/lib/query/log");
    await expect(
      logQuery({
        connection: null,
        intent: "general_summary",
        question: null,
        response_summary: null,
        allowed: false,
        blocked_reason: "missing_scope: x",
        scopes_used: [],
      }),
    ).resolves.toBeUndefined();
  });

  it("works with null connection (logs orphan failed-auth queries)", async () => {
    const { logQuery } = await import("@/lib/query/log");
    await logQuery({
      connection: null,
      intent: "general_summary",
      question: "q",
      response_summary: null,
      allowed: false,
      blocked_reason: "unauthorized",
      scopes_used: [],
    });
    const row = inserts[0] as Record<string, unknown>;
    expect(row.connection_id).toBeNull();
    expect(row.user_id).toBeNull();
  });
});

describe("summarizeResponse", () => {
  it("general_summary includes completion and domains count", async () => {
    const { summarizeResponse } = await import("@/lib/query/log");
    expect(
      summarizeResponse("general_summary", {
        completion: 0.62,
        domains_available: ["music_taste", "vibes"],
      }),
    ).toContain("completion=0.62");
  });

  it("event_ranking summarizes counts by match label", async () => {
    const { summarizeResponse } = await import("@/lib/query/log");
    const summary = summarizeResponse("event_ranking", {
      ranking: [
        { match: "strong_match" },
        { match: "strong_match" },
        { match: "weak_match" },
        { match: "no_match" },
      ],
    });
    expect(summary).toContain("4 events");
    expect(summary).toContain("2 strong");
    expect(summary).toContain("1 weak");
  });
});
