import { loadTwinSkills } from "./post-session.js";
import { getWorkerSupabase } from "./supabase.js";
import type { TwinSkill } from "../src/types/index.js";

export interface LoadedTwin {
  name: string | null;
  summary: string | null;
  skills: TwinSkill[];
}

const getAdminClient = getWorkerSupabase;

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
