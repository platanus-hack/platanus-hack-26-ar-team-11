export type Domain =
  | "vibes"
  | "communication_style"
  | "spending_profile"
  | "music_taste"
  | "event_preferences"
  | "fashion_taste"
  | "food_taste"
  | "travel_style";

export const ALL_DOMAINS: readonly Domain[] = [
  "vibes",
  "communication_style",
  "spending_profile",
  "music_taste",
  "event_preferences",
  "fashion_taste",
  "food_taste",
  "travel_style",
] as const;

export interface Fact {
  id: string;
  text: string;
  confidence: number; // 0..1
  source_session_id: string | null;
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface TwinSkill {
  id: string;
  twin_id: string;
  domain: Domain;
  confidence: number; // mean of facts confidences
  facts: Fact[]; // raw column is facts_json
  created_at: string;
  updated_at: string;
}

export interface TwinProfileJson {
  version: number; // 1
  summary: string | null;
  summary_generated_at: string | null;
  summary_after_session_id: string | null;
}

export interface Twin {
  id: string;
  user_id: string;
  name: string | null;
  completion_score: number;
  summary: string | null;
  profile_json: TwinProfileJson;
  next_session_index: number; // 0..12
  created_at: string;
  updated_at: string;
}

export const DOMAIN_LABELS: Record<Domain, string> = {
  vibes: "Vibe",
  communication_style: "Comunicación",
  spending_profile: "Gastos",
  music_taste: "Música",
  event_preferences: "Eventos",
  fashion_taste: "Moda",
  food_taste: "Comida",
  travel_style: "Viajes",
};
