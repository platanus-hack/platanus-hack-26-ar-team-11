import { createClient as createServiceClient } from "@supabase/supabase-js";

/**
 * Server-only admin client using service role key.
 * Bypasses RLS — use only for trusted server code (seed scripts, worker, etc).
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createServiceClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
