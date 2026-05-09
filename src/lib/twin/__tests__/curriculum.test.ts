import { describe, expect, it } from "vitest";
import { CURRICULUM, getCurriculumSlot } from "../curriculum";

describe("CURRICULUM", () => {
  it("has exactly 12 slots", () => {
    expect(CURRICULUM).toHaveLength(12);
  });

  it("uses consecutive indexes starting at 0", () => {
    CURRICULUM.forEach((slot, i) => {
      expect(slot.index).toBe(i);
    });
  });

  it("ends with synthesis then gap_filling and null target_domain", () => {
    expect(CURRICULUM[10].target_depth).toBe("synthesis");
    expect(CURRICULUM[10].target_domain).toBeNull();
    expect(CURRICULUM[11].target_depth).toBe("gap_filling");
    expect(CURRICULUM[11].target_domain).toBeNull();
  });

  it("has at least 3 focus areas per slot", () => {
    CURRICULUM.forEach((slot) => {
      expect(slot.focus_areas.length).toBeGreaterThanOrEqual(3);
    });
  });

  it("covers every domain at least once with a broad slot", () => {
    const broadDomains = new Set(
      CURRICULUM.filter((s) => s.target_depth === "broad").map(
        (s) => s.target_domain,
      ),
    );
    for (const domain of [
      "vibes",
      "communication_style",
      "spending_profile",
      "music_taste",
      "event_preferences",
      "fashion_taste",
      "food_taste",
      "travel_style",
    ]) {
      expect(broadDomains).toContain(domain);
    }
  });
});

describe("getCurriculumSlot", () => {
  it("returns the slot at the given index", () => {
    expect(getCurriculumSlot(0)).toBe(CURRICULUM[0]);
    expect(getCurriculumSlot(11)).toBe(CURRICULUM[11]);
  });

  it("throws for out-of-range indexes", () => {
    expect(() => getCurriculumSlot(-1)).toThrow();
    expect(() => getCurriculumSlot(12)).toThrow();
  });
});
