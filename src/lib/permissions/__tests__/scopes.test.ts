import { describe, expect, it } from "vitest";
import { hasAllScopes, requiredScopesForIntent } from "@/lib/permissions/scopes";

describe("requiredScopesForIntent", () => {
  it("general_summary → persona.read.summary", () => {
    expect(requiredScopesForIntent("general_summary")).toEqual([
      "persona.read.summary",
    ]);
  });

  it("domain_summary maps each domain to its read scope", () => {
    expect(requiredScopesForIntent("domain_summary", { domain: "music_taste" })).toEqual([
      "persona.read.music",
    ]);
    expect(
      requiredScopesForIntent("domain_summary", { domain: "event_preferences" }),
    ).toEqual(["persona.read.events"]);
    expect(requiredScopesForIntent("domain_summary", { domain: "vibes" })).toEqual([
      "persona.read.vibes",
    ]);
    expect(
      requiredScopesForIntent("domain_summary", { domain: "communication_style" }),
    ).toEqual(["persona.read.communication"]);
  });

  it("domain_summary with missing/unknown domain → []", () => {
    expect(requiredScopesForIntent("domain_summary")).toEqual([]);
    expect(requiredScopesForIntent("domain_summary", { domain: "politics" })).toEqual(
      [],
    );
  });

  it("event_recommendation requires music + events + ask.recommendation", () => {
    expect(requiredScopesForIntent("event_recommendation").sort()).toEqual(
      ["persona.ask.recommendation", "persona.read.events", "persona.read.music"].sort(),
    );
  });

  it("event_ranking requires the same as recommendation", () => {
    expect(requiredScopesForIntent("event_ranking").sort()).toEqual(
      requiredScopesForIntent("event_recommendation").sort(),
    );
  });
});

describe("hasAllScopes", () => {
  it("returns null when all granted", () => {
    expect(
      hasAllScopes(
        ["persona.read.summary", "persona.read.music"],
        ["persona.read.summary"],
      ),
    ).toBeNull();
  });

  it("returns first missing scope", () => {
    expect(
      hasAllScopes(["persona.read.summary"], [
        "persona.read.summary",
        "persona.read.events",
      ]),
    ).toBe("persona.read.events");
  });

  it("with empty required, returns null", () => {
    expect(hasAllScopes([], [])).toBeNull();
  });
});
