import type { Domain } from "@/types/twin";
import { createAdminClient } from "@/lib/supabase/admin";

export interface TwinSkillSlim {
  domain: Domain;
  confidence: number;
  facts: { text: string; confidence: number }[];
}

export interface TwinContext {
  skills: TwinSkillSlim[];
  meanConfidence: number;
}

export async function loadTwinContext(twin_id: string): Promise<TwinContext> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("twin_skills")
    .select("domain, confidence, facts_json")
    .eq("twin_id", twin_id);

  if (error) {
    console.error("[twin-context] skills load failed", error);
    return { skills: [], meanConfidence: 0 };
  }

  const skills: TwinSkillSlim[] = [];
  for (const row of data ?? []) {
    const facts = (row.facts_json as { text: string; confidence: number }[]) ?? [];
    skills.push({
      domain: row.domain as Domain,
      confidence: Number(row.confidence) || 0,
      facts: facts.map((f) => ({
        text: String(f.text ?? ""),
        confidence: Number(f.confidence) || 0,
      })),
    });
  }

  const populated = skills.filter((s) => s.confidence > 0);
  const meanConfidence =
    populated.length === 0
      ? 0
      : populated.reduce((sum, s) => sum + s.confidence, 0) / populated.length;

  return { skills, meanConfidence };
}

export function formatSkillsForPrompt(context: TwinContext): string {
  if (context.skills.length === 0) {
    return "(no facts available — Twin not yet trained)";
  }
  const blocks: string[] = [];
  for (const skill of context.skills) {
    if (skill.facts.length === 0) continue;
    const facts = skill.facts.map((f) => `  - ${f.text}`).join("\n");
    blocks.push(
      `${skill.domain} (confidence ${skill.confidence.toFixed(2)}):\n${facts}`,
    );
  }
  if (blocks.length === 0) return "(no facts available)";
  return blocks.join("\n");
}
