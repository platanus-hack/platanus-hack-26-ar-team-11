import { createAdminClient } from "@/lib/supabase/admin";
import type { AppConnection } from "@/types/apps";
import { verifyAccessToken } from "./tokens";

export type ValidationFailureReason =
  | "not_found"
  | "invalid_token"
  | "revoked"
  | "expired";

export interface ValidationFailure {
  ok: false;
  reason: ValidationFailureReason;
}

export interface ValidationSuccess {
  ok: true;
  connection: AppConnection;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Validates a (connection_id, access_token) pair against app_connections.
 * Returns the row when active and token matches, otherwise a failure reason.
 */
export async function validateConnection(
  connection_id: string,
  access_token: string,
): Promise<ValidationResult> {
  if (!connection_id || !access_token) {
    return { ok: false, reason: "not_found" };
  }
  if (!isUuid(connection_id)) {
    return { ok: false, reason: "not_found" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("app_connections")
    .select("*")
    .eq("id", connection_id)
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "not_found" };
  }

  const row = data as AppConnection;
  if (!verifyAccessToken(access_token, row.access_token_hash)) {
    return { ok: false, reason: "invalid_token" };
  }
  if (row.status === "revoked") {
    return { ok: false, reason: "revoked" };
  }
  if (row.status === "expired") {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, connection: row };
}

/**
 * Convenience wrapper that returns the row if active+valid, else null.
 */
export async function getActiveConnection(
  connection_id: string,
  access_token: string,
): Promise<AppConnection | null> {
  const result = await validateConnection(connection_id, access_token);
  return result.ok ? result.connection : null;
}
