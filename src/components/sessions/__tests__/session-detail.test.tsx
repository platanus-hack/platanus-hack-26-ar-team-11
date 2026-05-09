import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { SessionDetail } from "../session-detail";
import type { Session } from "@/types";

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: "s1",
    twin_id: "t1",
    type: "training",
    domain: "vibes",
    transcript_json: [
      { role: "assistant", at: "2026-04-15T18:30:00Z", text: "Hola, contame algo." },
      { role: "user", at: "2026-04-15T18:31:00Z", text: "Soy introvertido." },
    ],
    summary: "Sesión inicial.",
    extracted_facts_json: [{ domain: "vibes", text: "Introvertido.", confidence: 0.88 }],
    session_index: 0,
    target_domains_json: ["vibes"],
    duration_seconds: 600,
    started_at: "2026-04-15T18:30:00Z",
    ended_at: "2026-04-15T18:40:00Z",
    created_at: "2026-04-15T18:30:00Z",
    ...overrides,
  };
}

describe("SessionDetail", () => {
  it("renders user and assistant turns separately", () => {
    const html = renderToString(<SessionDetail session={makeSession()} />);
    expect(html).toContain("Hola, contame algo.");
    expect(html).toContain("Soy introvertido.");
    expect(html).toContain("Twin");
    expect(html).toContain("Vos");
  });

  it("renders extracted facts when present", () => {
    const html = renderToString(<SessionDetail session={makeSession()} />);
    expect(html).toContain("Facts extraídos");
    expect(html).toContain("Introvertido.");
    expect(html.replace(/<!--[^>]*-->/g, "")).toContain("88%");
  });

  it("hides facts section when empty", () => {
    const html = renderToString(
      <SessionDetail session={makeSession({ extracted_facts_json: [] })} />,
    );
    expect(html).not.toContain("Facts extraídos");
  });

  it("shows empty transcript message", () => {
    const html = renderToString(
      <SessionDetail session={makeSession({ transcript_json: [] })} />,
    );
    expect(html).toContain("Sin transcripción disponible.");
  });
});
