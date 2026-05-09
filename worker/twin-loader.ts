import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadTwinSkills } from "./post-session.js";
import type { TwinSkill } from "../src/types/index.js";

export interface LoadedTwin {
  name: string | null;
  summary: string | null;
  skills: TwinSkill[];
}

let cachedClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (cachedClient) return cachedClient;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  cachedClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export async function loadTwinState(twinId: string): Promise<LoadedTwin> {
  const client = getAdminClient();

  const { data: twin } = await client
    .from("twins")
    .select("name, summary")
    .eq("id", twinId)
    .maybeSingle();

  const skills = await loadTwinSkills(client, twinId).catch(() => []);

  return {
    name: (twin?.name as string | null) ?? null,
    summary: (twin?.summary as string | null) ?? null,
    skills,
  };
}
