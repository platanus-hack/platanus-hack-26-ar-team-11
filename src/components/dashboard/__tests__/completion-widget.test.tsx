import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { CompletionWidget } from "../completion-widget";

function strip(html: string): string {
  return html.replace(/<!--[^>]*-->/g, "");
}

describe("CompletionWidget", () => {
  it("renders rounded percent", () => {
    const html = strip(renderToString(<CompletionWidget completion={0.62} sessionIndex={5} />));
    expect(html).toContain(">62%<");
    expect(html).toContain("Sesión 6 de 12");
  });

  it("clamps completion above 1", () => {
    const html = strip(renderToString(<CompletionWidget completion={1.5} sessionIndex={12} />));
    expect(html).toContain(">100%<");
  });

  it("clamps below 0", () => {
    const html = strip(renderToString(<CompletionWidget completion={-0.2} sessionIndex={0} />));
    expect(html).toContain(">0%<");
    expect(html).toContain("Sesión 1 de 12");
  });

  it("shows complete copy when sessionIndex >= total", () => {
    const html = strip(renderToString(<CompletionWidget completion={1} sessionIndex={12} />));
    expect(html).toMatch(/Twin completo/);
  });
});
