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
  });

  it("clamps completion above 1", () => {
    const html = strip(renderToString(<CompletionWidget completion={1.5} sessionIndex={8} />));
    expect(html).toContain(">100%<");
  });

  it("clamps below 0", () => {
    const html = strip(renderToString(<CompletionWidget completion={-0.2} sessionIndex={0} />));
    expect(html).toContain(">0%<");
  });

  it("forces 100% when training is complete", () => {
    const html = strip(renderToString(<CompletionWidget completion={0.71} sessionIndex={8} />));
    expect(html).toContain(">100%<");
  });
});
