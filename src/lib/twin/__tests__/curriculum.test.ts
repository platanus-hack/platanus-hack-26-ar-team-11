import { describe, expect, it } from "vitest";
import { CURRICULUM, getCurriculumSlot } from "../curriculum";

describe("CURRICULUM", () => {
  it("has exactly 8 slots", () => {
    expect(CURRICULUM).toHaveLength(8);
  });

  it("uses consecutive indexes starting at 0", () => {
    CURRICULUM.forEach((slot, i) => {
      expect(slot.index).toBe(i);
    });
  });

  it("ends with synthesis then gap_filling and null target_domain", () => {
    expect(CURRICULUM[6].target_depth).toBe("synthesis");
    expect(CURRICULUM[6].target_domain).toBeNull();
    expect(CURRICULUM[7].target_depth).toBe("gap_filling");
    expect(CURRICULUM[7].target_domain).toBeNull();
  });

  it("has at least 3 focus areas per slot", () => {
    CURRICULUM.forEach((slot) => {
      expect(slot.focus_areas.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe("getCurriculumSlot", () => {
  it("returns the slot at the given index", () => {
    expect(getCurriculumSlot(0)).toBe(CURRICULUM[0]);
    expect(getCurriculumSlot(7)).toBe(CURRICULUM[7]);
  });

  it("throws for out-of-range indexes", () => {
    expect(() => getCurriculumSlot(-1)).toThrow();
    expect(() => getCurriculumSlot(8)).toThrow();
  });
});
