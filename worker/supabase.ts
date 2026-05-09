import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import WebSocket from "ws";

/**
 * Shared admin Supabase client for worker code.
 * Cached per process. Uses 'ws' as WebSocket transport because supabase-js
 * >= 2.105 requires explicit WebSocket on Node < 22.
 */
let cachedClient: SupabaseClient | null = null;

export function getWorkerSupabase(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
  });
  return cachedClient;
}
