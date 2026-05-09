import type { Scope } from "@/types/permissions";

export const SCOPE_LABELS: Record<Scope, string> = {
  "persona.read.summary": "General Twin summary",
  "persona.read.music": "Music taste",
  "persona.read.events": "Event preferences",
  "persona.read.vibes": "Personality & vibes",
  "persona.read.communication": "Communication style",
  "persona.read.spending": "Spending profile",
  "persona.read.fashion": "Fashion taste",
  "persona.read.food": "Food taste",
  "persona.read.travel": "Travel style",
  "persona.ask.recommendation": "Personalized recommendations",
  "persona.write.feedback": "Feedback writing",
};

export const SCOPE_DESCRIPTIONS: Record<Scope, string> = {
  "persona.read.summary":
    "A short paragraph describing the Twin overall — used by apps to greet you in your style.",
  "persona.read.music":
    "Top genres, favorite artists and how the user discovers new music.",
  "persona.read.events":
    "Preferred venue size, ticket budget, and event format (intimate vs festival).",
  "persona.read.vibes":
    "Personality tags, mood and social-energy preferences.",
  "persona.read.communication":
    "Tone, formality and verbosity the Twin uses when responding.",
  "persona.read.spending":
    "Price sensitivity, splurge vs save categories, and overall money mindset.",
  "persona.read.fashion":
    "Personal style tags, color palette, fit preferences and brands the user loves.",
  "persona.read.food":
    "Cuisines, dietary restrictions, palate notes and eating habits (delivery, dining out, cooking).",
  "persona.read.travel":
    "Travel vibe, destinations the user loves, typical budget and who they travel with.",
  "persona.ask.recommendation":
    "Lets the app ask the Twin if a specific event matches the user.",
  "persona.write.feedback":
    "(Reserved) Allows the app to write back feedback to your Twin.",
};

export function scopeLabel(scope: Scope): string {
  return SCOPE_LABELS[scope] ?? scope;
}

export function scopeDescription(scope: Scope): string {
  return SCOPE_DESCRIPTIONS[scope] ?? "";
}
