import { describe, expect, it } from "vitest";
import {
  generateConnectionTokens,
  hashAccessToken,
  verifyAccessToken,
} from "@/lib/connect/tokens";

describe("generateConnectionTokens", () => {
  it("returns unique connection_id and access_token each call", () => {
    const a = generateConnectionTokens();
    const b = generateConnectionTokens();
    expect(a.connection_id).not.toBe(b.connection_id);
    expect(a.access_token).not.toBe(b.access_token);
  });

  it("connection_id is a UUID, access_token is 64 hex chars", () => {
    const t = generateConnectionTokens();
    expect(t.connection_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(t.access_token).toMatch(/^[0-9a-f]{64}$/);
    expect(t.access_token_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("access_token_hash equals sha256(access_token)", () => {
    const t = generateConnectionTokens();
    expect(t.access_token_hash).toBe(hashAccessToken(t.access_token));
  });
});

describe("hashAccessToken", () => {
  it("is deterministic", () => {
    const token = "abc123";
    expect(hashAccessToken(token)).toBe(hashAccessToken(token));
  });

  it("different inputs → different hashes", () => {
    expect(hashAccessToken("a")).not.toBe(hashAccessToken("b"));
  });
});

describe("verifyAccessToken", () => {
  it("returns true for matching pair", () => {
    const t = generateConnectionTokens();
    expect(verifyAccessToken(t.access_token, t.access_token_hash)).toBe(true);
  });

  it("returns false when token does not match hash", () => {
    const a = generateConnectionTokens();
    const b = generateConnectionTokens();
    expect(verifyAccessToken(a.access_token, b.access_token_hash)).toBe(false);
  });

  it("returns false for empty inputs", () => {
    expect(verifyAccessToken("", "abc")).toBe(false);
    expect(verifyAccessToken("abc", "")).toBe(false);
  });

  it("returns false on malformed hash without throwing", () => {
    expect(verifyAccessToken("abc", "not-hex!!!")).toBe(false);
  });
});
