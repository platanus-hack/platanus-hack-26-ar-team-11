export type Scope =
  | "persona.read.summary"
  | "persona.read.music"
  | "persona.read.events"
  | "persona.read.vibes"
  | "persona.read.communication"
  | "persona.ask.recommendation"
  | "persona.write.feedback";

export const ALL_SCOPES: readonly Scope[] = [
  "persona.read.summary",
  "persona.read.music",
  "persona.read.events",
  "persona.read.vibes",
  "persona.read.communication",
  "persona.ask.recommendation",
  "persona.write.feedback",
] as const;

export type Intent =
  | "event_recommendation"
  | "event_ranking"
  | "domain_summary"
  | "general_summary";

export const ALL_INTENTS: readonly Intent[] = [
  "event_recommendation",
  "event_ranking",
  "domain_summary",
  "general_summary",
] as const;

export type BlockedDomain =
  | "private_memories"
  | "sensitive_topics"
  | "politics"
  | "health"
  | "relationships"
  | "financial_status"
  | "raw_sources";

export const ALL_BLOCKED_DOMAINS: readonly BlockedDomain[] = [
  "private_memories",
  "sensitive_topics",
  "politics",
  "health",
  "relationships",
  "financial_status",
  "raw_sources",
] as const;

export interface PolicyResult {
  allowed: boolean;
  scopes_used: Scope[];
  blocked_reason: string | null;
}

export const SCOPE_LABELS: Record<Scope, string> = {
  "persona.read.summary": "General Twin summary",
  "persona.read.music": "Music taste",
  "persona.read.events": "Event preferences",
  "persona.read.vibes": "Personality & vibes",
  "persona.read.communication": "Communication style",
  "persona.ask.recommendation": "Personalized recommendations",
  "persona.write.feedback": "Feedback writing",
};
