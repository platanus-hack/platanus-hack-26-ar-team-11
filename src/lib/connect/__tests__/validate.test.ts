import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateConnectionTokens,
  hashAccessToken,
} from "@/lib/connect/tokens";

type Row = {
  id: string;
  status: "active" | "revoked" | "expired";
  access_token_hash: string;
  user_id: string;
  twin_id: string;
  app_id: string;
  scopes_json: string[];
  created_at: string;
  revoked_at: string | null;
};

let mockRow: Row | null = null;

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: mockRow, error: null }),
        }),
      }),
    }),
  }),
}));

beforeEach(() => {
  mockRow = null;
});

afterEach(() => {
  mockRow = null;
});

async function importValidate() {
  return await import("@/lib/connect/validate");
}

describe("validateConnection", () => {
  it("returns success when row is active and token matches", async () => {
    const t = generateConnectionTokens();
    mockRow = {
      id: t.connection_id,
      status: "active",
      access_token_hash: t.access_token_hash,
      user_id: "u1",
      twin_id: "tw1",
      app_id: "a1",
      scopes_json: ["persona.read.summary"],
      created_at: new Date().toISOString(),
      revoked_at: null,
    };
    const { validateConnection } = await importValidate();
    const result = await validateConnection(t.connection_id, t.access_token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.connection.id).toBe(t.connection_id);
    }
  });

  it("returns invalid_token when hash does not match", async () => {
    const t = generateConnectionTokens();
    mockRow = {
      id: t.connection_id,
      status: "active",
      access_token_hash: hashAccessToken("a-different-token"),
      user_id: "u1",
      twin_id: "tw1",
      app_id: "a1",
      scopes_json: [],
      created_at: new Date().toISOString(),
      revoked_at: null,
    };
    const { validateConnection } = await importValidate();
    const result = await validateConnection(t.connection_id, t.access_token);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("invalid_token");
  });

  it("returns revoked when status is revoked", async () => {
    const t = generateConnectionTokens();
    mockRow = {
      id: t.connection_id,
      status: "revoked",
      access_token_hash: t.access_token_hash,
      user_id: "u1",
      twin_id: "tw1",
      app_id: "a1",
      scopes_json: [],
      created_at: new Date().toISOString(),
      revoked_at: new Date().toISOString(),
    };
    const { validateConnection } = await importValidate();
    const result = await validateConnection(t.connection_id, t.access_token);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("revoked");
  });

  it("returns not_found when row missing", async () => {
    mockRow = null;
    const t = generateConnectionTokens();
    const { validateConnection } = await importValidate();
    const result = await validateConnection(t.connection_id, t.access_token);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not_found");
  });

  it("returns not_found for non-uuid connection_id", async () => {
    const { validateConnection } = await importValidate();
    const result = await validateConnection("not-a-uuid", "abc");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not_found");
  });

  it("returns not_found for empty inputs", async () => {
    const { validateConnection } = await importValidate();
    const result = await validateConnection("", "");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("not_found");
  });
});

describe("getActiveConnection", () => {
  it("returns row on success, null on failure", async () => {
    const t = generateConnectionTokens();
    mockRow = {
      id: t.connection_id,
      status: "active",
      access_token_hash: t.access_token_hash,
      user_id: "u1",
      twin_id: "tw1",
      app_id: "a1",
      scopes_json: [],
      created_at: new Date().toISOString(),
      revoked_at: null,
    };
    const { getActiveConnection } = await importValidate();
    expect(await getActiveConnection(t.connection_id, t.access_token)).not.toBeNull();

    mockRow = null;
    expect(await getActiveConnection(t.connection_id, t.access_token)).toBeNull();
  });
});
