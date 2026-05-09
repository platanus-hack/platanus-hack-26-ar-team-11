import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppConnection } from "@/types/apps";

interface MockState {
  validation:
    | { ok: true; connection: AppConnection }
    | { ok: false; reason: "not_found" | "invalid_token" | "revoked" | "expired" };
  generalSummary: unknown;
  domainSummary: unknown;
  recommendation: unknown;
  ranking: unknown;
  loggedCalls: unknown[];
}

const state: MockState = {
  validation: { ok: false, reason: "not_found" },
  generalSummary: {
    summary: "S",
    completion: 0.5,
    domains_available: ["music_taste"],
  },
  domainSummary: {
    domain: "music_taste",
    data: { top_genres: ["indie"], favorite_artists: [], discovery_style: null },
    confidence: 0.8,
  },
  recommendation: { answer: "strong_match", confidence: 0.8, reasons: ["a"] },
  ranking: { ranking: [{ id: "e0", score: 0.9, match: "strong_match", reasons: ["x"] }] },
  loggedCalls: [],
};

vi.mock("@/lib/connect", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/connect")>("@/lib/connect");
  return {
    ...actual,
    validateConnection: async () => state.validation,
  };
});

vi.mock("@/lib/query/log", () => ({
  logQuery: async (params: unknown) => {
    state.loggedCalls.push(params);
  },
  summarizeResponse: () => "summary",
}));

vi.mock("@/lib/query/intents/general-summary", () => ({
  handleGeneralSummary: async () => state.generalSummary,
}));
vi.mock("@/lib/query/intents/domain-summary", () => ({
  handleDomainSummary: async () => state.domainSummary,
}));
vi.mock("@/lib/query/intents/event-recommendation", () => ({
  handleEventRecommendation: async () => state.recommendation,
}));
vi.mock("@/lib/query/intents/event-ranking", () => ({
  handleEventRanking: async () => state.ranking,
  MAX_EVENTS: 50,
}));

const ACTIVE_CONN: AppConnection = {
  id: "11111111-1111-1111-1111-111111111111",
  user_id: "u1",
  twin_id: "tw1",
  app_id: "a1",
  scopes_json: [
    "persona.read.summary",
    "persona.read.music",
    "persona.read.events",
    "persona.ask.recommendation",
  ],
  status: "active",
  access_token_hash: "hash",
  created_at: new Date().toISOString(),
  revoked_at: null,
};

beforeEach(() => {
  state.validation = { ok: false, reason: "not_found" };
  state.loggedCalls.length = 0;
});

afterEach(() => {
  state.loggedCalls.length = 0;
});

function buildRequest(
  body: unknown,
  opts: { token?: string; origin?: string } = {},
): Request {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (opts.token) headers["authorization"] = `Bearer ${opts.token}`;
  if (opts.origin) headers["origin"] = opts.origin;
  return new Request("http://localhost/api/twin/query", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function call(body: unknown, opts?: { token?: string; origin?: string }) {
  const route = await import("@/app/api/twin/query/route");
  const req = buildRequest(body, opts) as unknown as Parameters<typeof route.POST>[0];
  return await route.POST(req);
}

describe("POST /api/twin/query", () => {
  it("401 when Bearer header missing", async () => {
    const res = await call({ connection_id: "x", intent: "general_summary" });
    expect(res.status).toBe(401);
  });

  it("400 when body fails schema", async () => {
    const res = await call({ foo: "bar" }, { token: "abc" });
    expect(res.status).toBe(400);
  });

  it("400 invalid_intent for unknown intent", async () => {
    state.validation = { ok: true, connection: ACTIVE_CONN };
    const res = await call(
      { connection_id: ACTIVE_CONN.id, intent: "weird_intent" },
      { token: "tok" },
    );
    expect(res.status).toBe(400);
  });

  it("401 when connection invalid", async () => {
    state.validation = { ok: false, reason: "invalid_token" };
    const res = await call(
      { connection_id: ACTIVE_CONN.id, intent: "general_summary" },
      { token: "tok" },
    );
    expect(res.status).toBe(401);
  });

  it("200 with policy.allowed=false when connection revoked", async () => {
    state.validation = { ok: false, reason: "revoked" };
    const res = await call(
      { connection_id: ACTIVE_CONN.id, intent: "general_summary" },
      { token: "tok" },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.policy.allowed).toBe(false);
    expect(json.policy.blocked_reason).toBe("connection_revoked");
  });

  it("200 with policy.allowed=false when scope missing", async () => {
    state.validation = {
      ok: true,
      connection: { ...ACTIVE_CONN, scopes_json: [] },
    };
    const res = await call(
      { connection_id: ACTIVE_CONN.id, intent: "general_summary" },
      { token: "tok" },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.policy.allowed).toBe(false);
    expect(json.policy.blocked_reason).toContain("missing_scope");
  });

  it("200 happy path general_summary returns combined response", async () => {
    state.validation = { ok: true, connection: ACTIVE_CONN };
    const res = await call(
      { connection_id: ACTIVE_CONN.id, intent: "general_summary" },
      { token: "tok" },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.summary).toBe("S");
    expect(json.policy.allowed).toBe(true);
    expect(json.policy.scopes_used).toContain("persona.read.summary");
  });

  it("200 happy path event_ranking", async () => {
    state.validation = { ok: true, connection: ACTIVE_CONN };
    const res = await call(
      {
        connection_id: ACTIVE_CONN.id,
        intent: "event_ranking",
        context: { events: [{ id: "e0", artist: "A" }] },
      },
      { token: "tok" },
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ranking).toBeDefined();
    expect(json.policy.allowed).toBe(true);
  });

  it("400 bad_request when domain_summary missing context.domain", async () => {
    state.validation = { ok: true, connection: ACTIVE_CONN };
    const res = await call(
      { connection_id: ACTIVE_CONN.id, intent: "domain_summary" },
      { token: "tok" },
    );
    expect(res.status).toBe(400);
  });

  it("400 bad_request when event_recommendation missing context.event", async () => {
    state.validation = { ok: true, connection: ACTIVE_CONN };
    const res = await call(
      { connection_id: ACTIVE_CONN.id, intent: "event_recommendation" },
      { token: "tok" },
    );
    expect(res.status).toBe(400);
  });

  it("400 bad_request when event_ranking has empty events array", async () => {
    state.validation = { ok: true, connection: ACTIVE_CONN };
    const res = await call(
      {
        connection_id: ACTIVE_CONN.id,
        intent: "event_ranking",
        context: { events: [] },
      },
      { token: "tok" },
    );
    expect(res.status).toBe(400);
  });

  it("400 bad_request when event_ranking exceeds MAX_EVENTS", async () => {
    state.validation = { ok: true, connection: ACTIVE_CONN };
    const events = Array.from({ length: 51 }, (_, i) => ({ id: `e${i}` }));
    const res = await call(
      {
        connection_id: ACTIVE_CONN.id,
        intent: "event_ranking",
        context: { events },
      },
      { token: "tok" },
    );
    expect(res.status).toBe(400);
  });

  it("logs every request (allowed and denied)", async () => {
    state.validation = { ok: true, connection: ACTIVE_CONN };
    await call(
      { connection_id: ACTIVE_CONN.id, intent: "general_summary" },
      { token: "tok" },
    );
    expect(state.loggedCalls.length).toBeGreaterThan(0);
  });
});

describe("OPTIONS /api/twin/query (CORS)", () => {
  it("returns 204 with CORS headers for whitelisted origin", async () => {
    const route = await import("@/app/api/twin/query/route");
    const req = new Request("http://localhost/api/twin/query", {
      method: "OPTIONS",
      headers: { origin: "http://localhost:5173" },
    });
    const res = await route.OPTIONS(
      req as unknown as Parameters<typeof route.OPTIONS>[0],
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe(
      "http://localhost:5173",
    );
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
  });

  it("returns 204 without CORS headers for unknown origin", async () => {
    const route = await import("@/app/api/twin/query/route");
    const req = new Request("http://localhost/api/twin/query", {
      method: "OPTIONS",
      headers: { origin: "https://evil.example.com" },
    });
    const res = await route.OPTIONS(
      req as unknown as Parameters<typeof route.OPTIONS>[0],
    );
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
  });
});
