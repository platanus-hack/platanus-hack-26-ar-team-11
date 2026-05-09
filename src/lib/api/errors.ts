import { NextResponse } from "next/server";
import type { ApiError, ApiErrorCode } from "@/types/api";

export type { ApiError, ApiErrorCode };

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>,
): NextResponse<ApiError> {
  const body: ApiError = {
    error: { code, message, ...(details ? { details } : {}) },
  };
  return NextResponse.json(body, { status });
}

export function unauthorized(message = "Authentication required") {
  return apiError("unauthorized", message, 401);
}

export function forbidden(message = "Forbidden") {
  return apiError("forbidden", message, 403);
}

export function missingScope(scope: string) {
  return apiError(
    "missing_scope",
    `The access token is missing scope ${scope}.`,
    403,
    { scope },
  );
}

export function blockedDomain(domain: string) {
  return apiError(
    "blocked_domain",
    `Domain ${domain} is not exposed by the Twin.`,
    403,
    { domain },
  );
}

export function connectionRevoked() {
  return apiError("connection_revoked", "Connection has been revoked.", 403);
}

export function invalidIntent(intent: string) {
  return apiError("invalid_intent", `Unknown intent: ${intent}`, 400, { intent });
}

export function badRequest(message: string, details?: Record<string, unknown>) {
  return apiError("bad_request", message, 400, details);
}

export function notFound(resource: string) {
  return apiError("not_found", `${resource} not found`, 404);
}

export function internal(message = "Internal server error") {
  return apiError("internal", message, 500);
}
