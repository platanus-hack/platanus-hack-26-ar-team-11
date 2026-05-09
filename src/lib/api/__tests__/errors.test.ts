import { describe, expect, it } from "vitest";
import {
  apiError,
  badRequest,
  blockedDomain,
  connectionRevoked,
  forbidden,
  internal,
  invalidIntent,
  missingScope,
  notFound,
  unauthorized,
} from "@/lib/api/errors";
import type { ApiError } from "@/types/api";

async function readJson(res: Response): Promise<ApiError> {
  return (await res.json()) as ApiError;
}

describe("api errors", () => {
  it("apiError builds canonical shape", async () => {
    const res = apiError("bad_request", "boom", 418, { foo: 1 });
    expect(res.status).toBe(418);
    const body = await readJson(res);
    expect(body).toEqual({
      error: { code: "bad_request", message: "boom", details: { foo: 1 } },
    });
  });

  it("apiError omits details when not provided", async () => {
    const res = apiError("internal", "x", 500);
    const body = await readJson(res);
    expect(body.error.details).toBeUndefined();
  });

  it("unauthorized → 401", async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    expect((await readJson(res)).error.code).toBe("unauthorized");
  });

  it("forbidden → 403", async () => {
    const res = forbidden();
    expect(res.status).toBe(403);
  });

  it("missingScope includes scope in details", async () => {
    const res = missingScope("persona.read.events");
    expect(res.status).toBe(403);
    const body = await readJson(res);
    expect(body.error.code).toBe("missing_scope");
    expect(body.error.details).toEqual({ scope: "persona.read.events" });
  });

  it("blockedDomain includes domain in details", async () => {
    const res = blockedDomain("politics");
    const body = await readJson(res);
    expect(body.error.code).toBe("blocked_domain");
    expect(body.error.details).toEqual({ domain: "politics" });
  });

  it("connectionRevoked → 403", async () => {
    const res = connectionRevoked();
    expect(res.status).toBe(403);
    expect((await readJson(res)).error.code).toBe("connection_revoked");
  });

  it("invalidIntent → 400", async () => {
    const res = invalidIntent("foo");
    expect(res.status).toBe(400);
    const body = await readJson(res);
    expect(body.error.code).toBe("invalid_intent");
    expect(body.error.details).toEqual({ intent: "foo" });
  });

  it("badRequest → 400", async () => {
    const res = badRequest("bad");
    expect(res.status).toBe(400);
  });

  it("notFound → 404", async () => {
    const res = notFound("Twin");
    expect(res.status).toBe(404);
    expect((await readJson(res)).error.message).toContain("Twin");
  });

  it("internal → 500", async () => {
    const res = internal();
    expect(res.status).toBe(500);
  });
});
