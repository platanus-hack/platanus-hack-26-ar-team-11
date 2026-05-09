import type { Domain } from "@/types/twin";
import type { Intent, Scope } from "@/types/permissions";

const DOMAIN_TO_READ_SCOPE: Record<Domain, Scope> = {
  music_taste: "persona.read.music",
  event_preferences: "persona.read.events",
  vibes: "persona.read.vibes",
  communication_style: "persona.read.communication",
  spending_profile: "persona.read.spending",
  fashion_taste: "persona.read.fashion",
  food_taste: "persona.read.food",
  travel_style: "persona.read.travel",
};

export const INTENT_TO_SCOPES = {
  general_summary: ["persona.read.summary"] as Scope[],
  domain_summary: DOMAIN_TO_READ_SCOPE,
  event_recommendation: [
    "persona.read.music",
    "persona.read.events",
    "persona.ask.recommendation",
  ] as Scope[],
  event_ranking: [
    "persona.read.music",
    "persona.read.events",
    "persona.ask.recommendation",
  ] as Scope[],
} as const;

export interface ScopeContext {
  domain?: Domain | string;
}

export function requiredScopesForIntent(
  intent: Intent,
  context?: ScopeContext,
): Scope[] {
  switch (intent) {
    case "general_summary":
      return [...INTENT_TO_SCOPES.general_summary];
    case "domain_summary": {
      const domain = context?.domain as Domain | undefined;
      if (!domain || !(domain in DOMAIN_TO_READ_SCOPE)) {
        return [];
      }
      return [DOMAIN_TO_READ_SCOPE[domain]];
    }
    case "event_recommendation":
      return [...INTENT_TO_SCOPES.event_recommendation];
    case "event_ranking":
      return [...INTENT_TO_SCOPES.event_ranking];
    default:
      return [];
  }
}

export function hasAllScopes(granted: Scope[], required: Scope[]): Scope | null {
  for (const scope of required) {
    if (!granted.includes(scope)) return scope;
  }
  return null;
}
