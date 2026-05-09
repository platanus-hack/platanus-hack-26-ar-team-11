import type { Domain } from "./twin";

export type SessionType = "training" | "chat";
export type CurriculumDepth = "broad" | "deep" | "synthesis" | "gap_filling";

export interface CurriculumSlot {
  index: number; // 0..11
  target_domain: Domain | null; // null para synthesis y gap_filling
  target_depth: CurriculumDepth;
  focus_areas: string[];
  intro_hint: string | null;
}

export interface TranscriptEntry {
  role: "user" | "assistant";
  at: string; // ISO
  text: string;
}

export interface ExtractedFact {
  domain: Domain;
  text: string;
  confidence: number;
}

export interface Session {
  id: string;
  twin_id: string;
  type: SessionType;
  domain: Domain | null;
  transcript_json: TranscriptEntry[];
  summary: string | null;
  extracted_facts_json: ExtractedFact[];
  session_index: number | null; // 0..11 si type=training, null si chat
  target_domains_json: Domain[];
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}
