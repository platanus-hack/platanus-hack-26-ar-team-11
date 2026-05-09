import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { DomainCard, meanConfidence } from "../domain-card";
import type { Fact } from "@/types";

const fact = (confidence: number, text = "f"): Fact => ({
  id: `${text}-${confidence}`,
  text,
  confidence,
  source_session_id: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
});

describe("meanConfidence", () => {
  it("averages confidences", () => {
    expect(meanConfidence([fact(0.5), fact(0.9)])).toBeCloseTo(0.7, 5);
  });

  it("returns 0 for empty list", () => {
    expect(meanConfidence([])).toBe(0);
  });
});

describe("DomainCard", () => {
  it("renders empty state when no facts", () => {
    const html = renderToString(<DomainCard domain="vibes" facts={[]} />);
    expect(html).toContain("Aún no entrenamos este dominio");
  });

  it("orders facts desc by confidence", () => {
    const html = renderToString(
      <DomainCard
        domain="music_taste"
        facts={[fact(0.5, "ZAlpha"), fact(0.95, "ZBravo"), fact(0.7, "ZCharlie")]}
      />,
    );
    const idxBravo = html.indexOf("ZBravo");
    const idxCharlie = html.indexOf("ZCharlie");
    const idxAlpha = html.indexOf("ZAlpha");
    expect(idxBravo).toBeGreaterThan(-1);
    expect(idxBravo).toBeLessThan(idxCharlie);
    expect(idxCharlie).toBeLessThan(idxAlpha);
  });
});
