import type { Domain } from "@/types/twin";
import type {
  CommunicationStyleData,
  DomainSummaryData,
  EventPreferencesData,
  FashionTasteData,
  FoodTasteData,
  MusicTasteData,
  SpendingProfileData,
  TravelStyleData,
  VibesData,
} from "@/types/api";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ANTHROPIC_QUERY_MODEL,
  extractFirstJson,
  extractText,
  getAnthropicClient,
} from "@/lib/query/anthropic";

const DOMAIN_SHAPES: Record<Domain, string> = {
  music_taste: `{
  "top_genres": string[],            // 1-5 genres ranked by preference
  "favorite_artists": string[],      // 1-5 artists
  "discovery_style": string | null   // e.g. "active discoverer", "follows friends", null if unclear
}`,
  event_preferences: `{
  "venue_size_pref": string | null,  // "intimate" | "club" | "theatre" | "arena" | "festival" | null
  "festival_vs_intimate": string | null, // free text describing leaning, null if unknown
  "max_price": number | null,        // ARS or USD numeric, null if unknown
  "preferred_times": string[]        // e.g. ["weeknights", "late"]
}`,
  vibes: `{
  "tags": string[],
  "mood": string | null,
  "social_energy": string | null
}`,
  communication_style: `{
  "tone": string | null,
  "verbosity": string | null,
  "formality": string | null,
  "technical_detail": string | null
}`,
  spending_profile: `{
  "price_sensitivity": string | null,    // "high" | "medium" | "low" | null
  "splurge_categories": string[],        // categorías donde no le importa pagar
  "save_categories": string[],           // categorías donde busca ahorrar
  "budget_mindset": string | null        // p. ej. "value-driven", "experience-first", "status-driven"
}`,
  fashion_taste: `{
  "style_tags": string[],                // p. ej. ["minimal", "streetwear"]
  "color_palette": string[],
  "fit_preference": string | null,
  "brands_loved": string[]
}`,
  food_taste: `{
  "cuisines": string[],
  "dietary_restrictions": string[],
  "palate": string | null,
  "habit": string | null                 // p. ej. "delivery frecuente", "cocina casa"
}`,
  travel_style: `{
  "vibe": string | null,                 // "mochilero" | "confort" | "lujo" | null
  "destinations_loved": string[],
  "budget_typical": string | null,
  "travel_companions": string | null
}`,
};

const EMPTY_SHAPES: Record<Domain, DomainSummaryData> = {
  music_taste: {
    top_genres: [],
    favorite_artists: [],
    discovery_style: null,
  } satisfies MusicTasteData,
  event_preferences: {
    venue_size_pref: null,
    festival_vs_intimate: null,
    max_price: null,
    preferred_times: [],
  } satisfies EventPreferencesData,
  vibes: {
    tags: [],
    mood: null,
    social_energy: null,
  } satisfies VibesData,
  communication_style: {
    tone: null,
    verbosity: null,
    formality: null,
    technical_detail: null,
  } satisfies CommunicationStyleData,
  spending_profile: {
    price_sensitivity: null,
    splurge_categories: [],
    save_categories: [],
    budget_mindset: null,
  } satisfies SpendingProfileData,
  fashion_taste: {
    style_tags: [],
    color_palette: [],
    fit_preference: null,
    brands_loved: [],
  } satisfies FashionTasteData,
  food_taste: {
    cuisines: [],
    dietary_restrictions: [],
    palate: null,
    habit: null,
  } satisfies FoodTasteData,
  travel_style: {
    vibe: null,
    destinations_loved: [],
    budget_typical: null,
    travel_companions: null,
  } satisfies TravelStyleData,
};

interface SkillFactRow {
  text: string;
  confidence: number;
}

export interface DomainSummaryHandlerInput {
  twin_id: string;
  domain: Domain;
}

export interface DomainSummaryHandlerOutput {
  domain: Domain;
  data: DomainSummaryData | null;
  confidence: number;
}

export async function handleDomainSummary({
  twin_id,
  domain,
}: DomainSummaryHandlerInput): Promise<DomainSummaryHandlerOutput> {
  const admin = createAdminClient();
  const { data: skill, error } = await admin
    .from("twin_skills")
    .select("confidence, facts_json")
    .eq("twin_id", twin_id)
    .eq("domain", domain)
    .maybeSingle();

  if (error) {
    console.error("[domain_summary] skill lookup failed", error);
  }

  if (!skill) {
    return { domain, data: null, confidence: 0 };
  }

  const confidence = Number(skill.confidence) || 0;
  const facts = (skill.facts_json as SkillFactRow[] | null) ?? [];

  if (facts.length === 0) {
    return { domain, data: null, confidence };
  }

  const data = await mapFactsToShape(domain, facts);
  return { domain, data, confidence };
}

async function mapFactsToShape(
  domain: Domain,
  facts: SkillFactRow[],
): Promise<DomainSummaryData> {
  const factBullets = facts
    .map((f) => `- (${(f.confidence ?? 0).toFixed(2)}) ${f.text}`)
    .join("\n");

  const prompt = `You receive facts extracted from a user's voice training sessions about the domain "${domain}".
Map them to a JSON object with exactly this shape (use null for unknown fields, do NOT invent data):

${DOMAIN_SHAPES[domain]}

Facts:
${factBullets}

Output ONLY the JSON object, no markdown fences, no commentary.`;

  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model: ANTHROPIC_QUERY_MODEL,
      max_tokens: 600,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    });
    const text = extractText(message);
    const parsed = extractFirstJson<DomainSummaryData>(text);
    if (!parsed) {
      console.warn("[domain_summary] could not parse LLM output", { domain, text });
      return EMPTY_SHAPES[domain];
    }
    return mergeIntoShape(domain, parsed);
  } catch (err) {
    console.error("[domain_summary] LLM call failed", err);
    return EMPTY_SHAPES[domain];
  }
}

function mergeIntoShape(
  domain: Domain,
  parsed: Partial<DomainSummaryData>,
): DomainSummaryData {
  const empty = EMPTY_SHAPES[domain];
  return { ...empty, ...parsed } as DomainSummaryData;
}

export const __test__ = { mergeIntoShape, EMPTY_SHAPES };
