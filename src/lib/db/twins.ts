import { createClient } from "@/lib/supabase/server";
import type { Domain, Fact, Twin, TwinSkill } from "@/types";
import { ALL_DOMAINS } from "@/types";

export interface TwinWithSkills {
  twin: Twin;
  skills: TwinSkill[];
}

interface TwinSkillRow {
  id: string;
  twin_id: string;
  domain: Domain;
  confidence: number | string;
  facts_json: Fact[] | null;
  created_at: string;
  updated_at: string;
}

function rowToSkill(row: TwinSkillRow): TwinSkill {
  return {
    id: row.id,
    twin_id: row.twin_id,
    domain: row.domain,
    confidence: typeof row.confidence === "string" ? Number(row.confidence) : row.confidence,
    facts: row.facts_json ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getTwinForUser(userId: string): Promise<TwinWithSkills | null> {
  const supabase = await createClient();

  const { data: twin, error: twinErr } = await supabase
    .from("twins")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (twinErr || !twin) return null;

  const { data: skillRows } = await supabase
    .from("twin_skills")
    .select("*")
    .eq("twin_id", twin.id);

  const skills = (skillRows ?? []).map((row) => rowToSkill(row as TwinSkillRow));
  return { twin: twin as Twin, skills };
}

export function skillByDomain(skills: TwinSkill[], domain: Domain): TwinSkill | undefined {
  return skills.find((s) => s.domain === domain);
}

export function pendingDomains(skills: TwinSkill[]): Domain[] {
  const present = new Set(skills.filter((s) => s.facts.length > 0).map((s) => s.domain));
  return ALL_DOMAINS.filter((d) => !present.has(d));
}
