import type { Domain } from "@/types/twin";
import { createAdminClient } from "@/lib/supabase/admin";

export interface GeneralSummaryHandlerInput {
  twin_id: string;
}

export interface GeneralSummaryData {
  summary: string;
  completion: number;
  domains_available: Domain[];
}

const FALLBACK_SUMMARY =
  "This user hasn't completed enough training sessions yet for the Twin to summarize them.";

export async function handleGeneralSummary({
  twin_id,
}: GeneralSummaryHandlerInput): Promise<GeneralSummaryData> {
  const admin = createAdminClient();

  const { data: twin, error: twinError } = await admin
    .from("twins")
    .select("summary, completion_score, profile_json")
    .eq("id", twin_id)
    .maybeSingle();
  if (twinError) {
    console.error("[general_summary] twin lookup failed", twinError);
  }

  const profileSummary = (twin?.profile_json as { summary?: string | null } | null)?.summary;
  const summary =
    twin?.summary ??
    profileSummary ??
    FALLBACK_SUMMARY;

  const completionRaw = twin?.completion_score;
  const completion =
    typeof completionRaw === "number"
      ? completionRaw
      : typeof completionRaw === "string"
        ? Number(completionRaw)
        : 0;

  const { data: skills, error: skillsError } = await admin
    .from("twin_skills")
    .select("domain, confidence")
    .eq("twin_id", twin_id);
  if (skillsError) {
    console.error("[general_summary] skills lookup failed", skillsError);
  }

  const domains_available: Domain[] = [];
  for (const row of skills ?? []) {
    const conf = Number((row as { confidence: number | string }).confidence);
    const domain = (row as { domain: Domain }).domain;
    if (Number.isFinite(conf) && conf > 0) {
      domains_available.push(domain);
    }
  }

  return {
    summary,
    completion: Number.isFinite(completion) ? completion : 0,
    domains_available,
  };
}
