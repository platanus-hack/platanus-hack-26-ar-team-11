import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import {
  SessionRow,
  formatDuration,
  truncateSummary,
} from "../session-row";
import type { Session } from "@/types";

const baseSession: Session = {
  id: "s1",
  twin_id: "t1",
  type: "training",
  domain: "music_taste",
  transcript_json: [],
  summary: "Sesión de música.",
  extracted_facts_json: [],
  session_index: 2,
  target_domains_json: ["music_taste"],
  duration_seconds: 720,
  started_at: "2026-04-15T18:30:00Z",
  ended_at: "2026-04-15T18:42:00Z",
  created_at: "2026-04-15T18:30:00Z",
};

describe("formatDuration", () => {
  it("formats seconds to minutes", () => {
    expect(formatDuration(720)).toBe("12 min");
  });
  it("returns dash for null", () => {
    expect(formatDuration(null)).toBe("—");
  });
  it("returns dash for zero", () => {
    expect(formatDuration(0)).toBe("—");
  });
});

describe("truncateSummary", () => {
  it("truncates long text", () => {
    const result = truncateSummary("a".repeat(200), 80);
    expect(result.length).toBeLessThanOrEqual(80);
    expect(result.endsWith("…")).toBe(true);
  });
  it("returns full text when short", () => {
    expect(truncateSummary("corto", 80)).toBe("corto");
  });
  it("handles null", () => {
    expect(truncateSummary(null)).toBe("Sin resumen.");
  });
});

describe("SessionRow", () => {
  it("renders training slot label", () => {
    const html = renderToString(<SessionRow session={baseSession} />);
    expect(html).toContain("Slot 3");
    expect(html).toContain("Music taste");
    expect(html).toContain("12 min");
  });

  it("renders chat label when session_index is null", () => {
    const html = renderToString(
      <SessionRow session={{ ...baseSession, session_index: null, domain: null }} />,
    );
    expect(html).toContain("Chat");
    expect(html).toContain("Síntesis");
  });
});
