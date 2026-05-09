import { describe, expect, it } from "vitest";
import { isCorrect, normalizeAnswer } from "../match";

describe("normalizeAnswer", () => {
  it("strips punctuation, casing and extra spaces", () => {
    expect(normalizeAnswer("  I  EAT, an Apple. ")).toBe("i eat an apple");
  });
  it("strips diacritics", () => {
    expect(normalizeAnswer("Cómo estás")).toBe("como estas");
  });
});

describe("isCorrect", () => {
  it("matches with different casing and punctuation", () => {
    expect(isCorrect("I eat an apple", "I eat an apple.")).toBe(true);
    expect(isCorrect("i eat an apple!", "I eat an apple.")).toBe(true);
  });
  it("rejects empty input", () => {
    expect(isCorrect("", "I eat an apple.")).toBe(false);
    expect(isCorrect("   ", "I eat an apple.")).toBe(false);
  });
  it("rejects different content", () => {
    expect(isCorrect("I eat a banana", "I eat an apple.")).toBe(false);
  });
});
