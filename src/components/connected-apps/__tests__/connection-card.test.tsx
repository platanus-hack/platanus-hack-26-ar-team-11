import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { ConnectionCard } from "../connection-card";
import type { ConnectionWithApp } from "@/lib/db/connections";
import type { QueryLog } from "@/types";

const connection: ConnectionWithApp = {
  id: "c1",
  user_id: "u1",
  twin_id: "t1",
  app_id: "a1",
  scopes_json: ["persona.read.music", "persona.read.events"],
  status: "active",
  access_token_hash: "hash",
  created_at: "2026-04-01T10:00:00Z",
  revoked_at: null,
  app: {
    id: "a1",
    name: "AllAccess",
    description: "Tickets para conciertos",
    client_id: "allaccess_demo",
    allowed_scopes_json: [
      "persona.read.music",
      "persona.read.events",
      "persona.read.vibes",
      "persona.ask.recommendation",
    ],
  },
};

const logs: QueryLog[] = [
  {
    id: "l1",
    connection_id: "c1",
    user_id: "u1",
    twin_id: "t1",
    app_id: "a1",
    intent: "event_recommendation",
    question: "¿Le gustaría a Manu este show?",
    response_summary: null,
    allowed: true,
    blocked_reason: null,
    scopes_used_json: ["persona.read.music"],
    created_at: new Date(Date.now() - 30 * 60_000).toISOString(),
  },
  {
    id: "l2",
    connection_id: "c1",
    user_id: "u1",
    twin_id: "t1",
    app_id: "a1",
    intent: "domain_summary",
    question: "Información sensible",
    response_summary: null,
    allowed: false,
    blocked_reason: "scope_missing",
    scopes_used_json: [],
    created_at: new Date(Date.now() - 60 * 60_000).toISOString(),
  },
];

describe("ConnectionCard", () => {
  it("renders app name and description", () => {
    const html = renderToString(<ConnectionCard connection={connection} logs={logs} />);
    expect(html).toContain("AllAccess");
    expect(html).toContain("Tickets para conciertos");
  });

  it("shows granted scopes with check and ungranted with x", () => {
    const html = renderToString(<ConnectionCard connection={connection} logs={logs} />);
    expect(html).toContain("Music taste");
    expect(html).toContain("Event preferences");
    expect(html).toContain("Personality &amp; vibes");
    expect(html).toContain("Personalized recommendations");
  });

  it("renders allowed and blocked logs", () => {
    const html = renderToString(<ConnectionCard connection={connection} logs={logs} />)
      .replace(/<!--[^>]*-->/g, "");
    expect(html).toContain("Recomendación de evento");
    expect(html).toContain("Resumen de dominio");
    expect(html).toContain("Bloqueada: scope_missing");
  });

  it("shows empty state when no logs", () => {
    const html = renderToString(<ConnectionCard connection={connection} logs={[]} />);
    expect(html).toContain("Aún no hubo consultas.");
  });
});
