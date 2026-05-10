import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Domain,
  Fact,
  TwinProfileJson,
  TwinSkill,
} from "@/types";

export const TARGET_TRAINING_SESSIONS = 12;
export const MAX_SESSION_INDEX = TARGET_TRAINING_SESSIONS;

export interface RecomputeOptions {
  client: SupabaseClient;
  twinId: string;
}

export interface CompletionInputs {
  sessionsCompleted: number;
  meanConfidence: number;
}

// Mientras el entrenamiento corre: progreso = sesiones completadas.
// Al llegar al target: 100% (la confidence se refleja en otros widgets).
export function computeCompletion({
  sessionsCompleted,
  meanConfidence,
}: CompletionInputs): number {
  if (sessionsCompleted >= TARGET_TRAINING_SESSIONS) return 1;
  const sessionPart = sessionsCompleted / TARGET_TRAINING_SESSIONS;
  const raw = 0.5 * sessionPart + 0.5 * clamp01(meanConfidence);
  return Number(clamp01(raw).toFixed(2));
}

export function meanSkillConfidence(skills: TwinSkill[]): number {
  if (skills.length === 0) return 0;
  return (
    skills.reduce((acc, s) => acc + clamp01(s.confidence), 0) / skills.length
  );
}

export async function recomputeCompletion(
  opts: RecomputeOptions
): Promise<number> {
  const { client, twinId } = opts;

  const skills = await loadSkills(client, twinId);
  const sessionsCompleted = await countTrainingSessions(client, twinId);

  const completion = computeCompletion({
    sessionsCompleted,
    meanConfidence: meanSkillConfidence(skills),
  });

  const { error } = await client
    .from("twins")
    .update({ completion_score: completion })
    .eq("id", twinId);

  if (error) {
    throw new Error(`recomputeCompletion failed: ${error.message}`);
  }

  return completion;
}

export async function advanceNextSessionIndex(
  opts: RecomputeOptions
): Promise<number> {
  const { client, twinId } = opts;

  const { data, error } = await client
    .from("twins")
    .select("next_session_index")
    .eq("id", twinId)
    .maybeSingle();
  if (error) {
    throw new Error(`advanceNextSessionIndex select failed: ${error.message}`);
  }

  const current = Number(data?.next_session_index ?? 0);
  const next = Math.min(current + 1, MAX_SESSION_INDEX);
  if (next === current) return current;

  const { error: updateErr } = await client
    .from("twins")
    .update({ next_session_index: next })
    .eq("id", twinId);
  if (updateErr) {
    throw new Error(
      `advanceNextSessionIndex update failed: ${updateErr.message}`
    );
  }
  return next;
}

export interface RegenerateSummaryOptions extends RecomputeOptions {
  sessionId?: string | null;
  apiKey?: string;
  model?: string;
  client_anthropic?: Anthropic;
}

export async function regenerateSummary(
  opts: RegenerateSummaryOptions
): Promise<string | null> {
  const { client, twinId } = opts;

  const skills = await loadSkills(client, twinId);
  if (skills.length === 0) return null;

  const anthropic =
    opts.client_anthropic ??
    new Anthropic({ apiKey: opts.apiKey ?? process.env.ANTHROPIC_API_KEY });
  const model = opts.model ?? process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

  const userMessage = buildSummaryUserMessage(skills);

  const response = await anthropic.messages.create({
    model,
    max_tokens: 600,
    temperature: 0.4,
    system:
      'Generate a 3-sentence summary of this user in BOTH English and Spanish. The English version is consumed by third-party APIs; the Spanish version is shown in the Twin\'s own UI. Stick to the facts provided — do not invent or speculate. Keep both versions neutral, useful for personalization, and matched in meaning (the Spanish is not a literal translation of the English; it should feel native and use rioplatense Spanish — vos forms when addressing or characterizing the user). Output ONLY a JSON object with this exact shape: {"en": "<english summary>", "es": "<spanish summary>"}. No markdown fences, no preamble, no commentary.',
    messages: [{ role: "user", content: userMessage }],
  });

  const parsed = parseSummaryResponse(collectText(response));
  if (!parsed) return null;
  const summary = parsed.en;
  const summaryEs = parsed.es;

  // Read current profile_json so we patch instead of overwrite.
  const { data: row, error: readErr } = await client
    .from("twins")
    .select("profile_json")
    .eq("id", twinId)
    .maybeSingle();
  if (readErr) {
    throw new Error(`regenerateSummary read failed: ${readErr.message}`);
  }

  const profile: TwinProfileJson = {
    version: 1,
    summary: null,
    summary_es: null,
    summary_generated_at: null,
    summary_after_session_id: null,
    ...(row?.profile_json as Partial<TwinProfileJson> | undefined),
  };

  const updatedProfile: TwinProfileJson = {
    ...profile,
    summary,
    summary_es: summaryEs,
    summary_generated_at: new Date().toISOString(),
    summary_after_session_id: opts.sessionId ?? profile.summary_after_session_id,
  };

  const { error: updateErr } = await client
    .from("twins")
    .update({ summary, profile_json: updatedProfile })
    .eq("id", twinId);
  if (updateErr) {
    throw new Error(`regenerateSummary update failed: ${updateErr.message}`);
  }

  return summary;
}

export function buildSummaryUserMessage(skills: TwinSkill[]): string {
  const blocks = skills
    .filter((s) => s.facts.length > 0)
    .map((s) => {
      const top = [...s.facts]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);
      const lines = top
        .map((f) => `  - [${f.confidence.toFixed(2)}] ${f.text}`)
        .join("\n");
      return `## ${s.domain} (avg confidence ${s.confidence.toFixed(2)})\n${lines}`;
    })
    .join("\n\n");

  if (!blocks) return "No facts known about this user yet.";
  return `Facts known about the user, grouped by domain:\n\n${blocks}`;
}

async function loadSkills(
  client: SupabaseClient,
  twinId: string
): Promise<TwinSkill[]> {
  const { data, error } = await client
    .from("twin_skills")
    .select("*")
    .eq("twin_id", twinId);
  if (error) {
    throw new Error(`loadSkills failed: ${error.message}`);
  }
  return (data ?? []).map((row) => ({
    id: row.id as string,
    twin_id: row.twin_id as string,
    domain: row.domain as Domain,
    confidence: Number(row.confidence ?? 0),
    facts: (row.facts_json ?? []) as Fact[],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }));
}

async function countTrainingSessions(
  client: SupabaseClient,
  twinId: string
): Promise<number> {
  const { count, error } = await client
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("twin_id", twinId)
    .eq("type", "training")
    .not("ended_at", "is", null);
  if (error) {
    throw new Error(`countTrainingSessions failed: ${error.message}`);
  }
  return count ?? 0;
}

// The model is instructed to return raw JSON, but Claude occasionally wraps it
// in ```json fences or adds preamble. Strip those before parsing.
function parseSummaryResponse(raw: string): { en: string; es: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const fenceStripped = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = fenceStripped.indexOf("{");
  const end = fenceStripped.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) return null;
  const slice = fenceStripped.slice(start, end + 1);
  try {
    const obj = JSON.parse(slice) as { en?: unknown; es?: unknown };
    const en = typeof obj.en === "string" ? obj.en.trim() : "";
    const es = typeof obj.es === "string" ? obj.es.trim() : "";
    if (!en || !es) return null;
    return { en, es };
  } catch {
    return null;
  }
}

function collectText(response: Anthropic.Messages.Message): string {
  if (!Array.isArray(response.content)) return "";
  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}
