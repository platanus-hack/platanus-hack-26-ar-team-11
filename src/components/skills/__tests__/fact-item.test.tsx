import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { FactItem } from "../fact-item";

describe("FactItem", () => {
  it("uses lilac color for low confidence", () => {
    const html = renderToString(<FactItem text="x" confidence={0.3} />);
    expect(html).toContain("bg-lilac");
    expect(html).not.toContain("bg-primary");
    expect(html).toContain("Bajo");
  });

  it("uses dusty for mid confidence", () => {
    const html = renderToString(<FactItem text="x" confidence={0.65} />);
    expect(html).toContain("bg-dusty");
    expect(html).toContain("Medio");
  });

  it("uses primary for high confidence", () => {
    const html = renderToString(<FactItem text="x" confidence={0.9} />);
    expect(html).toContain("bg-primary");
    expect(html).toContain("Alto");
  });

  it("renders rounded percent", () => {
    const html = renderToString(<FactItem text="x" confidence={0.834} />);
    expect(html.replace(/<!--[^>]*-->/g, "")).toContain("83%");
  });
});
