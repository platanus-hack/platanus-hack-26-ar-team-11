import type { Domain } from "./twin";
import type { Intent, PolicyResult } from "./permissions";

// =============================================================================
// REQUEST SHAPES — discriminated union por `intent`.
// =============================================================================

export interface QueryRequestBase {
  connection_id: string;
  intent: Intent;
}

export interface GeneralSummaryRequest extends QueryRequestBase {
  intent: "general_summary";
  context?: Record<string, never>;
}

export interface DomainSummaryRequest extends QueryRequestBase {
  intent: "domain_summary";
  context: { domain: Domain };
}

export type VenueSize = "intimate" | "club" | "theatre" | "arena" | "festival";

export interface EventDescriptor {
  id?: string;
  artist?: string;
  venue?: string;
  city?: string;
  date?: string;
  genres?: string[];
  venue_size?: VenueSize;
  price?: number;
}

export interface EventRecommendationRequest extends QueryRequestBase {
  intent: "event_recommendation";
  context: { event: EventDescriptor };
}

export interface EventRankingRequest extends QueryRequestBase {
  intent: "event_ranking";
  context: { events: EventDescriptor[] };
}

export type QueryRequest =
  | GeneralSummaryRequest
  | DomainSummaryRequest
  | EventRecommendationRequest
  | EventRankingRequest;

// =============================================================================
// RESPONSE SHAPES — todas con envelope `policy`.
// =============================================================================

export interface PolicyEnvelope {
  policy: PolicyResult;
}

export interface GeneralSummaryResponse extends PolicyEnvelope {
  summary: string;
  completion: number;
  domains_available: Domain[];
}

// data shape varía por dominio (ver CONTRACTS.md §TYPES).
export interface MusicTasteData {
  top_genres: string[];
  favorite_artists: string[];
  discovery_style: string | null;
}

export interface EventPreferencesData {
  venue_size_pref: string | null;
  festival_vs_intimate: string | null;
  max_price: number | null;
  preferred_times: string[];
}

export interface VibesData {
  tags: string[];
  mood: string | null;
  social_energy: string | null;
}

export interface CommunicationStyleData {
  tone: string | null;
  verbosity: string | null;
  formality: string | null;
  technical_detail: string | null;
}

export type DomainSummaryData =
  | MusicTasteData
  | EventPreferencesData
  | VibesData
  | CommunicationStyleData;

export interface DomainSummaryResponse extends PolicyEnvelope {
  domain: Domain;
  data: DomainSummaryData | null;
  confidence: number;
}

export type MatchLabel = "strong_match" | "weak_match" | "no_match";

export interface EventRecommendationResponse extends PolicyEnvelope {
  answer: MatchLabel;
  confidence: number;
  reasons: string[];
}

export interface RankedEvent {
  id: string;
  score: number;
  match: MatchLabel;
  reasons: string[];
}

export interface EventRankingResponse extends PolicyEnvelope {
  ranking: RankedEvent[];
}

export type QueryResponse =
  | GeneralSummaryResponse
  | DomainSummaryResponse
  | EventRecommendationResponse
  | EventRankingResponse;

// =============================================================================
// API ERROR — formato canónico para errores HTTP (no policy denials).
// =============================================================================

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "missing_scope"
  | "blocked_domain"
  | "connection_revoked"
  | "invalid_intent"
  | "bad_request"
  | "not_found"
  | "internal";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}
