import { describe, expect, it } from "vitest";
import type { Domain, TwinSkill } from "@/types";
import {
  buildSummaryUserMessage,
  computeCompletion,
  meanSkillConfidence,
} from "../recompute";

function skill(domain: Domain, confidence: number): TwinSkill {
  return {
    id: `sk_${domain}`,
    twin_id: "tw1",
    domain,
    confidence,
    facts: [],
    created_at: "",
    updated_at: "",
  };
}

describe("computeCompletion", () => {
  it("returns 0 for an empty user", () => {
    expect(
      computeCompletion({ sessionsCompleted: 0, meanConfidence: 0 })
    ).toBe(0);
  });

  it("hits 1.0 when all 8 sessions are done and confidence is 1", () => {
    expect(
      computeCompletion({ sessionsCompleted: 8, meanConfidence: 1 })
    ).toBe(1);
  });

  it("uses 50/50 weighting between sessions and confidence", () => {
    expect(
      computeCompletion({ sessionsCompleted: 4, meanConfidence: 0.7 })
    ).toBeCloseTo(0.5 * 0.5 + 0.5 * 0.7, 2);
  });

  it("caps at 100% once the training target is reached", () => {
    expect(
      computeCompletion({ sessionsCompleted: 12, meanConfidence: 0.5 })
    ).toBe(1);
    expect(
      computeCompletion({ sessionsCompleted: 8, meanConfidence: 0 })
    ).toBe(1);
  });

  it("clamps mean confidence into [0,1]", () => {
    expect(
      computeCompletion({ sessionsCompleted: 0, meanConfidence: 1.5 })
    ).toBe(0.5);
    expect(
      computeCompletion({ sessionsCompleted: 0, meanConfidence: -0.4 })
    ).toBe(0);
  });
});

describe("meanSkillConfidence", () => {
  it("returns 0 for an empty list", () => {
    expect(meanSkillConfidence([])).toBe(0);
  });

  it("averages confidences", () => {
    expect(
      meanSkillConfidence([
        skill("vibes", 0.4),
        skill("music_taste", 0.8),
      ])
    ).toBeCloseTo(0.6);
  });
});

describe("buildSummaryUserMessage", () => {
  it("returns a no-data marker when no skill has facts", () => {
    expect(buildSummaryUserMessage([])).toContain("No facts known");
  });

  it("groups facts by domain and lists the top 5 by confidence", () => {
    const tw: TwinSkill = {
      ...skill("music_taste", 0.7),
      facts: Array.from({ length: 8 }, (_, i) => ({
        id: `f${i}`,
        text: `fact ${i}`,
        confidence: 0.9 - i * 0.05,
        source_session_id: null,
        created_at: "",
        updated_at: "",
      })),
    };
    const out = buildSummaryUserMessage([tw]);
    expect(out).toContain("music_taste");
    expect(out).toContain("fact 0");
    expect(out).toContain("fact 4");
    // Anything past index 4 should be omitted (top 5).
    expect(out).not.toContain("fact 5");
    expect(out).not.toContain("fact 7");
  });
});
