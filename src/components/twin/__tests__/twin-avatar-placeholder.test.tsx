import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { TwinAvatarPlaceholder } from "../twin-avatar-placeholder";

describe("TwinAvatarPlaceholder", () => {
  it("renders with aria-label and default size", () => {
    const html = renderToString(<TwinAvatarPlaceholder />);
    expect(html).toContain('aria-label="Twin avatar"');
    expect(html).toContain("h-32 w-32");
  });

  it("uses sm size class when size=sm", () => {
    const html = renderToString(<TwinAvatarPlaceholder size="sm" />);
    expect(html).toContain("h-16 w-16");
  });

  it("renders glow halo when completion > 0.8", () => {
    const html = renderToString(<TwinAvatarPlaceholder completion={0.9} />);
    expect(html).toContain("twin-halo");
  });

  it("does not render glow when completion is low", () => {
    const html = renderToString(<TwinAvatarPlaceholder completion={0.3} />);
    expect(html).not.toContain('fill="url(#twin-halo)"');
  });

  it("respects explicit glow prop overriding completion", () => {
    const html = renderToString(<TwinAvatarPlaceholder completion={0.1} glow />);
    expect(html).toContain('fill="url(#twin-halo)"');
  });
});
