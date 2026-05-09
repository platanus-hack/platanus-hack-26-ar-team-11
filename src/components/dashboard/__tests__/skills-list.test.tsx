import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { SkillsList } from "../skills-list";
import type { TwinSkill } from "@/types";

function makeSkill(domain: TwinSkill["domain"], confidence: number, factsCount = 1): TwinSkill {
  return {
    id: `s-${domain}`,
    twin_id: "t1",
    domain,
    confidence,
    facts: Array.from({ length: factsCount }, (_, i) => ({
      id: `${domain}-${i}`,
      text: `f${i}`,
      confidence,
      source_session_id: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    })),
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("SkillsList", () => {
  it("orders learned skills by confidence desc", () => {
    const html = renderToString(
      <SkillsList
        skills={[
          makeSkill("vibes", 0.6),
          makeSkill("music_taste", 0.9),
          makeSkill("event_preferences", 0.75),
        ]}
        pending={[]}
      />,
    );
    const idxMusic = html.indexOf("Música");
    const idxEvents = html.indexOf("Eventos");
    const idxVibes = html.indexOf("Vibe");
    expect(idxMusic).toBeGreaterThan(-1);
    expect(idxMusic).toBeLessThan(idxEvents);
    expect(idxEvents).toBeLessThan(idxVibes);
  });

  it("renders pending domains list", () => {
    const html = renderToString(
      <SkillsList skills={[]} pending={["music_taste", "vibes"]} />,
    );
    expect(html).toContain("Pendientes");
    expect(html).toContain("Música");
    expect(html).toContain("Vibe");
  });

  it("hides pending section when empty", () => {
    const html = renderToString(<SkillsList skills={[makeSkill("vibes", 0.8)]} pending={[]} />);
    expect(html).not.toContain("Pendientes");
  });
});
