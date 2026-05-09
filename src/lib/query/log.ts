import type { Intent, Scope } from "@/types/permissions";
import type { AppConnection } from "@/types/apps";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_RESPONSE_SUMMARY = 200;
const MAX_QUESTION = 1000;

function truncate(value: string | null | undefined, max: number): string | null {
  if (!value) return value ?? null;
  if (value.length <= max) return value;
  return value.slice(0, max - 1) + "…";
}

export interface LogQueryParams {
  connection: Pick<
    AppConnection,
    "id" | "user_id" | "twin_id" | "app_id"
  > | null;
  intent: Intent | string;
  question: string | null | undefined;
  response_summary: string | null | undefined;
  allowed: boolean;
  blocked_reason: string | null;
  scopes_used: Scope[];
}

export async function logQuery({
  connection,
  intent,
  question,
  response_summary,
  allowed,
  blocked_reason,
  scopes_used,
}: LogQueryParams): Promise<void> {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("query_logs").insert({
      connection_id: connection?.id ?? null,
      user_id: connection?.user_id ?? null,
      twin_id: connection?.twin_id ?? null,
      app_id: connection?.app_id ?? null,
      intent: String(intent),
      question: truncate(question ?? null, MAX_QUESTION),
      response_summary: truncate(response_summary ?? null, MAX_RESPONSE_SUMMARY),
      allowed,
      blocked_reason,
      scopes_used_json: scopes_used,
    });
    if (error) {
      console.error("[query-log] insert failed", error);
    }
  } catch (err) {
    console.error("[query-log] unexpected error", err);
  }
}

/**
 * Builds a short response_summary string for a given intent + result payload.
 * Always returns ≤200 chars.
 */
export function summarizeResponse(
  intent: string,
  data: Record<string, unknown>,
): string {
  switch (intent) {
    case "general_summary": {
      const completion = data.completion;
      const domains = Array.isArray(data.domains_available)
        ? data.domains_available.length
        : 0;
      return truncate(
        `Returned summary; completion=${completion ?? "?"}; ${domains} domains`,
        MAX_RESPONSE_SUMMARY,
      ) ?? "";
    }
    case "domain_summary": {
      const domain = data.domain ?? "?";
      const confidence = data.confidence ?? "?";
      return truncate(
        `Returned ${domain}; confidence=${confidence}`,
        MAX_RESPONSE_SUMMARY,
      ) ?? "";
    }
    case "event_recommendation": {
      const answer = data.answer ?? "?";
      const confidence = data.confidence ?? "?";
      return truncate(
        `answer=${answer} confidence=${confidence}`,
        MAX_RESPONSE_SUMMARY,
      ) ?? "";
    }
    case "event_ranking": {
      const ranking = Array.isArray(data.ranking) ? data.ranking : [];
      const counts = { strong: 0, weak: 0, no: 0 };
      for (const r of ranking) {
        const m = (r as { match?: string }).match;
        if (m === "strong_match") counts.strong++;
        else if (m === "weak_match") counts.weak++;
        else counts.no++;
      }
      return truncate(
        `Ranked ${ranking.length} events: ${counts.strong} strong, ${counts.weak} weak, ${counts.no} no`,
        MAX_RESPONSE_SUMMARY,
      ) ?? "";
    }
    default:
      return "";
  }
}
