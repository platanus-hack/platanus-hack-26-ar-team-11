import { describe, expect, it } from "vitest";
import { evaluatePolicy } from "@/lib/permissions/engine";

describe("evaluatePolicy — general_summary", () => {
  it("allowed when persona.read.summary is granted", () => {
    const result = evaluatePolicy({
      intent: "general_summary",
      granted_scopes: ["persona.read.summary"],
    });
    expect(result.allowed).toBe(true);
    expect(result.scopes_used).toEqual(["persona.read.summary"]);
    expect(result.blocked_reason).toBeNull();
  });

  it("blocked when missing summary scope", () => {
    const result = evaluatePolicy({
      intent: "general_summary",
      granted_scopes: ["persona.read.music"],
    });
    expect(result.allowed).toBe(false);
    expect(result.blocked_reason).toBe("missing_scope: persona.read.summary");
  });
});

describe("evaluatePolicy — domain_summary", () => {
  it("allowed for music_taste with persona.read.music", () => {
    const result = evaluatePolicy({
      intent: "domain_summary",
      context: { domain: "music_taste" },
      granted_scopes: ["persona.read.music"],
    });
    expect(result.allowed).toBe(true);
  });

  it("blocked when domain scope is missing", () => {
    const result = evaluatePolicy({
      intent: "domain_summary",
      context: { domain: "vibes" },
      granted_scopes: ["persona.read.music"],
    });
    expect(result.allowed).toBe(false);
    expect(result.blocked_reason).toContain("missing_scope");
  });

  it("blocked_domain wins over bad_request when context.domain is a blocked domain", () => {
    const result = evaluatePolicy({
      intent: "domain_summary",
      context: { domain: "politics" },
      granted_scopes: ["persona.read.summary", "persona.read.music"],
    });
    expect(result.allowed).toBe(false);
    expect(result.blocked_reason).toBe("blocked_domain: politics");
  });

  it("bad_request when domain is missing entirely", () => {
    const result = evaluatePolicy({
      intent: "domain_summary",
      context: {},
      granted_scopes: ["persona.read.summary"],
    });
    expect(result.allowed).toBe(false);
    expect(result.blocked_reason).toContain("bad_request");
  });

  it("bad_request when domain is unknown (not Domain, not BlockedDomain)", () => {
    const result = evaluatePolicy({
      intent: "domain_summary",
      context: { domain: "totally_random_domain" },
      granted_scopes: ["persona.read.summary"],
    });
    expect(result.allowed).toBe(false);
    expect(result.blocked_reason).toContain("bad_request");
  });
});

describe("evaluatePolicy — event_recommendation/ranking", () => {
  const allRequired = [
    "persona.read.music",
    "persona.read.events",
    "persona.ask.recommendation",
  ] as const;

  it("event_recommendation allowed with all 3 scopes", () => {
    const result = evaluatePolicy({
      intent: "event_recommendation",
      granted_scopes: [...allRequired],
    });
    expect(result.allowed).toBe(true);
  });

  it("event_recommendation blocked if missing ask.recommendation", () => {
    const result = evaluatePolicy({
      intent: "event_recommendation",
      granted_scopes: ["persona.read.music", "persona.read.events"],
    });
    expect(result.allowed).toBe(false);
    expect(result.blocked_reason).toBe(
      "missing_scope: persona.ask.recommendation",
    );
  });

  it("event_ranking same scopes as recommendation", () => {
    const result = evaluatePolicy({
      intent: "event_ranking",
      granted_scopes: [...allRequired],
    });
    expect(result.allowed).toBe(true);
  });
});

describe("evaluatePolicy — blocked topic detection", () => {
  it("scope OK but politics keyword in question → blocked", () => {
    const result = evaluatePolicy({
      intent: "general_summary",
      granted_scopes: ["persona.read.summary"],
      question: "What is the user's vote in the election?",
    });
    expect(result.allowed).toBe(false);
    expect(result.blocked_reason).toBe("blocked_domain: politics");
  });

  it("non-sensitive question + scope OK → allowed", () => {
    const result = evaluatePolicy({
      intent: "general_summary",
      granted_scopes: ["persona.read.summary"],
      question: "Tell me about their music taste.",
    });
    expect(result.allowed).toBe(true);
  });

  it("question takes precedence over context.question", () => {
    const result = evaluatePolicy({
      intent: "general_summary",
      granted_scopes: ["persona.read.summary"],
      context: { question: "innocuous" },
      question: "are they on medication?",
    });
    expect(result.allowed).toBe(false);
    expect(result.blocked_reason).toBe("blocked_domain: health");
  });
});
