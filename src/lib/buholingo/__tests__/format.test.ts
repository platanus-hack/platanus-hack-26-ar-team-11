import { describe, expect, it } from "vitest";
import {
  buildPreviews,
  formatGeneralPreview,
  formatMusicPreview,
  formatVibesPreview,
} from "../format";

describe("formatGeneralPreview", () => {
  it("returns the summary as-is when short", () => {
    expect(formatGeneralPreview({ summary: "Le copa el indie." })).toBe(
      "Le copa el indie.",
    );
  });
  it("shortens long summaries respecting periods", () => {
    const long =
      "Le copa la música indie y los recitales chicos. " +
      "Suele preferir bandas locales y volver caminando del show. " +
      "Esto sigue mucho más.";
    const out = formatGeneralPreview({ summary: long });
    expect(out.length).toBeLessThanOrEqual(160);
  });
  it("falls back when summary is missing", () => {
    expect(formatGeneralPreview({})).toMatch(/todavía/i);
    expect(formatGeneralPreview(null)).toMatch(/todavía/i);
  });
});

describe("formatMusicPreview", () => {
  it("joins genres and artists", () => {
    const out = formatMusicPreview({
      data: {
        top_genres: ["indie", "rock"],
        favorite_artists: ["Tormenta Negra"],
      },
    });
    expect(out).toContain("indie");
    expect(out).toContain("Tormenta Negra");
  });
  it("handles missing fields", () => {
    expect(formatMusicPreview({ data: {} })).toMatch(/no tiene música/i);
  });
});

describe("formatVibesPreview", () => {
  it("joins tags + mood + energy", () => {
    const out = formatVibesPreview({
      data: {
        tags: ["introvertido", "minimalista"],
        mood: "reflexivo",
        social_energy: "low-key",
      },
    });
    expect(out).toContain("introvertido");
    expect(out).toContain("reflexivo");
    expect(out).toContain("low-key");
  });
  it("falls back when nothing is set", () => {
    expect(formatVibesPreview({ data: {} })).toMatch(/no tiene vibes/i);
  });
});

describe("buildPreviews", () => {
  it("returns 3 previews with stable titles", () => {
    const previews = buildPreviews({
      general: { summary: "Hola." },
      music: { data: { top_genres: ["indie"] } },
      vibes: { data: { tags: ["introvertido"] } },
    });
    expect(previews).toHaveLength(3);
    expect(previews.map((p) => p.title)).toEqual(["Perfil", "Música", "Vibe"]);
  });
});
