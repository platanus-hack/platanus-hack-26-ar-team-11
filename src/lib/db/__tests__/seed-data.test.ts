import { describe, expect, it } from "vitest";
import { DEMO_USER_1, DEMO_USER_2, DEMO_USERS } from "../seed-data/demo-users";
import { buildAllAccessAppSeed } from "../seed-data/allaccess-app";

describe("demo users seed data", () => {
  it("each user has session count consistent with completion_score and next_session_index", () => {
    for (const user of DEMO_USERS) {
      expect(user.sessions.length).toBe(user.next_session_index);
      expect(user.completion_score).toBeGreaterThanOrEqual(0);
      expect(user.completion_score).toBeLessThanOrEqual(1);
    }
  });

  it("session indexes are unique and within [0,11]", () => {
    for (const user of DEMO_USERS) {
      const indexes = user.sessions.map((s) => s.session_index);
      expect(new Set(indexes).size).toBe(indexes.length);
      for (const idx of indexes) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThanOrEqual(11);
      }
    }
  });

  it("each demo user has facts in every domain (Skills tab is fully populated)", () => {
    const REQUIRED_DOMAINS = [
      "vibes",
      "communication_style",
      "spending_profile",
      "music_taste",
      "event_preferences",
      "fashion_taste",
      "food_taste",
      "travel_style",
    ];
    for (const user of DEMO_USERS) {
      const domainsWithFacts = new Set(
        user.skills.filter((s) => s.facts.length > 0).map((s) => s.domain),
      );
      for (const domain of REQUIRED_DOMAINS) {
        expect(domainsWithFacts).toContain(domain);
      }
    }
  });

  it("all skill facts have valid confidence in [0,1]", () => {
    for (const user of DEMO_USERS) {
      for (const skill of user.skills) {
        expect(skill.facts.length).toBeGreaterThan(0);
        for (const fact of skill.facts) {
          expect(fact.confidence).toBeGreaterThanOrEqual(0);
          expect(fact.confidence).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("demo profiles match the spec (introvertido/extrovertido)", () => {
    const u1Vibes = DEMO_USER_1.skills.find((s) => s.domain === "vibes");
    const u2Vibes = DEMO_USER_2.skills.find((s) => s.domain === "vibes");
    expect(u1Vibes?.facts.some((f) => /introvertid/i.test(f.text))).toBe(true);
    expect(u2Vibes?.facts.some((f) => /extrovertid/i.test(f.text))).toBe(true);
  });
});

describe("allaccess app seed", () => {
  it("includes the four music/event/vibes/recommendation scopes", () => {
    const seed = buildAllAccessAppSeed();
    expect(seed.client_id).toBe("allaccess_demo");
    expect(seed.allowed_scopes_json).toEqual(
      expect.arrayContaining([
        "persona.read.music",
        "persona.read.events",
        "persona.read.vibes",
        "persona.ask.recommendation",
      ]),
    );
    expect(seed.redirect_uris_json.length).toBeGreaterThanOrEqual(2);
    expect(seed.client_secret_hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
