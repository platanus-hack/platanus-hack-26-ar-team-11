import { describe, expect, it } from "vitest";
import {
  detectBlockedTopic,
  isBlockedDomain,
} from "@/lib/permissions/blocked-domains";

describe("isBlockedDomain", () => {
  it("matches known blocked domain names", () => {
    expect(isBlockedDomain("politics")).toBe(true);
    expect(isBlockedDomain("health")).toBe(true);
    expect(isBlockedDomain("relationships")).toBe(true);
  });

  it("rejects regular domain or unknown name", () => {
    expect(isBlockedDomain("music_taste")).toBe(false);
    expect(isBlockedDomain("anything")).toBe(false);
  });
});

describe("detectBlockedTopic", () => {
  it("detects politics in spanish and english", () => {
    expect(detectBlockedTopic("¿A qué partido vota?")).toBe("politics");
    expect(detectBlockedTopic("Who did they vote for?")).toBe("politics");
    expect(detectBlockedTopic("Their position on the elections")).toBe("politics");
  });

  it("detects health topics", () => {
    expect(detectBlockedTopic("¿Tiene alguna enfermedad?")).toBe("health");
    expect(detectBlockedTopic("Is the user on any medication?")).toBe("health");
  });

  it("detects relationships", () => {
    expect(detectBlockedTopic("¿Quién es su novia actual?")).toBe("relationships");
    expect(detectBlockedTopic("Is the user married?")).toBe(null); // 'married' not a kw
    expect(detectBlockedTopic("Tell me about their spouse")).toBe("relationships");
  });

  it("detects financial_status", () => {
    expect(detectBlockedTopic("What is their salary?")).toBe("financial_status");
    expect(detectBlockedTopic("Cuál es su sueldo")).toBe("financial_status");
  });

  it("avoids word-fragment false positives on single tokens", () => {
    // 'devoto' contains 'voto' as substring — must not match.
    expect(detectBlockedTopic("Es muy devoto del rock")).toBe(null);
  });

  it("returns null for innocuous question", () => {
    expect(detectBlockedTopic("What music does the user like?")).toBe(null);
  });

  it("returns null for empty/null input", () => {
    expect(detectBlockedTopic(null)).toBe(null);
    expect(detectBlockedTopic("")).toBe(null);
  });
});
