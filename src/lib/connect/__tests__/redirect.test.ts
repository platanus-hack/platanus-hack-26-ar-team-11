import { describe, expect, it } from "vitest";
import {
  buildApprovedUrl,
  buildDenyUrl,
  buildRedirectUrl,
} from "@/lib/connect/redirect";

describe("buildRedirectUrl", () => {
  it("appends params to bare URL", () => {
    expect(
      buildRedirectUrl("https://app.com/callback", { foo: "bar" }),
    ).toBe("https://app.com/callback?foo=bar");
  });

  it("preserves existing query string", () => {
    const url = buildRedirectUrl("https://app.com/cb?keep=1", { foo: "bar" });
    expect(url).toContain("keep=1");
    expect(url).toContain("foo=bar");
  });

  it("URL-encodes special characters", () => {
    const url = buildRedirectUrl("https://app.com/cb", { state: "a b/c" });
    expect(url).toContain("state=a+b%2Fc");
  });

  it("skips undefined/empty values", () => {
    const url = buildRedirectUrl("https://app.com/cb", {
      foo: "bar",
      empty: "",
      missing: undefined,
    });
    expect(url).toBe("https://app.com/cb?foo=bar");
  });
});

describe("buildDenyUrl", () => {
  it("adds error=user_denied with state", () => {
    expect(buildDenyUrl("https://app.com/cb", "abc")).toBe(
      "https://app.com/cb?error=user_denied&state=abc",
    );
  });

  it("works without state", () => {
    expect(buildDenyUrl("https://app.com/cb")).toBe(
      "https://app.com/cb?error=user_denied",
    );
  });
});

describe("buildApprovedUrl", () => {
  it("includes all tokens and state", () => {
    const url = buildApprovedUrl(
      "https://app.com/cb",
      "conn-123",
      "tok-abc",
      "csrf-xyz",
    );
    expect(url).toContain("connection_id=conn-123");
    expect(url).toContain("access_token=tok-abc");
    expect(url).toContain("state=csrf-xyz");
  });

  it("omits state when missing", () => {
    const url = buildApprovedUrl("https://app.com/cb", "c", "t");
    expect(url).not.toContain("state=");
  });
});
