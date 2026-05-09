import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { extractFacts } from "../src/lib/twin/extract-facts.js";
import {
  aggregateConfidence,
  mergeFacts,
} from "../src/lib/twin/merge-facts.js";
import {
  advanceNextSessionIndex,
  recomputeCompletion,
  regenerateSummary,
} from "../src/lib/twin/recompute.js";
import {
  ALL_DOMAINS,
  type Domain,
  type ExtractedFact,
  type Fact,
  type TranscriptEntry,
  type TwinSkill,
} from "../src/types/index.js";

export interface PostSessionInput {
  sessionId: string;
  twinId: string;
  targetDomain: Domain | null;
  transcript: TranscriptEntry[];
  client?: SupabaseClient;
}

export interface PostSessionResult {
  facts: ExtractedFact[];
  summaryUpdate: string | null;
  completion: number | null;
  nextSessionIndex: number | null;
  summary: string | null;
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

export async function runPostSession(
  input: PostSessionInput
): Promise<PostSessionResult> {
  const supabase = input.client ?? getAdminClient();

  const skills = await loadTwinSkills(supabase, input.twinId);

  const extracted = await extractFacts({
    transcript: input.transcript,
    twinSkills: skills,
    targetDomain: input.targetDomain,
  });

  const byDomain = groupByDomain(extracted.facts);
  for (const [domain, incoming] of byDomain.entries()) {
    const skill = skills.find((s) => s.domain === domain);
    const merged = mergeFacts(skill?.facts ?? [], incoming, {
      sessionId: input.sessionId,
    });
    await upsertTwinSkill(supabase, input.twinId, domain, merged);
  }

  await persistSessionResults(
    supabase,
    input.sessionId,
    extracted.facts,
    extracted.summary_update
  );

  const opts = { client: supabase, twinId: input.twinId };

  let completion: number | null = null;
  try {
    completion = await recomputeCompletion(opts);
  } catch (err) {
    console.error("[post-session] recomputeCompletion failed:", err);
  }

  let summary: string | null = null;
  if (extracted.facts.length > 0) {
    try {
      summary = await regenerateSummary({ ...opts, sessionId: input.sessionId });
    } catch (err) {
      console.error("[post-session] regenerateSummary failed:", err);
    }
  }

  let nextSessionIndex: number | null = null;
  try {
    nextSessionIndex = await advanceNextSessionIndex(opts);
  } catch (err) {
    console.error("[post-session] advanceNextSessionIndex failed:", err);
  }

  return {
    facts: extracted.facts,
    summaryUpdate: extracted.summary_update,
    completion,
    nextSessionIndex,
    summary,
  };
}

async function loadTwinSkills(
  supabase: SupabaseClient,
  twinId: string
): Promise<TwinSkill[]> {
  const { data, error } = await supabase
    .from("twin_skills")
    .select("*")
    .eq("twin_id", twinId);
  if (error) {
    throw new Error(`loadTwinSkills failed: ${error.message}`);
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

async function upsertTwinSkill(
  supabase: SupabaseClient,
  twinId: string,
  domain: Domain,
  facts: Fact[]
): Promise<void> {
  const confidence = aggregateConfidence(facts);
  const { error } = await supabase.from("twin_skills").upsert(
    {
      twin_id: twinId,
      domain,
      confidence,
      facts_json: facts,
    },
    { onConflict: "twin_id,domain" }
  );
  if (error) {
    throw new Error(`upsertTwinSkill ${domain} failed: ${error.message}`);
  }
}

async function persistSessionResults(
  supabase: SupabaseClient,
  sessionId: string,
  facts: ExtractedFact[],
  summary: string | null
): Promise<void> {
  const update: Record<string, unknown> = {
    extracted_facts_json: facts,
  };
  if (summary !== null) update.summary = summary;
  const { error } = await supabase
    .from("sessions")
    .update(update)
    .eq("id", sessionId);
  if (error) {
    throw new Error(`persistSessionResults failed: ${error.message}`);
  }
}

function groupByDomain(
  facts: ExtractedFact[]
): Map<Domain, ExtractedFact[]> {
  const out = new Map<Domain, ExtractedFact[]>();
  for (const d of ALL_DOMAINS) out.set(d, []);
  for (const fact of facts) {
    out.get(fact.domain)?.push(fact);
  }
  // drop empty buckets
  for (const [d, list] of out.entries()) {
    if (list.length === 0) out.delete(d);
  }
  return out;
}
