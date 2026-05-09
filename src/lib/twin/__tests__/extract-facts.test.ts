import { describe, expect, it } from "vitest";
import {
  buildExtractionSystemPrompt,
  buildExtractionUserMessage,
  parseExtractionPayload,
} from "../extract-facts";

describe("parseExtractionPayload", () => {
  it("parses a clean JSON payload", () => {
    const out = parseExtractionPayload(
      JSON.stringify({
        facts: [
          { domain: "music_taste", text: "Le gusta indie", confidence: 0.8 },
        ],
        summary_update: null,
      })
    );
    expect(out.facts).toHaveLength(1);
    expect(out.facts[0]).toEqual({
      domain: "music_taste",
      text: "Le gusta indie",
      confidence: 0.8,
    });
    expect(out.summary_update).toBeNull();
  });

  it("strips ```json fences", () => {
    const out = parseExtractionPayload(
      "```json\n" +
        JSON.stringify({ facts: [], summary_update: null }) +
        "\n```"
    );
    expect(out).toEqual({ facts: [], summary_update: null });
  });

  it("drops facts with unknown domains", () => {
    const out = parseExtractionPayload(
      JSON.stringify({
        facts: [
          { domain: "music_taste", text: "ok", confidence: 0.5 },
          { domain: "horoscope", text: "junk", confidence: 0.9 },
        ],
        summary_update: null,
      })
    );
    expect(out.facts).toHaveLength(1);
    expect(out.facts[0].domain).toBe("music_taste");
  });

  it("accepts the new lifestyle domains", () => {
    const out = parseExtractionPayload(
      JSON.stringify({
        facts: [
          { domain: "spending_profile", text: "Cazador de ofertas", confidence: 0.7 },
          { domain: "fashion_taste", text: "Estilo minimal en tonos neutros", confidence: 0.8 },
          { domain: "food_taste", text: "Vegetariano, le gusta el picante", confidence: 0.9 },
          { domain: "travel_style", text: "Viajero confort, prioriza buena comida", confidence: 0.75 },
        ],
        summary_update: null,
      })
    );
    expect(out.facts.map((f) => f.domain)).toEqual([
      "spending_profile",
      "fashion_taste",
      "food_taste",
      "travel_style",
    ]);
  });

  it("clamps confidence into [0,1] and defaults non-numeric to 0.5", () => {
    const out = parseExtractionPayload(
      JSON.stringify({
        facts: [
          { domain: "vibes", text: "hi", confidence: 1.7 },
          { domain: "vibes", text: "lo", confidence: -0.5 },
          { domain: "vibes", text: "missing" },
        ],
        summary_update: null,
      })
    );
    expect(out.facts.map((f) => f.confidence)).toEqual([1, 0, 0.5]);
  });

  it("truncates fact text to 140 chars", () => {
    const long = "x".repeat(500);
    const out = parseExtractionPayload(
      JSON.stringify({
        facts: [{ domain: "vibes", text: long, confidence: 0.5 }],
        summary_update: null,
      })
    );
    expect(out.facts[0].text.length).toBe(140);
  });

  it("trims and caps summary_update at 240 chars", () => {
    const long = "x".repeat(500);
    const out = parseExtractionPayload(
      JSON.stringify({ facts: [], summary_update: `   ${long}   ` })
    );
    expect(out.summary_update?.length).toBe(240);
  });

  it("treats empty/whitespace summary_update as null", () => {
    const out = parseExtractionPayload(
      JSON.stringify({ facts: [], summary_update: "   " })
    );
    expect(out.summary_update).toBeNull();
  });

  it("throws on malformed JSON", () => {
    expect(() => parseExtractionPayload("{not json}")).toThrow(/invalid JSON/);
  });

  it("returns empty payload for empty input", () => {
    expect(parseExtractionPayload("")).toEqual({
      facts: [],
      summary_update: null,
    });
  });
});

describe("prompt builders", () => {
  it("system prompt mentions the target domain when set", () => {
    const out = buildExtractionSystemPrompt("music_taste");
    expect(out).toContain("music_taste");
    expect(out).toContain("JSON");
  });

  it("system prompt enumerates all 8 domains", () => {
    const out = buildExtractionSystemPrompt(null);
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
      expect(out).toContain(domain);
    }
  });

  it("system prompt says transversal when target is null", () => {
    const out = buildExtractionSystemPrompt(null);
    expect(out).toContain("transversal");
  });

  it("user message includes transcript turns and known facts", () => {
    const msg = buildExtractionUserMessage({
      transcript: [
        { role: "user", at: "t1", text: "Hola" },
        { role: "assistant", at: "t2", text: "qué tal?" },
      ],
      twinSkills: [
        {
          id: "sk1",
          twin_id: "tw1",
          domain: "vibes",
          confidence: 0.6,
          facts: [
            {
              id: "f1",
              text: "Calmo y curioso",
              confidence: 0.6,
              source_session_id: null,
              created_at: "",
              updated_at: "",
            },
          ],
          created_at: "",
          updated_at: "",
        },
      ],
      targetDomain: "vibes",
    });
    expect(msg).toContain("[user] Hola");
    expect(msg).toContain("[assistant] qué tal?");
    expect(msg).toContain("Calmo y curioso");
    expect(msg).toContain("Target domain");
  });

  it("user message says no previous facts when twin is empty", () => {
    const msg = buildExtractionUserMessage({
      transcript: [{ role: "user", at: "t", text: "x" }],
      twinSkills: [],
      targetDomain: null,
    });
    expect(msg).toContain("sin facts previos");
  });
});
