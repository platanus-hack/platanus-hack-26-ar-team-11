import { createClient } from "@/lib/supabase/server";
import type { Domain, ExtractedFact, Session, SessionType, TranscriptEntry } from "@/types";

interface SessionRow {
  id: string;
  twin_id: string;
  type: SessionType;
  domain: Domain | null;
  transcript_json: TranscriptEntry[] | null;
  summary: string | null;
  extracted_facts_json: ExtractedFact[] | null;
  session_index: number | null;
  target_domains_json: Domain[] | null;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    twin_id: row.twin_id,
    type: row.type,
    domain: row.domain,
    transcript_json: row.transcript_json ?? [],
    summary: row.summary,
    extracted_facts_json: row.extracted_facts_json ?? [],
    session_index: row.session_index,
    target_domains_json: row.target_domains_json ?? [],
    duration_seconds: row.duration_seconds,
    started_at: row.started_at,
    ended_at: row.ended_at,
    created_at: row.created_at,
  };
}

export async function listSessionsForTwin(twinId: string, limit?: number): Promise<Session[]> {
  const supabase = await createClient();
  let query = supabase
    .from("sessions")
    .select("*")
    .eq("twin_id", twinId)
    .order("started_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as SessionRow[]).map(rowToSession);
}

export async function getSessionById(sessionId: string, twinId: string): Promise<Session | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("twin_id", twinId)
    .maybeSingle();
  if (error || !data) return null;
  return rowToSession(data as SessionRow);
}
