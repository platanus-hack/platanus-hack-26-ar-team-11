import { createClient } from "@/lib/supabase/server";
import type { AppConnection, ConnectionStatus, DeveloperApp, Intent, QueryLog, Scope } from "@/types";

export interface ConnectionWithApp extends AppConnection {
  app: Pick<DeveloperApp, "id" | "name" | "description" | "client_id" | "allowed_scopes_json">;
}

interface ConnectionRow {
  id: string;
  user_id: string;
  twin_id: string;
  app_id: string;
  scopes_json: Scope[] | null;
  status: ConnectionStatus;
  access_token_hash: string;
  created_at: string;
  revoked_at: string | null;
  developer_apps: {
    id: string;
    name: string;
    description: string | null;
    client_id: string;
    allowed_scopes_json: Scope[] | null;
  } | null;
}

export async function listConnectionsForUser(
  userId: string,
  opts?: { includeRevoked?: boolean },
): Promise<ConnectionWithApp[]> {
  const supabase = await createClient();
  let query = supabase
    .from("app_connections")
    .select(
      "id, user_id, twin_id, app_id, scopes_json, status, access_token_hash, created_at, revoked_at, developer_apps(id, name, description, client_id, allowed_scopes_json)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!opts?.includeRevoked) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as unknown as ConnectionRow[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    twin_id: row.twin_id,
    app_id: row.app_id,
    scopes_json: row.scopes_json ?? [],
    status: row.status,
    access_token_hash: row.access_token_hash,
    created_at: row.created_at,
    revoked_at: row.revoked_at,
    app: {
      id: row.developer_apps?.id ?? row.app_id,
      name: row.developer_apps?.name ?? "Unknown app",
      description: row.developer_apps?.description ?? null,
      client_id: row.developer_apps?.client_id ?? "",
      allowed_scopes_json: row.developer_apps?.allowed_scopes_json ?? [],
    },
  }));
}

export async function listRecentLogsForConnection(
  connectionId: string,
  limit = 5,
): Promise<QueryLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("query_logs")
    .select("*")
    .eq("connection_id", connectionId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as QueryLog[];
}

export interface RevokeResult {
  ok: boolean;
  error?: string;
}

export async function revokeConnection(
  connectionId: string,
  userId: string,
): Promise<RevokeResult> {
  const supabase = await createClient();
  const { data: existing, error: selectErr } = await supabase
    .from("app_connections")
    .select("id, user_id, status")
    .eq("id", connectionId)
    .maybeSingle();
  if (selectErr) return { ok: false, error: "select_failed" };
  if (!existing) return { ok: false, error: "not_found" };
  if (existing.user_id !== userId) return { ok: false, error: "forbidden" };
  if (existing.status === "revoked") return { ok: true };

  const { error } = await supabase
    .from("app_connections")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", connectionId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: "update_failed" };
  return { ok: true };
}

export const INTENT_LABELS: Record<Intent | string, string> = {
  event_recommendation: "Recomendación de evento",
  event_ranking: "Ranking de eventos",
  domain_summary: "Resumen de dominio",
  general_summary: "Resumen general",
};
