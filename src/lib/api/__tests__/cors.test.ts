import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { corsHeaders, isAllowedOrigin } from "@/lib/api/cors";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
  vi.restoreAllMocks();
});

describe("isAllowedOrigin", () => {
  it("accepts localhost dev origins", () => {
    expect(isAllowedOrigin("http://localhost:5173")).toBe(true);
    expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
  });

  it("accepts ALLACCESS_PROD_URL when set", () => {
    process.env.ALLACCESS_PROD_URL = "https://allaccess.example.com";
    expect(isAllowedOrigin("https://allaccess.example.com")).toBe(true);
  });

  it("accepts NEXT_PUBLIC_APP_URL when set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://twin.example.com";
    expect(isAllowedOrigin("https://twin.example.com")).toBe(true);
  });

  it("accepts vercel preview deploys", () => {
    expect(isAllowedOrigin("https://twin-pr-42.vercel.app")).toBe(true);
  });

  it("rejects unknown origins", () => {
    expect(isAllowedOrigin("https://evil.example.com")).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
    expect(isAllowedOrigin(undefined)).toBe(false);
    expect(isAllowedOrigin("")).toBe(false);
  });
});

describe("corsHeaders", () => {
  it("returns full headers for allowed origin", () => {
    const headers = corsHeaders("http://localhost:5173");
    expect(headers["Access-Control-Allow-Origin"]).toBe("http://localhost:5173");
    expect(headers["Access-Control-Allow-Methods"]).toContain("POST");
    expect(headers["Access-Control-Allow-Headers"]).toContain("Authorization");
    expect(headers["Vary"]).toBe("Origin");
  });

  it("returns empty object for disallowed origin", () => {
    expect(corsHeaders("https://evil.example.com")).toEqual({});
    expect(corsHeaders(null)).toEqual({});
  });
});
