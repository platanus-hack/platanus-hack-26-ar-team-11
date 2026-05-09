import { describe, expect, it } from "vitest";
import type { Domain, Fact, TwinSkill } from "@/types";
import { CURRICULUM } from "../curriculum";
import { buildSystemPrompt, type TwinState } from "../prompt";

function fact(domain: Domain, text: string, confidence: number, idx = 0): Fact {
  return {
    id: `f_${domain}_${idx}`,
    text,
    confidence,
    source_session_id: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

function skill(domain: Domain, facts: Fact[]): TwinSkill {
  const confidence =
    facts.length === 0
      ? 0
      : facts.reduce((acc, f) => acc + f.confidence, 0) / facts.length;
  return {
    id: `sk_${domain}`,
    twin_id: "tw_1",
    domain,
    confidence,
    facts,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}

const emptyTwin: TwinState = { name: null, summary: null, skills: [] };

describe("buildSystemPrompt", () => {
  it("includes identity, style rules, slot info and depth blurb", () => {
    const out = buildSystemPrompt({ slot: CURRICULUM[0], twin: emptyTwin });
    expect(out).toContain("# Identidad");
    expect(out).toContain("# Reglas de estilo");
    expect(out).toContain("# Sesión actual");
    expect(out).toContain("Modo: broad");
    expect(out).toContain("Personalidad y energía");
  });

  it("for an empty twin, mentions there are no facts yet and includes no fact text", () => {
    const out = buildSystemPrompt({ slot: CURRICULUM[0], twin: emptyTwin });
    expect(out).toContain("Todavía no hay facts conocidos");
    expect(out).not.toContain("Top genres");
  });

  it("for a populated twin, surfaces the existing domain context", () => {
    const twin: TwinState = {
      name: "Juan",
      summary: "Le gusta lo íntimo y la música indie.",
      skills: [
        skill("vibes", [
          fact("vibes", "Energía baja-media, introvertido", 0.8),
          fact("vibes", "Disfruta espacios chicos", 0.7),
        ]),
      ],
    };
    const out = buildSystemPrompt({ slot: CURRICULUM[3], twin });
    expect(out).toContain("Juan");
    expect(out).toContain("indie");
    expect(out).toContain("Personalidad y energía");
    expect(out).toContain("introvertido");
  });

  it("synthesis slot (10) explicitly recapitulates and asks for corrections", () => {
    const out = buildSystemPrompt({ slot: CURRICULUM[10], twin: emptyTwin });
    expect(out).toContain("Modo: synthesis");
    expect(out).toContain("recapitular");
    expect(out).toContain("correcciones");
  });

  it("gap_filling slot (11) targets low-confidence areas", () => {
    const out = buildSystemPrompt({ slot: CURRICULUM[11], twin: emptyTwin });
    expect(out).toContain("Modo: gap_filling");
    expect(out).toContain("menor confidence");
  });

  it("caps each fact line and keeps only top 3 per domain", () => {
    const longText = "x".repeat(500);
    const skills = [
      skill(
        "music_taste",
        [
          fact("music_taste", longText, 0.9, 1),
          fact("music_taste", "fact2", 0.8, 2),
          fact("music_taste", "fact3", 0.7, 3),
          fact("music_taste", "fact4", 0.6, 4),
          fact("music_taste", "fact5", 0.5, 5),
        ]
      ),
    ];
    const out = buildSystemPrompt({
      slot: CURRICULUM[3],
      twin: { name: null, summary: null, skills },
    });
    // truncated long fact never appears in full
    expect(out).not.toContain(longText);
    // bottom-confidence facts are dropped
    expect(out).not.toContain("fact5");
    expect(out).not.toContain("fact4");
    expect(out).toContain("fact2");
  });

  it("stays under the ~8000 char ceiling on a worst-case input", () => {
    const skills: TwinSkill[] = (
      ["music_taste", "event_preferences", "vibes", "communication_style"] as Domain[]
    ).map((d) =>
      skill(
        d,
        Array.from({ length: 8 }, (_, i) =>
          fact(d, "x".repeat(140), 0.9 - i * 0.05, i)
        )
      )
    );
    const out = buildSystemPrompt({
      slot: CURRICULUM[6],
      twin: {
        name: "Juan Ignacio",
        summary: "y".repeat(400),
        skills,
      },
    });
    expect(out.length).toBeLessThan(8000);
  });
});
