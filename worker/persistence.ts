import { getWorkerSupabase } from "./supabase.js";
import type {
  Domain,
  ExtractedFact,
  SessionType,
  TranscriptEntry,
} from "../src/types/index.js";

export interface SessionRecord {
  id: string;
  twin_id: string;
  type: SessionType;
  domain: Domain | null;
  session_index: number | null;
  target_domains: Domain[];
  transcript: TranscriptEntry[];
  summary: string | null;
  extracted_facts: ExtractedFact[];
  started_at: string;
  ended_at: string;
  duration_seconds: number;
}

const getAdminClient = getWorkerSupabase;

export async function saveSession(record: SessionRecord): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("sessions")
    .upsert(
      {
        id: record.id,
        twin_id: record.twin_id,
        type: record.type,
        domain: record.domain,
        session_index: record.session_index,
        target_domains_json: record.target_domains,
        transcript_json: record.transcript,
        summary: record.summary,
        extracted_facts_json: record.extracted_facts,
        started_at: record.started_at,
        ended_at: record.ended_at,
        duration_seconds: record.duration_seconds,
      },
      { onConflict: "id" }
    );

  if (error) {
    throw new Error(`saveSession failed: ${error.message}`);
  }
}

// Drop the second of two consecutive user turns when their normalized text
// matches and they happened within a short window. STT providers occasionally
// emit a duplicate final transcript when the user repeats themselves while
// waiting for the EOU detector — without this, fact extraction sees
// "Juan Ignacio. Juan Ignacio." style noise.
export function shouldDedupUserTurn(
  prev: TranscriptEntry | undefined,
  text: string,
  nowMs = Date.now(),
  windowMs = 12_000
): boolean {
  if (!prev || prev.role !== "user") return false;
  if (nowMs - new Date(prev.at).getTime() >= windowMs) return false;
  return normalize(prev.text) === normalize(text);
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replaceAll(/[¿?¡!.,…]/g, "")
    .trim();
}
